import type { Options } from '../types'
import { preserveFormState, replaceSpecialNode } from './content'
import { getDefaultStyle } from './defaults'

const PSEUDO_ELEMENTS = ['::before', '::after'] as const

let pseudoClassCounter = 0

const copyComputedStyle = (source: Element, target: HTMLElement) => {
  const computed = window.getComputedStyle(source)
  const defaults = getDefaultStyle(source.tagName)
  const style = target.style
  for (const property of computed) {
    const value = computed.getPropertyValue(property)
    // Only carry properties that deviate from the UA default for this tag; the
    // rest are already implied and would just bloat the serialized SVG.
    if (value !== defaults[property]) {
      style.setProperty(property, value, computed.getPropertyPriority(property))
    }
  }
}

const clonePseudoElement = (source: Element, target: HTMLElement, pseudo: string) => {
  const computed = window.getComputedStyle(source, pseudo)
  const content = computed.getPropertyValue('content')
  if (!content || content === 'none') return

  const className = `domtoimage-pseudo-${(pseudoClassCounter += 1)}`
  target.classList.add(className)

  const declarations = Array.from(computed)
    .map(
      (property) =>
        `${property}: ${computed.getPropertyValue(property)}${
          computed.getPropertyPriority(property) ? ' !important' : ''
        };`,
    )
    .join(' ')

  const style = document.createElement('style')
  style.appendChild(
    document.createTextNode(`.${className}${pseudo} { ${declarations} content: ${content}; }`),
  )
  target.appendChild(style)
}

const clonePseudoElements = (source: Element, target: HTMLElement) => {
  for (const pseudo of PSEUDO_ELEMENTS) {
    clonePseudoElement(source, target, pseudo)
  }
}

const cloneChildren = (source: Element, target: HTMLElement, options: Options) => {
  const children = source.childNodes
  if (children.length === 0) return

  for (const child of Array.from(children)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const clonedChild = cloneNode(child as Element, options)
      if (clonedChild) target.appendChild(clonedChild)
    } else {
      target.appendChild(child.cloneNode(false))
    }
  }
}

/**
 * Deep-clones a node into a detached copy whose styling no longer depends on the
 * document's stylesheets: every element carries its resolved computed style
 * inline, and `::before`/`::after` pseudo-elements are re-created via scoped
 * `<style>` rules. Descendants rejected by `options.filter` are dropped.
 *
 * `<canvas>`/`<video>` are rasterized into an `<img>` (their bitmap lives outside
 * the DOM and would otherwise clone empty); form controls carry their live value.
 */
export const cloneNode = (node: Element, options: Options, isRoot = false): HTMLElement | null => {
  if (!isRoot && options.filter && !options.filter(node)) return null

  const replacement = replaceSpecialNode(node)
  const clone = replacement ?? (node.cloneNode(false) as HTMLElement)

  if (!replacement) {
    cloneChildren(node, clone, options)
  }
  copyComputedStyle(node, clone)
  if (!replacement) {
    clonePseudoElements(node, clone)
  }
  preserveFormState(node, clone)
  return clone
}
