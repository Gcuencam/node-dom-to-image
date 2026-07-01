/**
 * Inlines external resources referenced by a cloned subtree into `data:` URIs.
 *
 * This is required, not just an optimization: an SVG `<foreignObject>` rasterized
 * through an `<img>` runs in a restricted mode that never fetches external URLs
 * and taints the canvas if any are present. Everything the capture needs must be
 * embedded up front.
 */

const dataUrlCache = new Map<string, Promise<string>>()

const isDataUrl = (url: string): boolean => url.startsWith('data:')

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

const fetchAsDataUrl = (url: string): Promise<string> => {
  const cached = dataUrlCache.get(url)
  if (cached) return cached

  const promise = fetch(url, { cache: 'force-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
      return response.blob()
    })
    .then(blobToDataUrl)
    .catch((error) => {
      // Don't poison the cache with a permanent failure for this URL.
      dataUrlCache.delete(url)
      throw error
    })

  dataUrlCache.set(url, promise)
  return promise
}

const embedImage = async (image: HTMLImageElement): Promise<void> => {
  const src = image.src
  if (!src || isDataUrl(src)) return
  try {
    image.src = await fetchAsDataUrl(src)
  } catch {
    // Leave the original src: the capture may lose this image, but a single
    // unreachable resource shouldn't abort the whole render.
  }
}

const CSS_URL_REGEX = /url\((['"]?)([^'"()]+?)\1\)/g

const embedBackground = async (element: HTMLElement): Promise<void> => {
  const backgroundImage = element.style.backgroundImage
  if (!backgroundImage || !backgroundImage.includes('url(')) return

  const replacements = new Map<string, string>()
  const urls = Array.from(backgroundImage.matchAll(CSS_URL_REGEX), (match) => match[2])

  await Promise.all(
    urls.map(async (url) => {
      if (isDataUrl(url)) return
      try {
        replacements.set(url, await fetchAsDataUrl(url))
      } catch {
        // Skip this url; keep the others.
      }
    }),
  )

  if (replacements.size === 0) return
  element.style.backgroundImage = backgroundImage.replace(CSS_URL_REGEX, (whole, _quote, url) => {
    const dataUrl = replacements.get(url)
    return dataUrl ? `url("${dataUrl}")` : whole
  })
}

/** Embeds every `<img>` source and CSS `background-image` in the clone as data URIs. */
export const embedResources = async (clone: HTMLElement): Promise<void> => {
  const images =
    clone instanceof HTMLImageElement ? [clone] : Array.from(clone.querySelectorAll('img'))
  const backgroundHosts = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))]

  await Promise.all([...images.map(embedImage), ...backgroundHosts.map(embedBackground)])
}
