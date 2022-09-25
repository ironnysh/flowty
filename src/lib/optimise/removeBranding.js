const removeBranding = $ => {
  $('html').removeAttr('data-wf-status')
  $('a#made-in-webflow').remove()
  return $.html()
}

module.exports = removeBranding
