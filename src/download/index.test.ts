import { describe, expect, it } from 'vitest'
import { createLink } from './index'

describe('createLink', () => {
  it('creates an anchor configured to download the given url under the given name', () => {
    const link = createLink('data:text/plain,hello', 'example.txt')

    expect(link.tagName).toBe('A')
    expect(link.download).toBe('example.txt')
    expect(link.href).toBe('data:text/plain,hello')
  })
})
