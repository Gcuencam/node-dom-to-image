# DOM to Image

**node-dom-to-image** turns any DOM node into an image, entirely in the browser.

It clones the node into a self-contained SVG `<foreignObject>` — inlining computed
styles, external images, background images and web fonts — then rasterizes it onto
a canvas. From there you can get an SVG, a canvas, a PNG/JPEG data URL, a `Blob`,
or trigger a download.

## Installation

```sh
npm install node-dom-to-image
```

```javascript
/* ES modules */
import { toPng, toBlob, download } from 'node-dom-to-image'
/* CommonJS */
const { toPng } = require('node-dom-to-image')
/* or the default namespace */
import domToImage from 'node-dom-to-image'
```

## Usage

```javascript
import { toPng, toBlob, download } from 'node-dom-to-image'

const node = document.querySelector('.example')

// Get a PNG data URL
const dataUrl = await toPng(node)

// Get a Blob (e.g. to upload)
const blob = await toBlob(node)

// Trigger a browser download
await download(node, 'example.png')
```

## API

Every function takes the node to capture and an optional [`Options`](#options) object.

| Function                             | Returns                      | Description                                |
| ------------------------------------ | ---------------------------- | ------------------------------------------ |
| `toSvg(node, options?)`              | `Promise<string>`            | `image/svg+xml` data URI                   |
| `toCanvas(node, options?)`           | `Promise<HTMLCanvasElement>` | Rasterized canvas                          |
| `toPng(node, options?)`              | `Promise<string>`            | PNG data URL                               |
| `toJpeg(node, options?)`             | `Promise<string>`            | JPEG data URL                              |
| `toDataUrl(node, options?)`          | `Promise<string>`            | Data URL of `options.format` (default PNG) |
| `toBlob(node, options?)`             | `Promise<Blob>`              | Encoded image blob                         |
| `download(node, fileName, options?)` | `Promise<void>`              | Captures and downloads the image           |

## Options

| Option            | Type                           | Default             | Description                                                                 |
| ----------------- | ------------------------------ | ------------------- | --------------------------------------------------------------------------- |
| `filter`          | `(node: Element) => boolean`   | —                   | Return `false` to exclude a node and its subtree. Never called on the root. |
| `format`          | `string`                       | `'image/png'`       | MIME type for rasterized output.                                            |
| `quality`         | `number`                       | `1`                 | Quality `0`–`1` for lossy formats (JPEG).                                   |
| `scale`           | `number`                       | `devicePixelRatio`  | Pixel-ratio multiplier for crisp captures on HiDPI displays.                |
| `backgroundColor` | `string`                       | —                   | CSS color painted behind the node (useful for JPEG).                        |
| `width`           | `number`                       | node `offsetWidth`  | Output width in CSS pixels.                                                 |
| `height`          | `number`                       | node `offsetHeight` | Output height in CSS pixels.                                                |
| `style`           | `Partial<CSSStyleDeclaration>` | —                   | Inline styles applied to the cloned root before rasterizing.                |
| `skipFonts`       | `boolean`                      | `false`             | Skip embedding `@font-face` web fonts.                                      |

## Limitations

These come from the SVG `foreignObject` technique itself and are shared by every
library that uses it:

- **Cross-origin resources** must allow CORS. Images, backgrounds and fonts served
  without permissive CORS headers can't be inlined and will be missing from the
  capture (a single unreachable resource is skipped, it doesn't abort the render).
- **Cross-origin `<iframe>` and cross-origin `<canvas>`** content can't be read and
  won't appear.
- **Shadow DOM** and elements rendered outside the captured subtree are not included.

## Development

```sh
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Vitest, in a real Chromium via Playwright
npm run format       # Prettier
```

Tests run against a real browser engine because jsdom does not render
`<foreignObject>`.

### Demo

An interactive playground lives in [`demo/`](demo) and imports the library
straight from source, so edits are reflected live:

```sh
npm run demo         # start the Vite dev server
npm run demo:build   # build the demo to demo/dist
```

The demo is not part of the published package.

## Authors

Gabriel Cuenca

## License

MIT
