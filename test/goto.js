const Chromy = require('../dist')
const {TimeoutError} = require('../dist/error')
const assert = require('assert')

describe('goto', function() {
  this.timeout(5000);
  afterEach(async () => {
    await Chromy.cleanup()
  })
  it('can use absolute or relative url', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto('file://' + process.env.PWD + '/test_pages/wait.html')
          .wait("div")
          .goto('test_pages/wait.html')
          .wait("div")
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
})


