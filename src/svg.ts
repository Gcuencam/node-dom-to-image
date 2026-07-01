import { cloneHTML, filterNode, height, width } from './dom'
import { getStylesFromFile } from './styles'
import type { DomToImageOptions } from './types'

const createForeignObject = () => {
  const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
  foreignObject.setAttribute('width', '100%')
  foreignObject.setAttribute('height', '100%')
  return foreignObject
}

export const createSvgURI = (node: HTMLElement, options: DomToImageOptions = {}): string => {
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
