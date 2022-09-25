const path = require('path')
const downloadImage = require('./downloadImage')
const createFolder = require('../../utils/createDirectory')

const downloadMetadata = async ($, outputDir) => {
  const successfulDownloads = []
    const failedDownloads = []

  try {
    await createFolder(path.join(__dirname, `/../../../${outputDir}/flowty/img`))
    const ogImage = $('meta[property*=":image"]')
  
    for (const el of $(ogImage)) {
      const url = $(el).attr('content')
      try {
        const filename = url.split('/').pop()
        await downloadImage(url, outputDir, filename).then($(el).attr('content', `/flowty/img/${filename}`))
        successfulDownloads.push(url)
      } catch {
        failedDownloads.push(url)
      }
    }
    
    const icons = $('link[rel*="icon"]')
    
    for (const el of $(icons)) {
      const url = $(el).attr('href')
      try {
        const filename = url.split('/').pop()
        await downloadImage(url, outputDir, filename).then($(el).attr('href', `/flowty/img/${filename}`))
        successfulDownloads.push(url)
      } catch {
        failedDownloads.push(url)
      }
    }

  } catch (error) {
    throw new Error("Error downloading metadata")
  } finally {
    return {$, successfulDownloads, failedDownloads}
  }
}

module.exports = downloadMetadata
