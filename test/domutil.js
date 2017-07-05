const Chromy = require('../dist')
const assert = require('assert')

describe('domutil', function () {
  this.timeout(5000)
  afterEach(async () => {
    await Chromy.cleanup()
  })
  it('exists', (done) => {
    const chromy = new Chromy()
    chromy.chain()
      .goto('file://' + process.env.PWD + '/test_pages/domutil.html')
      .end()
      .then(async () => {
        assert.equal(true, await chromy.exists('#normal_div'))
        assert.equal(true, await chromy.exists('#fixed_div'))
        assert.equal(true, await chromy.exists('#invisible_div'))
        assert.equal(true, await chromy.exists('#invisible_div_child'))
        assert.equal(false, await chromy.exists('#not_exists'))
      })
      .then(_ => done())
      .catch(e => {
        done(e)
      })
  })
  it('visible', (done) => {
    const chromy = new Chromy()
    chromy.chain()
      .goto('file://' + process.env.PWD + '/test_pages/domutil.html')
      .end()
      .then(async () => {
        assert.equal(true, await chromy.visible('#normal_div'))
        assert.equal(true, await chromy.visible('#fixed_div'))
        assert.equal(false, await chromy.visible('#invisible_div'))
        assert.equal(false, await chromy.visible('#invisible_div_child'))
      })
      .then(_ => done())
      .catch(e => {
        done(e)
      })
  })
})


