const path = require('path')
const fs = require('fs')
const https = require('https')
const css = require('css')
const createFolder = require('../../utils/createDirectory')

const download = async (url, outputDir, filename) => {
  const decodedFilename = decodeURIComponent(filename)
  await https
    .get(url, res => {
      // Open file in local filesystem
      const file = fs.createWriteStream(path.join(__dirname, `/../../../${outputDir}/flowty/fonts/${decodedFilename}`))

      // Write data into local file
      res.pipe(file)

      // Close the file
      file.on('finish', () => {
        file.close()
        // console.log(`File downloaded! ${decodedFilename}`)
      })
    })
    .on('error', err => {
      console.log('Error: ', err.message)
    })
}

const downloadWebflowFonts = async (allStyles, outputDir) => {
  try {
    let styles = allStyles
    // Gets an array of all the font-face rules
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+\.(?:eot|woff2|woff|ttf|svg|otf))/g
    const cssObj = css.parse(allStyles)
    const fontFaces = cssObj.stylesheet.rules.filter(rule => rule.type === 'font-face')
    const fontSrc = fontFaces.map(face => face.declarations.find(decl => decl.property === 'src').value)
    const srcArray = fontSrc
      .filter(src => src.startsWith(`url('http`) || src.startsWith(`url("http`))
      .map(src => src.split(', '))
      .flat()
    const urls = srcArray.map(src => src.match(urlRegex)).flat()

    await createFolder(path.join(__dirname, `/../../../${outputDir}/flowty/fonts`))

    const successfulDownloads = []
    const failedDownloads = []

    urls.forEach(async url => {
      const srcRegex = new RegExp(url, 'g')
      const filename = url.split('/').pop()
      try {
        await download(url, outputDir, filename).then((styles = styles.replace(srcRegex, `/flowty/fonts/${filename}`)))
        successfulDownloads.push(filename)
      } catch (error) {
        failedDownloads.push(filename)
      }
    })

    return { styles, successfulDownloads, failedDownloads }
  } catch (error) {
    throw new Error('Error downloading Webflow fonts')
  }
}

module.exports = downloadWebflowFonts
