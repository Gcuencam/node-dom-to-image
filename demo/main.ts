import { download, toJpeg, toPng, toSvg } from '../src/index'
import type { Options } from '../src/types'

const captureNode = document.querySelector<HTMLElement>('#capture')!
const formatSelect = document.querySelector<HTMLSelectElement>('#format')!
const scaleSelect = document.querySelector<HTMLSelectElement>('#scale')!
const backgroundInput = document.querySelector<HTMLInputElement>('#background')!
const filterCheckbox = document.querySelector<HTMLInputElement>('#filter')!
const output = document.querySelector<HTMLElement>('#output')!

type Format = 'png' | 'jpeg' | 'svg'

/** Draws a small bar chart so the live <canvas> content shows up in captures. */
const drawChart = (): void => {
  const canvas = document.querySelector<HTMLCanvasElement>('#chart')!
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const bars = [12, 34, 20, 46, 30, 52, 40, 24]
  const slot = canvas.width / bars.length
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  bars.forEach((value, index) => {
    ctx.fillRect(index * slot + 4, canvas.height - value, slot - 8, value)
  })
}

const buildOptions = (): Options => {
  const options: Options = {
    scale: Number(scaleSelect.value),
    backgroundColor: backgroundInput.value,
  }
  if (filterCheckbox.checked) {
    options.filter = (node) => !node.classList.contains('secret')
  }
  return options
}

const renderToDataUrl = (format: Format, options: Options): Promise<string> => {
  if (format === 'svg') return toSvg(captureNode, options)
  if (format === 'jpeg') return toJpeg(captureNode, options)
  return toPng(captureNode, options)
}

const byteSize = async (dataUrl: string): Promise<number> => {
  const blob = await (await fetch(dataUrl)).blob()
  return blob.size
}

const setError = (error: unknown): void => {
  output.classList.add('is-error')
  output.textContent = `Capture failed: ${error instanceof Error ? error.message : String(error)}`
}

const preview = async (): Promise<void> => {
  const format = formatSelect.value as Format
  output.classList.remove('is-error')
  output.innerHTML = '<p class="output__hint">Rendering…</p>'
  try {
    const dataUrl = await renderToDataUrl(format, buildOptions())
    const size = await byteSize(dataUrl)

    const image = new Image()
    image.src = dataUrl
    output.innerHTML = ''
    output.appendChild(image)

    const meta = document.createElement('p')
    meta.className = 'output__meta'
    meta.textContent = `${format.toUpperCase()} · ${(size / 1024).toFixed(1)} kB`
    output.appendChild(meta)
  } catch (error) {
    setError(error)
  }
}

const triggerDownload = async (): Promise<void> => {
  const format = formatSelect.value as Format
  const options = buildOptions()
  try {
    if (format === 'svg') {
      const uri = await toSvg(captureNode, options)
      const link = document.createElement('a')
      link.href = uri
      link.download = 'capture.svg'
      link.click()
      return
    }
    await download(captureNode, `capture.${format}`, {
      ...options,
      format: format === 'jpeg' ? 'image/jpeg' : 'image/png',
    })
  } catch (error) {
    setError(error)
  }
}

drawChart()
document.querySelector<HTMLButtonElement>('#preview')!.addEventListener('click', preview)
document.querySelector<HTMLButtonElement>('#download')!.addEventListener('click', triggerDownload)
