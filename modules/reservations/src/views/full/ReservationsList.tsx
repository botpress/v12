import React, { FC, useEffect, useState } from 'react'

const ReservationsList: FC<any> = ({ bp }) => {
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    const fetchReservations = async () => {
      const {
        data: { reservations }
      } = await bp.axios.get('mod/reservations/reservations')

      reservations.map(res => {
        res.date = new Date().toLocaleDateString()
      })

      setReservations(reservations)
    }

    fetchReservations()
  }, [])

  return (
    <div>
      {reservations.map(reservation => (
        <div key={reservation.id}>
          <b>{reservation.confirmationNumber}</b> - Reservation for <b>{reservation.customer}</b>, on{' '}
          <b>{reservation.date}</b> for <b>{reservation.numberOfGuests}</b> people at <b>{reservation.time}</b>
        </div>
      ))}
    </div>
  )
}

export default ReservationsList
