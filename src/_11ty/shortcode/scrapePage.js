const cheerio = require('cheerio')
const config = require('../../_data/config.js')

// Optimisation scripts
const removeBranding = require('../../lib/optimise/removeBranding')
const preloadNavigation = require('../../lib/optimise/preloadNavigation')
const removeWebflowJs = require('../../lib/optimise/removeWebflowJs')
const optimiseYoutube = require('../../lib/optimise/optimiseYoutube')
const processImages = require('../../lib/optimise/processImages')
const lazyIframes = require('../../lib/optimise/lazyIframes')

// Download scripts
const downloadWebflowFonts = require('../../lib/download/downloadWebflowFonts')
const downloadGoogleFonts = require('../../lib/download/downloadGoogleFonts')
const downloadCSS = require('../../lib/download/downloadCSS')
const downloadInlineImages = require('../../lib/download/downloadInlineImages')
const downloadCSSImages = require('../../lib/download/downloadCSSImagesCloud')
const downloadWebflowJs = require('../../lib/download/downloadWebflowJs')
const downloadJquery = require('../../lib/download/downloadJquery')
const downloadCdnJs = require('../../lib/download/downloadCdnJs')
const downloadJsDelivr = require('../../lib/download/downloadJsDelivr')
const downloadUnpkg = require('../../lib/download/downloadUnpkg')
const downloadVideo = require('../../lib/download/downloadVideo')
const downloadMetadata = require('../../lib/download/downloadMetadata')

// Other scripts
const getCSSFiles = require('../../utils/getCSSFiles')

const dev = process.env.NODE_ENV !== 'production'
const outputDir = dev ? '_dev' : '_site'

const hrTime = hrEnd => {
  // use process.hrtime() to show how long it takes to run in seconds
  const hrDiffMs = `${(hrEnd[0] * 1000 + hrEnd[1] / 1e6).toFixed(2)} ms`
  return hrDiffMs
}

module.exports = async function (page, noindex, customCodeHead, customCodeBody) {
  console.log(`Building page: ${page}/index.html`)
  const { webflowUrl } = config

  //   ! Get the HTML of the page
  const html = await fetch(`${webflowUrl}/${page}`).then(res => res.text())
  const $ = cheerio.load(html)

  const siteId = $('html').data('wf-site')
  $('html').removeAttr('data-wf-domain')
  if (noindex) {
    $('title').after('<meta name="robots" content="noindex">')
  }

  if (customCodeHead) {
    $('head').append(customCodeHead)
  }

  if (customCodeBody) {
    $('body').append(customCodeBody)
  }

  if (config.removeBranding) {
    try {
      await removeBranding($)
    } catch (error) {
      console.log('Error removing branding')
    }
  }

  if (config.preloadNavigation) {
    try {
      await preloadNavigation($, siteId)
    } catch (error) {
      console.log('Error adding instant.page')
    }
  }

  try {
    await downloadMetadata($, outputDir)
  } catch (error) {
    console.log('Error downloading metadata')
  }

  if (config.js) {
    if (config.js.webflow) {
      if (config.js.webflow.remove) {
        try {
          await removeWebflowJs($)
        } catch (error) {
          console.log('Error removing Webflow JS')
        }
      } else {
        try {
          await downloadWebflowJs($, siteId, outputDir)
        } catch (error) {
          console.log('Error downloading Webflow JS')
        }
      }
    }

    if (config.js.jquery) {
      if (config.js.jquery.remove) {
        try {
          $('script[src*="jquery"]').remove()
        } catch (error) {
          console.log('Error removing jQuery')
        }
      } else {
        try {
          await downloadJquery($, outputDir, siteId)
        } catch (error) {
          console.log('Error downloading jQuery')
        }
      }
    }
  }

    try {
      await downloadCdnJs($, outputDir, siteId)
      await downloadUnpkg($, outputDir, siteId)
      await downloadJsDelivr($, outputDir, siteId)
    } catch (error) {
      console.log('Error downloading from CDNs')
    }


  if (config.embeds) {
    if (config.embeds.optimiseYouTube) {
      try {
        await optimiseYoutube($)
      } catch (error) {
        console.log('Error optimising YouTube embeds')
      }
    }

    if (config.embeds.lazyIframes) {
      try {
        await lazyIframes($)
      } catch (error) {
        console.log('Error lazy loading iframes')
      }
    }
  }

  if (config.videos) {
    if (config.videos.download) {
      try {
        await downloadVideo($, outputDir, config)
      } catch (error) {
        console.log('Error downloading videos')
      }
    }
  }

  if (config.css) {
    const { stylesheets, allStyles } = await getCSSFiles($, siteId)
    let modifiedStyles = allStyles

    if (config.images) {
      try {
        const { styles } = await downloadCSSImages(allStyles, outputDir)
        modifiedStyles = styles
      } catch (error) {
        console.log('Error downloading CSS images')
      }

      // NOTE: Webflow font download is dependent on the CSS being downloaded
      if (config.fonts) {
        try {
          const { styles } = await downloadWebflowFonts(modifiedStyles, outputDir)
          modifiedStyles = styles
        } catch (error) {
          console.log('Error downloading Webflow fonts')
        }
      }

      try {
        await downloadCSS($, stylesheets, modifiedStyles, outputDir)
      } catch (error) {
        console.log('Error downloading CSS')
      }
    }
  }
  
  try {
    await downloadGoogleFonts($, outputDir)
  } catch (error) {
    console.log('Error downloading Google fonts')
  }

  if (config.images) {
    try {
      await processImages($, config.images, outputDir)
      await downloadInlineImages($, outputDir)
    } catch (error) {
      console.log('Error processing images')
    }
  }

  return $.html()
}
