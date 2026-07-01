import { cloneNode } from '../clone'
import { height, width } from '../dom'
import type { Options } from '../types'

const XHTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

const createForeignObject = () => {
  const foreignObject = document.createElementNS(SVG_NAMESPACE, 'foreignObject')
  foreignObject.setAttribute('width', '100%')
  foreignObject.setAttribute('height', '100%')
  foreignObject.setAttribute('x', '0')
  foreignObject.setAttribute('y', '0')
  foreignObject.setAttribute('externalResourcesRequired', 'true')
  return foreignObject
}

const applyStyleOption = (node: HTMLElement, style: Options['style']) => {
  if (!style) return
  for (const property of Object.keys(style) as (keyof CSSStyleDeclaration)[]) {
    const value = style[property]
    if (value != null) node.style[property as never] = value as never
  }
}

/**
 * Serializes a node into an `image/svg+xml` data URI by embedding a
 * self-contained clone (with inlined computed styles) inside a `<foreignObject>`.
 */
export const createSvgURI = (node: HTMLElement, options: Options = {}): string => {
  const clone = cloneNode(node, options, true)
  if (!clone) return ''

  applyStyleOption(clone, options.style)
  clone.setAttribute('xmlns', XHTML_NAMESPACE)

  const captureWidth = options.width ?? width(node)
  const captureHeight = options.height ?? height(node)

  const foreignObject = createForeignObject()
  foreignObject.appendChild(clone)

  const svg = document.createElementNS(SVG_NAMESPACE, 'svg')
  svg.setAttribute('xmlns', SVG_NAMESPACE)
  svg.setAttribute('width', captureWidth.toString())
  svg.setAttribute('height', captureHeight.toString())
  svg.appendChild(foreignObject)

  const serialized = new XMLSerializer().serializeToString(svg)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`
}
