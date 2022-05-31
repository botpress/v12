async function GetAll(getFilteredQuery) {
  const All = await getFilteredQuery()
    .count()
    .whereJson('payload', 'status', 'SUCCESS')
    .orWhereJson('payload', 'status', 'FAIL')
    .first()

  return All['count'] || All['count(*)']
}

async function SuccessValue(getFilteredQuery) {
  const Success = await getFilteredQuery()
    .count()
    .whereJson('payload', 'status', 'SUCCESS')
    .first()

  return Success['count'] || Success['count(*)']
}

async function FailValue(getFilteredQuery) {
  const Fail = await getFilteredQuery()
    .count()
    .andWhereJson('payload', 'status', 'FAIL')
    .first()

  return Fail['count'] || Fail['count(*)']
}

bp.experimental.successTelemetry.registryTelemetry('workflow', {
  name: 'Workflow Completion',
  viewFunction: async ({ startDate, endDate, getFilteredQuery }) => {
    const all = await GetAll(getFilteredQuery)
    const success = await SuccessValue(getFilteredQuery)
    //const fail = await FailValue(getFilteredQuery)

    return `
    <table>
      <tr>
        <th> Workflows Started </th>
        <th> Successful Completion </th>
      </tr>
      <tr>
        <td> ${all} </td>
        <td> ${all > 0 ? (success / all).toFixed(2) * 100 : '-'}% </td>
      </tr>
    </table>
  `
  },
  description: `Measures how efficiently your chatbot is in assisting users
  <br/>
  <br/><strong>Workflows Started</strong>: The number of workflows that have been initiated
  <br/><strong>Successful Completion</strong>: The percentage of workflows that have been successfully completed`,
  notesDisplay: 'Target Workflow Completion Rate'
})
