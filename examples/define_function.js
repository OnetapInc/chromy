const Chromy = require('../src')
const funcs = require('./lib/funcs')

let chromy = new Chromy()
async function main () {
  await chromy.chain()
        .goto('file://' + __dirname + '/pages/index.html')
        .defineFunction([funcs.A, funcs.B])
        .evaluate(() => {
          return B('INPUT')
        })
        .result((r) => console.log(r))
        .end()
        .then(() => chromy.close())
        .catch(e => console.log(e))

  await chromy.chain()
        .goto('file://' + __dirname + '/pages/index.html')
        .defineFunction(funcs)
        .evaluate(() => {
          return B('INPUT')
        })
        .result((r) => console.log(r))
        .end()
        .then(() => chromy.close())
        .catch(e => console.log(e))
}

main()

