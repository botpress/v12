import React, { FC } from 'react'

export { CreateReservation } from './CreateReservation'
import ReservationsList from './ReservationsList'

const Main: FC<any> = ({ bp }) => {
  return (
    <div>
      <h1>Reservations</h1>
      <ReservationsList bp={bp} />
    </div>
  )
}

export default Main
