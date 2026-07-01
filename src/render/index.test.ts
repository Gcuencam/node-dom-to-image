import { describe, expect, it } from 'vitest'
import { createCanvas, createImage } from './index'

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
  it('creates a canvas sized to the node at scale 1', async () => {
    const node = document.createElement('div')
    node.style.width = '10px'
    node.style.height = '20px'
    document.body.appendChild(node)

    const image = await createImage(TRANSPARENT_PIXEL_PNG)
    const canvas = createCanvas(node, image, { scale: 1 })

    expect(canvas.width).toBe(10)
    expect(canvas.height).toBe(20)
    expect(canvas.style.width).toBe('10px')

    node.remove()
  })

  it('multiplies the bitmap by the scale factor while keeping the css size', async () => {
    const node = document.createElement('div')
    node.style.width = '10px'
    node.style.height = '20px'
    document.body.appendChild(node)

    const image = await createImage(TRANSPARENT_PIXEL_PNG)
    const canvas = createCanvas(node, image, { scale: 2 })

    expect(canvas.width).toBe(20)
    expect(canvas.height).toBe(40)
    expect(canvas.style.width).toBe('10px')
    expect(canvas.style.height).toBe('20px')

    node.remove()
  })

  it('honors explicit width/height overrides', async () => {
    const node = document.createElement('div')
    node.style.width = '10px'
    node.style.height = '20px'
    document.body.appendChild(node)

    const image = await createImage(TRANSPARENT_PIXEL_PNG)
    const canvas = createCanvas(node, image, { scale: 1, width: 100, height: 50 })

    expect(canvas.width).toBe(100)
    expect(canvas.height).toBe(50)

    node.remove()
  })

  it('paints the background color before drawing the image', async () => {
    const node = document.createElement('div')
    node.style.width = '4px'
    node.style.height = '4px'
    document.body.appendChild(node)

    // A fresh canvas is fully transparent, so its data URL yields a truly
    // transparent image and the painted background must show through.
    const transparent = document.createElement('canvas')
    transparent.width = 1
    transparent.height = 1
    const image = await createImage(transparent.toDataURL())
    const canvas = createCanvas(node, image, { scale: 1, backgroundColor: 'rgb(255, 0, 0)' })

    const ctx = canvas.getContext('2d')
    const pixel = ctx?.getImageData(0, 0, 1, 1).data
    expect(pixel && Array.from(pixel)).toEqual([255, 0, 0, 255])

    node.remove()
  })
})
