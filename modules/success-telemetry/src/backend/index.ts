import axios from 'axios'
import 'bluebird-global'
import * as sdk from 'botpress/sdk'
import _ from 'lodash'

//import schedule from 'node-schedule'
import en from '../translations/en.json'

import api from './api'
import Database from './db'
import setup from './setup'
import sync from './sync'

let db: Database

interface TelemetryOptions {
  name: string
  viewFunction: () => string
  description: string
}

const onServerStarted = async (bp: typeof sdk) => {
  // @ts-ignore
  bp.experimental.successTelemetryRegistry = {}
  db = new Database(bp)
  await setup(bp, db)
}

const onServerReady = async (bp: typeof sdk) => {
  // @ts-ignore
  const successTelemetryRegistry = bp.experimental.successTelemetryRegistry
  api(bp, db)

  // @ts-ignore
  bp.experimental.successTelemetry = {
    registryTelemetry: (key, options: TelemetryOptions) => {
      successTelemetryRegistry[key] = { key, options, subviews: [] }
    },
    addTelemetryData: async ({ botId, metricId, payload, uuid }) => {
      if (!botId) {
        bp.logger.error(`[addTelemetryData] A valid botId is required in order add data | Current value ${botId}`)
        return
      }

      if (!metricId || !successTelemetryRegistry[metricId]) {
        bp.logger.error(`[addTelemetryData] A valid metricId is required in order add data | Current value ${metricId}`)
        return
      }

      try {
        const axiosConfig = await bp.http.getAxiosConfigForBot(botId, { localUrl: true })
        await axios.post(
          '/mod/success-telemetry/capture',
          { payload, metricId, uuid },
          { ...axiosConfig, proxy: false }
        )
      } catch (e) {
        bp.logger.attachError(e).error(`Error add telemetry data to bot ${botId}`)
      }
    },
    addNewSubview: ({ id, label, metricId, viewFunction }) => {
      let tries = 0

      const interval = setInterval(() => {
        if (!successTelemetryRegistry[metricId] && tries <= 3) {
          tries++
          return
        }

        if (interval) {
          clearInterval(interval)
        }

        if (!id || !id.length) {
          bp.logger.error(`[addNewSubview] A valid id is required in order to add a new subview | Current value ${id}`)
          return
        }

        if (!metricId || !successTelemetryRegistry[metricId]) {
          bp.logger.error(
            `[addNewSubview] A valid metricId is required in order to add a new subview | Current value ${metricId}`
          )
          return
        }

        successTelemetryRegistry[metricId].subviews[id] = {
          label,
          viewFunction
        }
      }, 3000)
    }
  }

  const scheduledTimming = process.env.SUCCESS_MODULE_FORCE_SYNC ? { second: 0 } : { date: 1, minute: 0 }

  // const job = schedule.scheduleJob(scheduledTimming, async function() {
  //   const lock = await bp.distributed.acquireLock('success-telemetry-sync', 600000)
  //   if (lock) {
  //     try {
  //       const { syncronizationToken: token } = await bp.config.getModuleConfig('success-telemetry')

  //       if (!token || !token.length) {
  //         return
  //       }

  //       bp.logger.info('Sync Success data - Start')

  //       const summary = await sync(bp, db, token)
  //       if (summary) {
  //         bp.logger.info('Sync Success data - Finish')
  //         bp.logger.info('Sync Summary: ' + JSON.stringify(summary))
  //         bp.logger.info('Next Success sync scheduled for ' + job.nextInvocation())
  //       }
  //     } catch (e) {
  //       bp.logger.attachError(e).info('Error during Success data synchronization: ' + e.message)
  //     } finally {
  //       if (lock) {
  //         await lock.unlock()
  //       }
  //     }
  //   }
  // })

  // const { syncronizationToken: token } = await bp.config.getModuleConfig('success-telemetry')
  // if (token) {
  //   bp.logger.info('Next Success sync scheduled for ' + job.nextInvocation())
  // }
}

const onModuleUnmount = async (bp: typeof sdk) => {
  bp.http.deleteRouterForBot('analytics')
}

const entryPoint: sdk.ModuleEntryPoint = {
  onServerStarted,
  onServerReady,
  onModuleUnmount,
  translations: { en },
  definition: {
    name: 'success-telemetry',
    fullName: 'Success Telemetry',
    homepage: 'https://botpress.com',
    menuIcon: 'percentage',
    menuText: 'Success',
    workspaceApp: { bots: true, global: true }
  }
}

export default entryPoint
