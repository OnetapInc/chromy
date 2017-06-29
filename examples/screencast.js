const Chromy = require('../src')
const path = require('path')

let chromy = new Chromy()
chromy.chain()
      .goto('file://' + path.join(__dirname, '/pages/index.html'))
      .startScreencast(async (payload) => {
        console.log(payload.data.length)
      }, {format: 'jpeg', quality: 50})
      .evaluate(_ => {
        setInterval(_ => {
          var s = document.createElement('span')
          s.innerHTML = 'foo'
          document.body.appendChild(s)
        }, 50)
      })
      .sleep(1000)
      .stopScreencast()
      .sleep(1000)
      .end()
      .then(_ => chromy.close())
      .catch(_ => { console.log(_); chromy.close() })
