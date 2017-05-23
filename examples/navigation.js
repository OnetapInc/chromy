const Chromy = require('../src')

let chromy = new Chromy()
chromy.chain()
      .goto('file://' + __dirname + '/pages/index.html')
      .evaluate(() => {
        return document.querySelector('h1').textContent
      })
      .result((v) => {
        console.log(v)
      })
      .click('a.link1', {waitLoadEvent: true})
      .evaluate(() => {
        return document.querySelector('h1').textContent
      })
      .result((v) => {
        console.log(v)
      })
      .back()
      .evaluate(() => {
        return document.querySelector('h1').textContent
      })
      .result((v) => {
        console.log(v)
      })
      .forward()
      .evaluate(() => {
        return document.querySelector('h1').textContent
      })
      .result((v) => {
        console.log(v)
      })
      .end()
      .then(_ => chromy.close())
      .catch(_ => console.log(_),chromy.close())

