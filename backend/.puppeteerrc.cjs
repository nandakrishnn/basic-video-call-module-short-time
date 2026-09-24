const { join } = require('path')

/**
 * Puppeteer defaults its browser cache to ~/.cache/puppeteer — on Render that
 * resolves to /opt/render/.cache/puppeteer, which is written during build and
 * then NOT carried into the runtime container. The downloaded Chrome vanishes,
 * and generateReportPdf fails with "Could not find Chrome (ver. …)".
 *
 * Pointing the cache inside the project directory keeps it on the persisted
 * side of that boundary, so the binary installed at build time is still there
 * when a report is generated.
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
}
