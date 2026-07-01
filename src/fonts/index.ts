import { fetchAsDataUrl, isDataUrl } from '../resource'

/**
 * Web-font handling for the capture. Like external images, `@font-face` sources
 * are never fetched when the SVG is rasterized through an `<img>`, so the font
 * files have to be embedded as `data:` URIs inside a `<style>` added to the clone.
 */

const CSS_URL_REGEX = /url\((['"]?)([^'"()]+?)\1\)/g

const resolveUrl = (url: string, base: string | null): string => {
  try {
    return new URL(url, base ?? document.baseURI).href
  } catch {
    return url
  }
}

const collectFontFaceRules = (): CSSFontFaceRule[] => {
  const rules: CSSFontFaceRule[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    let cssRules: CSSRuleList
    try {
      cssRules = sheet.cssRules
    } catch {
      // Cross-origin stylesheet without CORS headers: its rules can't be read.
      continue
    }
    for (const rule of Array.from(cssRules)) {
      if (rule.type === CSSRule.FONT_FACE_RULE) rules.push(rule as CSSFontFaceRule)
    }
  }
  return rules
}

const embedFontFaceRule = async (rule: CSSFontFaceRule): Promise<string> => {
  const cssText = rule.cssText
  const baseHref = rule.parentStyleSheet?.href ?? null
  const sources = Array.from(cssText.matchAll(CSS_URL_REGEX), (match) => match[2]).filter(
    (url) => !isDataUrl(url),
  )
  if (sources.length === 0) return cssText

  const replacements = new Map<string, string>()
  await Promise.all(
    sources.map(async (url) => {
      try {
        replacements.set(url, await fetchAsDataUrl(resolveUrl(url, baseHref)))
      } catch {
        // Skip this source; other formats in the same rule may still resolve.
      }
    }),
  )

  return cssText.replace(CSS_URL_REGEX, (whole, _quote, url) => {
    const dataUrl = replacements.get(url)
    return dataUrl ? `url("${dataUrl}")` : whole
  })
}

/**
 * Collects every readable `@font-face` rule in the document, embeds its font
 * files as data URIs and appends the rewritten rules as a `<style>` on the clone.
 */
export const embedWebFonts = async (clone: HTMLElement): Promise<void> => {
  const rules = collectFontFaceRules()
  if (rules.length === 0) return

  const embedded = await Promise.all(rules.map(embedFontFaceRule))
  const style = document.createElement('style')
  style.appendChild(document.createTextNode(embedded.join('\n')))
  clone.appendChild(style)
}

/** Resolves once all of the document's fonts have finished loading. */
export const waitForFonts = async (): Promise<void> => {
  if (document.fonts?.ready) await document.fonts.ready
}
