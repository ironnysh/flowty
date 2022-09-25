const removeWebflowJs = $ => {
  const webflowAssets = [
    'https://uploads-ssl.webflow.com',
    'https://assets-global.website-files.com',
    'https://assets.website-files.com',
  ]

  try {
    const scripts = $('script[src]')
    let webflowJS = null
    $(scripts).each((i, el) => {
      const src = $(el).attr('src')
      webflowAssets.forEach(asset => {
        if (src.startsWith(asset)) {
          webflowJS = src
        }
      })
    })

    if (webflowJS) {
      $(`script[src=${webflowJS}]`).remove()
    }
  } catch (error) {
    throw new Error('Error removing Webflow JS')
  }

  return $
}

module.exports = removeWebflowJs
