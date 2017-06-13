const Chromy = require('../src')
const assert = require('assert')

describe('inject()', function() {
  this.timeout(5000);
  afterEach(() => {
    Chromy.cleanup()
  })
  it('can inject javascript', (done) => {
    const chromy = new Chromy()
    let jsResult = null
    let cssResult = null
    chromy.chain()
          .goto('file://' + __dirname + '/pages/index.html')
          .inject('js', __dirname + '/pages/inject.js')
          .inject('css', __dirname + '/pages/inject.css')
          .evaluate(() => {
            let r1 = InjectedFunc(1, '2')
            var h1Node = document.querySelector('h1')
            var style = window.getComputedStyle(h1Node, null)
            let r2 = style.getPropertyValue('content')
            return [r1, r2]
          })
          .result(r => {
            jsResult = r[0]
            cssResult = r[1]
          })
          .end()
          .then(_ => {
            if (jsResult === 'value1value2value3' && cssResult === '"abc"') {
              done()
            } else {
              done('result is incorrect. jsResult:' + jsResult + ' cssResult:' + cssResult)
            }
          })
          .catch(e => {
            done(e)
          })
  })
})

