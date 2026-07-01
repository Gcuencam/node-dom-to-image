export interface Options {
  /**
   * Predicate deciding whether a node is kept in the capture. Return `false` to
   * exclude the node and its subtree. It is never called on the root node.
   */
  filter?: (node: Element) => boolean
  /** MIME type for rasterized output. Defaults to `'image/png'`. */
  format?: string
  /** Quality between 0 and 1 for lossy formats such as `image/jpeg`. Defaults to `1`. */
  quality?: number
  /**
   * Pixel-ratio multiplier applied to the output bitmap, for crisp captures on
   * high-density displays. Defaults to `window.devicePixelRatio`.
   */
  scale?: number
  /** CSS color painted behind the node. Useful for formats without alpha (JPEG). */
  backgroundColor?: string
  /** Output width in CSS pixels. Defaults to the node's `offsetWidth`. */
  width?: number
  /** Output height in CSS pixels. Defaults to the node's `offsetHeight`. */
  height?: number
  /** Inline styles applied to the cloned root node before rasterizing. */
  style?: Partial<CSSStyleDeclaration>
}
