export interface DomToImageOptions {
  /** CSS selector matching elements to exclude from the capture. */
  filter?: string
  /** MIME type passed to `canvas.toDataURL`. Defaults to `'image/png'`. */
  format?: string
}
