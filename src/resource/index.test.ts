import { describe, expect, it } from 'vitest'
import { fetchAsDataUrl, isDataUrl } from './index'

describe('isDataUrl', () => {
  it('recognizes data URIs', () => {
    expect(isDataUrl('data:image/png;base64,AAAA')).toBe(true)
    expect(isDataUrl('https://example.com/a.png')).toBe(false)
    expect(isDataUrl('blob:http://localhost/abc')).toBe(false)
  })
})

describe('fetchAsDataUrl', () => {
  it('fetches a same-origin resource and returns it as a data URI', async () => {
    const url = URL.createObjectURL(new Blob([Uint8Array.from([9, 8, 7])], { type: 'image/png' }))

    const dataUrl = await fetchAsDataUrl(url)
    expect(dataUrl.startsWith('data:image/png')).toBe(true)

    URL.revokeObjectURL(url)
  })

  it('rejects when the resource cannot be fetched', async () => {
    await expect(
      fetchAsDataUrl(`${location.origin}/missing-${'z'.repeat(10)}.bin`),
    ).rejects.toBeDefined()
  })
})
