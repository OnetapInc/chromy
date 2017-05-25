const Chromy = require('../src')
const path = require('path')
const funcs = require('./lib/funcs')

let chromy = new Chromy()
async function main () {
  await chromy.chain()
        .goto(path.join('file://', __dirname, '/pages/index.html'))
        .defineFunction([funcs.A, funcs.B])
        .evaluate(() => {
          // eslint-disable-next-line no-undef
          return B('INPUT')
        })
        .result((r) => console.log(r))
        .end()
        .then(() => chromy.close())
        .catch(e => console.log(e))

  await chromy.chain()
        .goto(path.join('file://', __dirname, '/pages/index.html'))
        .defineFunction(funcs)
        .evaluate(() => {
          // eslint-disable-next-line no-undef
          return B('INPUT')
        })
        .result((r) => console.log(r))
        .end()
        .then(() => chromy.close())
        .catch(e => console.log(e))
}

main()

