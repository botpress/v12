import * as sdk from 'botpress/sdk'
import _ from 'lodash'

import Database from './db'

export default async (bp: typeof sdk, db: Database) => {
  await db.initialize()
}
