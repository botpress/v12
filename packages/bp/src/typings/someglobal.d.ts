/* eslint-disable no-var */
export interface ExtraRequire {
  addToNodePath(path: string): void
  getPaths(): string[]
  overwritePaths(paths: string[])
}

declare var required: ExtraRequire & NodeRequire

declare global {
  function printErrorDefault(err: unknown): void
  var DEBUG: IDebug
  var BOTPRESS_CORE_EVENT: IEmitCoreEvent
  var BOTPRESS_CORE_EVENT_TYPES: BotpressCoreEvents

  // var require: ExtraRequire
  var requireExtra: ExtraRequire
  var rewire: (name: string) => string
  function printBotLog(botId: string, args: any[]): void
  function printLog(args: any[]): void
}

export {}
