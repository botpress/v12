import * as sdk from 'botpress/sdk'
import { asyncMiddleware as asyncMw, StandardError } from 'common/http'
import Joi from 'joi'
import _ from 'lodash'
import moment from 'moment'
import moment_timezone from 'moment-timezone'

import { TABLE_NAME, Database, Note } from './db'

export default (bp: typeof sdk, db: Database) => {
  const asyncMiddleware = asyncMw(bp.logger)
  const router = bp.http.createRouterForBot('success-telemetry', { checkAuthentication: true })

  router.get(
    '/all',
    asyncMiddleware(async (req, res) => {
      const { start, end, qBotId, tz } = req.query

      const { botId: reqBotId } = req.params

      const botId = qBotId || reqBotId

      try {
        const { startDate, endDate } = getStartEnd(start, end, tz)
        const telemetryData = await db.getTelemetryData({ startDate, endDate, botId })
        res.send({ telemetryData })
      } catch (err) {
        throw new StandardError('Cannot get data', err)
      }
    })
  )

  router.get(
    '/list-metrics',
    asyncMiddleware(async (req, res) => {
      // @ts-ignore
      const successTelemetryRegistry = bp.experimental.successTelemetryRegistry

      const list = []
      for (const key of Object.keys(successTelemetryRegistry)) {
        const item: { note: Partial<Note> } = successTelemetryRegistry[key]
        try {
          item.note = await db.getNote({ metricId: key, workspaceId: req.workspace })
        } catch (e) {
          console.log(e)
        } finally {
          if (!item.note) {
            item.note = { uuid: null, text: '', metricId: key }
          }
        }
        list.push(item)
      }
      res.send(list)
    })
  )

  router.get(
    '/config',
    asyncMiddleware(async (req, res) => {
      const { botId } = req.params
      const config = await bp.config.getModuleConfigForBot('success-telemetry', botId)
      res.send({ ...config, isProduction: process.IS_PRODUCTION })
    })
  )

  router.get(
    '/view-metric',
    asyncMiddleware(async (req, res) => {
      const { start, end, id, botId: qBotId, tz } = req.query
      const { botId: reqBotId } = req.params

      const botId = qBotId || reqBotId

      const { startDate, endDate } = getStartEnd(start, end, tz)

      const getFilteredQuery = options => {
        options = options || {}

        let query = bp.database
          .select()
          .table('success_telemetry')
          .where(bp.database.date.isBetween('creationDate', startDate, endDate))

        db.appendJsonUtils(query)

        if (botId && botId !== '___' && !options.allbots) {
          // @ts-ignore
          query = query.whereJson('payload', 'botId', botId)
        }

        if (!options.allMetrics) {
          // @ts-ignore
          query = query.andWhereJson('payload', 'metricId', options.metricId || id)
        }

        return query
      }

      // @ts-ignore
      const successTelemetryRegistryItem = bp.experimental.successTelemetryRegistry[id]

      const subviews = []

      // @ts-ignore
      for (const subviewId of Object.keys(successTelemetryRegistryItem.subviews)) {
        let viewString = ''
        try {
          viewString = await successTelemetryRegistryItem.subviews[subviewId].viewFunction({
            botId,
            startDate,
            endDate,
            getFilteredQuery
          })
        } catch (e) {
          viewString = `Error generating view: ${e.message}`
        }

        subviews.push({
          id: subviewId,
          label: successTelemetryRegistryItem.subviews[subviewId].label,
          viewString
        })
      }

      try {
        res.send({
          viewString: await successTelemetryRegistryItem.options.viewFunction({
            botId,
            startDate,
            endDate,
            getFilteredQuery
          }),
          metadata: { startDate, endDate, dateTime: moment(), botId },
          subviews
        })
      } catch (err) {
        throw new StandardError('Cannot get data', err)
      }
    })
  )

  router.post(
    '/delete',
    asyncMiddleware(async (req, res) => {
      if (process.IS_PRODUCTION) {
        res.status(400).send({ success: false, err: 'Cannot delete telemetry data on production' })
        return
      }

      try {
        await db.deleteTelemetryData()
        res.status(200).send({ success: true })
      } catch (err) {
        res.status(400).send({ success: false, err: err.message })
      }
    })
  )

  router.post(
    '/capture',
    asyncMiddleware(async (req, res) => {
      try {
        const { payload, uuid, metricId } = req.body
        const { botId } = req.params

        await Joi.validate(
          req.body,
          Joi.object().keys({
            uuid: Joi.string().optional(),
            payload: Joi.object().required(),
            metricId: Joi.string().required()
          })
        )

        // @ts-ignore
        if (!bp.experimental.successTelemetryRegistry[metricId]) {
          res.status(400).send({ success: false, err: `${metricId} is not a registered metric id` })
          return
        }

        await db.addTelemetryData({ ...payload, botId, metricId, workspaceId: req.workspace }, { uuid })
        res.status(200).send({ success: true })
      } catch (err) {
        bp.logger.attachError(err).error('Error capturing telemetry payload')
        res.status(400).send({ success: false, err: err.message })
      }
    })
  )

  router.post(
    '/note',
    asyncMiddleware(async (req, res) => {
      try {
        const { text, metricId } = req.body

        await Joi.validate(
          req.body,
          Joi.object().keys({
            uuid: Joi.string().optional(),
            text: Joi.string(),
            metricId: Joi.string().required()
          })
        )

        await db.addNote(text || '', { metricId, workspaceId: req.workspace })
        res.status(200).send({ success: true })
      } catch (err) {
        res.status(400).send({ success: false, err: err.message })
      }
    })
  )

  router.get(
    '/note/:metricId',
    asyncMiddleware(async (req, res) => {
      const { metricId } = req.params

      if (!metricId) {
        res.status(400).send({ success: false, err: 'No telemetry key specified' })
      }

      return db.getNote({ metricId, workspaceId: req.workspace })
    })
  )

  const unixToMoment = unix => {
    const momentDate = moment_timezone.unix(unix)
    if (!momentDate.isValid()) {
      throw new Error(`Invalid unix timestamp format ${unix}.`)
    }

    return momentDate
  }

  const getStartEnd = (start, end, tz) => {
    let startDate =
      start &&
      parseInt(start) &&
      unixToMoment(start)
        .tz(tz)
        .startOf('day')
        .toDate()

    let endDate =
      end &&
      parseInt(end) &&
      unixToMoment(end)
        .tz(tz)
        .endOf('day')
        .toDate()

    if (!endDate) {
      endDate =
        startDate &&
        unixToMoment(start)
          .tz(tz)
          .endOf('day')
          .toDate()
    }
    if (!startDate) {
      startDate =
        endDate &&
        unixToMoment(end)
          .tz(tz)
          .startOf('day')
          .toDate()
    }

    return { startDate, endDate }
  }
}
