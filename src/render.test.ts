import { describe, expect, it } from 'vitest'
import { createCanvas, createImage } from './render'

const TRANSPARENT_PIXEL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

describe('createImage', () => {
  it('resolves an HTMLImageElement once the source loads', async () => {
    const image = await createImage(TRANSPARENT_PIXEL_PNG)
    expect(image).toBeInstanceOf(HTMLImageElement)
  })

  it('rejects when the source fails to load', async () => {
    await expect(createImage('data:image/png;base64,not-a-real-image')).rejects.toBeDefined()
  })
})

describe('createCanvas', () => {
  it('creates a canvas sized to the node and draws the image onto it', async () => {
    const node = document.createElement('div')
    node.style.width = '10px'
    node.style.height = '20px'
    document.body.appendChild(node)

    const image = await createImage(TRANSPARENT_PIXEL_PNG)
    const canvas = createCanvas(node, image)

    expect(canvas.width).toBe(10)
    expect(canvas.height).toBe(20)

    node.remove()
  })
})
