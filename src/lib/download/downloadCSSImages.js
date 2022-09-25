const path = require('path')
const css = require('css')
const Image = require('@11ty/eleventy-img')
const downloadImage = require('./downloadImage')
const createFolder = require('../../utils/createDirectory')

const downloadCSSImages = async (allStyles, outputDir) => {
  const options = {
    widths: [null],
    urlPath: '/flowty/img/',
    formats: [null],
    outputDir: `./${outputDir}/flowty/img/`,
  }
  try {
    let styles = allStyles

    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+[^("\)|'\))])/g
    cssObj = css.parse(allStyles)
    const rules = cssObj.stylesheet.rules
      .map(rule => {
        if (rule.declarations) {
          return rule.declarations.filter(decl => decl.property === 'background-image')
        }
      })
      .flat()
      .filter(rule => rule !== undefined)
    const srcArray = rules
      .filter(src => src.value.startsWith(`url('http`) || src.value.startsWith(`url("http`))
      // .map(src => src.split(', '))
      .flat()
    const urls = srcArray.map(src => src.value.match(urlRegex)).flat()

    await createFolder(path.join(__dirname, `/../../../${outputDir}/flowty/img`))

    const successfulDownloads = []
    const failedDownloads = []

    const imageDownloads = []
    urls.forEach(async url => {
      const srcRegex = new RegExp(url, 'g')
      const filename = url.split('/').pop()
      try {
        const metadata = await Image(url, options)
        let lowsrc = null

        if (metadata.jpeg) {
          lowsrc = metadata.jpeg[0].url
        } else if (metadata.png) {
          lowsrc = metadata.png[0].url
        } else if (metadata.gif) {
          lowsrc = metadata.gif[0].url
        } else if (metadata.svg) {
          lowsrc = metadata.svg[0].url
        } else if (metadata.webp) {
          lowsrc = metadata.webp[0].url
        } else if (metadata.avif) {
          lowsrc = metadata.avif[0].url
        }

        if (lowsrc) {
          styles = styles.replace(srcRegex, `/flowty/img/${lowsrc}`)
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

    // await Promise.all(imageDownloads)
    return { styles, successfulDownloads, failedDownloads }
  } catch (error) {
    throw new Error('Error downloading background images')
  }
}

module.exports = downloadCSSImages
