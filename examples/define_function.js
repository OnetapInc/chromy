const Chromy = require('../src')
const funcs = require('./lib/funcs')

let chromy = new Chromy()
async function main () {
  await chromy.chain()
        .goto('http://example.com/')
        .defineFunction([funcs.A, funcs.B])
        .evaluate(() => {
          return B()
        })
        .result((r) => console.log(r))
        .end()
        .then(() => chromy.close())
        .catch(e => console.log(e))

  await chromy.chain()
        .goto('http://example.com/')
        .defineFunction(funcs)
        .evaluate(() => {
          return B()
        })
        .result((r) => console.log(r))
        .end()
        .then(() => chromy.close())
        .catch(e => console.log(e))
}

main()

