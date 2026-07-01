import { describe, expect, it } from 'vitest'
import { cloneNode } from './index'

describe('cloneNode', () => {
  it('returns a detached deep clone of the node', () => {
    const node = document.createElement('div')
    node.innerHTML = '<span>child</span>'
    document.body.appendChild(node)

    const clone = cloneNode(node, {}, true)

    expect(clone).not.toBeNull()
    expect(clone).not.toBe(node)
    expect(clone?.parentNode).toBeNull()
    expect(clone?.querySelector('span')?.textContent).toBe('child')

    node.remove()
  })

  it('inlines the resolved computed style onto every element', () => {
    const node = document.createElement('div')
    node.style.color = 'rgb(0, 128, 0)'
    document.body.appendChild(node)

    const clone = cloneNode(node, {}, true)
    expect(clone?.style.color).toBe('rgb(0, 128, 0)')

    node.remove()
  })

  it('applies the filter predicate to descendants but never to the root', () => {
    const node = document.createElement('div')
    node.className = 'root'
    node.innerHTML = '<span class="keep">a</span><span class="drop">b</span>'
    document.body.appendChild(node)

    const clone = cloneNode(node, { filter: (el) => !el.classList.contains('drop') }, true)

    expect(clone?.classList.contains('root')).toBe(true)
    expect(clone?.querySelector('.keep')).not.toBeNull()
    expect(clone?.querySelector('.drop')).toBeNull()

    node.remove()
  })

  it('recreates ::before pseudo-element content via a scoped style rule', () => {
    const node = document.createElement('div')
    const style = document.createElement('style')
    style.textContent = '.pseudo-host::before { content: "badge"; }'
    document.head.appendChild(style)
    node.className = 'pseudo-host'
    document.body.appendChild(node)

    const clone = cloneNode(node, {}, true)
    expect(clone?.querySelector('style')?.textContent).toContain('badge')

    node.remove()
    style.remove()
  })

  it('rasterizes a nested canvas into an img carrying its bitmap', () => {
    const node = document.createElement('div')
    const canvas = document.createElement('canvas')
    canvas.width = 8
    canvas.height = 8
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'rgb(0, 0, 255)'
      ctx.fillRect(0, 0, 8, 8)
    }
    node.appendChild(canvas)
    document.body.appendChild(node)

    const clone = cloneNode(node, {}, true)
    const image = clone?.querySelector('img')
    expect(clone?.querySelector('canvas')).toBeNull()
    expect(image?.src.startsWith('data:image/png')).toBe(true)

    node.remove()
  })

  it('preserves the live value of a text input as an attribute', () => {
    const node = document.createElement('div')
    const input = document.createElement('input')
    input.type = 'text'
    node.appendChild(input)
    document.body.appendChild(node)
    input.value = 'typed text'

    const clone = cloneNode(node, {}, true)
    expect(clone?.querySelector('input')?.getAttribute('value')).toBe('typed text')

    node.remove()
  })

  it('preserves the checked state of a checkbox', () => {
    const node = document.createElement('div')
    const input = document.createElement('input')
    input.type = 'checkbox'
    node.appendChild(input)
    document.body.appendChild(node)
    input.checked = true

    const clone = cloneNode(node, {}, true)
    expect(clone?.querySelector('input')?.hasAttribute('checked')).toBe(true)

    node.remove()
  })

  it('preserves the live value of a textarea as its text content', () => {
    const node = document.createElement('div')
    const textarea = document.createElement('textarea')
    node.appendChild(textarea)
    document.body.appendChild(node)
    textarea.value = 'multi\nline'

    const clone = cloneNode(node, {}, true)
    expect(clone?.querySelector('textarea')?.textContent).toBe('multi\nline')

    node.remove()
  })
})
