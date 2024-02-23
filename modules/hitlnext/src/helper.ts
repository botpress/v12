import { IAgent } from './types'

export function agentName(agent: IAgent) {
  if (!agent) {
    return '-'
  }

  const { firstname, lastname } = agent.attributes || {}

  if (firstname || lastname) {
    return [firstname, lastname].filter(Boolean).join(' ')
  } else {
    return agent.email
  }
}
