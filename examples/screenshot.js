const Chromy = require('../src')
const path = require('path')
const fs = require('fs')

let chromy = new Chromy()
chromy.chain()
      .goto('file://' + path.join(__dirname, '/pages/index.html'))
      .screenshot()
      .result((png) => {
        fs.writeFileSync('out.png', png)
      })
      .screenshotSelector('form')
      .result((png) => {
        fs.writeFileSync('out_form.png', png)
      })
      .screenshotDocument() // take screenshot of whole document
      .result((png) => {
        fs.writeFileSync('out_doc.png', png)
      })
      .pdf()
      .result((pdf) => {
        fs.writeFileSync('out.pdf', pdf)
      })
      .end()
      .then(_ => chromy.close())
      .catch(e => {
        console.log(e)
        chromy.close()
      })

