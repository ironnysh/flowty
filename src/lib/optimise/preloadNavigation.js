const preloadNavigation = ($, siteId) =>
  $('body').append(`<script src="/flowty/js/instant-page-5.1.0.js?id=${siteId}" type="module"></script>`)

module.exports = preloadNavigation
