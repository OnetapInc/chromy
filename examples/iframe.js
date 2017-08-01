const Chromy = require('../src')
const path = require('path')

let chromy = new Chromy({visible: true})
chromy.chain()
      .goto('file://' + path.join(__dirname, '/pages/index.html'))
      .console(msg => console.log(msg))
      .iframe('iframe', async iframe => {
        await iframe.chain()
                    .type('#txt', 'abc')
                    .click('#btn')
                    .evaluate(_ => {
                      console.log(document.querySelector('h1').innerText)
                    })
                    .end()
      })
      .sleep(3000)
      .end()
      .catch(e => console.log(e))
      .then(_ => {
        chromy.close()
      })

