# Chromy

Chromy is a library for operating headless chrome.

Chromy is similar to Nightmare.js but has some differences:

 - Controlling Chrome via Chrome DevTools Protocol.
 - Supports mobile emulation.
 - No need to prepare a screen such as xvfb.

## Requirements

 - Node 6 or later
 - Install Chrome60 or later to your machine before use Chromy.

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

 * [Chromy(options)](#chromyoptions)
    * [.start(startingUrl = null)](#startstartingurl--null)
    * [.goto(url, options = {})](#gotourl-options--)
    * [.waitLoadEvent()](#waitloadevent)
    * [.forward()](#forward)
    * [.back()](#back)
    * [.inject(type, file)](#injecttype-file)
    * [.evaluate(func|source)](#evaluatefuncsource)
    * [.result(func)](#resultfunc)
    * [.end()](#end)
    * [.exists(selector)](#existsselector)
    * [.visible(selector)](#visibleselector)
    * [.wait(msec)](#waitmsec)
    * [.wait(selector)](#waitselector)
    * [.wait(func)](#waitfunc)
    * [.sleep(msec)](#sleepmsec)
    * [.type(selector, text)](#typeselector-text)
    * [.insert(selector, text)](#insertselector-text)
    * [.check(selector)](#checkselector)
    * [.uncheck(selector)](#uncheckselector)
    * [.select(selector, value)](#selectselector-value)
    * [.setFile(selector, files)](#setfileselector-files)
    * [.click(selector, options)](#clickselector-options)
    * [.mouseMoved(x, y, options = {})](#mousemovedx-y-options--)
    * [.mousePressed(x, y, options = {})](#mousepressedx-y-options--)
    * [.mouseReleased(x, y, options = {})](#mousereleasedx-y-options--)
    * [.tap(x, y, options = {})](#tapx-y-options--)
    * [.doubleTap(x, y, options = {})](#doubletapx-y-options--)
    * [.scroll(x, y)](#scrollx-y)
    * [.scrollTo(x, y)](#scrolltox-y)
    * [.rect(selector)](#rectselector)
    * [.rectAll(selector)](#rectallselector)
    * [.defineFunction(func)](#definefunctionfunc)
    * [.on(eventName, listener)](#oneventname-listener)
    * [.once(eventName, listener)](#onceeventname-listener)
    * [.removeListener(eventName, listener)](#removelistenereventname-listener)
    * [.removeAllListeners(eventName)](#removealllistenerseventname)
    * [.screenshot(options= {})](#screenshotoptions-)
    * [.screenshotSelector(selector, options={})](#screenshotselectorselector-options)
    * [.screenshotMultipleSelectors(selectors, callback, options = {})](#screenshotmultipleselectorsselectors-callback-options--)
    * [.screenshotDocument(options = {})](#screenshotdocumentoptions--)
    * [.pdf(options={})](#pdfoptions)
    * [.startScreencast(callback, options = {})](#startscreencastcallback-options--)
    * [.stopScreencast()](#stopscreencast)
    * [.console(func)](#consolefunc)
    * [.receiveMessage(func)](#receivemessagefunc)
    * [.ignoreCertificateErrors()](#ignorecertificateerrors)
    * [.blockUrls(urls)](#blockurlsurls)
    * [.clearBrowserCache()](#clearbrowsercache)
    * [.setCookie(params)](#setcookieparams)
    * [.deleteCookie(name, url = null)](#deletecookiename-url--null)
    * [.clearAllCookies()](#clearallcookies)
    * [.clearDataForOrigin (origin = null, type = 'all')](#cleardatafororigin-origin--null-type--all)
    * [.getDOMCounters()](#getdomcounters)
    * [.static cleanup()](#static-cleanup)

##### Chromy(options)

###### options  

 - host(default: localhost): host address
 - port(default: 9222): --remote-debugging-port  
 - userDataDir(default: null): Chrome profile path. This option can be used to persist an user profile.
 - launchBrowser(default: true): If you want chromy to attach to the Chrome instance that is already launched, set to false.
 - visible(default: false): If set to true, chrome is launched in visible mode. This option is not used if launchBrowser is false.
 - chromePath(default: null): This option is used to find out an executable of Chrome. If set to null, executable is selected automatically. This option is not used if launchBrowser is false.
 - enableExtensions(default: false): Enable extension loading. (Generally, this options is used with userDataDir option)
 - chromeFlags(default: []): These flags is passed to Chrome. Each flag must have a prefix string "--". This option is not used if launchBrowser is false.
 - waitTimeout(default: 30000): If wait() doesn't finish in the specified time WaitTimeoutError will be thrown.
 - gotoTimeout(default: 30000): If goto() doesn't finish in the specified time GotoTimeoutError will be thrown.
 - evaluateTimeout(default: 30000): If evaluate() doesn't finish in the specified time EvaluateTimeError will be thrown.
 - waitFunctionPollingInterval(default: 100): polling interval for wait().
 - typeInterval(default: 20): This option is used only in type() method.
 - activateOnStartUp(default: true): activate a first tab on startup. this option is enable only in visible mode.


##### .start(startingUrl = null)

Launches Chrome browser.

###### options

startingUrl: a staring url. If you set to null 'about:blank' is used as a starting url.

##### .goto(url, options = {})

Goes to url. If you have not called start(), this method calls start(url) automatically.

###### options

waitLoadEvent(default: true): If set to false, goto() doesn't wait until load event is fired.

###### returns

Returns [Response object](https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Response)

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

##### .exists(selector)

Returns whether an node matched with the selector is exists.

##### .visible(selector)

Returns whether an node matched with the selector is exists and visible.

##### .wait(msec)

alias for .sleep(msec)

##### .wait(selector)

wait until selector you specified appear in a DOM tree.

##### .wait(func)

wait until function you supplied is evaluated as true. func() executes in browser window context.

##### .sleep(msec)

wait for milli seconds you specified.

##### .type(selector, text)

##### .insert(selector, text)

##### .check(selector)

##### .uncheck(selector)

##### .select(selector, value)

##### .setFile(selector, files)

Sets the files to a file field that matches the selector.

 - selector: selector for specifying the file field.
 - files: The array or string value that represents a local file path.

##### .click(selector, options)

###### options

waitLoadEvent(default: false): If set to true, wait until load event is fired after click event is fired.

##### .mouseMoved(x, y, options = {})

Dispatch mousemoved event.

##### .mousePressed(x, y, options = {})

Dispatch mousedown event.

##### .mouseReleased(x, y, options = {})

Dispatch mouseup event.

##### .tap(x, y, options = {})

Synthesize tap by dispatching touch events.
(NOTE: To dispatch touch events you need to enable a mobile emulation before.)

##### .doubleTap(x, y, options = {})

Synthesize double tap by dispatching touch events.
(NOTE: To dispatch touch events you need to enable a mobile emulation before.)

##### .scroll(x, y)

Scrolls to the position. x and y means relative position.

##### .scrollTo(x, y)

Scrolls to the position. x and y means absolute position.

##### .rect(selector)

Returns a rect of the element specified by selector.

##### .rectAll(selector)

Returns an array of rects that is specified by selector.

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

##### .send(eventName, parameter)

Calls DevTools protocol directly.

##### .on(eventName, listener)

Adds the listener function.

##### .once(eventName, listener)

Adds one time listener function.

##### .removeListener(eventName, listener)

Removes the listener function.

##### .removeAllListeners(eventName)

Removes all listener function.

##### .screenshot(options= {})

Exports a current screen as an image data.

See examples: [examples/screenshot.js](examples/screenshot.js)

###### options

 - format(default: 'png'): must be either 'png' or 'jpeg'
 - quality(default: 100): quality of image.
 - fromSurface(default: true): if set to true, take screenshot from surface.
 - useDeviceResolution(default: false): if set to true, the image will have same resolution with device.

##### .screenshotSelector(selector, options={})

Exports an area of selector you specified as an image data.

See examples: [examples/screenshot.js](examples/screenshot.js)

Note:

 - The size of target specified by selector must be smaller than viewport size. If not, image gets cropped.
 - It has a side-effect. After this api is called, scroll position is moved to target position.

###### options

See screenshot()

##### .screenshotMultipleSelectors(selectors, callback, options = {})

Takes multiple screenshot specified by selector at once.
Each image can be received by callback.

Limitation:
 - It is impossible that taking a screenshot of the element positioned at below of 16384px because of limitation of chrome.
   Detail: https://groups.google.com/a/chromium.org/d/msg/headless-dev/DqaAEXyzvR0/P9zmTLMvDQAJ

###### Parameter

 - selectors: An array of selector
 - callback: function(error, image, index, selectors, subIndex)
   - error: error information.
   - image: image data
   - index: index of selectors.
   - subIndex: this value is used only if useQuerySelecotrAll is true.
 - options:  
   - model: see explanation of screenDocument()
   - format: see explanation of screenshot()
   - quality: see explanation of screenshot()
   - fromSurface: see explanation of screenshot()
   - useQuerySelectorAll(default: false): If set to true, take all the screenshot of elements returned from document.querySelectorAll() (Since v 0.2.13)

##### .screenshotDocument(options = {})

Exports a entire document as an image data.

See examples: [examples/screenshot.js](examples/screenshot.js)

Limitation:
  - Cannot take a screenshot of an area under 16384px.
    Detail: https://groups.google.com/a/chromium.org/d/msg/headless-dev/DqaAEXyzvR0/P9zmTLMvDQAJ

Known Issue:

 - When this api is called to take large page sometimes strange white area is appeared. This result is caused by --disable-flag option passed to Chrome. After chrome 60 is officially released I remove --disable-flag option to fix this problem.

###### options

 - model: this parameter affect page size. must be which one of: 'box', 'scroll'. 'box' means box model of body element. 'scroll' means size of scroll area.
 - format: see explanation of screenshot()
 - quality: see explanation of screenshot()
 - fromSurface: see explanation of screenshot()

##### .pdf(options={})

Exports a current page's printing image as a PDF data.
This function is supported only in headless mode (since Chrome60).

See examples: [examples/screenshot.js](examples/screenshot.js)

###### Parameters

 - options: See [devtools protocol](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-printToPDF)

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
A listener function passed to receiveMessage() receives parameters when sendToChromy() is executed in a browser.


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

##### .ignoreCertificateErrors()

Ignores all certificate errors.

```js
chromy.chain()
      .ignoreCertificateErrors()
      .goto('https://xxxxx/')
      .end()
```

##### .blockUrls(urls)

blocks urls from loading.  

###### Parameter

urls: array[string]  
Wildcard('*') is allowed in url string.

##### .clearBrowserCache()

Removes all browser caches.

##### .setCookie(params)

###### Parameters

params: object or array

See [chrome document](https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-setCookie)
If url parameter is not set, current url(location.href) is used as default value.

##### .deleteCookie(name, url = null)

Remove a cookie.

###### Parameters

name: string or array of string
url: url associated with cookie. If url is not set, current url(location.href) is used as default value.

##### .clearAllCookies()

Removes all browser cookies.

##### .clearDataForOrigin (origin = null, type = 'all')

Clear data for origin.(cookies, local_storage, indexedDb, etc...)

See details [here](https://chromedevtools.github.io/devtools-protocol/tot/Storage/#method-clearDataForOrigin).

##### .getDOMCounters()

Get count of these item: document, node, jsEventListeners

See details [here](https://chromedevtools.github.io/devtools-protocol/tot/Memory/#method-getDOMCounters).

##### .static cleanup()

close all browsers.

```js
process.on('SIGINT', async () => {
  await Chromy.cleanup()
  process.exit(1)
})
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/OnetapInc/chromy
