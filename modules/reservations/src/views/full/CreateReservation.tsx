// @ts-ignore
import ContentPickerWidget from 'botpress/content-picker'
import React, { FC, useState, useEffect } from 'react'

export const CreateReservation: FC<any> = props => {
  const [customerContentId, setCustomerContentId] = useState(props.customerContentId || '')
  const [numberOfGuestsContentId, setNumberOfGuestsContentId] = useState(props.numberOfGuestsContentId || '')
  const [dateContentId, setDateContentId] = useState(props.dateContentId || '')
  const [timeContentId, setTimeContentId] = useState(props.timeContentId || '')
  const { bp } = props

  //customer
  const onCustomerContentChanged = (element, force) => {
    if (element && (force || element.id !== customerContentId)) {
      setCustomerContentId(element.id)
    }
  }

  const refreshCustomerContentId = async () => {
    const id = customerContentId

    if (id && id.length) {
      const res = await bp.axios.get(`/content/element/${id}`)
      return onCustomerContentChanged(res.data, true)
    }
  }

  //number of guests
  const onNumberOfGuestsContentChanged = (element, force) => {
    if (element && (force || element.id !== numberOfGuestsContentId)) {
      setNumberOfGuestsContentId(element.id)
    }
  }

  const refreshNumberOfGuestsContentId = async () => {
    const id = numberOfGuestsContentId

    if (id && id.length) {
      const res = await bp.axios.get(`/content/element/${id}`)
      return onNumberOfGuestsContentChanged(res.data, true)
    }
  }

  //date
  const onDateContentChanged = (element, force) => {
    if (element && (force || element.id !== dateContentId)) {
      setDateContentId(element.id)
    }
  }

  const refreshDateContentId = async () => {
    const id = dateContentId

    if (id && id.length) {
      const res = await bp.axios.get(`/content/element/${id}`)
      return onDateContentChanged(res.data, true)
    }
  }

  //time
  const onTimeContentChanged = (element, force) => {
    if (element && (force || element.id !== timeContentId)) {
      setTimeContentId(element.id)
    }
  }

  const refreshTimeContentId = async () => {
    const id = timeContentId

    if (id && id.length) {
      const res = await bp.axios.get(`/content/element/${id}`)
      return onTimeContentChanged(res.data, true)
    }
  }

  const updateParent = () => {
    props.onDataChanged({
      customerContentId,
      numberOfGuestsContentId,
      dateContentId,
      timeContentId
    })
    if (customerContentId && numberOfGuestsContentId && dateContentId && timeContentId) {
      props.onValidChanged(true)
    }
  }

  useEffect(() => {
    updateParent()
  }, [customerContentId, numberOfGuestsContentId, dateContentId, timeContentId])

  return (
    <div>
      <h2>Create reservation</h2>
      <ContentPickerWidget
        categoryId="builtin_text"
        contentType="builtin_text"
        refresh={() => refreshCustomerContentId}
        itemId={customerContentId}
        onChange={onCustomerContentChanged}
        placeholder="Pick Customer content"
      />

      <ContentPickerWidget
        categoryId="builtin_text"
        contentType="builtin_text"
        refresh={() => refreshNumberOfGuestsContentId}
        itemId={numberOfGuestsContentId}
        onChange={onNumberOfGuestsContentChanged}
        placeholder="Pick Number of guests content"
      />

      <ContentPickerWidget
        categoryId="builtin_text"
        contentType="builtin_text"
        refresh={() => refreshDateContentId}
        itemId={dateContentId}
        onChange={onDateContentChanged}
        placeholder="Pick Date content"
      />

      <ContentPickerWidget
        categoryId="builtin_text"
        contentType="builtin_text"
        refresh={() => refreshTimeContentId}
        itemId={timeContentId}
        onChange={onTimeContentChanged}
        placeholder="Pick Time content"
      />
    </div>
  )
}
