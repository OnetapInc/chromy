const Chromy = require('../src')
const path = require('path')

// Communication with a browser.

let chromy = new Chromy()
chromy.chain()
      .start()
      .goto('file://' + path.join(__dirname, '/pages/index.html'))
      .receiveMessage((params) => {
        // receive a parameters passed by sendToChromy()
        console.log(params)
      })
      .evaluate(() => {
        // sendToChromy() is a special function to communicate with Chromy.
        sendToChromy('param1', {hoge: 'value'}) // eslint-disable-line no-undef
      })
      .end()
      .then(_ => chromy.close())
      .catch(_ => chromy.close())
