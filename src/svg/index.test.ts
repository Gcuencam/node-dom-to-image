import { describe, expect, it } from 'vitest'
import { createSvgURI } from './index'

const decodeSvg = (uri: string) => decodeURIComponent(uri.split(',').slice(1).join(','))

describe('createSvgURI', () => {
  it('returns a data URI embedding the captured node as a foreignObject', async () => {
    const node = document.createElement('div')
    node.textContent = 'hello'
    document.body.appendChild(node)

    const uri = await createSvgURI(node)
    expect(uri.startsWith('data:image/svg+xml;')).toBe(true)

    const svgMarkup = decodeSvg(uri)
    expect(svgMarkup).toContain('<foreignObject')
    expect(svgMarkup).toContain('hello')

    node.remove()
  })

  it('inlines computed styles onto the clone so it no longer depends on stylesheets', async () => {
    const node = document.createElement('div')
    node.style.color = 'rgb(255, 0, 0)'
    node.textContent = 'styled'
    document.body.appendChild(node)

    const svgMarkup = decodeSvg(await createSvgURI(node))
    expect(svgMarkup).toContain('color: rgb(255, 0, 0)')

    node.remove()
  })

  it('drops descendants rejected by the filter predicate', async () => {
    const node = document.createElement('div')
    node.innerHTML = '<span class="keep">a</span><span class="drop">b</span>'
    document.body.appendChild(node)

    const svgMarkup = decodeSvg(
      await createSvgURI(node, { filter: (el) => !el.classList.contains('drop') }),
    )

    expect(svgMarkup).toContain('class="keep"')
    expect(svgMarkup).not.toContain('class="drop"')

    node.remove()
  })

  it('honors width/height overrides on the generated svg', async () => {
    const node = document.createElement('div')
    node.style.width = '50px'
    node.style.height = '40px'
    document.body.appendChild(node)

    const svgMarkup = decodeSvg(await createSvgURI(node, { width: 200, height: 100 }))
    expect(svgMarkup).toContain('width="200"')
    expect(svgMarkup).toContain('height="100"')

    node.remove()
  })
})
