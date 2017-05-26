const Chromy = require('../src')
const path = require('path')

let chromy = new Chromy({visible: true})
chromy.chain()
      .goto(path.join('file://', __dirname, '/pages/event.html'))
      .console((msg) => {
        console.log(msg)
      })
      .mouseMoved(10, 10)
      .sleep(500)
      .mouseMoved(20, 20)
      .sleep(500)
      .mousePressed(20, 30)
      .sleep(500)
      .mouseReleased(20, 30)
      .sleep(1000)
      .end()
      .then(_ => chromy.close())
      .catch(e => {
        console.log(e)
        chromy.close()
      })

