const extractStats = rows => {
  const confidences = rows.map(r => r.confidence).filter(r => r.intent !== 'none')
  const noneCount = rows.filter(r => r.intent == 'none').length
  confidences.sort()

  const count = confidences.length
  let averageConfidence = null
  let understandingRate = null
  //let medianConfidence = 0

  if (count) {
    averageConfidence = confidences.reduce((a, b) => a + b, 0) / count
    //understandingRate = rows
    /*
      medianConfidence = confidences[count / 2]
      if (count % 2 !== 0)
        medianConfidence = (confidences[Math.floor(count / 2)] + confidences[Math.ceil(count / 2)]) / 2
    */
    understandingRate = (count - noneCount) / count
  }

  return [averageConfidence && averageConfidence.toFixed(4), understandingRate && understandingRate.toFixed(4)]
}

// TODO: use knex to filter in a query
const getAllNLUTelemetryRows = async getFilteredQuery => {
  const rows = await getFilteredQuery()
  return rows
    .map(r => (typeof r.payload == 'string' ? JSON.parse(r.payload) : r.payload))
    .filter(r => r.hasOwnProperty('is_qna'))
}

bp.experimental.successTelemetry.registryTelemetry('nlu', {
  name: 'Understanding - Intent Recognition',
  viewFunction: async ({ startDate, endDate, getFilteredQuery }) => {
    const telemetryRows = await getAllNLUTelemetryRows(getFilteredQuery)

    let [intentsAvgConfidence, understandingRate] = extractStats(telemetryRows)
    understandingRate = understandingRate && `${100 * understandingRate}%`
    intentsAvgConfidence = intentsAvgConfidence && `${100 * intentsAvgConfidence}%`

    return `
  <table>
    <tr>
      <th>User Messages</th>
      <th>Understanding Rate</th>
    </tr>
    <tr>
      <td>${telemetryRows.length}</td>
      <td>${understandingRate || '-'}</td>
    </tr>
  </table>
`
  },
  description: `Measures how well your chatbot is understanding users
    <br/>
    <br/><strong>User Messages</strong>: User-written messages taken into account (excluding button clicks)
    <br/><strong>Understanding Rate</strong>: The percentage of user messages that were successfully classified as an intent or QNA
    `,
  notesDisplay: 'Target Understanding Rate'
})
