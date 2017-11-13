const Util = require('../dist/util')
const assert = require('assert')
const path = require('path')

describe('util', function () {
  it('completeUrl()', () => {
    assert.equal('http://example.com/hoge.html', Util.completeUrl('http://example.com/hoge.html'))
    assert.equal('https://example.com/hoge.html', Util.completeUrl('https://example.com/hoge.html'))
    assert.equal('http://example.com/hoge.html', Util.completeUrl('//example.com/hoge.html'))
    assert.equal('file:///hoge.html', Util.completeUrl('file:///hoge.html'))
    assert.equal('file://' + process.cwd() + path.sep + 'hoge.html', Util.completeUrl('hoge.html'))
    assert.equal('file://' + process.cwd() + path.sep + 'hoge', Util.completeUrl('./hoge'))
    assert.equal('file://' + process.cwd() + path.sep + 'hoge', Util.completeUrl('./hoge'))
    assert.equal('data:text/html,Hello', Util.completeUrl('data:text/html,Hello'))
  })
})


