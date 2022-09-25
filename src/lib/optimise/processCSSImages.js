// TODO: This doesn't work yet!
// NOTE: https://ole.michelsen.dk/blog/using-webp-images-html-css/

const Image = require('@11ty/eleventy-img')

const imageOperations = async (img, $, config, outputDir) => {
  const src = $(img).attr('src')
  const alt = $(img).attr('alt')
  const id = $(img).attr('id')
  const className = $(img).attr('class')
  const dataWId = $(img).attr('data-w-id')
  const styles = $(img).attr('style')
  const width = $(img).attr('width')
  const height = $(img).attr('height')
  const loading = $(img).attr('loading') || 'auto'
  const decoding = $(img).attr('decoding') || 'async'
  const sizes = $(img).attr('sizes')
  const srcset = $(img).attr('srcset')

  if (!src) {
    return $
  }

  // console.log(`Processing image: ${src}`)

  const options = {
    widths: [null],
    urlPath: '/flowty/img/',
    outputDir: `./${outputDir}/flowty/img/`,
  }

  const srcsetMap = srcset ? srcset.split(', ') : undefined
  const imageSizes = srcsetMap ? srcsetMap.map(size => parseInt(size.split(' ')[1].replace('w', ''))) : null

  const imageAttributes = {
    alt,
    id,
    sizes,
    // srcset: imageSizes ? undefined : srcset,
    class: className,
    // TODO: Cater for more data attributes
    'data-w-id': dataWId,
    width: width || '',
    height: height || '',
    style: styles,
    loading,
    // FIX: Decoding should be replaced if loading is eager. It's not.
    decoding: loading === 'eager' ? 'sync' : decoding,
  }

  Object.keys(imageAttributes).forEach(key =>
    imageAttributes[key] === undefined || imageAttributes[key] === null ? delete imageAttributes[key] : {}
  )

  const sharpOptions = { limitInputPixels: false }
  
  if (imageSizes) {
    options.widths = imageSizes
  }

  options.sharpOptions = { ...sharpOptions }
  if (src.endsWith('.svg')) {
    options.formats = ['svg']
    options.svgShortCircuit = true
    options.svgAllowUpscale = false
  } else if (src.endsWith('.png')) {
    options.formats = ['png']
    if (config.webp) {
      options.formats.unshift('webp')
    }
    if (config.avif) {
      options.formats.unshift('avif')
    }
  } else if (src.endsWith('.gif')) {
    options.formats = ['gif']
    options.sharpOptions = { ...sharpOptions, animated: true }
    if (config.webp) {
      options.formats.unshift('webp')
    }
  } else {
    options.formats = ['jpeg']
    if (config.webp) {
      options.formats.unshift('webp')
    }
    if (config.avif) {
      options.formats.unshift('avif')
    }
  }

  let newImage

  try {
    const metadata = await Image(src, options)

    if (src.endsWith('.svg')) {
      newImage = `<img
      src="${metadata.svg[0].url}"
      ${width ? `width="${width}"` : ''}
      ${height ? `height="${height}"` : ''}
      ${alt ? `alt="${alt}"` : ''}
      ${className ? `class="${className}"` : ''}
      ${dataWId ? `data-w-id="${dataWId}"` : ''}
      ${styles ? `style="${styles}"` : ''}
      ${loading ? `loading="${loading}"` : ''}
      ${decoding ? `decoding="${decoding}"` : ''}
      ${sizes ? `sizes="${sizes}"` : ''}
      >`
    } else {
      let lowsrc
      if (metadata.jpeg) {
        lowsrc = metadata.jpeg[0].url
      } else if (metadata.png) {
        lowsrc = metadata.png[0].url
      } else if (metadata.gif) {
        lowsrc = metadata.gif[0].url
      }

      // TODO: Don't add srcset sizes if sizes is empty
      newImage = `<picture ${id ? `id=${id}` : ''}>
    ${Object.values(metadata)
      .map(
        imageFormat =>
          `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat
            .map(entry => (sizes ? entry.srcset : entry.srcset.split(' ')[0]))
            .join(', ')}" ${sizes ? `sizes="${sizes}"` : ''}>`
      )
      .join('\n')}
      <img
        src="${lowsrc}"
        ${width ? `width="${width}"` : ''}
        ${height ? `height="${height}"` : ''}
        ${alt ? `alt="${alt}"` : ''}
        ${className ? `class="${className}"` : ''}
        ${dataWId ? `data-w-id="${dataWId}"` : ''}
        ${styles ? `style="${styles}"` : ''}
        ${loading ? `loading="${loading}"` : ''}
        ${decoding ? `decoding="${decoding}"` : ''}
        ${sizes ? `sizes="${sizes}"` : ''}
        >
    </picture>`
    }

    $(img).replaceWith(newImage)
  } catch (err) {
    console.log(`Error downloading image: ${src}`, err)
  }
}

const processImages = async ($, config, outputDir) => {
  const images = $('img')
  const promises = []
  const successfulDownloads = []
  const failedDownloads = []

  for (const img of $(images)) {
    const src = $(img).attr('src')

    if (!src) {
      return $
    }

    try {
      await imageOperations(img, $, config, outputDir)
      successfulDownloads.push(src)
    } catch (err) {
      failedDownloads.push(src)
    }
  }

  // await Promise.all(promises)

  return {$, failedDownloads, successfulDownloads}
}

module.exports = processImages
