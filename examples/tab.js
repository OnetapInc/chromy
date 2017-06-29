const Chromy = require('../src')
const path = require('path')

let chromy = new Chromy({visible: true, chromeFlags: ['--disable-popup-blocking']})
chromy.chain()
      .goto('file://' + path.join(__dirname, '/pages/tab01.html'))
      .click('a.link')
      .sleep(500)
      .getPageTargets()
      .result(async pages => {
        const targetPage = pages.filter(p => p.title === 'next').shift()
        let title = null
        const newTab = new Chromy({target: targetPage.targetId, activateOnStartUp: true})
        await newTab.chain().start().evaluate(() => {
          return document.querySelector('h1').innerText
        }).result(t => {
          title = t
        }).end().then(_ => {
          newTab.close()
        }).catch(e => {
          newTab.close()
        })
        console.log(title)
      })
      .end()
      .then(_ => chromy.close())
      .catch(e => {
        console.log(e)
        chromy.close()
      })

