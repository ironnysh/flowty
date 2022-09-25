const cheerio = require('cheerio')
const fetch = require('isomorphic-fetch')

const generatePages = (sitemap, url) => sitemap.map(page => page.replace(`${url}/`, ''))

// const isContentTypeHtml = contentType => contentType?.toLowerCase().includes('html')
const crawledPages = [`/`]
const foundPages = [`/`, `/404`]
const pagesToVisit = [`/`, `/404`]
const excludeFromSitemap = []

const crawlPage = async (pageToVisit, neatUrl) => {
  const page = await fetch(`${neatUrl}${pageToVisit}`)

  if (page.status === 404) {
    console.log(`Page ${pageToVisit} not found`)
    foundPages.filter(path => path !== pageToVisit)
    return
  }

  const html = await page.text()
  const $ = cheerio.load(html)

  if ($('body').attr('sitemap') === 'no') {
    excludeFromSitemap.push(pageToVisit)
  }

  const links = $('a')
  crawledPages.push(pageToVisit)


  // Find all links on the page, follow them
  for (const el of $(links)) {
    const href = $(el).attr('href')
    const page = `${href}`
    const hasHash = page.includes('#')

    if (href && href.startsWith('/') && !hasHash && !href.endsWith('sitemap.xml') && !href.endsWith('robots.txt')) {
      if (!foundPages.includes(page)) {
        foundPages.push(page)
      }
      if (!crawledPages.includes(page) && !pagesToVisit.includes(page)) {
        pagesToVisit.push(page)
      }
    }
  }
}

async function crawlSite(webflowUrl) {
  if (!webflowUrl) {
    throw new Error('webflowUrl is required')
  }

  //   remove trailing slash at end of url
  const neatUrl = webflowUrl.endsWith('/') ? webflowUrl.slice(0, -1) : webflowUrl

  while (pagesToVisit.length > 0) {
    try {
      await crawlPage(pagesToVisit.shift(), neatUrl)
    } catch (error) {
      console.log(error)
      throw new Error('Error crawling site')
    }
  }

  const pages = await generatePages(foundPages, neatUrl)
  console.log(`Total pages found: ${pages.length}`)

  return { pages, excludeFromSitemap }
}

module.exports = crawlSite
