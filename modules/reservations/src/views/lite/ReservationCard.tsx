import React, { FC } from 'react'

export const ReservationCard: FC<any> = ({ bp, confirmationNumber, numberOfGuests, customer, date, time }) => {
  return (
    <div>
      <b>{confirmationNumber}</b> - Reservation for <b>{customer}</b>, on <b>{date}</b> for <b>{numberOfGuests}</b>{' '}
      people at <b>{time}</b>
    </div>
  )
}
