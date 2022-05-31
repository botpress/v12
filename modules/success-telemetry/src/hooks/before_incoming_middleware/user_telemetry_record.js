const moment = require('moment')

const userToUuid = str => {
  return `userdata-${str}`
}

const userVisitUuid = str => {
  return `sessions-${str}`
}

const sessionToUuid = str => {
  return `int-sessions-${str}`
}

const addTelemetryData = async (payload, uuid = undefined) => {
  const moment = require('moment')
  const currentMoment = moment(new Date())

  if (!uuid) {
    bp.logger.error('user uuid required to add telemetry ' + payload)
  }

  payload = { ...payload, unix: currentMoment.unix() }

  const sendData = async () => {
    return await bp.experimental.successTelemetry.addTelemetryData({
      botId: event.botId,
      payload: payload,
      uuid: uuid + currentMoment.format('#YYYY-MM-DD'),
      metricId: 'user'
    })
  }
  sendData()
}

//stores all user-session real interactions -> we can count how many sessions has at least one message
const sendUserMessageData = async () => {
  if (event.type != 'visit' && event.type != 'session_reset' && event.type != 'proactive-trigger') {
    const botId = event.botId
    const sessionId = event.threadId || event.target // While using converseAPI threadId will be undefined
    const userId = event.target
    const eventId = event.id
    const payload = { botId, sessionId, eventId, userId }
    await addTelemetryData(payload, sessionToUuid(sessionId.toString()))
    await storeVisit()
  }
}

//stores user-session interactions -> we can count how many sessions user has opened up
const sendUserVisitData = async () => {
  if (event.type == 'visit' || event.type == 'proactive-trigger') {
    storeVisit()
  }
}

const storeVisit = async () => {
  const botId = event.botId
  const sessionId = event.threadId || event.target // While using converseAPI threadId will be undefined
  const userId = event.target
  const payload = { botId, sessionId, userId }
  await addTelemetryData(payload, userVisitUuid(sessionId.toString()))
}

//stores the user data for each session -> we can count number of returning / new users
const sendUserData = async () => {
  if (!event.state.temp.collectedUserStats) {
    const sessionId = event.threadId
    let userInfo = (await bp.database.table('bot_chat_users').where('userId', '=', event.target))[0]
    if (!userInfo || moment(userInfo.createdOn).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      await addTelemetryData({ type: 'NEW_USER', userId: event.target, sessionId }, userToUuid(event.target))
    } else {
      await addTelemetryData(
        { type: 'RETURNING_USER', userId: event.target, ...userInfo[0], sessionId },
        userToUuid(event.target)
      )
    }
    event.state.temp.collectedUserStats = true
    await event.setFlag(bp.IO.WellKnownFlags.FORCE_PERSIST_STATE, true)
  }
}

// only triggered in the first node of the flow
if (event.state && event.state.context && event.state.context.currentFlow == undefined) {
  return (async function() {
    await sendUserData()
    await sendUserMessageData()
    await sendUserVisitData()
  })()
} else {
  return sendUserData()
}
