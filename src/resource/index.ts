/**
 * Low-level helper for turning an external URL into a `data:` URI, shared by the
 * resource- and font-embedding passes. Results are cached across a session so a
 * URL referenced many times (or across captures) is fetched only once.
 */

const dataUrlCache = new Map<string, Promise<string>>()

export const isDataUrl = (url: string): boolean => url.startsWith('data:')

export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

export const fetchAsDataUrl = (url: string): Promise<string> => {
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
