import { Text } from '@blueprintjs/core'
import { lang } from 'botpress/shared'
import cx from 'classnames'
import _ from 'lodash'
import moment from 'moment'
import ms from 'ms'
import React, { FC, useContext, useEffect, useState } from 'react'

import { agentName } from '../../../../helper'
import { IHandoff } from '../../../../types'
import style from '../../style.scss'
import { Context } from '../Store'

import HandoffBadge from './HandoffBadge'
import UserName from './UserName'

const HandoffItem: FC<IHandoff> = ({ createdAt, id, status, agentId, userConversation, userChannel, user }) => {
  const { state, dispatch } = useContext(Context)

  const [readStatus, setReadStatus] = useState(false)
  const [fromNow, setFromNow] = useState(moment(createdAt).fromNow())
  const [handoffStyle, setHandoffStyle] = useState({})

  async function handleSelect(id: string) {
    dispatch({ type: 'setSelectedHandoffId', payload: id })
    dispatch({
      type: 'setRead',
      payload: {
        [id]: state.handoffs[id].userConversation.createdOn
      }
    })
  }

  useEffect(() => {
    const refreshRate = ms('1m')

    const interval = setInterval(() => {
      setFromNow(moment(createdAt).fromNow())
    }, refreshRate)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (state.reads[id] < userConversation.createdOn) {
      setReadStatus(false)
    } else if (state.reads[id] >= userConversation.createdOn) {
      setReadStatus(true)
    }
  }, [userConversation, state.reads])

  useEffect(() => {
    const interval = setInterval(() => setHandoffStyle(getHandoffStyle(createdAt, status)), 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  const displayAgentName = () => {
    if (agentId && agentId === state.currentAgent?.agentId) {
      return lang.tr('module.hitlnext.handoff.you')
    } else if (agentId) {
      const agent = state.agents[agentId]
      return agentName(agent)
    }
  }

  const getHandoffStyle = (createdAt, status) => {
    if (status === 'pending') {
      const alerts = (state.config.handoffAlerts || [{ time: 300000, color: '#FFE5B4D9' }])
        .slice()
        .sort((a, b) => (a.time > b.time ? 1 : -1))

      let color = ''
      for (let i = 0; i < alerts.length; i++) {
        if (moment().diff(moment(createdAt)) >= alerts[i].time) {
          if (i === alerts.length - 1 || moment().diff(moment(createdAt)) <= alerts[i + 1].time) {
            color = alerts[i].color
          }
        }
      }

      return { backgroundColor: color }
    }
  }

  return (
    <div
      className={cx({ [style.handoffItem]: true }, { [style.active]: state.selectedHandoffId === id })}
      style={handoffStyle}
      onClick={() => handleSelect(id)}
    >
      {!readStatus && <span className={style.unreadDot}></span>}
      <div className={style.info}>
        <UserName user={user} />
        &nbsp;<strong>#{id}</strong>
        <p>
          <span>{lang.tr('module.hitlnext.handoff.from', { channel: userChannel })}</span> {agentId && '⋅'}{' '}
          <span>{displayAgentName()}</span>
        </p>
        <Text ellipsize={true}>{_.get(userConversation, 'event.preview')}</Text>
        <p className={style.createdDate}>{fromNow}</p>
        <HandoffBadge status={status}></HandoffBadge>
      </div>
    </div>
  )
}

export default HandoffItem
