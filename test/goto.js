const Chromy = require('../dist')
const {TimeoutError} = require('../dist/error')
const assert = require('assert')

describe('goto', function() {
  this.timeout(10000);
  afterEach(async () => {
    await Chromy.cleanup()
  })
  it('can use absolute or relative url', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto('file://' + process.env.PWD + '/test_pages/wait.html')
          .result(e => {
            assert.ok(e != null)
          })
          .evaluate(_ => { console.log('test') })
          .wait("div")
          .goto('file://' + process.env.PWD + '/test_pages/index.html')
          .evaluate(_ => { console.log('test') })
          .wait("form")
          .goto('file://' + process.env.PWD + '/test_pages/wait.html')
          .evaluate(_ => { console.log('test') })
          .wait("div")
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
})


