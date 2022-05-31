/**
 * Indicate where a workflow will be completed as failed (Success Module)
 * @title Fail Workflow
 * @category Success
 * @author Botpress, Inc.
 * @param {string} workflowId - The name of the workflow (should be the same as the name used in the workflowStart action)
 */

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

  if (!event.state.context.workflows) event.state.context.workflows = {}
  const workflow = event.state.context.workflows[workflowId]
  delete event.state.context.workflows[workflowId]

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
    event.state.context.workflows[workflowId] = undefined
  }
}

return addTelemetryData(args.workflowId, args.type)
