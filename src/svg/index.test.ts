import { describe, expect, it } from 'vitest'
import { createSvgURI } from './index'

describe('createSvgURI', () => {
  it('returns a data URI embedding the captured node as a foreignObject', () => {
    const node = document.createElement('div')
    node.textContent = 'hello'
    document.body.appendChild(node)

    const uri = createSvgURI(node)
    expect(uri.startsWith('data:image/svg+xml;')).toBe(true)

    const svgMarkup = decodeURIComponent(uri.split(',').slice(1).join(','))
    expect(svgMarkup).toContain('<foreignObject')
    expect(svgMarkup).toContain('hello')

    node.remove()
  })

  it('applies the filter option to remove matching elements', () => {
    const node = document.createElement('div')
    node.innerHTML = '<span class="keep">a</span><span class="drop">b</span>'
    document.body.appendChild(node)

    const uri = createSvgURI(node, { filter: '.drop' })
    const svgMarkup = decodeURIComponent(uri.split(',').slice(1).join(','))

    expect(svgMarkup).toContain('keep')
    expect(svgMarkup).not.toContain('drop')

    node.remove()
  })
})
