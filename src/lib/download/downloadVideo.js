const path = require('path')
const fs = require('fs')
const https = require('https')
const createFolder = require('../../utils/createDirectory')

const downloadFile = async (url, outputDir, filename) => {
  await createFolder(path.join(__dirname, `/../../../${outputDir}/flowty/video`))
  const decodedFilename = decodeURIComponent(filename)
  if (!fs.existsSync(path.join(__dirname, `/../../../${outputDir}/flowty/video/${decodedFilename}`))) {
    await https
      .get(url, res => {
        // Open file in local filesystem
        const file = fs.createWriteStream(
          path.join(__dirname, `/../../../${outputDir}/flowty/video/${decodedFilename}`)
        )

        // Write data into local file
        res.pipe(file)

        // Close the file
        file.on('finish', () => {
          file.close()
        })
      })
      .on('error', err => {
        console.log('Error: ', err.message, url)
      })
  }
}

const downloadVideo = async ($, outputDir, config) => {
  const videos = $('video')
  const promises = []

  if ($(videos).length) {
    for (const el of $(videos)) {
      const poster = $(el).parent().data('poster-url')
      const posterFilename = encodeURIComponent(poster.split('/').pop())
      await downloadFile(poster, outputDir, posterFilename).then(() => {
        $(el).attr('poster', `/flowty/video/${posterFilename}`)
        $(el).css('background-image', `url(/flowty/video/${posterFilename})`)
        $(el).parent().removeAttr('data-poster-url')
        $(el).parent().removeAttr('data-video-urls')
        if (config.videos.disableAutoplay) {
          $(el).parent().removeAttr('data-wf-ignore')
          $(el).parent().removeAttr('data-autoplay')
          $(el).parent().removeAttr('data-loop')
          $(el).removeAttr('autoplay')
          $(el).css('z-index', '0')
          $(el).attr('controls', true)
        }
      })
      const sources = $(el).find('source')
      for (const source of $(sources)) {
        const src = $(source).attr('src')
        const filename = encodeURIComponent(src.split('/').pop())
        promises.push(
          await downloadFile(src, outputDir, filename).then($(source).attr('src', `/flowty/video/${filename}`))
        )
      }
    }
    await Promise.all(promises)
  }

  return $
}

module.exports = downloadVideo
