const fs = require('fs')

const createFolder = async dir => {
  try {
    await fs.promises.mkdir(dir, { recursive: true })
  } catch (error) {
    console.log(error)
  }
}

module.exports = createFolder
