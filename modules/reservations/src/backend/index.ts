import * as sdk from 'botpress/sdk'

import en from '../translations/en.json'
import api from './api'
import DB from './db'

import createReservation from './skills/createReservation'

// This is called when server is started, usually to set up the database
const onServerStarted = async (bp: typeof sdk) => {
  await new DB(bp).initialize()
}

// At this point, you would likely setup the API route of your module.
const onServerReady = async (bp: typeof sdk) => {
  await api(bp, new DB(bp))
}

// Every time a bot is created (or enabled), this method will be called with the bot id
const onBotMount = async (bp: typeof sdk, botId: string) => {}

// This is called every time a bot is deleted (or disabled)
const onBotUnmount = async (bp: typeof sdk, botId: string) => {}

// When anything is changed using the flow editor, this is called with the new flow, so you can rename nodes if you reference them
const onFlowChanged = async (bp: typeof sdk, botId: string, flow: sdk.Flow) => {}

/**
 * This is where you would include your 'demo-bot' definitions.
 * You can copy the content of any existing bot and mark them as "templates", so you can create multiple bots from the same template.
 */
const botTemplates: sdk.BotTemplate[] = [{ id: 'my_bot_demo', name: 'Bot Demo', desc: 'Some description' }]

/**
 * Skills allows you to create custom logic and use them easily on the flow editor
 * Check this link for more information: https://botpress.com/docs/developers/create-module/#skill-creation
 */
const skills: sdk.Skill[] = [
  {
    id: 'CreateReservation',
    name: 'module.reservations.skills.createReservation',
    icon: 'calendar',
    flowGenerator: createReservation.generateFlow
  }
]

const entryPoint: sdk.ModuleEntryPoint = {
  onServerStarted,
  onServerReady,
  onBotMount,
  onBotUnmount,
  onFlowChanged,
  botTemplates,
  skills,
  translations: { en },
  definition: {
    // This must match the name of your module's folder, and the name in package.json
    name: 'reservations',
    /**
     * By default we are using the https://blueprintjs.com/docs/#icons. Use the corresponding name
     * Otherwise, create an icon in the assets module in the following format studio_${module.menuIcon}
     */
    menuIcon: 'calendar',
    // This is the name of your module which will be displayed in the sidebar
    menuText: 'ResRes',
    // When set to `true`, the name and icon of your module won't be displayed in the sidebar
    noInterface: false,
    // The full name is used in other places, for example when displaying bot templates
    fullName: 'Reservations',
    // Not used anywhere, but should be a link to your website or module repository
    homepage: 'https://botpress.com'
  }
}

export default entryPoint
