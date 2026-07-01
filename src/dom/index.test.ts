import { describe, expect, it } from 'vitest'
import { cloneHTML, filterNode, height, width } from './index'

describe('width/height', () => {
  it('read the offset dimensions of a node', () => {
    const node = document.createElement('div')
    node.style.width = '120px'
    node.style.height = '80px'
    document.body.appendChild(node)

    expect(width(node)).toBe(120)
    expect(height(node)).toBe(80)

    node.remove()
  })
})

describe('cloneHTML', () => {
  it('returns a deep clone of the document html element', () => {
    const clone = cloneHTML()
    expect(clone?.tagName).toBe('HTML')
    expect(clone).not.toBe(document.querySelector('html'))
  })
})

describe('filterNode', () => {
  it('removes descendants matching the given selector', () => {
    const node = document.createElement('div')
    node.innerHTML = '<span class="keep"></span><span class="drop"></span>'

    const filtered = filterNode(node, '.drop')

    expect(filtered.querySelector('.drop')).toBeNull()
    expect(filtered.querySelector('.keep')).not.toBeNull()
  })
})
