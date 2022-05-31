function hasType(array, type) {
  return array.filter(item => item.payload.type == type).length > 0
}

async function calculate_users(getFilteredQuery) {
  const _ = require('lodash')
  const userInfo = (await getFilteredQuery().andWhere('uuid', 'like', 'userdata-%'))
    .map(item => {
      try {
        item.payload = typeof item.payload == 'string' ? JSON.parse(item.payload) : item.payload
      } catch (e) {
        bp.logger.attachError(e).error(`Error calculating user data for ` + JSON.stringify(item))
        item.payload = null
      }
      return item
    })
    .filter(item => item.uuid.indexOf('#') != -1 && item.payload)
  let returning_users = 0
  let new_users = 0

  const groupedByUser = _.groupBy(userInfo, info => {
    return info.uuid.substring(0, info.uuid.indexOf('#'))
  })

  if (userInfo.length > 0) {
    for (let userId of Object.keys(groupedByUser)) {
      const userList = groupedByUser[userId]
      if (hasType(userList, 'NEW_USER')) new_users++
      else if (hasType(userList, 'RETURNING_USER')) returning_users++
    }
  }
  return { new_users, total_users: new_users + returning_users, returning_users }
}

async function calculate_real_sessions(getFilteredQuery) {
  const info = await getFilteredQuery().andWhere('uuid', 'like', 'int-sessions-%')
  const count = info.length

  return count
}

async function calculate_sessions(getFilteredQuery) {
  const info = await getFilteredQuery().andWhere('uuid', 'like', 'sessions-%')
  const count = info.length

  return count
}

bp.experimental.successTelemetry.registryTelemetry('user', {
  name: 'Adoption and Usage',
  viewFunction: async ({ startDate, endDate, getFilteredQuery }) => {
    const { new_users, total_users, returning_users } = await calculate_users(getFilteredQuery)
    const sessions_data = await calculate_sessions(getFilteredQuery)
    const real_sessions_data = await calculate_real_sessions(getFilteredQuery)
    return `
          <table>
            <tr>
              <th>Total Users</th>
              <th>New Users</th>
              <th>Returning Users</th>
              <th>Sessions</th>
              <th>Active Sessions</th>
            </tr>
            <tr>
              <td>${total_users}</td>
              <td>${new_users}</td>
              <td>${returning_users}</td>
              <td>${sessions_data}</td>
              <td>${real_sessions_data}</td>
            </tr>
          </table>
        `
  },
  description: `Measures how much your chatbot is being used<br />
    <br/><strong>Total Users</strong>: New users plus returning users
    <br/><strong>New Users</strong>: The number of users that spoke to the chatbot for the first time
    <br/><strong>Returning Users</strong>: The number of users that spoke to the chatbot multiple times in different sessions
    <br/><strong>Sessions</strong>: The total number of sessions, where a conversation was initiated
    <br/><strong>Active Sessions</strong>: The number of sessions where the user interacted with the chatbot at least once
  `,
  notesDisplay: 'Target Users'
})
