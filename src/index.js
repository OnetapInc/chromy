const fs = require('fs')

const CDP = require('chrome-remote-interface')
const chainProxy = require('async-chain-proxy')
const uuidV4 = require('uuid/v4')
const devices = require('./devices')
const sharp = require('sharp')

const {
  TimeoutError,
  GotoTimeoutError,
  WaitTimeoutError,
  EvaluateTimeoutError,
  EvaluateError
} = require('./error')
const {
  functionToEvaluatingSource
} = require('./functionToSource')
const {
  escapeHtml,
  createChromeLauncher
} = require('./util')

let instances = []
let instanceId = 1

function makeSendToChromy (uuid) {
  return `
  function () {
    console.info('${uuid}:' + JSON.stringify(arguments))
  }
  `
}

function defaultTargetFunction (targets) {
  return targets.filter(t => t.type === 'page').shift()
}

const _clone = (obj) => Object.assign({}, obj)

class Chromy {
  constructor (options = {}) {
    const defaults = {
      port: 9222,
      waitTimeout: 30000,
      gotoTimeout: 30000,
      loadTimeout: 30000,
      evaluateTimeout: 30000,
      waitFunctionPollingInterval: 100,
      typeInterval: 20,
      activateOnStartUp: true,
      target: defaultTargetFunction,
      chromeFlags: []
    }
    this.options = Object.assign(_clone(defaults), options)
    this.cdpOptions = {
      port: this.options.port,
      target: this.options.target
    }
    this.client = null
    this.launcher = null
    this.messagePrefix = null
    this.emulateMode = false
    this.currentEmulateDeviceName = null
    this.userAgentBeforeEmulate = null
    this.instanceId = instanceId++
  }

  chain (options = {}) {
    return chainProxy(this, options)
  }

  async start (startingUrl = null) {
    if (startingUrl === null) {
      startingUrl = 'about:blank'
    }
    if (this.client !== null) {
      return
    }
    if (this.launcher === null) {
      this.launcher = createChromeLauncher(startingUrl, this.options)
    }
    await this.launcher.launch()
    instances.push(this)
    await new Promise((resolve, reject) => {
      CDP(this.cdpOptions, async (client) => {
        try {
          this.client = client
          const {Network, Page, Runtime, Console} = client
          await Promise.all([Network.enable(), Page.enable(), Runtime.enable(), Console.enable()])

          // activate first tab
          if (this.options.activateOnStartUp) {
            let targetId = await this._getTargetIdFromOption()
            await this.client.Target.activateTarget({targetId: targetId})
          }

          if ('userAgent' in this.options) {
            await this.userAgent(this.options.userAgent)
          }
          if ('headers' in this.options) {
            await this.headers(this.options.headers)
          }
          resolve(this)
        } catch (e) {
          reject(e)
        }
      }).on('error', (err) => {
        reject(err)
      })
    }).catch(e => {
      throw e
    })
  }

  async _getTargetIdFromOption () {
    if (typeof this.options.target === 'function') {
      const result = await this.client.Target.getTargets()
      const page = this.options.target(result.targetInfos)
      return page.targetId
    } else if (typeof this.options.target === 'object') {
      return this.options.target.targetId
    } else if (typeof this.options.target === 'string') {
      return this.options.target
    } else {
      throw new Error('type of `target` option is invalid.')
    }
  }

  async close () {
    if (this.client === null) {
      return false
    }
    await this.client.close()
    this.client = null
    if (this.launcher !== null) {
      await this.launcher.kill()
      this.launcher = null
    }
    instances = instances.filter(i => i.instanceId !== this.instanceId)
    return true
  }

  static async cleanup () {
    const copy = [].concat(instances)
    const promises = copy.map(i => i.close())
    await Promise.all(promises)
  }

  async getPageTargets () {
    const result = await this.client.Target.getTargets()
    return result.targetInfos.filter(t => t.type === 'page')
  }

  async userAgent (ua) {
    await this._checkStart()
    return await this.client.Network.setUserAgentOverride({'userAgent': ua})
  }

  /**
   * Example:
   * chromy.headers({'X-Requested-By': 'foo'})
   */
  async headers (headers) {
    await this._checkStart()
    return await this.client.Network.setExtraHTTPHeaders({'headers': headers})
  }

  async console (callback) {
    await this._checkStart()
    this.client.Console.messageAdded((payload) => {
      try {
        const msg = payload.message.text
        const pre = this.messagePrefix
        if (typeof msg !== 'undefined') {
          if (pre === null || msg.substring(0, pre.length + 1) !== pre + ':') {
            callback.apply(this, [msg, payload.message])
          }
        }
      } catch (e) {
        console.warn(e)
      }
    })
  }

  async receiveMessage (callback) {
    await this._checkStart()
    const uuid = uuidV4()
    this.messagePrefix = uuid
    const f = makeSendToChromy(this.messagePrefix)
    this.defineFunction({sendToChromy: f})
    this.client.Console.messageAdded((payload) => {
      try {
        const msg = payload.message.text
        if (msg && msg.substring(0, uuid.length + 1) === uuid + ':') {
          const data = JSON.parse(msg.substring(uuid.length + 1))
          callback.apply(this, [data])
        }
      } catch (e) {
        console.warn(e)
      }
    })
  }

  async goto (url, options) {
    const defaultOptions = {
      waitLoadEvent: true
    }
    options = Object.assign(_clone(defaultOptions), options)
    await this._checkStart(url)
    try {
      await this._waitFinish(this.options.gotoTimeout, async () => {
        await this.client.Page.navigate({url: url})
        if (options.waitLoadEvent) {
          await this.client.Page.loadEventFired()
        }
      })
    } catch (e) {
      if (e instanceof TimeoutError) {
        throw new GotoTimeoutError('goto() timeout')
      } else {
        throw e
      }
    }
  }

  async waitLoadEvent () {
    await this._waitFinish(this.options.loadTimeout, async () => {
      await this.client.Page.loadEventFired()
    })
  }

  async forward () {
    const f = 'window.history.forward()'
    const promise = this.waitLoadEvent()
    await this.client.Runtime.evaluate({expression: f})
    await promise
  }

  async back () {
    const f = 'window.history.back()'
    const promise = this.waitLoadEvent()
    await this.client.Runtime.evaluate({expression: f})
    await promise
  }

  async reload (ignoreCache, scriptToEvaluateOnLoad) {
    await this.client.Page.reload({ignoreCache, scriptToEvaluateOnLoad})
  }

  async evaluate (expr, options = {}) {
    return await this._evaluateWithReplaces(expr, options)
  }

  async _evaluateWithReplaces (expr, options = {}, replaces = {}) {
    let e = functionToEvaluatingSource(expr, replaces)
    try {
      let result = await this._waitFinish(this.options.evaluateTimeout, async () => {
        if (!this.client) {
          return null
        }
        let params = Object.assign({}, options, {expression: e})
        return await this.client.Runtime.evaluate(params)
      })
      if (!result || !result.result) {
        return null
      }
      // resolve a promise
      if (result.result.subtype === 'promise') {
        result = await this.client.Runtime.awaitPromise({promiseObjectId: result.result.objectId, returnByValue: true})
        // adjust to after process
        result.result.value = JSON.stringify({type: (typeof result.result.value), result: JSON.stringify(result.result.value)})
      }
      if (result.result.subtype === 'error') {
        throw new EvaluateError('An error has been occurred in evaluated script on a browser.' + result.result.description, result.result)
      }
      const resultObject = JSON.parse(result.result.value)
      const type = resultObject.type
      if (type === 'undefined') {
        return undefined
      } else {
        try {
          return JSON.parse(resultObject.result)
        } catch (e) {
          console.log('ERROR', resultObject)
          throw e
        }
      }
    } catch (e) {
      if (e instanceof TimeoutError) {
        throw new EvaluateTimeoutError('evaluate() timeout')
      } else {
        throw e
      }
    }
  }

  async _waitFinish (timeout, callback) {
    const start = Date.now()
    let finished = false
    let error = null
    let result = null
    const f = async () => {
      try {
        result = await callback.apply()
        finished = true
        return result
      } catch (e) {
        error = e
        finished = true
      }
    }
    f.apply()
    while (!finished) {
      const now = Date.now()
      if ((now - start) > timeout) {
        throw new TimeoutError('timeout')
      }
      await this.sleep(this.options.waitFunctionPollingInterval)
    }
    if (error !== null) {
      throw error
    }
    return result
  }

  /**
   * define function
   *
   * @param func {(function|string|Array.<function>|Array.<string>)}
   * @returns {Promise.<void>}
   */
  async defineFunction (def) {
    let funcs = []
    if (Array.isArray(def)) {
      funcs = def
    } else if ((typeof def) === 'object') {
      funcs = this._moduleToFunctionSources(def)
    } else {
      funcs.push(def)
    }
    for (let i = 0; i < funcs.length; i++) {
      let f = funcs[i]
      if ((typeof f) === 'function') {
        f = f.toString()
      }
      await this.client.Runtime.evaluate({expression: f})
    }
  }

  _moduleToFunctionSources (module) {
    const result = []
    for (let funcName in module) {
      let func = module[funcName]
      let src = `function ${funcName} () { return (${func.toString()})(...arguments) }`.trim()
      result.push(src)
    }
    return result
  }

  async sleep (msec) {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, msec)
    })
  }

  async wait (cond) {
    if ((typeof cond) === 'number') {
      await this.sleep(cond)
    } else if ((typeof cond) === 'function') {
      await this._waitFunction(cond)
    } else {
      await this._waitSelector(cond)
    }
  }

  // wait for func to return true.
  async _waitFunction (func) {
    await this._waitFinish(this.options.waitTimeout, async () => {
      while (true) {
        const r = await this.evaluate(func)
        if (r) {
          break
        }
        await this.sleep(this.options.waitFunctionPollingInterval)
      }
    })
  }

  async _waitSelector (selector) {
    let check = null
    let startTime = Date.now()
    await new Promise((resolve, reject) => {
      check = () => {
        setTimeout(async () => {
          try {
            const now = Date.now()
            if (now - startTime > this.options.waitTimeout) {
              reject(new WaitTimeoutError('wait() timeout'))
              return
            }
            const result = await this._evaluateWithReplaces(() => {
              return document.querySelector('?')
            }, {}, {'?': escapeHtml(selector)})
            if (result) {
              resolve(result)
            } else {
              check()
            }
          } catch (e) {
            reject(e)
          }
        }, this.options.waitFunctionPollingInterval)
      }
      check()
    })
  }

  async type (expr, value) {
    await this.evaluate('document.querySelector("' + expr + '").focus()')
    const characters = value.split('')
    for (let i in characters) {
      const c = characters[i]
      await this.client.Input.dispatchKeyEvent({type: 'char', text: c})
      await this.sleep(this.options.typeInterval)
    }
  }

  async insert (expr, value) {
    await this.evaluate('document.querySelector("' + expr + '").focus()')
    await this.evaluate('document.querySelector("' + expr + '").value = "' + escapeHtml(value) + '"')
  }

  async click (expr, inputOptions = {}) {
    const defaults = {waitLoadEvent: false}
    const options = Object.assign(_clone(defaults), inputOptions)
    let promise = null
    if (options.waitLoadEvent) {
      promise = this.waitLoadEvent()
    }
    await this.evaluate('document.querySelectorAll("' + expr + '").forEach(n => n.click())')
    if (promise !== null) {
      await promise
    }
  }

  async mouseMoved (x, y, options = {}) {
    const opts = Object.assign({type: 'mouseMoved', x: x, y: y}, options)
    await this.client.Input.dispatchMouseEvent(opts)
  }

  async mousePressed (x, y, options = {}) {
    const opts = Object.assign({type: 'mousePressed', x: x, y: y, button: 'left'}, options)
    await this.client.Input.dispatchMouseEvent(opts)
  }

  async mouseReleased (x, y, options = {}) {
    const opts = Object.assign({type: 'mouseReleased', x: x, y: y, button: 'left'}, options)
    await this.client.Input.dispatchMouseEvent(opts)
  }

  async tap (x, y, options = {}) {
    const time = Date.now() / 1000
    const opts = Object.assign({x: x, y: y, timestamp: time, button: 'left'}, options)
    await this.client.Input.synthesizeTapGesture(opts)
  }

  async doubleTap (x, y, options = {}) {
    const time = Date.now() / 1000
    const opts = Object.assign({x: x, y: y, timestamp: time, button: 'left', tapCount: 2}, options)
    await this.client.Input.synthesizeTapGesture(opts)
  }

  async check (selector) {
    await this.evaluate('document.querySelectorAll("' + selector + '").forEach(n => n.checked = true)')
  }

  async uncheck (selector) {
    await this.evaluate('document.querySelectorAll("' + selector + '").forEach(n => n.checked = false)')
  }

  async select (selector, value) {
    const src = `
      document.querySelectorAll("${selector} > option").forEach(n => {
        if (n.value === "${value}") {
          n.selected = true
        }
      })
      `
    await this.evaluate(src)
  }

  async screenshot (format = 'png', quality = undefined, fromSurface = true) {
    if (['png', 'jpeg'].indexOf(format) === -1) {
      throw new Error('format is invalid.')
    }
    const {data} = await this.client.Page.captureScreenshot({
      format: format,
      quality: quality,
      fromSurface: fromSurface
    })
    return Buffer.from(data, 'base64')
  }

  async screenshotDocument (model = 'scroll', format = 'png', quality = undefined, fromSurface = true) {
    let width = 0
    let height = 0
    const info = await this.evaluate(function () {
      return {
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      }
    })
    if (model === 'box') {
      const DOM = this.client.DOM
      const {root: {nodeId: documentNodeId}} = await DOM.getDocument()
      const {nodeId: bodyNodeId} = await DOM.querySelector({
        selector: 'body',
        nodeId: documentNodeId
      })
      const box = await DOM.getBoxModel({nodeId: bodyNodeId})
      width = box.model.width
      height = box.model.height
    } else {
      width = info.width
      height = info.height
    }
    const deviceMetrics = {
      width,
      height,
      deviceScaleFactor: 0,
      mobile: false,
      fitWindow: false
    }

    let result = null
    try {
      await this.client.Emulation.setVisibleSize({width, height})
      await this.client.Emulation.forceViewport({x: 0, y: 0, scale: 1})
      await this.client.Emulation.setDeviceMetricsOverride(deviceMetrics)
      await this.scrollTo(0, 0)
      result = await this.screenshot('png', quality, fromSurface)
    } finally {
      await this.client.Emulation.resetViewport()
      await this.client.Emulation.clearDeviceMetricsOverride()
      await this.client.Emulation.setVisibleSize({width: info.viewportHeight, height: info.viewportHeight})

      // restore emulation mode
      if (this.currentEmulateDeviceName !== null) {
        await this.emulate(this.currentEmulateDeviceName)
      }
    }
    return result
  }

  async screenshotSelector (selector, format = 'png', quality = undefined, fromSurface = true) {
    const rect = await this.getBoundingClientRect(selector)
    if (!rect) {
      return null
    }
    const pixelRatio = await this.evaluate(function () {
      return window.devicePixelRatio
    })

    // scroll to element
    await this.scroll(rect.left, rect.top)

    // capture screenshot and crop it.
    const actualRect = await this.getBoundingClientRect(selector)
    if (!actualRect) {
      return null
    }
    const clipRect = {
      top: Math.floor(actualRect.top * pixelRatio),
      left: Math.floor(actualRect.left * pixelRatio),
      width: Math.floor(actualRect.width * pixelRatio),
      height: Math.floor(actualRect.height * pixelRatio)
    }
    const buffer = await this.screenshot(format, quality, fromSurface)
    const meta = await sharp(buffer).metadata()
    if (meta.width < clipRect.left + clipRect.width) {
      clipRect.width = meta.width - clipRect.left
    }
    if (meta.height < clipRect.top + clipRect.height) {
      clipRect.height = meta.height - clipRect.top
    }
    return sharp(buffer).extract(clipRect).toBuffer()
  }

  async pdf (options = {}) {
    const {data} = await this.client.Page.printToPDF(options)
    return Buffer.from(data, 'base64')
  }

  async startScreencast (callback, options = {}) {
    await this.client.Page.screencastFrame(async (payload) => {
      await callback.apply(this, [payload])
      await this.client.Page.screencastFrameAck({sessionId: payload.sessionId})
    })
    await this.client.Page.startScreencast(options)
  }

  async stopScreencast () {
    await this.client.Page.stopScreencast()
  }

  async requestWillBeSent (callback) {
    await this._checkStart()
    await this.client.Network.responseReceived(callback)
  }

  async inject (type, file) {
    const data = await new Promise((resolve, reject) => {
      fs.readFile(file, {encoding: 'utf-8'}, (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    }).catch(e => {
      throw e
    })
    if (type === 'js') {
      let script = data.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/(\r|\n)/g, '\\n')
      let expr = `
      {
         let script = document.createElement('script')
         script.type = 'text/javascript'
         script.innerHTML = '${script}'
         document.body.appendChild(script)
      }
      `
      return this.evaluate(expr)
    } else if (type === 'css') {
      let style = data.replace(/`/g, '\\`').replace(/\\/g, '\\\\') // .replace(/(\r|\n)/g, ' ')
      let expr = `
      {
         let style = document.createElement('style')
         style.type = 'text/css'
         style.innerText = \`
        ${style}
        \`
         document.head.appendChild(style)
      }
      `
      return this.evaluate(expr)
    } else {
      throw new Error('found invalid type.')
    }
  }

  async emulate (deviceName) {
    await this._checkStart()

    if (!this.emulateMode) {
      this.userAgentBeforeEmulate = await this.evaluate('return navigator.userAgent')
    }
    const device = devices[deviceName]
    await this.client.Emulation.setDeviceMetricsOverride({
      width: device.width,
      height: device.height,
      deviceScaleFactor: device.deviceScaleFactor,
      mobile: device.mobile,
      fitWindow: false,
      scale: device.pageScaleFactor
    })
    const platform = device.mobile ? 'mobile' : 'desktop'
    await this.client.Emulation.setTouchEmulationEnabled({enabled: true, configuration: platform})
    await this.userAgent(device.userAgent)
    this.currentEmulateDeviceName = deviceName
    this.emulateMode = true
  }

  async clearEmulate () {
    await this.client.Emulation.clearDeviceMetricsOverride()
    await this.client.Emulation.setTouchEmulationEnabled({enabled: false})
    if (this.userAgentBeforeEmulate) {
      await this.userAgent(this.userAgentBeforeEmulate)
    }
    this.emulateMode = false
    this.currentEmulateDeviceName = null
  }

  async blockUrls (urls) {
    await this._checkStart()
    await this.client.Network.setBlockedURLs({urls: urls})
  }

  async clearBrowserCache () {
    await this._checkStart()
    await this.client.Network.clearBrowserCache()
  }

  async setCookie (params) {
    await this._checkStart()
    await this.client.Network.setCookie(params)
  }

  async deleteCookie (name, url) {
    await this._checkStart()
    await this.client.Network.deleteCookie({cookieName: name, url: url})
  }

  async clearAllCookies () {
    await this._checkStart()
    await this.client.Network.clearBrowserCookies()
  }

  async getDOMCounters () {
    return await this.client.Memory.getDOMCounters()
  }

  async clearDataForOrigin (origin = null, type = 'all') {
    if (origin === null) {
      origin = await this.evaluate(_ => { return location.origin })
    }
    return await this.client.Storage.clearDataForOrigin({origin: origin, storageTypes: type})
  }

  async scroll (x, y) {
    return this._evaluateWithReplaces(function () {
      const dx = _1  // eslint-disable-line no-undef
      const dy = _2  // eslint-disable-line no-undef
      window.scrollTo(window.pageXOffset + dx, window.pageYOffset + dy)
    }, {}, {'_1': x, '_2': y})
  }

  async scrollTo (x, y) {
    return this._evaluateWithReplaces(function () {
      window.scrollTo(_1, _2) // eslint-disable-line no-undef
    }, {}, {'_1': x, '_2': y})
  }

  async getBoundingClientRect (selector) {
    const result = await this._evaluateWithReplaces(function () {
      let dom = document.querySelector('?')
      if (!dom) {
        return null
      }
      let rect = dom.getBoundingClientRect()
      return {
        rect: {top: rect.top, left: rect.left, width: rect.width, height: rect.height}
      }
    }, {}, {'?': escapeHtml(selector)})
    if (!result) {
      return null
    }
    return {
      top: Math.floor(result.rect.top),
      left: Math.floor(result.rect.left),
      width: Math.floor(result.rect.width),
      height: Math.floor(result.rect.height)
    }
  }

  async _checkStart (startingUrl = null) {
    if (this.client === null) {
      await this.start(startingUrl)
    }
  }
}

module.exports = Chromy

