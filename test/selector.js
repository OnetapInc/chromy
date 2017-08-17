const Chromy = require('../dist')
const {TimeoutError} = require('../dist/error')
const assert = require('assert')

describe('selector', function() {
  this.timeout(5000);
  afterEach(async () => {
    await Chromy.cleanup()
  })
  it('selector', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto('file://' + process.env.PWD + '/test_pages/index.html')
          .wait("a[class='link1']")
          .wait('a[class="link1"]')
          .wait('[class="link1"]')
          .getBoundingClientRect('a[class=\'link1\']')
          .select('select[name=\'select\']', 'v1')
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
})


