const Chromy = require('../src')
const path = require('path')

let chromy = new Chromy()
chromy.chain()
      .goto('file://' + path.join(__dirname, '/pages/index.html'))
      .getDOMCounters()
      .result((v) => {
        console.log(v)
      })
      .end()
      .then(_ => chromy.close())
