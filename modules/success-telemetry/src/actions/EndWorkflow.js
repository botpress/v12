/**
 * Indicate where a workflow will be successfully completed (Success Module)
 * @title End Workflow
 * @category Success
 * @author Botpress, Inc.
 * @param {string} workflowId - The name of the workflow (should be the same as the name used in the workflowStart action)
 */

const moment = require('moment')
const axios = require('axios')

const addTelemetryData = async (workflowId, type) => {
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
  let workflow = event.state.session.workflows[workflowId]

  if (workflow && workflow.status == 'PENDING') {
    workflow = {
      ...workflow,
      endUnix: moment(new Date()).unix(),
      status: 'SUCCESS'
    }
    await bp.experimental.successTelemetry.addTelemetryData({
      botId: event.botId,
      metricId: 'workflow',
      payload: workflow
    })
    event.state.session.workflows[workflowId] = workflow
  }

  await event.setFlag(bp.IO.WellKnownFlags.FORCE_PERSIST_STATE, true)
}

return addTelemetryData(args.workflowId, args.type)
