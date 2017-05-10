const Chromy = require('../src')

let chromy = new Chromy()
chromy.chain()
      .goto('http://example.com/')
      .evaluate(() => {
        return document.querySelectorAll('*').length
      })
      .result((r) => console.log(r))
      .end()
      .then(_ => chromy.close())
