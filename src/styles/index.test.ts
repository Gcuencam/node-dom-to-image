import { describe, expect, it } from 'vitest'
import { getStylesFromFile } from './index'

describe('getStylesFromFile', () => {
  it('does nothing when the document has no stylesheet link', () => {
    const node = document.createElement('html')
    node.innerHTML = '<head></head><body></body>'

    getStylesFromFile(node)

    expect(node.querySelector('head')?.querySelector('style')).toBeNull()
  })
})
