const Chromy = require('../src')
const path = require('path')

let chromy = new Chromy({visible: true})
chromy.chain()
      .emulate('Nexus6P')
      .goto('file://' + path.join(__dirname, '/pages/index.html'))
      .evaluate(() => {
        return 'Nexus6P width: ' + window.innerWidth
      })
      .result(console.log)
      .sleep(500)
      .emulate('iPhone6')
      .evaluate(() => {
        return 'iPhone6 width:' + window.innerWidth
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

