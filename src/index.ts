import { throwIfAborted } from './abort'
import { createLink } from './download'
import { canvasToBlob, createCanvas, createImage } from './render'
import { blobToDataUrl } from './resource'
import { createSvgURI } from './svg'
import type { Options } from './types'

export type { Options }

/** Captures `node` as an `image/svg+xml` data URI. */
export const toSvg = (node: HTMLElement, options: Options = {}): Promise<string> =>
  createSvgURI(node, options)

/** Captures `node` and rasterizes it onto a canvas. */
export const toCanvas = async (
  node: HTMLElement,
  options: Options = {},
): Promise<HTMLCanvasElement> => {
  const uri = await createSvgURI(node, options)
  const image = await createImage(uri)
  throwIfAborted(options.signal)
  return createCanvas(node, image, options)
}

/** Captures `node` as a `Blob` of the given `format` (defaults to PNG). */
export const toBlob = async (node: HTMLElement, options: Options = {}): Promise<Blob> => {
  const canvas = await toCanvas(node, options)
  return canvasToBlob(canvas, options.format ?? 'image/png', options.quality ?? 1)
}

/** Captures `node` as a data URL of the given `format` (defaults to PNG). */
export const toDataUrl = async (node: HTMLElement, options: Options = {}): Promise<string> => {
  const blob = await toBlob(node, options)
  return blobToDataUrl(blob)
}

/** Captures `node` as a PNG data URL. */
export const toPng = (node: HTMLElement, options: Options = {}): Promise<string> =>
  toDataUrl(node, { ...options, format: 'image/png' })

/** Captures `node` as a JPEG data URL. */
export const toJpeg = (node: HTMLElement, options: Options = {}): Promise<string> =>
  toDataUrl(node, { ...options, format: 'image/jpeg' })

/** Captures `node` and triggers a browser download of the resulting image. */
export const download = async (
  node: HTMLElement,
  fileName: string,
  options: Options = {},
): Promise<void> => {
  const dataUrl = await toDataUrl(node, options)
  createLink(dataUrl, fileName).click()
}

export default { toSvg, toCanvas, toDataUrl, toPng, toJpeg, toBlob, download }
