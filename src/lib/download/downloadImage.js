const path = require('path')
const fs = require('fs')
const https = require('https')

const downloadImage = async (url, outputDir, filename) => {
  // TODO: Check if image already saved
  const decodedFilename = decodeURIComponent(filename)
  if (!fs.existsSync(path.join(__dirname, `/../../../${outputDir}/flowty/img/${decodedFilename}`))) {
    await https
      .get(url, res => {
        // Open file in local filesystem
        const file = fs.createWriteStream(path.join(__dirname, `/../../../${outputDir}/flowty/img/${decodedFilename}`))

        // Write data into local file
        res.pipe(file)

        // Close the file
        file.on('finish', () => {
          file.close()
          // console.log(`Download success${url}`)
        })
      })
      .on('error', err => {
        console.log('Error: ', err.message, url)
        return false
      })
  }
}

module.exports = downloadImage
