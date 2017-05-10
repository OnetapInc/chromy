const {ChromeLauncher} = require('lighthouse/lighthouse-cli/chrome-launcher')

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
      '>': '&gt;'
    }[match]
  })
}

function createChromeLauncher (options) {
  const flags = ['--disable-gpu']
  if (!options.visible) {
    flags.push('--headless')
  }
  return new ChromeLauncher({
    port: options.port,
    autoSelectChrome: true,
    additionalFlags: flags
  })
}

exports.escapeHtml = escapeHtml
exports.createChromeLauncher = createChromeLauncher

