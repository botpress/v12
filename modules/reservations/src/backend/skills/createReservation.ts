import * as sdk from 'botpress/sdk'

export interface CreateReservationData {
  customerContentId: string
  numberOfGuestsContentId: string
  dateContentId: string
  timeContentId: string
}

export const generateFlow = async (
  data: CreateReservationData,
  metadata: sdk.FlowGeneratorMetadata
): Promise<sdk.FlowGenerationResult> => {
  return {
    transitions: createTransitions(),
    flow: {
      nodes: createNodes(data),
      catchAll: {
        next: []
      }
    }
  }
}

const createNodes = (data: CreateReservationData) => {
  const nodes: sdk.SkillFlowNode[] = [
    {
      name: 'entry',
      onEnter: [
        {
          type: sdk.NodeActionType.RenderElement,
          name: `#!${data.customerContentId}`
        }
      ],
      onReceive: [
        {
          type: sdk.NodeActionType.RunAction,
          name: 'builtin/setVariable {"type":"temp","name":"customer","value":"{{event.preview}}"}'
        }
      ],
      next: [{ condition: 'true', node: 'promptNumberOfGuests' }]
    },
    {
      name: 'promptNumberOfGuests',
      onEnter: [
        {
          type: sdk.NodeActionType.RenderElement,
          name: `#!${data.numberOfGuestsContentId}`
        }
      ],
      onReceive: [
        {
          type: sdk.NodeActionType.RunAction,
          name: 'builtin/setVariable {"type":"temp","name":"numberOfGuests","value":"{{event.preview}}"}'
        }
      ],
      next: [{ condition: 'true', node: 'promptDate' }]
    },
    {
      name: 'promptDate',
      onEnter: [
        {
          type: sdk.NodeActionType.RenderElement,
          name: `#!${data.dateContentId}`
        }
      ],
      onReceive: [
        {
          type: sdk.NodeActionType.RunAction,
          name: 'builtin/setVariable {"type":"temp","name":"date","value":"{{event.preview}}"}'
        }
      ],
      next: [{ condition: 'true', node: 'promptTime' }]
    },
    {
      name: 'promptTime',
      onEnter: [
        {
          type: sdk.NodeActionType.RenderElement,
          name: `#!${data.timeContentId}`
        }
      ],
      onReceive: [
        {
          type: sdk.NodeActionType.RunAction,
          name: 'builtin/setVariable {"type":"temp","name":"time","value":"{{event.preview}}"}'
        }
      ],
      next: [{ condition: 'true', node: 'createReservation' }]
    },
    {
      name: 'createReservation',
      onEnter: [
        {
          type: sdk.NodeActionType.RunAction,
          name: 'reservations/createReservation',
          args: {
            customer: '{{event.state.temp.customer}}',
            numberOfGuests: '{{event.state.temp.numberOfGuests}}',
            time: '{{event.state.temp.time}}'
          }
        },
        {
          type: sdk.NodeActionType.RunAction,
          name: 'builtin/setVariable {"type":"temp","name":"success","value":"true"}'
        }
      ],
      next: [{ condition: 'true', node: '#' }]
    }
  ]
  return nodes
}

const createTransitions = (): sdk.NodeTransition[] => {
  return [
    { caption: 'On success', condition: 'temp.success', node: '' },
    { caption: 'On failure', condition: '!temp.success', node: '' }
  ]
}

export default { generateFlow }
