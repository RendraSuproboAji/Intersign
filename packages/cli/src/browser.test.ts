import { afterEach, describe, expect, mock, test } from 'bun:test'
import type { spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { openBrowser } from './browser.js'

const spawnMock = mock(() => {
  const child = new EventEmitter() as EventEmitter & { unref: () => void }
  child.unref = mock(() => {})
  return child
}) as unknown as typeof spawn

afterEach(() => spawnMock.mockClear())

describe('browser launch', () => {
  test('removes the Intersign API key from the spawned process environment', () => {
    openBrowser(
      'https://editor.pascal.app/settings/agents/claim',
      {
        HOME: '/tmp/intersign-home',
        INTERSIGN_API_KEY: 'sk_live_private-agent-key',
        PATH: '/usr/bin',
      },
      spawnMock,
    )

    expect(spawnMock).toHaveBeenCalledTimes(1)
    const options = spawnMock.mock.calls[0]?.[2]
    expect(options?.env).toEqual({ HOME: '/tmp/intersign-home', PATH: '/usr/bin' })
    expect(JSON.stringify(options)).not.toContain('sk_live_private-agent-key')
  })

  test('does not spawn when browser opening is disabled', () => {
    openBrowser(
      'https://editor.pascal.app/settings/agents/claim',
      {
        INTERSIGN_API_KEY: 'sk_live_private-agent-key',
        INTERSIGN_NO_OPEN: '1',
      },
      spawnMock,
    )

    expect(spawnMock).not.toHaveBeenCalled()
  })
})
