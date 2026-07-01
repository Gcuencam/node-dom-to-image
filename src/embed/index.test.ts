import { describe, expect, it } from 'vitest'
import { embedResources } from './index'

const RED_PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const pngObjectUrl = (): string => {
  const bytes = Uint8Array.from(atob(RED_PIXEL_PNG_BASE64), (char) => char.charCodeAt(0))
  return URL.createObjectURL(new Blob([bytes], { type: 'image/png' }))
}

describe('embedResources', () => {
  it('rewrites an external img src into an inline data URI', async () => {
    const url = pngObjectUrl()
    const container = document.createElement('div')
    const image = document.createElement('img')
    image.src = url
    container.appendChild(image)
    document.body.appendChild(container)

    await embedResources(container)

    expect(container.querySelector('img')?.src.startsWith('data:image/png')).toBe(true)

    URL.revokeObjectURL(url)
    container.remove()
  })

  it('rewrites a css background-image url into an inline data URI', async () => {
    const url = pngObjectUrl()
    const container = document.createElement('div')
    container.style.backgroundImage = `url("${url}")`
    document.body.appendChild(container)

    await embedResources(container)

    expect(container.style.backgroundImage).toContain('data:image/png')
    expect(container.style.backgroundImage).not.toContain('blob:')

    URL.revokeObjectURL(url)
    container.remove()
  })

  it('leaves an already-inlined data URI untouched', async () => {
    const dataUri =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    const container = document.createElement('div')
    const image = document.createElement('img')
    image.src = dataUri
    container.appendChild(image)
    document.body.appendChild(container)

    await embedResources(container)

    expect(container.querySelector('img')?.src).toBe(dataUri)

    container.remove()
  })

  it('does not throw when a resource is unreachable', async () => {
    const container = document.createElement('div')
    const image = document.createElement('img')
    image.src = `${location.origin}/definitely-missing-${'x'.repeat(8)}.png`
    container.appendChild(image)
    document.body.appendChild(container)

    await expect(embedResources(container)).resolves.toBeUndefined()

    container.remove()
  })
})
