# Chromy

Chromy is a library for operating headless chrome.

Chromy is similar to Nightmare.js but has some differnces:

 - Controlling Chrome via Chrome DevTools Protocol.
 - Supports mobile emulation.
 - No need to prepare a screen such as xvfb. 

## Requirements

 - Node 6 or later
 - Install Chrome59 or later to your machine before use Chromy.

headless mode is supported by Chrome59 or later.

## Installation

```bash
npm i chromy
```

## Usage

```js
const Chromy = require('chromy')

// not headless
// let chromy = new Chromy({visible:true})
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

You can also use async/await interfaces like this:

```js
const Chromy = require('chromy')

async function main () {
  let chromy = new Chromy()
  await chromy.goto('http://example.com/')
  const result = await chromy.evaluate(() => {
          return document.querySelectorAll('*').length
        })
  console.log(result)
  await chromy.close()
}

main()
```

### Mobile Emulation

Chromy provides mobile emulation.  
The emulation changes a screen resolution, density, userAgent and provides touch emulation.

```js
const Chromy = require('chromy')

let chromy = new Chromy()
chromy.chain()
      .emulate('iPhone6')
      .goto('http://example.com/')
      .tap(100, 100) // emulate tap action by synthesizing touch events.
      .evaluate(() => {
        return navigator.userAgent
      })
      .result(console.log)
      .end()
      .then(() => chromy.close())
```

## FAQ

[FAQ](https://github.com/OnetapInc/chromy/wiki/FAQ)

## API

##### Chromy(options)

###### options  

 - port(default: 9222): --remote-debugging-port  
 - launchBrowser(default: true): If you want chromy to attach to Chrome that is already launched, set to true.
 - visible(default: false): If set to true, chrome is launched in visible mode. This option is not used if launchChrome is false.
 - chromePath(default: null): This option is used to find out an executable of Chrome. If set to null, executable is selected automatically. This option is not used if launchChrome is false.
 - chromeFlags(default: []): These flags is passed to Chrome. Each flag must have a prefix string "--". This option is not used if launchChrome is false.
 - waitTimeout(default: 30000): If wait() doesn't finish in the specified time WaitTimeoutError will be throwed.
 - gotoTimeout(default: 30000): If goto() doesn't finish in the specified time GotoTimeoutError will be throwed.
 - evaluateTimeout(default: 30000): If evaluate() doesn't finish in the specified time EvaluateTimeError will be throwed.
 - waitFunctionPollingInterval(default: 100): polling interval for wait().
 - typeInterval(default: 20): This option is used only in type() method.
 - activateOnStartUp(default: true): activate a first tab on startup. this option is enable only in visible mode.


##### .start(startingUrl = null)

Launches Chrome browser.

###### options

startingUrl: a staring url. If you set to null 'abount:blank' is used as a starting url.

##### .goto(url, options = {})

Goes to url. If you have not called start(), this method calls start(url) automatically.

###### options

waitLoadEvent(default: true): If set to false, goto() doesn't wait until load event is fired.

##### .waitLoadEvent()

wait until a load event is fired.

##### .forward()

go forward to the next page and wait until load event is fired.

##### .back()

go back to the previous page and wait until load event is fired.

##### .inject(type, file)

Injects a file into browser as a javascript or a css.

type: must be 'js' or 'css'
file: injected file.

##### .evaluate(func|source)

Evaluates a expression in the browser context.  
If the expression returns a Promise object, the promise is resolved automatically.

##### .result(func)

result() receives a result of previous directive.

```js
chromy.chain()
      .goto('http://example.com')
      .evaluate(() => {
        return document.querySelectorAll('*').length
      })
      .result((length) => {
        // length is a result of evaluate() directive.
        console.log(length)
      }
      .end()
```

##### .end()

##### .wait(msec)

alias for .sleep(msec)

##### .wait(selector)

wait until selector you specified appear in a DOM tree.

##### .wait(func)

wait until function you supplied is evaluated as true.

##### .sleep(msec)

wait for milli seconds you specified.

##### .type(selector, text)

##### .insert(selector, text)

##### .check(selector)

##### .uncheck(selector)

##### .select(selector, value)

##### .setFile(selector, files)

Sets the files to a file field that matches the selector.

 - selector: selector for specifing the file field.
 - files: The array or string value that representate a local file path.

##### .click(selector, options)

###### options

waitLoadEvent(Default:false): If set to true, wait until load event is fired after click event is fired.

##### .mouseMoved(x, y, options = {})

Dispatch mousemoved event.

##### .mousePressed(x, y, options = {})

Dispatch mousedown event.

##### .mouseReleased(x, y, options = {})

Dispatch mouseup event.

##### .tap(x, y, options = {})

Synthesize tap by dispatching touche events.
(NOTE: To dispatch touch events you need to enable a mobile emulation before.)

##### .doubleTap(x, y, options = {})

Synthesize double tap by dispatching touche events.
(NOTE: To dispatch touch events you need to enable a mobile emulation before.)

##### .defineFunction(func)

```js
function outerFunc () {
  return 'VALUE'
}
chromy.chain()
      .goto('http://example.com')
      .defineFunction(outerFunc)
      .evaluate(() => {
        outerFunc()
      })
      .end()
```

##### .screenshot(format = 'png', quality = 100, fromSurface = true)

Exports a current screen as an image data. 
`format` must be eather 'png' or 'jpeg'.

See examples: [examples/screenshot.js](examples/screenshot.js)

##### .screenshotSelector(selector, format = 'png', quality = 100, fromSurface = true)

Exports an area of selector you specified as an image data. 
`format` must be eather 'png' or 'jpeg'.

See examples: [examples/screenshot.js](examples/screenshot.js)

Note:

 - The size of target specified by selector must be smaller than viewport size. If not, image gets cropped.
 - It has a side-effect. After this api is called, scroll position is moved to target position.

##### .screenshotMultipleSelectors(selectors, callback, options = {})

Takes multiple screenshot specified by selector at once.
Each image can be received by callback.

Limitation:
 - It is impossible that taking a screenshot of the element positioned at below of 16384px because of limitation of chrome.
   Detail: https://groups.google.com/a/chromium.org/d/msg/headless-dev/DqaAEXyzvR0/P9zmTLMvDQAJ

###### Parameter

 - selectors: An array of selector
 - callback: function(error, buffer, index, selectors)
 - options:  
   - model: see explanation of screenDocument() 
   - format: see explanation of screenDocument() 
   - quality: see explanation of screenDocument() 
   - fromSurface: see explanation of screenDocument() 
   - useQuerySelectorAll(default:false): If set to true, take all the screenshot of elements returned from document.querySelectorAll() (Since v 0.2.13)

##### .screenshotDocument(model = 'scroll', format = 'png', quality = 100, fromSurface = true)

(Experimental)

Exports a entire document as an image data. 
`format` must be eather 'png' or 'jpeg'.

See examples: [examples/screenshot.js](examples/screenshot.js)

Limitation:
  - Cannot take a screenshot of an area under 16384px.
    Detail: https://groups.google.com/a/chromium.org/d/msg/headless-dev/DqaAEXyzvR0/P9zmTLMvDQAJ

Known Issue:

 - When this api is called to take large page sometimes strange white area is appeared. This result is caused by --disable-flag option passed to Chrome. After chrome 60 is officialy released I remove --disable-flag option to fix this problem.

###### Parameters

 - model: this parameter affect page size. must be which one of: 'box', 'scroll'. 'box' means box model of body element. 'scroll' means size of scroll area.

##### .pdf()

Exports a current page's printing image as a PDF data.
This function is supported only in headless mode (since Chrome60).

See examples: [examples/screenshot.js](examples/screenshot.js)

##### .startScreencast(callback, options = {})

Starts screencast to take screenshots by every frame.

See examples: [examples/screencast.js](examples/screenshot.js)

###### Parameter

callback: callback function for receiving parameters of screencastFrame event. See details [here](https://chromedevtools.github.io/devtools-protocol/tot/Page/#event-screencastFrame)
options: See details [here](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-startScreencast).

##### .stopScreencast()

Stops screencast.

##### .console(func)

```js
chromy.chain()
      .goto('http://example.com')
      .console((text) => {
        console.log(text)
      })
      .evaluate(() => {
        console.log('HEY')
      })
      .end()
```

##### .receiveMessage(func)

receive a message from browser.  

You can communicate with a browser by using receiveMessage() and sendToChromy().
sendToChromy() is a special function to communicate with Chromy.
When you call receiveMessage() at the first time, sendToChromy() is defined in a browser automatically.
A listner function passed to receiveMessage() receives parameters when sendToChromy() is executed in a browser.


```js
chromy.chain()
      .goto('http://example.com')
      .receiveMessage((msg) => {
        console.log(msg[0].value)
      })
      .evaluate(() => {
        sendToChromy({value: 'foo'})
      })
```

##### blockUrls(urls)

blocks urls from loading.  

###### Parameter

urls: array[string]  
Wildcard('*') is allowed in url string.

##### clearBrowserCache()

Removes all browser caches.

##### setCookie(params)

###### Prameters

params: object  

See [chrome document](https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-setCookie)

##### deleteCookie(name, url)

Remove a single cookie.

##### clearAllCookies()

Removes all browser cookies.

##### clearDataForOrigin (origin = null, type = 'all')

Clear data for origin.(cookies, local_storage, indexeddb, etc...)

See details [here](https://chromedevtools.github.io/devtools-protocol/tot/Storage/#method-clearDataForOrigin).

##### getDOMCounters()

Get count of these item: document, node, jsEventListeners

See details [here](https://chromedevtools.github.io/devtools-protocol/tot/Memory/#method-getDOMCounters).

##### static cleanup()

close all browsers.

```js
process.on('SIGINT', async () => {
  await Chromy.cleanup()
  process.exit(1)
})
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/OnetapInc/chromy

