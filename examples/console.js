const Chromy = require('../src')

let chromy = new Chromy()
chromy.chain()
      .start()
      .goto('http://example.com/')
      .console((msg) => {
        console.log(msg)
      })
      .receiveMessage((params) => {
        console.log(params)
      })
      .evaluate(() => {
        console.log('message')
        sendToChromy('param1', {hoge: 'value'})
      })
      .end()
      .then(_ => chromy.close())
      .catch(_ => chromy.close())
