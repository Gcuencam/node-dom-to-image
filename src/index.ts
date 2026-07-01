import { createLink } from './download'
import { createCanvas, createImage } from './render'
import { createSvgURI } from './svg'
import type { Options } from './types'

export type { Options }

const domDownloader = async (node: HTMLElement, fileName: string, options: Options = {}) => {
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
