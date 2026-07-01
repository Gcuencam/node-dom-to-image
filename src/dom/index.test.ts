import { describe, expect, it } from 'vitest'
import { height, width } from './index'

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
