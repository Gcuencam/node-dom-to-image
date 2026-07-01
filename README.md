# DOM to Image

## What is it

**node-dom-to-image** is a library which converts any DOM node into a downloadable image.

## Installation

### NPM

`npm install node-dom-to-image`

Then load

```javascript
/* in ES 6 */
import domtoimage from 'node-dom-to-image'
/* in ES 5 */
var domtoimage = require('node-dom-to-image')
```

## Usage

```javascript
import domToImage from 'node-dom-to-image'

const anyFunction = () => {
  const node = document.querySelector('.example')
  domToImage(node, 'example')
}

anyFunction() // This will download the image
```

## Authors

Gabriel Cuenca

## License

MIT
