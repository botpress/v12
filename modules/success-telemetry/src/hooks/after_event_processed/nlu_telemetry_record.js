if (event.direction == 'incoming') {
  const axios = require('axios')

  const sendTelemetry = async (isQna = false) => {
    const { name: intent, confidence } = event.nlu.intent

    await bp.experimental.successTelemetry.addTelemetryData({
      botId: event.botId,
      metricId: 'nlu',
      payload: { intent, confidence, is_qna: isQna }
    })
  }

  const track = async (trackAlways = true) => {
    if (event.state.context && event.nlu) {
      if (!event.nlu.intent) return
      const { currentNode, previousNode, currentFlow } = event.state.context
      if (!currentNode) {
        if (trackAlways) {
          const { name: intent } = event.nlu.intent
          if (!intent || !intent.startsWith('__qna__')) return
          sendTelemetry(true)
        }
        return
      }
      const theNode = currentFlow.startsWith('skills/') ? previousNode : currentNode
      if (trackAlways) {
        if (currentFlow.startsWith('skills/') && !currentFlow.startsWith('skills/choice-')) {
          if (!theNode.startsWith('TRACKNLU')) return
        } else if (theNode.startsWith('IGNORENLU')) return
      } else {
        if (!theNode.startsWith('TRACKNLU')) return
      }

      await sendTelemetry()
    }
  }

  const start = async () => {
    const config = await bp.config.getModuleConfigForBot('success-telemetry', event.botId)
    let { alwaysTrackNLU: trackAlways } = config

    if (!event.type == 'text') return

    if (trackAlways === undefined) trackAlways = true

    track(trackAlways)
  }

  return start()
}
