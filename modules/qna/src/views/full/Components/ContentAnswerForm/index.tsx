// TODO refactor to use the same form as say node

import { Tab, Tabs } from '@blueprintjs/core'
import { BotEvent, FormData } from 'botpress/sdk'
import { Contents, Dropdown, lang, MoreOptions, MoreOptionsItems, RightSidebar, sharedStyle } from 'botpress/shared'
import cx from 'classnames'
import _ from 'lodash'
import React, { FC, Fragment, useEffect, useReducer, useRef, useState } from 'react'

interface Props {
  bp: any
  deleteContent: () => void
  editingContent: number
  close: (closingKey: number) => void
  onUpdate: (data: any) => void
  formData: FormData
  events: BotEvent[]
  isLite: boolean
  currentLang: string
  defaultLang: string
}

const fetchReducer = (state, action) => {
  switch (action.type) {
    case 'fetchSuccess':
      const { data } = action

      return {
        ...state,
        contentTypes: data.map(type => ({
          value: type.id,
          label: lang.tr(type.title),
          order: type.schema.newJson.order
        })),
        contentTypesFields: data.reduce((acc, type) => ({ ...acc, [type.id]: type.schema.newJson }), {})
      }
    default:
      throw new Error(`That action type isn't supported.`)
  }
}

const ContentAnswerForm: FC<Props> = ({
  isLite,
  currentLang,
  defaultLang,
  editingContent,
  bp,
  close,
  formData,
  onUpdate,
  events,
  deleteContent
}) => {
  const [state, dispatch] = useReducer(fetchReducer, {
    contentTypes: [],
    contentTypesFields: {}
  })
  const contentType = useRef(formData?.contentType || 'builtin_image')
  const [showOptions, setShowOptions] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(false)
  const { contentTypes, contentTypesFields } = state

  useEffect(() => {
    bp.axios.get('/content/types').then(({ data }) => {
      dispatch({ type: 'fetchSuccess', data: data.filter(type => type.schema.newJson?.displayedIn.includes('qna')) })
    })
  }, [])

  useEffect(() => {
    contentType.current = formData?.contentType || 'builtin_image'
    setForceUpdate(!forceUpdate)
  }, [editingContent])

  const moreOptionsItems: MoreOptionsItems[] = [
    {
      label: lang.tr('deleteContent'),
      action: deleteContent,
      type: 'delete'
    }
  ]

  const handleContentTypeChange = value => {
    const { fields, advancedSettings } = contentTypesFields?.[value] || {}
    contentType.current = value
    onUpdate({
      ...Contents.createEmptyDataFromSchema([...fields, ...(advancedSettings || [])]),
      contentType: value,
      id: formData?.id
    })
  }

  const contentFields = contentTypesFields?.[contentType.current]

  return (
    <RightSidebar className={sharedStyle.wrapper} canOutsideClickClose close={() => close(editingContent)}>
      <Fragment key={`${contentType.current}-${editingContent}`}>
        <div className={sharedStyle.formHeader}>
          <Tabs id="contentFormTabs">
            <Tab id="content" title="Content" />
          </Tabs>
          <MoreOptions show={showOptions} onToggle={setShowOptions} items={moreOptionsItems} />
        </div>
        <div className={cx(sharedStyle.fieldWrapper, sharedStyle.typeField)}>
          <span className={sharedStyle.formLabel}>{lang.tr('studio.content.contentType')}</span>
          {contentTypes.length && (
            <Dropdown
              filterable={false}
              className={sharedStyle.formSelect}
              items={_.sortBy(contentTypes, 'order')}
              defaultItem={contentType.current}
              rightIcon="chevron-down"
              onChange={option => {
                handleContentTypeChange(option.value)
              }}
            />
          )}
        </div>
        {contentFields && (
          <Contents.Form
            superInputOptions={{ enabled: !isLite, eventsOnly: true }}
            currentLang={currentLang}
            defaultLang={defaultLang}
            fields={contentFields.fields}
            advancedSettings={contentFields.advancedSettings}
            axios={bp.axios}
            events={events || []}
            formData={formData}
            onUpdate={data => onUpdate({ ...data, contentType: contentType.current })}
          />
        )}
      </Fragment>
    </RightSidebar>
  )
}

export default ContentAnswerForm