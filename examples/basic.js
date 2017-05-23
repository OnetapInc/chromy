const Chromy = require('../src')

let chromy = new Chromy()
chromy.chain()
      .goto('file://' + __dirname + '/pages/index.html')
      .evaluate(() => {
        return document.querySelectorAll('*').length
      })
      .result((r) => console.log(r))
      .end()
      .then(_ => chromy.close())
