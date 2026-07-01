import { height, width } from './dom'
import { createSvgURI } from './svg'
import type { DomToImageOptions } from './types'

export type { DomToImageOptions }

const createCanvas = (node: HTMLElement, image: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = width(node)
  canvas.height = height(node)
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (ctx) ctx.drawImage(image, 0, 0)
  return canvas
}

const createImage = async (uri: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve(image)
    }
    image.onerror = reject
    image.src = uri
  })
}

const createLink = (url: string, name: string) => {
  const link = document.createElement('a')
  link.download = name
  link.href = url
  return link
}

const domDownloader = async (
  node: HTMLElement,
  fileName: string,
  options: DomToImageOptions = {},
) => {
  const uri: string = createSvgURI(node, options)
  const { format = 'image/png' } = options
  try {
    const image = await createImage(uri)
    const canvas = createCanvas(node, image)
    const link = createLink(canvas.toDataURL(format, 1.0), fileName)
    link.click()
  } catch (err) {
    console.error(err)
  }
}

export default domDownloader
