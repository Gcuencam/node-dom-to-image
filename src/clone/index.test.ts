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
})
