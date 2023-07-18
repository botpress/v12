import * as sdk from 'botpress/sdk'
import { asyncMiddleware as asyncMw, StandardError } from 'common/http'
import _ from 'lodash'
import moment from 'moment'

import Database from './db'

const getCustomMetricName = (name: string) => {
  if (name.startsWith('cm_')) {
    return name
  }

  return `cm_${name}`
}

export default (bp: typeof sdk, db: Database) => {
  const asyncMiddleware = asyncMw(bp.logger)
  const router = bp.http.createRouterForBot('analytics')

  router.get(
    '/channel/:channel',
    asyncMiddleware(async (req, res) => {
      const { botId, channel } = req.params
      const { start, end } = req.query

      try {
        const startDate = unixToDate(start)
        const endDate = unixToDate(end)
        const metrics = await db.getMetrics(botId, { startDate, endDate, channel })
        res.send({ metrics })
      } catch (err) {
        throw new StandardError('Cannot get analytics', err)
      }
    })
  )

  router.get('/custom_metrics/:name', async (req, res) => {
    try {
      const { botId, name } = req.params
      const { start, end } = req.query

      const startDate = start ? moment(start).toDate() : moment().toDate()
      const endDate = end ? moment(end).toDate() : moment().toDate()

      const metrics = await db.getMetric(botId, '', getCustomMetricName(name), {
        startDate,
        endDate
      })
      res.send({ success: true, metrics })
    } catch (err) {
      res.send({ success: false, message: err.message })
    }
  })

  router.post('/custom_metrics/:name/:method', async (req, res) => {
    try {
      const { botId, method, name } = req.params
      const { count, date } = req.body

      switch (method) {
        case 'increment':
          db.incrementMetric(botId, '', getCustomMetricName(name))
          break
        case 'decrement':
          db.decrementMetric(botId, '', getCustomMetricName(name))
          break
        case 'set':
          const metricDate = date ? moment(date).toDate() : moment().toDate()
          await db.setMetric(botId, '', getCustomMetricName(name), { count, date: metricDate })
          break
        default:
          res.send({ success: false, message: 'Invalid method, use increment, decrement or set' })
          return
      }

      res.send({ success: true })
    } catch (err) {
      res.send({ success: false, message: err.message })
    }
  })

  const unixToDate = unix => {
    const momentDate = moment.unix(unix)
    if (!momentDate.isValid()) {
      throw new Error(`Invalid unix timestamp format ${unix}.`)
    }

    return moment.utc(momentDate.format('YYYY-MM-DD')).toDate()
  }
}
