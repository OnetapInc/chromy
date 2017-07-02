const Chromy = require('../dist')
const {TimeoutError} = require('../dist/error')
const assert = require('assert')

describe('iframe', function() {
  this.timeout(5000);
  afterEach(async () => {
    await Chromy.cleanup()
  })
  it('click element inside iframe', (done) => {
    const chromy = new Chromy()
    var output = ''
    chromy.chain()
          .goto('file://' + process.env.PWD + '/test_pages/iframe.html')
          .console(e => {
            output = e
          })
          .iframe('iframe', async iframe => {
            await iframe.chain().click('button').end()
            assert.equal('iframe_button_click', output)
          })
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
  it('evaulate javascript on iframe context', (done) => {
    const chromy = new Chromy()
    var output = ''
    chromy.chain()
          .goto('file://' + process.env.PWD + '/test_pages/iframe.html')
          .iframe('iframe', async iframe => {
            await iframe.chain().evaluate(_ => {
              return document.querySelector('#divtext').innerText
            }).result(text => {
              assert.equal('text1', text)
            }).end()
          })
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
})


