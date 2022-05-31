const axios = require('axios')
/**
 * Creates a reservation
 * @title Create Reservation
 * @category Reservations
 * @author Botpress, Inc.
 * @param item The name of the item
 * @param qty The item quantity
 * @param customer The name of the customer
 */
const createReservation = async (customer, numberOfGuests, time) => {
  const axiosConfig = await this.bp.http.getAxiosConfigForBot(event.botId, { localUrl: true })
  const {
    data: { id, confirmationNumber }
  } = await axios.post('/mod/reservations/reservation', { numberOfGuests, customer, time }, axiosConfig)

  temp.createdReservation = { confirmationNumber, numberOfGuests, customer, date: new Date().toLocaleDateString(), time }
  bp.logger.info(`[createReservation] ${id} ${confirmationNumber} ${customer} ${numberOfGuests} ${time}`)
}

return createReservation(args.customer, args.numberOfGuests, args.time)
