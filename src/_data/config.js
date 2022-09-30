module.exports = {
    "webflowUrl": "https://ronnys-supercool-site.webflow.io", // Example: https://my-website.webflow.io
    "customDomain": "", // Example: https://my-website.com
    "css": {
        "critical": false,
        "purge": false
    },
    "embeds": {
        "optimiseYouTube": true,
        "lazyIframes": true
    },
    "js": {
        "webflow": {
            "remove": false
        },
        "jquery": {
            "remove": false
        },
    },
    "preloadNavigation": true,
    "images": {
        "webp": true,
        "avif": false,
    },
    "removeBranding": true,
    "videos": {
        "download": true,
        "disableAutoplay": false
    },
    "generateSitemap": true,
    "generateRobots": true,
    "sitemapExclude": ["/404"],
    "noindex": ["/404"],
    "customCodeHead": ``,
    "customCodeBody": ``,
}