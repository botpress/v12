// makes sure that path resolve has same behavior accross platforms, and that change should be propagated downstream
// on macos, path.resolve when run as an app, will set the CWD to / (root path), this can cause a whole host of issues
import path from 'path'

export function fixPathResolve() {
  const projectLocation = process.pkg
    ? path.dirname(process.execPath) // We point at the binary path
    : __dirname // e.g. /dist/..

  const currentEmptyResolve = path.resolve('')

  if (currentEmptyResolve === '/' && projectLocation !== '/') {
    process.chdir(projectLocation)
  }
}
