import { describe, expect, it } from 'vitest'
import { getDefaultStyle } from './defaults'

describe('getDefaultStyle', () => {
  it('returns the UA default computed style for a tag', () => {
    const div = getDefaultStyle('div')
    expect(div.display).toBe('block')

    const span = getDefaultStyle('span')
    expect(span.display).toBe('inline')
  })

  it('returns the same cached object for repeated calls', () => {
    expect(getDefaultStyle('p')).toBe(getDefaultStyle('P'))
  })
})
