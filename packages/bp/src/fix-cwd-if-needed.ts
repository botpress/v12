// makes sure that path.resolve("") has same behavior across platforms
// on macos, path.resolve("") === '/' not CWD. This causes a whole host of issues

import os from 'os'
import path from 'path'

export const mustFixCwd = (osCode, isPkg, currentEmptyPathResolve, projectLocation) => {
  if (!isPkg || osCode !== 'darwin') {
    return false
  }

  return currentEmptyPathResolve === '/' && projectLocation !== '/'
}

export const fixCwdIfNeeded = () => {
  const projectLocation = path.dirname(process.execPath) // We point at the binary path
  const currentEmptyPathResolve = path.resolve('')
  const isPkg = !!process.pkg
  const osCode = os.platform()

  if (mustFixCwd(osCode, isPkg, currentEmptyPathResolve, projectLocation)) {
    process.chdir(projectLocation)
  }
}
