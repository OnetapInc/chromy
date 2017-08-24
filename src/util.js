'use strict'

const chromeLauncher = require('chrome-launcher')
const path = require('path')

// borrow from: http://qiita.com/saekis/items/c2b41cd8940923863791
function escapeHtml (string) {
  if (typeof string !== 'string') {
    return string
  }
  return string.replace(/[&'`"<>]/g, function (match) {
    return {
      '&': '&amp;',
      '\'': '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }[match]
  })
}

function escapeSingleQuote (string) {
  if (typeof string !== 'string') {
    return string
  }
  return string.replace(/'/g, '\\\'')
}

async function createChromeLauncher (startingUrl, options) {
  const flags = []
  let chromeInstance

  // Lighthouse adds '--disable-setuid-sandbox' flag automatically.
  // The flag causes an error on linux when staring headless chrome.
  // '--no-sandbox' suppresses an error caused by '--disable-setuid-sandbox'.
  if (process.platform === 'linux') {
    flags.push('--no-sandbox')
  }
  if (!options.visible) {
    flags.push('--headless')
    flags.push('--hide-scrollbars')
  }
  if (options.chromeFlags && Array.isArray(options.chromeFlags)) {
    options.chromeFlags.forEach(f => {
      if (f.indexOf('--') === -1) {
        throw new Error('An item of chromFlags option must have "--" at start of itself. the value: ' + f)
      }
      flags.push(f)
    })
  }
  if (options.additionalChromeFlags && Array.isArray(options.additionalChromeFlags)) {
    console.warn('[chromy] additionalChromeFlags is deprecated. Use chromeFlags instead of this.')
    options.additionalChromeFlags.forEach(f => {
      if (f.indexOf('--') === -1) {
        throw new Error('An item of chromFlags option must have "--" at start of itself. the value: ' + f)
      }
      flags.push(f)
    })
  }
  const params = {
    port: options.port,
    chromeFlags: flags,
    startingUrl: startingUrl,
    logLevel: 'error',
    enableExtensions: options.enableExtensions,
    handleSIGINT: false,
  }
  if (options.chromePath) {
    params.chromePath = options.chromePath
  }
  if (options.userDataDir) {
    params.userDataDir = options.userDataDir
  }

  chromeInstance = await chromeLauncher.launch(params)

  return chromeInstance
}

function completeUrl (url) {
  const reg = new RegExp('^[a-zA-Z0-9]+:', 'i')
  const regAbbr = new RegExp('^//', 'i')
  if (reg.test(url)) {
    return url
  } else if (regAbbr.test(url)) {
    return 'http:' + url
  } else {
    return 'file://' + path.join(process.cwd(), url)
  }
}

exports.escapeHtml = escapeHtml
exports.escapeSingleQuote = escapeSingleQuote
exports.createChromeLauncher = createChromeLauncher
exports.completeUrl = completeUrl

