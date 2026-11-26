import { afterEach, beforeEach, jest } from '@jest/globals'
const core = await import('../__fixtures__/core')
const github = await import('../__fixtures__/github')

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)

const main = await import('../src/main')

describe('Retrieving supported versions', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('latest', async () => {
    core.getInput.mockReturnValueOnce('')
    core.getInput.mockReturnValueOnce('latest')

    await main.run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'version',
      expect.stringMatching(/^[0-9]+\.[0-9]+$/)
    )
  })

  it('oldest', async () => {
    core.getInput.mockReturnValueOnce('')
    core.getInput.mockReturnValueOnce('oldest')

    await main.run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'version',
      expect.stringMatching(/^[0-9]+\.[0-9]+$/)
    )
  })

  it('all', async () => {
    core.getInput.mockReturnValueOnce('')
    core.getInput.mockReturnValueOnce('all')

    await main.run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'version',
      expect.stringMatching(/^\[.*,.*\]$/)
    )
  })

  it('custom date (2 only)', async () => {
    core.getInput.mockReturnValueOnce('2002-01-01')
    core.getInput.mockReturnValueOnce('oldest')

    await main.run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'version',
      expect.stringMatching(/^2\./)
    )
  })

  it('custom date (2 and 3)', async () => {
    core.getInput.mockReturnValueOnce('2018-01-01')
    core.getInput.mockReturnValueOnce('oldest')

    await main.run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'version',
      expect.stringMatching(/^2\./)
    )
  })

  it('invalid date', async () => {
    core.getInput.mockReturnValueOnce('2000-foo-bar')
    core.getInput.mockReturnValueOnce('oldest')

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("invalid date"))
  })

  it('unsupported date', async () => {
    core.getInput.mockReturnValueOnce('2000-01-01')
    core.getInput.mockReturnValueOnce('latest')

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("no supported"))
  })

  it('invalid version', async () => {
    core.getInput.mockReturnValueOnce('')
    core.getInput.mockReturnValueOnce('something')

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("must be one of"))
  })
})
