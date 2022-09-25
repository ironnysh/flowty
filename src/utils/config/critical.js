const options = {
  inline: true,
  dimensions: [
    {
      height: 640,
      width: 360,
    },
    {
      height: 1080,
      width: 1920,
    },
  ],
  rebase: ({ originalUrl }) => originalUrl,
}

module.exports = options
