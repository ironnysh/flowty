const path = require('path')
const fs = require('fs')
const css = require('css')
const shortHash = require('short-hash')
const { normalizeUrl } = require('crux-api')
const downloadImage = require('./downloadImage')
const createFolder = require('../../utils/createDirectory')

const downloadCSSImages = async (allStyles, outputDir) => {
  let styles = allStyles

  try {
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+(?:"([^"]*)"|([^ ]*)\b))/g
    const cssObj = await css.parse(allStyles)
    const rules = await cssObj.stylesheet.rules
      .map(rule => {
        if (rule.declarations) {
          return rule.declarations.filter(decl => decl.property === 'background-image')
        }
      })
      .flat()
      .filter(rule => rule !== undefined)
    const srcArray = rules.filter(src => src.value.match(urlRegex)).flat()
    // .flatMap(src => src.value.split(', '))
    const urls = srcArray
      .map(src => src.value.split(',').flatMap(source => source.match(urlRegex)))
      .flat()
      .filter(url => !!url)
    // console.log(urls)

    await createFolder(path.join(__dirname, `/../../../${outputDir}/flowty/img`))

    const successfulDownloads = []
    const failedDownloads = []

    const imageDownloads = []

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
        const filepath = path.join(__dirname, `/../../../${outputDir}/flowty/img/${filename}`)

        if (!fs.existsSync(filepath)) {
          await downloadImage(cloudinaryUrl, outputDir, filename).then(
            // console.log('replacing')
            // console.log(styles.match(srcRegex))
            (styles = styles.replaceAll(srcRegex, `/flowty/img/${filename}`))
          )
        }

        // await downloadImage(url, outputDir, filename).then(
        //   (styles = styles.replace(srcRegex, `/flowty/img/${filename}`))
        // )
      } catch (error) {
        failedDownloads.push(filename)
      }
      // imageDownloads.push(
      //   // TODO: Optimise background images and use webP
      //   // await processCssImages(url, config, outputDir).then(
      //   //   (allStyles = allStyles.replace(srcRegex, `/flowty/img/${filename}`))
      //   // )
      // )
    })

    return { styles, successfulDownloads, failedDownloads }
    // await Promise.all(imageDownloads)
  } catch (error) {
    throw new Error('Error downloading background images')
  }
}

module.exports = downloadCSSImages
