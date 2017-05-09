# chromy

chromy is a library for operating chrome.  

## Installation

```bash
npm i chromy
```

## Usage

```js
const Chromy = require('./src')

let chromy = new Chromy()
chromy.chain()
      .goto('http://example.com/')
      .evaluate(() => {
        return document.querySelectorAll('*').length
      })
      .result((r) => console.log(r))
      .end()
      .then(() => chromy.close())
```

## API

##### .goto(url)

##### .evaluate(func)

##### .result(func)

##### .end()

##### .wait(msec | selector)

##### .sleep(msec)

##### .type(selector, text)

##### .click(selector)

##### .defineFunction(func)

```
function outerFunc () {
  return 'VALUE'
}
chromy.chain()
      .defineFunction(outerFunc)
      .evaluate(() => {
        outerFunc()
      })
      .end()
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/OnetapInc/chromy

