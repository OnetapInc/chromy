const Chromy = require('../src')
const path = require('path')

Chromy.addCustomDevice([
  {
    iPad: {
      width: 1536,
      height: 2048,
      deviceScaleFactor: 2.0,
      pageScaleFactor: 1.0,
      mobile: true,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    }
  },
  {
    customApp: {
      width: 640,
      height: 880,
      deviceScaleFactor: 2.0,
      pageScaleFactor: 1.0,
      mobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12F70 baiduboxapp/6.9.0.0'
    }
  }
])

let chromy = new Chromy({visible: true})
chromy.chain()
      .emulate('iPad')
      .goto('file://' + path.join(__dirname, '/pages/index.html'))
      .evaluate(() => {
        return 'iPad width: ' + window.innerWidth
      })
      .result(console.log)
      .sleep(500)
      .emulate('customApp')
      .evaluate(() => {
        return 'customApp width:' + window.innerWidth
      })
      .result(console.log)
      .sleep(500)
      .clearEmulate()
      .evaluate(() => {
        return 'default width:' + window.innerWidth
      })
      .result(console.log)
      .sleep(500)
      .end()
      .then(_ => chromy.close())
      .catch(e => {
        console.log(e)
        chromy.close()
      })

