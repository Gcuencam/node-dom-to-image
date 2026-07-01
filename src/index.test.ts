import { describe, expect, it, vi } from 'vitest'
import domToImage, { download, toBlob, toCanvas, toJpeg, toPng, toSvg } from './index'

const sampleNode = (): HTMLElement => {
  const node = document.createElement('div')
  node.style.width = '16px'
  node.style.height = '16px'
  node.textContent = 'hi'
  document.body.appendChild(node)
  return node
}

describe('public API surface', () => {
  it('exposes the capture helpers on the default export', () => {
    expect(Object.keys(domToImage).sort()).toEqual(
      ['download', 'toBlob', 'toCanvas', 'toDataUrl', 'toJpeg', 'toPng', 'toSvg'].sort(),
    )
  })
})

describe('toSvg', () => {
  it('returns an svg data uri', async () => {
    const node = sampleNode()
    const uri = await toSvg(node)
    expect(uri.startsWith('data:image/svg+xml;')).toBe(true)
    node.remove()
  })
})

describe('toCanvas', () => {
  it('returns a canvas sized from the node', async () => {
    const node = sampleNode()
    const canvas = await toCanvas(node, { scale: 1 })
    expect(canvas).toBeInstanceOf(HTMLCanvasElement)
    expect(canvas.width).toBe(16)
    expect(canvas.height).toBe(16)
    node.remove()
  })
})

describe('toPng / toJpeg', () => {
  it('returns a png data url', async () => {
    const node = sampleNode()
    expect((await toPng(node)).startsWith('data:image/png')).toBe(true)
    node.remove()
  })

  it('returns a jpeg data url', async () => {
    const node = sampleNode()
    expect((await toJpeg(node)).startsWith('data:image/jpeg')).toBe(true)
    node.remove()
  })
})

describe('toBlob', () => {
  it('returns a Blob of the captured node', async () => {
    const node = sampleNode()
    const blob = await toBlob(node)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/png')
    node.remove()
  })
})

describe('download', () => {
  it('captures the node and clicks a download link', async () => {
    const node = sampleNode()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    await download(node, 'capture.png')

    expect(click).toHaveBeenCalledOnce()
    click.mockRestore()
    node.remove()
  })
})

describe('error propagation', () => {
  it('rejects instead of swallowing when the image fails to rasterize', async () => {
    const node = sampleNode()
    const spy = vi.spyOn(HTMLImageElement.prototype, 'src', 'set').mockImplementation(function (
      this: HTMLImageElement,
    ) {
      this.dispatchEvent(new Event('error'))
    })

    await expect(toPng(node)).rejects.toBeDefined()

    spy.mockRestore()
    node.remove()
  })
})
