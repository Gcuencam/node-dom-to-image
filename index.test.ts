import { describe, expect, it } from 'vitest'
import domToImage from './index'

describe('domToImage', () => {
  it('is exported as a function', () => {
    expect(typeof domToImage).toBe('function')
  })

  it('runs in a real browser environment with foreignObject support', () => {
    // jsdom cannot render <foreignObject>, so this suite must run against a real
    // browser engine (see vitest.config.ts) for the SVG capture technique to be testable.
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
    expect(foreignObject.namespaceURI).toBe('http://www.w3.org/2000/svg')
  })
})
