import axios from 'axios'
import * as sdk from 'botpress/sdk'
import { Database } from './db'

const CLOUD_HOST = process.env.SUCCESS_MODULE_CLOUD_HOST || 'https://cstelemetry.botpress.cloud'

export const sendPost = async (endpoint, body, config?) => {
  try {
    const data = await axios.post(`${CLOUD_HOST}${endpoint}`, body, config)
    return data
  } catch (e) {
    throw new Error(
      `Error posting data for '${CLOUD_HOST}${endpoint} - ${e.message}  - ${e.response &&
        e.response.data &&
        e.response.data.message}`
    )
  }
}

export const sendGet = async (endpoint, config?) => {
  try {
    const res = await axios.get(`${CLOUD_HOST}${endpoint}`, config)
    return res
  } catch (e) {
    throw new Error(
      `Error getting data for '${CLOUD_HOST}${endpoint} - ${e.message}  - ${e.response &&
        e.response.data &&
        e.response.data.message}`
    )
  }
}

export default async (bp: typeof sdk, db: Database, token) => {
  try {
    let fingerprint

    const config = await bp.http.getAxiosConfigForBot('___')
    const axiosConfig = { headers: config.headers, baseURL: config.baseURL.replace(/\/api\/.*/g, '') }

    //get fingerprint
    try {
      const { data } = await axios.get('/api/v2/admin/management/licensing/status', axiosConfig)

      // default localhost:3000 fingerprint if undefined
      fingerprint = data.payload.fingerprints.cluster_url || 'de:3b:18:6d:f6:e9:fe:c0:b2:5b:e3:1c:a2:47:9a:82'
    } catch (e) {
      throw new Error('Error while requesting server fingerprint: ' + e.message)
    }

    let res
    //Verify fingerprint
    try {
      res = await sendPost('/fingerprint/check', {
        fingerprint,
        token
      })
    } catch (e) {
      bp.logger.attachError(e).error('Error during fingerprint check.')
    } finally {
      if (!res) {
        bp.logger.error(
          `Failed to start success telemetry syncronization, fingerprint ${fingerprint} is not authorized, check your token configuration.`
        )
        return
      }
    }

    let dataToSync = await db.getDataToSync()
    const stats = { success: 0, error: 0 }
    for (const data of dataToSync) {
      try {
        await sendPost('/receive', {
          ...data,
          payload: JSON.parse(data.payload),
          fingerprint,
          token
        })
        await db.markAsSynced(data.uuid)
        stats.success++
      } catch (e) {
        stats.error++
        bp.logger.attachError(e).error('Error sincronizing data: ' + e.message)
      }
    }

    dataToSync = await db.getNotesToSync()
    const statsNotes = { success: 0, error: 0 }
    for (const data of dataToSync) {
      try {
        await sendPost(
          '/note',
          {
            ...data,
            fingerprint,
            token
          },
          axiosConfig
        )
        await db.markNoteAsSynced(data.uuid)
        statsNotes.success++
      } catch (e) {
        statsNotes.error++
        bp.logger.attachError(e).error('Error sincronizing notes: ' + e.message)
      }
    }
    return { telemetry: stats, notes: statsNotes }
  } catch (err) {
    throw new Error('Cannot get data: ' + err.message)
  }
}
