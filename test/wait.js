const Chromy = require('../dist')
const {TimeoutError} = require('../dist/error')
const assert = require('assert')

describe('wait', function() {
  this.timeout(5000);
  afterEach(async () => {
    await Chromy.cleanup()
  })
  it('wait selector', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto('file://' + process.env.PWD + '/test_pages/wait.html')
          .wait("div")
          .wait(".block1")
          .wait(".block2")
          .wait(".block3")
          .wait(".block1 .block2 .block3")
          .wait(".block3.additional-class")
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
  it('wait selector with asynchronouse process', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto('file://' + process.env.PWD + '/test_pages/wait.html')
          .evaluate(() => {
            setTimeout(() => {
              let div = document.createElement('div')
              div.classList.add('newdiv')
              document.body.appendChild(div)
            }, 500)
          })
          .wait("div.newdiv")
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
  it('wait function', (done) => {
    const chromy = new Chromy()
    chromy.chain()
          .goto('file://' + process.env.PWD + '/test_pages/wait.html')
          .wait(function () {
            return document.querySelector('.block1')
          })
          .end()
          .then(_ => done())
          .catch(e => {
            done(e)
          })
  })
  it('raise TimeoutError', (done) => {
    const chromy = new Chromy({waitTimeout: 100})
    chromy.chain()
          .goto('file://' + process.env.PWD + '/test_pages/wait.html')
          .wait(function () {
            return document.querySelector('.not-exists')
          })
          .end()
          .then(_ => done('timeout doesn\'t be occured'))
          .catch(e => {
            if (e instanceof TimeoutError) {
              done()
            } else {
              done(e)
            }
          })
  })
  it('wait fixed time', (done) => {
    const chromy = new Chromy()
    let ellapseTime = null
    chromy.chain()
          .goto('file://' + process.env.PWD + '/test_pages/wait.html')
          .evaluate(() => {
            window.before_time = Date.now()
          })
          .wait(200)
          .evaluate(() => {
            return Date.now() - window.before_time
          })
          .result((time) => {
            ellapseTime = parseInt(time)
          })
          .end()
          .then(_ => {
            if (ellapseTime > 200) {
              done()
            } else {
              done('sleep() doe\'s not worked. ellapseTime:' + ellapseTime)
            }
          })
          .catch(e => {
            done(e)
          })
  })
})


