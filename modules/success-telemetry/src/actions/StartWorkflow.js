/**
 * Indicate where a workflow starts (Success Module)
 * @title Start Workflow
 * @category Success
 * @author Botpress, Inc.
 * @param {string} workflowId - The name of the workflow
 */

const moment = require('moment')
const axios = require('axios')

const addTelemetryData = async (workflowId, type) => {
  try {
    if (!workflowId || !workflowId.replace(/ /, '').length) {
      bp.logger
        .forBot(event.botId)
        .error(
          `Success Telemetry - Using a workflow action without specifying a valid workflowId on flow '${event.state
            .context && event.state.context.currentFlow}' and node '${event.state.context &&
            event.state.context.currentNode}'`
        )
      return
    }

    workflowId = workflowId.replace(/ /, '').toLocaleLowerCase()

    if (!event.state.session.workflows) event.state.session.workflows = {}
    const workflow = event.state.session.workflows[workflowId]

    // Expire the workflow with same id, if it still pending
    if (workflow && workflow.status == 'PENDING') {
      await bp.experimental.successTelemetry.addTelemetryData({
        botId: event.botId,
        metricId: 'workflow',
        payload: {
          ...workflow,
          endUnix: moment(new Date()).unix(),
          status: 'FAIL'
        }
      })

      event.state.session.workflows[workflowId] = undefined
      delete event.state.session.workflows[workflowId]
    } else {
      console.log('No previous Workflow')
    }

    const workflowData = {
      conversationId: event.id,
      workflowId,
      startUnix: moment(new Date()).unix(),
      status: 'PENDING'
    }

    event.state.session.workflows[workflowId] = workflowData
    await event.setFlag(bp.IO.WellKnownFlags.FORCE_PERSIST_STATE, true)
  } catch (e) {
    bp.logger.forBot(event.botId).error(`Error saving workflow statys - ${e.message}`)
  }
} //Saving the payload

return addTelemetryData(args.workflowId, args.type)
