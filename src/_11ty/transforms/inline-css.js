const { PurgeCSS } = require('purgecss')
const path = require('path')
const fs = require('fs')
const critical = require('critical')
const cheerio = require('cheerio')
const stringHash = require('string-hash')
const config = require('../../_data/config')
const options = require('../../utils/config/critical')

const dev = process.env.NODE_ENV !== 'production'

const siteFolder = !dev ? '_site' : '_dev'

const fontsFile = fs.existsSync(path.join(__dirname, `/../../../${siteFolder}/flowty/fonts/fonts.css`))

const cssFiles = []
if (config.css.download) {
  cssFiles.push(`/${siteFolder}/flowty/css/main.css`)
}

if (fontsFile) {
  cssFiles.push(`/${siteFolder}/flowty/fonts/fonts.css`)
}

if (cssFiles.length > 0) {
  options.css = cssFiles
}

/*
 * Extract critical CSS for desktop & mobile. Inline that in the head (blocks render)
 * Take the remaining CSS for the page & run it through purgeCSS so that we only have used CSS remaining
 * With the remaining CSS & raw HTML
 *      - Search for <section>, <article>, <footer> tags
 *      - Run the tag content & unused CSS through purgeCSS
 *      - Return the block with HTML first
 *      - All remaining unused CSS is run one final time against the HTML & added to the end of the document.
 */
// REGEX for HTML tag search: /<\s*div[^>]*>(.*?)<\s*/\s*div>/gis
// Extract critical CSS for each page from main css file
// Inline critical CSS
// Return new HTML and unused CSS

const extractCritical = async (content, outputPath) => {
  const { html, uncritical } = await critical.generate({
    ...options,
    base: path.dirname(outputPath),
    html: content,
    minify: !dev,
  })

  return { html, uncritical }
}

const createFolder = async dir => {
  try {
    await fs.promises.mkdir(dir, { recursive: true })
  } catch (error) {
    console.log(error)
  }
}

module.exports = async (content, outputPath) => {
  // const styles = fs.readFileSync(path.join(__dirname, `/../../_css_cache/main.css`));
  // const pattern = /<\s*section[^>]*>.*?<\s*\/\s*section>/gs;

  if (outputPath.endsWith('.html')) {
    // Return HTML with critical CSS inlined
    // Return uncritical CSS for further purge & file creation
    const { html, uncritical } = await extractCritical(content, outputPath)

    const $ = cheerio.load(html)
    const head = $('head')

    // Create a unique filename for the uncritical CSS file
    const hashedFilename = `${stringHash(uncritical)}.css`

    // Create folder in assets for uncritical CSS to live
    // await createFolder(path.join(__dirname, `/../../../${siteFolder}/assets/css`))

    // Write uncritical CSS to file
    // Add it to HTML document
    // Return HTML
    await fs.writeFile(
      path.join(__dirname, `/../../../${siteFolder}/flowty/css/${hashedFilename}`),
      uncritical,
      (error, result) => {
        if (error) {
          console.log(error)
        }
      }
    )

    // const inlineStyle = `<style type="text/css">${uncritical}</style>`;
    const linkToFile = `<link href='/flowty/css/${hashedFilename}' rel="stylesheet" media="nope!" onload="this.media='all'" type="text/css">
    <noscript><link href='/flowty/css/${hashedFilename}' rel='stylesheet' type="text/css"></noscript>`

    head.append(linkToFile)
    // }

    if (config.css.download) {
      $('link[rel="stylesheet"][href*="main.css"]').remove()
    }

    if (fontsFile) {
      $('link[rel="stylesheet"][href*="fonts.css"]').remove()
    }

    return $.html()
  }
  return content
}
