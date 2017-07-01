const Chromy = require('../dist')
const assert = require('assert')

describe('evaluate', function() {
  this.timeout(5000);
  afterEach(async () => {
    console.log('after')
    await Chromy.cleanup()
  })
  it('can return any type', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto('file://' + process.env.PWD + '/example_pages/index.html')
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
  if (!process.env.WITH_BABEL)  {
    it('resolve promise', (done) => {
      const chromy = new Chromy()
      chromy.chain()
            .goto('file://' + process.env.PWD + '/example_pages/index.html')
            .evaluate(_ => Promise.resolve(100))
            .result(r => assert.equal(100, r))
            .evaluate(_ => Promise.resolve({a: 'abc'}))
            .result(r => assert.equal('abc', r.a))
            .evaluate(_ => Promise.resolve(Promise.resolve(Promise.resolve(100))))
            .result(r => assert.equal(100, r))
            .evaluate(async r => await 200)
            .result(r => assert.equal(200, r))
            .end()
            .then(_ => done())
            .catch(e => {
              done(e)
            })
    })
  }

})


