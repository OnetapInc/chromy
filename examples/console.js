const Chromy = require('../src')
const path = require('path')

let chromy = new Chromy()
chromy.chain()
      .start()
      .goto(path.join('file://', __dirname, '/pages/index.html'))
      .console((msg, obj) => {
        console.log(msg) // text
        console.log(obj) // object incuding all parameters.
      })
      .evaluate(() => {
        console.log('message')
      })
      .end()
      .then(_ => chromy.close())
      .catch(_ => chromy.close())
