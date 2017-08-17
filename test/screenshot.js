const Chromy = require('../dist')
const {TimeoutError} = require('../dist/error')
const assert = require('assert')

const page = 'file://' + process.env.PWD + '/test_pages/index.html'

describe('screenshot', function() {
  this.timeout(10000);
  afterEach(async () => {
    await Chromy.cleanup()
  })
  it('screenshot', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto(page)
          .screenshot()
          .result(img => {
            assert.ok(img !== null)
          })
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
  it('screenshotSelector', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto(page)
          .screenshotSelector('a')
          .result(img => {
            assert.ok(img !== null)
          })
          .screenshotSelector('[data-attr=\'attr\']')
          .result(img => {
            assert.ok(img !== null)
          })
          .screenshotSelector('[data-attr="attr"]')
          .result(img => {
            assert.ok(img !== null)
          })
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
  it('screenshotDocument', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto(page)
          .screenshotDocument()
          .result(img => {
            assert.ok(img !== null)
          })
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
  it('screenshotMultipleSelectors', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto(page)
          .screenshotMultipleSelectors(['a', 'form', "[data-attr='attr']", "[data-attr=\"attr\"]"], (err, buffer) => {
            assert.ok(err === null)
            assert.ok(buffer !== null)
          })
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
})


