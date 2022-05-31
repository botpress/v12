import * as sdk from 'botpress/sdk'

const TABLE_NAME = 'reservations'

interface User {
  id: number
  name: string
  role: string
}

const generateOrderId = () => {
  return Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000)
}

export default class CompleteModuleDB {
  knex: sdk.KnexExtended

  constructor(bp: typeof sdk) {
    this.knex = bp.database
  }

  initialize() {
    return this.knex.createTableIfNotExists(TABLE_NAME, table => {
      table.increments('id').primary()
      table.string('confirmationNumber')
      table.integer('numberOfGuests')
      table.string('customer')
      table.string('time')
      table.date('date')
    })
  }

  async addReservation(numberOfGuests: number, customer: string, time: string) {
    const confirmationNumber = generateOrderId()
    const { id } = await this.knex.insertAndRetrieve<User>(
      TABLE_NAME,
      { confirmationNumber, numberOfGuests, customer, date: new Date(), time },
      ['id']
    )
    return { id, confirmationNumber }
  }

  async getReservations() {
    return this.knex(TABLE_NAME).select()
  }
}
