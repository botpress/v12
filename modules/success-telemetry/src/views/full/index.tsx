import {
  Button,
  ButtonGroup,
  HTMLSelect,
  IconName,
  MaybeElement,
  Popover,
  Position,
  Tooltip as BpTooltip
} from '@blueprintjs/core'
import { DateRange, DateRangePicker, IDateRangeShortcut } from '@blueprintjs/datetime'
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css'
import axios from 'axios'
import { lang, utils } from 'botpress/shared'
import cx from 'classnames'
import _ from 'lodash'
import moment from 'moment'
import React, { FC, useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { config } from 'yargs'
import { MetricEntry, ViewEntry } from '../../backend/typings'
import { Config } from '../../config'

import {
  last7days,
  lastMonthEnd,
  lastMonthStart,
  lastWeekEnd,
  lastWeekStart,
  lastYearEnd,
  lastYearStart,
  now,
  thisMonth,
  thisWeek,
  thisYear
} from './dates'
import ItemsList from './ItemsList'
import style from './style.scss'

interface State {
  previousDateRange?: DateRange
  telemetryData: { uuid: string; payload: string; available: boolean; lastChanged: string; creationDate: string }[]
  views: ViewEntry[]
  dateRange?: DateRange
  pageTitle: string
  shownSection: string
  disableAnalyticsFetching?: boolean
  config?: Partial<Config & { isProduction: boolean }>
}

export interface Channel {
  label: string
  value: string
}

export interface Extras {
  icon?: IconName | MaybeElement
  iconBottom?: IconName | MaybeElement
  className?: string
}

const fetchReducer = (state: State, action): State => {
  if (action.type === 'datesSuccess') {
    const { dateRange } = action.data

    return {
      ...state,
      dateRange,
      disableAnalyticsFetching: false
    }
  } else if (action.type === 'receivedTelemetryData') {
    const { telemetryData } = action.data

    return {
      ...state,
      telemetryData
    }
  } else if (action.type === 'receivedViews') {
    const { views } = action.data

    return {
      ...state,
      views
    }
  } else if (action.type === 'sectionChange') {
    const { shownSection, pageTitle } = action.data

    return {
      ...state,
      shownSection,
      pageTitle
    }
  } else if (action.type === 'setManualDate') {
    const { dateRange } = action.data

    return {
      ...state,
      dateRange,
      disableAnalyticsFetching: true
    }
  } else if (action.type === 'changeViewState') {
    const { key, ...rest } = action.data

    const views = [...state.views]
    const index = state.views.findIndex(i => i.key === key)
    if (index !== -1) {
      views[index] = { ...views[index], ...rest }
    }

    return {
      ...state,
      views
    }
  } else if (action.type === 'setConfig') {
    const { config } = action.data

    return {
      ...state,
      config
    }
  } else {
    throw new Error("That action type isn't supported.")
  }
}

const Telemetry: FC<any> = ({ bp }) => {
  const loadJson = useRef(null)
  const [rawExpanded, setRawExpanded] = useState(false)
  const [dashboardState, setDashboardState] = useState(undefined)

  const [state, dispatch] = React.useReducer(fetchReducer, {
    telemetryData: [],
    views: [],
    dateRange: undefined,
    previousDateRange: undefined,
    pageTitle: lang.tr('module.success-telemetry.dashboard'),
    shownSection: 'dashboard',
    config: {}
  })

  useEffect(() => {
    dispatch({ type: 'datesSuccess', data: { dateRange: [last7days, now] } })

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchViews().then(views => {
      dispatch({ type: 'receivedViews', data: { views } })
    })

    void updateConfig()
  }, [])

  useEffect(() => {
    if (!state.dateRange?.[0] || !state.dateRange?.[1] || dashboardState !== 'loading') {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchTelemetryData(state.dateRange).then(telemetryData => {
      utils.inspect({ id: state.dateRange })
      dispatch({ type: 'receivedTelemetryData', data: { dateRange: state.dateRange, telemetryData } })
    })
  }, [state.dateRange, dashboardState])

  const fetchTelemetryData = async (dateRange): Promise<MetricEntry[]> => {
    const startDate = moment(dateRange[0]).unix()
    const endDate = moment(dateRange[1]).unix()

    const { data } = await bp.axios.get('mod/success-telemetry/all', {
      params: {
        start: startDate,
        end: endDate,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
    return data.telemetryData
  }

  const fetchViews = async (): Promise<ViewEntry[]> => {
    const { data } = await bp.axios.get('mod/success-telemetry/list-metrics')
    return data
  }

  const updateConfig = async () => {
    const { data } = await bp.axios.get('mod/success-telemetry/config')
    dispatch({ type: 'setConfig', data: { config: data } })
  }

  const deleteTelemetryData = async () => {
    await bp.axios.post('mod/success-telemetry/delete')
  }

  const handleDateChange = async (dateRange: DateRange) => {
    dispatch({ type: 'datesSuccess', data: { dateRange } })
  }

  const handleCalculateMetric = async (key: string) => {
    const dateRange = state.dateRange
    const startDate = moment(dateRange[0]).unix()
    const endDate = moment(dateRange[1]).unix()

    dispatch({ type: 'changeViewState', data: { key, state: 'loading' } })
    try {
      const { data } = await bp.axios.get(`mod/success-telemetry/view-metric?id=${key}`, {
        params: {
          start: startDate,
          end: endDate,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      })
      dispatch({
        type: 'changeViewState',
        data: { key, state: 'loaded', viewString: data.viewString, metadata: data.metadata, subviews: data.subviews }
      })
    } catch (e) {
      dispatch({ type: 'changeViewState', data: { key, state: 'Error Loading:\n\n' + e.message } })
    }
  }

  const handleCalculateAllMetrics = async () => {
    setDashboardState('loading')
    await Promise.all(state.views.map(metric => handleCalculateMetric(metric.key)))
    setDashboardState('loaded')
  }

  const handleDeleteAll = async () => {
    try {
      await deleteTelemetryData()
      dispatch({ type: 'receivedTelemetryData', data: { dateRange: state.dateRange, telemetryData: [] } })
    } catch (e) {
      console.log(e)
      alert('Error Deleting')
    }
  }

  const isLoaded = () => {
    return state.telemetryData && state.dateRange
  }

  const getMetric = metricName => state.telemetryData

  const updateNote = async (telemetry: ViewEntry) => {
    try {
      await bp.axios.post('mod/success-telemetry/note', {
        metricId: telemetry.key,
        text: telemetry.note.text
      })
      dispatch({
        type: 'changeViewState',
        data: { key: telemetry.key, note: { ...telemetry.note, changed: false } }
      })
    } catch (e) {
      console.log(e)
      alert('Error saving note')
    }
  }

  const getTopItems = (
    type: string,
    options?: {
      nameRenderer?: (name: string) => string
      filter?: (x: any) => boolean
    }
  ) => {
    const { filter } = options || {}

    let telemetryData = getMetric(null)
    if (filter) {
      telemetryData = telemetryData.filter(filter)
    }
    const results = orderMetrics(telemetryData)

    return results.map(x => ({
      ...x,
      payload: JSON.stringify(x.payload),
      href: ''
    }))
  }

  const orderMetrics = telemetryData => {
    return telemetryData
  }

  const renderInteractions = () => {
    return (
      <div className={cx(style.metricsContainer, style.fullWidth, style.tables)}>
        {rawExpanded && <ItemsList name={''} items={getTopItems('')} className={cx(style.quarter, style.list)} />}
      </div>
    )
  }

  const renderSubviews = subviews => {
    return (
      <div>
        {subviews.map(subview => (
          <div key={subview.id}>
            <h5 style={{ margin: 0, marginBottom: 5 }}>{subview.label}: </h5>
            <div
              className={cx(style.metricsContainer, style.fullWidth, style.tables)}
              dangerouslySetInnerHTML={{ __html: subview.viewString }}
            />
          </div>
        ))}
      </div>
    )
  }

  const renderViews = () => {
    return (
      <>
        {state.views &&
          state.views.map(item => (
            <div style={{ width: '100%' }} className={style.fullWidth}>
              <h2 style={{ marginBottom: 0 }}>{item.options.name}</h2>
              <br />
              <small style={{ fontSize: '16px' }} dangerouslySetInnerHTML={{ __html: item.options.description }} />
              {item.state === 'loading' && <p>Loading</p>}
              <div
                className={cx(style.metricsContainer, style.fullWidth, style.tables)}
                dangerouslySetInnerHTML={{ __html: item.viewString }}
              />
              {item.note && (
                <>
                  <h5 style={{ margin: 0, marginBottom: 5 }}>{item.options.notesDisplay || 'Notes'}: </h5>
                  <TextareaAutosize
                    minRows={1}
                    style={{ minWidth: 300 }}
                    value={item.note.text}
                    onChange={e => {
                      dispatch({
                        type: 'changeViewState',
                        data: { key: item.key, note: { ...item.note, text: e.currentTarget.value, changed: true } }
                      })
                    }}
                  ></TextareaAutosize>
                  <br />
                  {item.note.changed && (
                    <Button onClick={e => updateNote(item)} icon="annotation" className={style.filterItem}>
                      Save Target Changes
                    </Button>
                  )}
                </>
              )}
              {(item.subviews && item.subviews.length && renderSubviews(item.subviews)) || ''}
            </div>
          ))}
      </>
    )
  }

  if (!isLoaded()) {
    return (
      <div>
        Not Loaded <div>{JSON.stringify(state)}</div>
      </div>
    )
  }

  const shortcuts: IDateRangeShortcut[] = [
    {
      dateRange: [thisWeek, now],
      label: lang.tr('module.success-telemetry.timespan.thisWeek')
    },
    {
      dateRange: [lastWeekStart, lastWeekEnd],
      label: lang.tr('module.success-telemetry.timespan.lastWeek')
    },
    {
      dateRange: [thisMonth, now],
      label: lang.tr('module.success-telemetry.timespan.thisMonth')
    },
    {
      dateRange: [lastMonthStart, lastMonthEnd],
      label: lang.tr('module.success-telemetry.timespan.lastMonth')
    },
    {
      dateRange: [thisYear, now],
      label: lang.tr('module.success-telemetry.timespan.thisYear')
    },
    {
      dateRange: [lastYearStart, lastYearEnd],
      label: lang.tr('module.success-telemetry.timespan.lastYear')
    }
  ]

  return (
    <div className={style.mainWrapper}>
      <div className={style.innerWrapper}>
        <div className={style.header}>
          <h1 className={style.pageTitle} style={{ marginBottom: 10 }}>
            {lang.tr('module.success-telemetry.title')}
          </h1>
          <div className={style.filters}>
            <Popover>
              <Button icon="calendar" className={style.filterItem}>
                {lang.tr('module.success-telemetry.dateRange')}
              </Button>
              <DateRangePicker
                onChange={handleDateChange}
                allowSingleDayRange={true}
                shortcuts={shortcuts}
                maxDate={new Date()}
                value={state.dateRange}
              />
            </Popover>
            <Button onClick={e => handleCalculateAllMetrics()} icon="calculator" className={style.filterItem}>
              {(!dashboardState && 'Calculate') || (dashboardState === 'loaded' && 'Re-calculate')}
            </Button>
            {state.config && !state.config.isProduction && (
              <Button onClick={handleDeleteAll} icon="trash" className={style.filterItem}>
                Delete All Data
              </Button>
            )}
          </div>
        </div>
        {state.views[0] && state.views[0].viewString && state.views[0].metadata && (
          <small style={{ display: 'block', fontSize: '16px' }}>
            <br />
            <strong>Start Date</strong>:{' '}
            {moment(state.views[0].metadata.startDate)
              .local()
              .format('D MMM YYYY')}{' '}
            | <strong>End Date</strong>:{' '}
            {moment(state.views[0].metadata.endDate)
              .local()
              .format('D MMM YYYY')}{' '}
            <br />{' '}
            {/*<strong>Calculation Time:</strong>
                  {moment(item.metadata.dateTime).format('dddd, MMMM Do YYYY HH:mm:ss')} | <strong>Bot Id:</strong>{' '}*/}
            <strong>Bot</strong>: {state.views[0].metadata.botId === '___' ? 'All Bots' : state.views[0].metadata.botId}
          </small>
        )}
        <div className={style.sectionsWrapper}>
          {renderViews()}
          {state.config.showRawData && (
            <div style={{ width: '100%' }} className={style.fullWidth}>
              <h2 style={{ display: 'inline-flex', margin: '10px', marginLeft: 0 }}>Raw Telemetry Data</h2>
              <Button
                icon={rawExpanded ? 'folder-close' : 'folder-open'}
                onClick={() => {
                  setRawExpanded(!rawExpanded)
                }}
                className={style.filterItem}
              >
                {!rawExpanded ? 'Show' : 'Hide'}
              </Button>
              {renderInteractions()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Telemetry
