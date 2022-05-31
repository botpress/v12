const axios = require('axios')
const moment = require('moment')

if (event.state && event.state.session && event.state.session.workflows) {
  const process = async () => {
    const workflows = event.state.session.workflows
    for (const workflowId of Object.keys(workflows)) {
      const workflow = workflows[workflowId]
      if (workflows[workflowId] && workflows[workflowId].status == 'PENDING') {
        workflows[workflowId] = {
          ...workflow,
          endUnix: moment(new Date()).unix(),
          status: 'FAIL'
        }
        await bp.experimental.successTelemetry.addTelemetryData({
          botId: event.botId,
          metricId: 'workflow',
          payload: workflows[workflowId]
        })
      }
    }
    await event.setFlag(bp.IO.WellKnownFlags.FORCE_PERSIST_STATE, true)
  }
  return process()
}
