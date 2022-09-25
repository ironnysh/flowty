const getCSSFiles = async ($, siteId) => {
  const stylesheets = $(`link[rel*="stylesheet"][href*="${siteId}/"]`)
  let allStyles = ''

  for (const el of $(stylesheets)) {
    const src = $(el).attr('href')
    const styles = await fetch(src).then(res => res.text())
    allStyles += styles
  }

  return { stylesheets, allStyles }
}

module.exports = getCSSFiles
