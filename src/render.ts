import { height, width } from './dom'

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

export const createCanvas = (node: HTMLElement, image: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = width(node)
  canvas.height = height(node)
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (ctx) ctx.drawImage(image, 0, 0)
  return canvas
}
