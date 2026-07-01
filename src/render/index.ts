import { height, width } from '../dom'
import type { Options } from '../types'

export const createImage = async (uri: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve(image)
    }
    image.onerror = reject
    image.src = uri
  })
}

/**
 * Draws the rasterized capture onto a canvas. The bitmap is multiplied by
 * `scale` (defaulting to the device pixel ratio) so captures stay crisp on
 * high-density displays, and an optional opaque background can be painted first.
 */
export const createCanvas = (
  node: HTMLElement,
  image: HTMLImageElement,
  options: Options = {},
): HTMLCanvasElement => {
  const cssWidth = options.width ?? width(node)
  const cssHeight = options.height ?? height(node)
  const scale = options.scale ?? window.devicePixelRatio ?? 1

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(cssWidth * scale)
  canvas.height = Math.ceil(cssHeight * scale)
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(scale, scale)
    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor
      ctx.fillRect(0, 0, cssWidth, cssHeight)
    }
    ctx.drawImage(image, 0, 0, cssWidth, cssHeight)
  }
  return canvas
}
