const Chromy = require('../src')
const path = require('path')

let chromy = new Chromy()
chromy.chain()
      .goto('file://' + path.join(__dirname, '/pages/index.html'))
      .evaluate(() => {
        return document.querySelectorAll('*').length
      })
      .result((r) => console.log(r))
      .end()
      .then(_ => chromy.close())
