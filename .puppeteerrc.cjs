/**
 * Puppeteer configuration.
 *
 * - Skip Chromium download on Vercel (static-site builds don't need a browser).
 * - Local dev / author machines: download as usual so `npm run pdf` works.
 */
module.exports = {
  skipDownload: !!process.env.VERCEL,
};
