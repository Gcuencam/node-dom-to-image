import { describe, expect, it } from 'vitest'
import { ABORT_ERROR, throwIfAborted } from './index'

describe('throwIfAborted', () => {
  it('does nothing without a signal', () => {
    expect(() => throwIfAborted()).not.toThrow()
  })

  it('does nothing while the signal is not aborted', () => {
    const controller = new AbortController()
    expect(() => throwIfAborted(controller.signal)).not.toThrow()
  })

  it('throws an AbortError once the signal is aborted', () => {
    const controller = new AbortController()
    controller.abort()
    expect(() => throwIfAborted(controller.signal)).toThrow(
      expect.objectContaining({ name: ABORT_ERROR }),
    )
  })
})
