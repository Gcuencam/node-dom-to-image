import { describe, expect, it } from 'vitest'
import { embedWebFonts, waitForFonts } from './index'

// Arbitrary bytes served as a font file; the embedder only fetches and inlines
// them, it never parses the font, so this is enough to exercise the pipeline.
const fontObjectUrl = (): string =>
  URL.createObjectURL(new Blob([Uint8Array.from([1, 2, 3, 4])], { type: 'font/woff2' }))

describe('waitForFonts', () => {
  it('resolves once document fonts are ready', async () => {
    await expect(waitForFonts()).resolves.toBeUndefined()
  })
})

describe('embedWebFonts', () => {
  it('appends a style with @font-face sources rewritten to data URIs', async () => {
    const url = fontObjectUrl()
    const sheet = document.createElement('style')
    sheet.textContent = `@font-face { font-family: EmbedTest; src: url("${url}"); }`
    document.head.appendChild(sheet)

    const clone = document.createElement('div')
    await embedWebFonts(clone)

    const injected = clone.querySelector('style')?.textContent ?? ''
    expect(injected).toContain('@font-face')
    expect(injected).toContain('EmbedTest')
    expect(injected).toContain('data:font/woff2')
    expect(injected).not.toContain('blob:')

    URL.revokeObjectURL(url)
    sheet.remove()
  })

  it('does nothing when there are no @font-face rules', async () => {
    const clone = document.createElement('div')
    await embedWebFonts(clone)
    expect(clone.querySelector('style')).toBeNull()
  })
})
