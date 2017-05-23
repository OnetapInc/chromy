const Chromy = require('../src')

// Communication with a browser.

let chromy = new Chromy()
chromy.chain()
      .start()
      .goto('file://' + __dirname + '/pages/index.html')
      .receiveMessage((params) => {
        // receive a parameters passed by sendToChromy()
        console.log(params)
      })
      .evaluate(() => {
        // sendToChromy() is a special function to communicate with Chromy.
        sendToChromy('param1', {hoge: 'value'})
      })
      .end()
      .then(_ => chromy.close())
      .catch(_ => chromy.close())
