const lazyIframes = $ => {
  try {
    const iframes = $('iframe')
    $(iframes).each((i, el) => {
      const loading = $(el).attr('loading')

      if (loading) {
        return
      }
      $(el).attr('loading', 'lazy')
    })
  } catch (error) {
    throw new Error('Error removing Webflow JS')
  }

  return $
}

module.exports = lazyIframes
