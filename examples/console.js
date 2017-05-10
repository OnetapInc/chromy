const Chromy = require('../src')

let chromy = new Chromy({visible:true})
chromy.chain()
      .start()
      .console((msg) => {
        console.log(msg.text)
      })
      .goto('http://example.com/')
      .evaluate(() => {
        console.log('Hey!')
      })
      .end()
      .then(_ => chromy.close())
      .catch(_ => chromy.close())
