// Optimises native YouTube embeds, as well as Embedly media widget YouTube embeds

const optimiseYoutube = async $ => {
  const ms = Date.now()

  try {
    const iframes = $('iframe[src*="youtube"]')
    for (const iframe of $(iframes)) {
      let src = $(iframe).attr('src')

      if (src && src.includes('cdn.embedly.com')) {
        src = src.startsWith('//') ? (src = `https:${src}`) : src
        const embedlySrc = new URL(src)
        const embedlyParams = embedlySrc.searchParams
        const embedlyUrl = embedlyParams.get('src')
        src = embedlyUrl
      }

      const path = new URL(src).pathname
      const id = path.split('/').pop()
      const title = $(iframe).attr('title') || ''
      const style = $(iframe).attr('style') || ''
      const params = new URL(src).searchParams.toString()
      const lite = `<link rel="stylesheet" href="/flowty/css/yt-lite.min.css?v=${ms}" />
      <lite-youtube videoid="${id}" playlabel="Play: ${title}" style="${style}" params=${params}></lite-youtube>
      <script src="/flowty/js/yt-lite.min.js?v=${ms}"></script>`

      $(iframe).replaceWith(lite)
    }
  } catch {
    throw new Error('Error optimising Youtube')
  }
  return $
}

module.exports = optimiseYoutube
