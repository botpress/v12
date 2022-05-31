import * as sdk from 'botpress/sdk'
import DB from './db'

export default async (bp: typeof sdk, db: DB) => {
  const router = bp.http.createRouterForBot('reservations')

  router.post('/reservation', async (req, res) => {
    const { customer, numberOfGuests, time } = req.body
    const { id, confirmationNumber } = await db.addReservation(numberOfGuests, customer, time)
    res.send({ id, confirmationNumber })
  })

  router.get('/reservations', async (req, res) => {
    const reservations = await db.getReservations()
    res.send({ reservations })
  })
}
