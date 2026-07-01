/**
 * Provides the user-agent default computed style for a given tag, so the clone
 * only needs to carry the properties that actually differ from the browser
 * defaults instead of the full ~400-property computed style of every node.
 *
 * The baseline is read from a bare element rendered inside a hidden, style-free
 * `<iframe>` (a clean UA context) and cached per tag name.
 */

let sandbox: HTMLIFrameElement | null = null
const baselineCache = new Map<string, Record<string, string>>()

const getSandboxDocument = (): Document | null => {
  if (sandbox?.contentDocument) return sandbox.contentDocument

  sandbox = document.createElement('iframe')
  sandbox.setAttribute('aria-hidden', 'true')
  sandbox.style.cssText =
    'position:absolute;top:0;left:0;width:0;height:0;border:0;visibility:hidden;'
  document.body.appendChild(sandbox)
  return sandbox.contentDocument
}

const computeBaseline = (tagName: string): Record<string, string> => {
  const doc = getSandboxDocument()
  const view = sandbox?.contentWindow
  if (!doc?.body || !view) return {}

  const element = doc.createElement(tagName)
  doc.body.appendChild(element)
  const computed = view.getComputedStyle(element)

  const baseline: Record<string, string> = {}
  for (const property of computed) {
    baseline[property] = computed.getPropertyValue(property)
  }

  doc.body.removeChild(element)
  return baseline
}

/** Returns the cached UA default computed style for `tagName`. */
export const getDefaultStyle = (tagName: string): Record<string, string> => {
  const key = tagName.toLowerCase()
  const cached = baselineCache.get(key)
  if (cached) return cached

  const baseline = computeBaseline(key)
  baselineCache.set(key, baseline)
  return baseline
}
