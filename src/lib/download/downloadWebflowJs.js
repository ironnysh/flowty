require('isomorphic-fetch')
const path = require('path')
const fs = require('fs')
const uglifyJS = require('uglify-js')

const webflowAssets = [
  'https://uploads-ssl.webflow.com',
  'https://assets-global.website-files.com',
  'https://assets.website-files.com',
]

const downloadJS = async ($, siteId, outputDir) => {
  try {
    const scripts = $(`script[src*="/${siteId}/js/"]`)
    let webflowJS = null
    $(scripts).each((i, el) => {
      const src = $(el).attr('src')
      webflowAssets.forEach(async asset => {
        if (src.startsWith(asset)) {
          webflowJS = src
          if (webflowJS) {
            const filename = webflowJS.split('/').pop()
            if (!fs.existsSync(path.join(__dirname, `/../../../${outputDir}/flowty/js/${filename}`))) {
              const mainJS = path.join(__dirname, `/../../../${outputDir}/flowty/js/${filename}`)
              // TODO: Add a configuration option to enable/disable this
              const response = await fetch(webflowJS)
              const data = await response.text()
              fs.writeFileSync(mainJS, uglifyJS.minify(data).code)

              // await fetch(webflowJS).then(res => res.body.pipe(fs.createWriteStream(mainJS)))
            }

            $(`script[src=${webflowJS}]`).replaceWith(`<script src="/flowty/js/${filename}" ></script>`)
          } else {
            throw new Error('No webflow JS found')
          }
        }
      })
    })
  } catch (error) {
    throw new Error('Error downloading Webflow JS')
  }

  return $
}

module.exports = downloadJS
