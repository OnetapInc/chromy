const Chromy = require('../src')
const assert = require('assert')

describe('evaluate', function() {
  this.timeout(5000);
  afterEach(() => {
    Chromy.cleanup()
  })
  it('can return any type', (done) => {
    Chromy.cleanup()
    const chromy = new Chromy()
    chromy.chain()
          .goto('file://' + __dirname + '/pages/index.html')
          .evaluate(_ => "abc")
          .result(r => assert.equal('abc', r))
          .evaluate(_ => 100)
          .result(r => assert.equal(100, r))
          .evaluate(_ => 100.5)
          .result(r => assert.equal(100.5, r))
          .evaluate(_ => true)
          .result(r => assert.equal(true, r))
          .evaluate(_ => {return {hoge: 123}})
          .result(r => assert.equal(123, r.hoge))
          .evaluate(_ => undefined)
          .result(r => assert.equal(undefined, r))
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
})


