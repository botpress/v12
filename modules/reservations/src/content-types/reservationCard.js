const base = require('./_base')

function renderElement(data, channel) {
  const events = []

  if (data.typing) {
    events.push({
      type: 'typing',
      value: data.typing
    })
  }

  return [
    ...events,
    {
      type: 'custom',
      module: 'reservations',
      component: 'ReservationCard',
      confirmationNumber: data.confirmationNumber,
      numberOfGuests: data.numberOfGuests,
      customer: data.customer,
      date: new Date().toLocaleDateString(),
      time: data.time
    }
  ]
}

module.exports = {
  id: 'reservations_reservation-card',
  group: 'Reservations Module',
  title: 'Reservation Card',

  jsonSchema: {
    description: 'module.reservations.types.reservationCard.description',
    type: 'object',
    required: ['confirmationNumber', 'numberOfGuests', 'customer', 'date', 'time'],
    properties: {
      confirmationNumber: {
        type: 'string',
        title: 'module.reservations.types.reservationCard.confirmationNumber'
      },
      numberOfGuests: {
        type: 'string',
        title: 'module.reservations.types.reservationCard.numberOfGuests'
      },
      customer: {
        type: 'string',
        title: 'module.reservations.types.reservationCard.customer'
      },
      date: {
        type: 'string',
        title: 'module.reservations.types.reservationCard.date'
      },
      time: {
        type: 'string',
        title: 'module.reservations.types.reservationCard.time'
      },
      ...base.typingIndicators
    }
  },

  uiSchema: {},
  computePreviewText: formData =>
    `${formData.confirmationNumber} - Reservation for ${formData.customer}, on ${formData.date} for ${formData.numberOfGuests} people at ${formData.time}`,

  renderElement
}
