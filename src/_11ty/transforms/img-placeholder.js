const { JSDOM } = require('jsdom')
const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))
const path = require('path')
// const blurryPlaceholder = require('../../utils/blurry-placeholder')

const dev = process.env.NODE_ENV !== 'production'
const outputFolder = !dev ? './_site/' : './_dev/'

const processImage = async (img, outputPath) => {
  let src = img.getAttribute('src')

  if (/^\.+\//.test(src)) {
    // resolve relative URL
    src = `/${path.relative(outputFolder, path.resolve(path.dirname(outputPath), src))}`
  }
  let dimensions

  try {
    dimensions = await sizeOf(`${outputFolder}/${src}`)
  } catch (e) {
    console.warn(e.message, src)
    return
  }

  if (dimensions.type === 'svg') {
    return
  }

  if (!img.getAttribute('width')) {
    img.setAttribute('width', dimensions.width)
    img.setAttribute('height', dimensions.height)
  }
}

module.exports = async (rawContent, outputPath) => {
  let content = rawContent
  if (outputPath && outputPath.endsWith('.html')) {
    const dom = new JSDOM(content)
    const images = [...dom.window.document.querySelectorAll('img')]

    if (images.length > 0) {
      await Promise.all(images.map(i => processImage(i, outputPath)))
      content = dom.serialize()
    }

    return content
  }

  return content
}
