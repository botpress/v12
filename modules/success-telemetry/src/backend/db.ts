import * as sdk from 'botpress/sdk'
import Knex from 'knex'
import { v4 } from 'uuid'

const TABLE_NAME = 'success_telemetry'
const NOTES_TABLE_NAME = 'success_telemetry_notes'

export interface Note {
  uuid: string
  text: string
  metricId: string
  available: boolean
  lastChanged: Date
  creationDate: Date
}

export default class Database {
  private knex: Knex & sdk.KnexExtension

  constructor(private bp: typeof sdk) {
    this.knex = bp.database
  }

  async initialize() {
    await this.knex.createTableIfNotExists(TABLE_NAME, table => {
      table
        .text('uuid')
        .notNullable()
        .primary()
      table.json('payload').notNullable()
      table.boolean('available').notNullable()
      table.timestamp('lastChanged').notNullable()
      table.timestamp('creationDate').notNullable()
    })

    await this.knex.createTableIfNotExists(NOTES_TABLE_NAME, table => {
      table
        .text('uuid')
        .notNullable()
        .primary()
      table.text('text')
      table.string('metricId').notNullable()
      table.string('workspaceId').notNullable()
      table.boolean('available').notNullable()
      table.timestamp('lastChanged').notNullable()
      table.timestamp('creationDate').notNullable()
    })
  }

  async addTelemetryData(payload, options?: { uuid?: string }) {
    try {
      //Upsert
      await this.knex.raw(
        `? ON CONFLICT (uuid)
                DO UPDATE SET
                "lastChanged" = ?,
                payload = ?,
                available = ?
                `,
        [
          this.knex(TABLE_NAME).insert({
            uuid: options?.uuid || v4(),
            payload: this.knex.json.set(payload),
            available: this.knex.bool.true(),
            lastChanged: this.knex.date.now(),
            creationDate: this.knex.date.now()
          }),
          this.knex.date.now(),
          this.knex.json.set(payload),
          this.knex.bool.true()
        ]
      )
    } catch (err) {
      this.bp.logger.attachError(err).warn('Could not add data')
    }
  }

  async addNote(text, options: { metricId: string; workspaceId: string }) {
    const currentNote: Note = await this.knex(NOTES_TABLE_NAME)
      .where('metricId', options.metricId)
      .first()

    if (currentNote) {
      await this.knex(NOTES_TABLE_NAME)
        .update({
          text,
          available: this.knex.bool.true(),
          lastChanged: this.knex.date.now()
        })
        .where('uuid', currentNote.uuid)
    } else {
      await this.knex(NOTES_TABLE_NAME).insert({
        uuid: v4(),
        text,
        metricId: options.metricId,
        workspaceId: options.workspaceId,
        available: this.knex.bool.true(),
        lastChanged: this.knex.date.now(),
        creationDate: this.knex.date.now()
      })
    }
  }

  async getNote(options: { metricId: string; workspaceId: string }) {
    try {
      return await this.knex(NOTES_TABLE_NAME)
        .where('metricId', options.metricId)
        .andWhere('workspaceId', options.workspaceId)
        .first()
    } catch (err) {
      this.bp.logger.attachError(err).warn('Could not get note')
    }
  }

  async deleteTelemetryData() {
    try {
      await this.knex(TABLE_NAME).delete()
    } catch (err) {
      this.bp.logger.attachError(err).warn('Could not delete data')
    }
  }

  async getTelemetryData(options?: { startDate: Date; endDate: Date; botId: string }) {
    let query = this.knex(TABLE_NAME)
      .select()
      .andWhere(this.knex.date.isBetween('creationDate', options.startDate, options.endDate))

    this.appendJsonUtils(query)

    if (options.botId && options.botId !== '___') {
      // @ts-ignore
      query = query.andWhereJson('payload', 'botId', options.botId)
    }

    try {
      const telemetryData = await query
      return telemetryData
    } catch (err) {
      this.bp.logger.attachError(err).warn('Could not retrieve data')
      return []
    }
  }

  async getDataToSync() {
    const query = this.knex(TABLE_NAME)
      .select()
      .where('available', this.knex.bool.true())

    try {
      const telemetryData = await query
      return telemetryData
    } catch (err) {
      this.bp.logger.attachError(err).warn('Could not retrieve data')
      return []
    }
  }

  async getNotesToSync() {
    const query = this.knex(NOTES_TABLE_NAME)
      .select()
      .where('available', this.knex.bool.true())

    try {
      const telemetryData = await query
      return telemetryData
    } catch (err) {
      this.bp.logger.attachError(err).warn('Could not retrieve data')
      return []
    }
  }

  async markAsSynced(uuid) {
    await this.knex(TABLE_NAME)
      .update({
        available: this.knex.bool.false()
      })
      .where('uuid', uuid)
  }

  async markNoteAsSynced(uuid) {
    await this.knex(NOTES_TABLE_NAME)
      .update({
        available: this.knex.bool.false()
      })
      .where('uuid', uuid)
  }

  appendJsonUtils(query) {
    const { client } = query.client.config

    if (client === 'sqlite3') {
      query.andWhereJson = (column, property, value) => {
        return query.andWhere(column, 'like', `%"${property}":"${value}"%`)
      }
      query.whereJson = (column, property, value) => {
        return query.where(column, 'like', `%"${property}":"${value}"%`)
      }
      query.orWhereJson = (column, property, value) => {
        return query.orWhere(column, 'like', `%"${property}":"${value}"%`)
      }
    } else {
      query.andWhereJson = (column, property, value) => {
        return query.andWhereRaw(`${column}->>'${property}'=? `, [value])
      }
      query.whereJson = (column, property, value) => {
        return query.whereRaw(`${column}->>'${property}'=? `, [value])
      }
      query.orWhereJson = (column, property, value) => {
        return query.orWhereRaw(`${column}->>'${property}'=? `, [value])
      }
    }
  }
}

export { TABLE_NAME, Database }
