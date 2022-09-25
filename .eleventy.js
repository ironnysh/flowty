require('dotenv').config()
const scrapePage = require('./src/_11ty/shortcode/scrapePage')
const inlineCSS = require('./src/_11ty/transforms/inline-css')
const purgeCSS = require('./src/_11ty/transforms/purge-css')


const dev = process.env.NODE_ENV !== 'production';
const config = require('./src/_data/config')

module.exports = (eleventyConfig) => {

  //! Shortcodes
  eleventyConfig.addShortcode("scrapePage", scrapePage);

  eleventyConfig.addPassthroughCopy({
    public: './'
  })

  if (config.css.purge) {
    eleventyConfig.addTransform('purgeCSS', purgeCSS)
  } else if (config.css.critical) {
    eleventyConfig.addTransform('critical', inlineCSS)
  }

  eleventyConfig.setBrowserSyncConfig({
    files: ['_dev/**/*'],
    open: false,
  })

  eleventyConfig.addFilter("removeTrailingSlash", (string) => {
    return string.replace(/\/$/, '')
  })


  eleventyConfig.setLiquidOptions({
    dynamicPartials: true
  });

  eleventyConfig.setDataDeepMerge(true)

  eleventyConfig.setBrowserSyncConfig({
    files: ['_dev/img/*']
  });



  return {
    dir: {
      input: 'src',
      output: dev ? '_dev' : '_site'
    },
  }
}