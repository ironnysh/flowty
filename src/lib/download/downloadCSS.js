const path = require('path')
const fs = require('fs')
const CleanCSS = require('clean-css')
const shortHash = require('short-hash')
const createFolder = require('../../utils/createDirectory')

const id = Date.now()

const downloadCSS = async ($, stylesheets, allStyles, outputDir) => {
  const hashedFilename = shortHash(allStyles)
  await createFolder(path.join(__dirname, `/../../../${outputDir}/flowty/css`))
  const mainCSS = path.join(__dirname, `/../../../${outputDir}/flowty/css/main.css`)

  if (!fs.existsSync(path.join(__dirname, `/../../../${outputDir}/flowty/css/main.css`))) {
    try {
      // const minified = new CleanCSS({}).minify(allStyles).styles
      fs.writeFileSync(mainCSS, allStyles)
    } catch (err) {
      console.log(err)
      throw new Error('Error downloading CSS')
    }
  }

  try {
    for (const el of $(stylesheets)) {
      $(el).remove()
    }
  } catch (err) {
    console.log(err)
    throw new Error('Error downloading CSS')
  }

  $('head').append(`<link rel="stylesheet" href="/flowty/css/main.css?v=${hashedFilename}" media="all">`)

  return $
}

module.exports = downloadCSS
