import type { DomToImageOptions } from './types'

export type { DomToImageOptions }

const width = (node: HTMLElement): number => node.offsetWidth
const height = (node: HTMLElement): number => node.offsetHeight

const cloneHTML = (): HTMLElement | null => {
  const node = document.querySelector('html')
  return node ? (node.cloneNode(true) as HTMLElement) : null
}

const createForeignObject = () => {
  const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
  foreignObject.setAttribute('width', '100%')
  foreignObject.setAttribute('height', '100%')
  return foreignObject
}

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

const getStylesFromFile = (node: HTMLElement) => {
  const stylesheet = document.querySelector<HTMLLinkElement>('[rel="stylesheet"]')
  if (stylesheet?.sheet) {
    const head = node.querySelector('head')
    const cssContent = Array.from(stylesheet.sheet.cssRules)
      .map((rule) => rule.cssText)
      .join('\n')
    const style = document.createElement('style')
    style.type = 'text/css'
    style.appendChild(document.createTextNode(cssContent))
    head?.appendChild(style)
  }
}

const createSvgURI = (node: HTMLElement, options: DomToImageOptions = {}): string => {
  const html = cloneHTML()
  if (!node || !html) return 'false'
  html.classList.add('domtoimage')
  getStylesFromFile(html)
  const body = html.querySelector('body')
  if (body) html.removeChild(body)
  let clonedNode = node.cloneNode(true) as HTMLElement
  if (options.filter) {
    clonedNode = filterNode(clonedNode, options.filter)
  }
  clonedNode.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
  html.appendChild(clonedNode)
  const foreignObject = createForeignObject()
  foreignObject.appendChild(html)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', width(node).toString())
  svg.setAttribute('height', height(node).toString())
  svg.appendChild(foreignObject)
  return (
    'data:image/svg+xml; charset=utf8, ' +
    encodeURIComponent(new XMLSerializer().serializeToString(svg))
  )
}

const createLink = (url: string, name: string) => {
  const link = document.createElement('a')
  link.download = name
  link.href = url
  return link
}

const filterNode = (node: HTMLElement, selector: string): HTMLElement => {
  node.querySelectorAll(selector).forEach((n) => n.remove())
  return node
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
