/**
 * Handling for elements whose visible content is *not* captured by a plain
 * `cloneNode` — canvases and videos keep their bitmap outside the DOM, and form
 * controls keep their current value as live properties rather than attributes.
 */

const canvasToImage = (canvas: HTMLCanvasElement): HTMLImageElement => {
  const image = document.createElement('img')
  try {
    image.src = canvas.toDataURL()
  } catch {
    // A tainted canvas (cross-origin content drawn without CORS) cannot be read;
    // leave the image empty rather than aborting the whole capture.
  }
  image.width = canvas.width
  image.height = canvas.height
  return image
}

const videoToImage = (video: HTMLVideoElement): HTMLElement => {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth || video.clientWidth
  canvas.height = video.videoHeight || video.clientHeight
  const ctx = canvas.getContext('2d')
  try {
    if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvasToImage(canvas)
  } catch {
    // Cross-origin or not-yet-decoded frame: fall back to the poster if any.
    if (video.poster) {
      const image = document.createElement('img')
      image.src = video.poster
      return image
    }
    return video.cloneNode(false) as HTMLElement
  }
}

/**
 * Returns a replacement clone for elements that need their live content
 * rasterized into an `<img>`, or `null` for elements handled by a normal clone.
 */
export const replaceSpecialNode = (node: Element): HTMLElement | null => {
  if (node instanceof HTMLCanvasElement) return canvasToImage(node)
  if (node instanceof HTMLVideoElement) return videoToImage(node)
  return null
}

/** Copies the live value/checked/selected state of a form control onto its clone. */
export const preserveFormState = (node: Element, clone: HTMLElement): void => {
  if (node instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
    if (node.type === 'checkbox' || node.type === 'radio') {
      if (node.checked) clone.setAttribute('checked', '')
      else clone.removeAttribute('checked')
    } else {
      clone.setAttribute('value', node.value)
    }
  } else if (node instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) {
    clone.textContent = node.value
  } else if (node instanceof HTMLSelectElement && clone instanceof HTMLSelectElement) {
    Array.from(node.options).forEach((option, index) => {
      const clonedOption = clone.options[index]
      if (clonedOption && option.selected) clonedOption.setAttribute('selected', '')
    })
  }
}
