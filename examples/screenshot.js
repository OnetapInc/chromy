const Chromy = require('../src')
const fs = require('fs')

let chromy = new Chromy()
chromy.chain()
      .goto('http://example.com/')
      .screenshot()
      .result((png) => {
        fs.writeFileSync('out.png', png)
      })
      .pdf()
      .result((pdf) => {
        fs.writeFileSync('out.pdf', pdf)
      })
      .end()
      .then(_ => chromy.close())
      .catch(e => chromy.close())

