import { lang } from 'botpress/shared'
import cx from 'classnames'
import React, { FC } from 'react'

import style from './style.scss'

interface Props {
  name: string
  items: { uuid: string; payload: string; available: boolean; lastChanged: string; creationDate: string }[]
  className: string
  itemLimit?: number
}

const ItemsList: FC<Props> = props => {
  const { name, className, itemLimit } = props
  let { items } = props

  if (itemLimit) {
    items = items.slice(0, itemLimit)
  }

  return (
    <div style={{ width: '100%' }} className={className}>
      <h3 className={style.metricName}>{name}</h3>
      {!items.length && (
        <p className={cx(style.emptyState, style.alignedLeft)}>{lang.tr('module.success-telemetry.noDataAvailable')}</p>
      )}
      <table>
        <tr>
          <th>UUID</th>
          <th>Payload</th>
          <th>Available</th>
          <th>Last Changed</th>
          <th>creationDate</th>
        </tr>
        {items.map((item, index) => (
          <tr key={index}>
            <td>{item.uuid}</td>
            <td>{item.payload}</td>
            <td>{item.available}</td>
            <td>{item.lastChanged}</td>
            <td>{item.creationDate}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}

export default ItemsList
