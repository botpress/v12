import { mustFixCwd } from './fix-cwd-if-needed'

describe('check if must fix cwd in node process', () => {
  test('not macos: no need', () => {
    const result = mustFixCwd('win32', true, '/', '/')
    expect(result).toEqual(false)
  })
  test('not pkg: no need', () => {
    const result = mustFixCwd('win32', false, '/', '/')
    expect(result).toEqual(false)
  })
  test('macos pkg, root paths: no need', () => {
    const result = mustFixCwd('darwin', true, '/', '/')
    expect(result).toEqual(false)
  })
  test('macos pkg, non-root paths: no need', () => {
    const result = mustFixCwd('darwin', true, '/some_folder', '/some_folder/path_to_project/')
    expect(result).toEqual(false)
  })
  test('macos pkg, cwd root path, project non-root path: needs', () => {
    const result = mustFixCwd('darwin', true, '/', '/some_folder/path_to_project/')
    expect(result).toEqual(true)
  })
})
