const path = require('path')
const fs = require('fs')
const GetGoogleFonts = require('get-google-fonts')
const shortHash = require('short-hash')

const googleRegex = /google:( ?){.+?}/g
const fontFaceRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g
const fontNameRegex = /[^'"].*(?=:)/g
const fontStyleRegex = /[(?=.*:)].*[^"',]/g

const downloadGoogleFonts = async ($, outputDir) => {
  try {
    const scripts = $('script:not([src])')
    for (const script of $(scripts)) {
      if (!fs.existsSync(path.join(__dirname, `/../../../${outputDir}/flowty/fonts/fonts.css`))) {
        if ($(script).html().startsWith('WebFont.load')) {
          // console.log('Found WebFont.load')
          const googleFonts = $(script).html().match(googleRegex)
          const fontsJSON = JSON.parse(JSON.stringify(googleFonts[0]))
          const fonts = fontsJSON.match(fontFaceRegex)

          let constructor = {}
          const italicRegex = /(italic)/g
          fonts.map(font => {
            const name = font.match(fontNameRegex)[0]
            const styles = font.match(fontStyleRegex)[0].substring(1)
            const obj = { [name]: styles.replace(italicRegex, 'i').replace('regular', '400').split(',') }
            constructor = { ...constructor, ...obj }
          })

          // console.log({ constructor })
          const gfUrl = GetGoogleFonts.constructUrl(constructor)
          const hashedFilename = shortHash(gfUrl)
          await new GetGoogleFonts().download(`${gfUrl}display=swap`, {
            outputDir: path.join(__dirname, `/../../../${outputDir}/flowty/fonts`),
            path: '/flowty/fonts/',
            cssFile: `fonts.css`,
          })
          $(script).remove()
          $('title').after(`<link rel="stylesheet" href="/flowty/fonts/fonts.css?v=${hashedFilename}" media="all">`)
          $('[src*="webfont.js"]').remove()
        }
      }
    }
  } catch (error) {
    console.log(error)
    throw new Error('Error downloading Google Fonts')
  }

  return $
}

module.exports = downloadGoogleFonts
