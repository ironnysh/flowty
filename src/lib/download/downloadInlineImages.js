const path = require('path')
const fs = require('fs')
const css = require('css')
const shortHash = require('short-hash')
const { normalizeUrl } = require('crux-api')
const downloadImage = require('./downloadImage')
const createFolder = require('../../utils/createDirectory')

const downloadInlineImages = async (style, $, outputDir) => {
  let newStyle = $(style).attr('style')

  try {
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+[^("\)|'\))])/g

    const cssObj = css.parse(`* { ${newStyle} }`)
    const rules = cssObj.stylesheet.rules
      .map(rule => {
        if (rule.declarations) {
          return rule.declarations.filter(decl => decl.property === 'background-image')
        }
      })
      .flat()
      .filter(rule => rule !== undefined)
    const srcArray = rules
      .filter(src => src.value.match(urlRegex))
      // .map(src => src.split(', '))
      .flat()
    const urls = srcArray.map(src => src.value.match(urlRegex)).flat()
    await createFolder(path.join(__dirname, `/../../../${outputDir}/flowty/img`))

    urls.map(async url => {
      const src = normalizeUrl(url)
      let originalFormat
      if (src.endsWith('.svg')) {
        originalFormat = 'svg'
      } else if (src.endsWith('.png')) {
        originalFormat = 'png'
      } else if (src.endsWith('.gif')) {
        originalFormat = 'gif'
      } else {
        originalFormat = 'jpg'
      }

      const srcRegex = new RegExp(url, 'g')
      const filename = `${shortHash(src)}.${originalFormat}`

      try {
        const cloudinaryUrl = `https://res.cloudinary.com/meifu/image/fetch/f_${originalFormat},q_auto/${src}`
        // const filepath = path.join(__dirname, `/../../../${outputDir}/flowty/img/${filename}`)

        await downloadImage(cloudinaryUrl, outputDir, filename)
          .then(
            // console.log('replacing')
            // console.log(styles.match(srcRegex))
            (newStyle = newStyle.replaceAll(srcRegex, `/flowty/img/${filename}`))
          )
          .then($(style).attr('style', newStyle))
      } catch (error) {
        console.log(error)
      }
      // imageDownloads.push(
      //   // TODO: Optimise background images and use webP
      //   // await processCssImages(url, config, outputDir).then(
      //   //   (allStyles = allStyles.replace(srcRegex, `/flowty/img/${filename}`))
      //   // )
      // )
    })
    // await Promise.all(imageDownloads)
  } catch (error) {
    console.log(error)
    throw new Error('Error downloading background images')
  }
}

const processImages = async ($, outputDir) => {
  const inlinedStyledElements = $('[style]')
  const promises = []
  const successfulDownloads = []
  const failedDownloads = []

  for (const style of $(inlinedStyledElements)) {
    const src = $(inlinedStyledElements).attr('style')

    if (!src) {
      return $
    }

    try {
      await downloadInlineImages(style, $, outputDir)
      successfulDownloads.push(src)
    } catch (err) {
      failedDownloads.push(src)
    }
  }

  // await Promise.all(promises)

  return { $, failedDownloads, successfulDownloads }
}

module.exports = processImages
