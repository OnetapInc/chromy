const Chromy = require('../src')

let chromy = new Chromy()
chromy.chain()
      .start()
      .goto('http://example.com/')
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
