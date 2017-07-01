const uuidV4 = require('uuid/v4')

const {
  TimeoutError,
  GotoTimeoutError,
  WaitTimeoutError,
  EvaluateTimeoutError,
  EvaluateError
} = require('./error')
const {
  wrapFunctionForEvaluation
} = require('./functionToSource')
const {
  escapeHtml,
  escapeSingleQuote,
  createChromeLauncher,
  completeUrl
} = require('./util')

class Document {
  constructor (chromy, client, nodeId = null) {
    if (chromy) {
      this.chromy = chromy
    } else {
      this.chromy = this
    }
    this.client = client
    this.nodeId = nodeId
  }

  async iframe (selector, callback) {
    const rect = await this.getBoundingClientRect(selector)
    if (!rect) {
      return Promise.resolve()
    }
    const locationParams = {x: rect.left + Math.floor(rect.width / 2), y: rect.top + Math.floor(rect.height / 2)}
    const {nodeId: iframeNodeId} = await this.client.DOM.getNodeForLocation(locationParams)
    if (!iframeNodeId) {
      return Promise.resolve()
    }
    const doc = new Document(this.chromy, this.client, iframeNodeId)
    doc._activateOnDocumentUpdatedListener()
    return Promise.resolve(callback.apply(this, [doc]))
  }

  async click (expr, inputOptions = {}) {
    const defaults = {waitLoadEvent: false}
    const options = Object.assign({}, defaults, inputOptions)
    let promise = null
    if (options.waitLoadEvent) {
      promise = this.waitLoadEvent()
    }
    let nid = await this._getNodeId()
    await this._evaluateOnNode(nid, 'document.querySelectorAll(\'' + escapeSingleQuote(expr) + '\').forEach(n => n.click())')
    if (promise !== null) {
      await promise
    }
  }

  async evaluate (expr, options = {}) {
    return await this._evaluateWithReplaces(expr, options)
  }

  async _evaluateWithReplaces (expr, options = {}, replaces = {}) {
    let e = wrapFunctionForEvaluation(expr, replaces)
    try {
      let result = await this._waitFinish(this.chromy.options.evaluateTimeout, async () => {
        if (!this.client) {
          return null
        }
        const contextNodeId = await this._getNodeId()
        const objectId = await this._getObjectIdFromNodeId(contextNodeId)
        let params = Object.assign({}, options, {objectId: objectId, functionDeclaration: e})
        return await this.client.Runtime.callFunctionOn(params)
      })
      if (!result || !result.result) {
        return null
      }
      // resolve a promise
      if (result.result.subtype === 'promise') {
        result = await this.client.Runtime.awaitPromise({promiseObjectId: result.result.objectId, returnByValue: true})
        // adjust to after process
        result.result.value = JSON.stringify({
          type: (typeof result.result.value),
          result: JSON.stringify(result.result.value)
        })
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

  // evaluate a function on the specified node context.
  async _evaluateOnNode (nodeId, fn) {
    const objectId = await this._getObjectIdFromNodeId(nodeId)
    const src = fn.toString()
    const functionDeclaration = `function () {
      return (${src})()
    }`
    const params = {
      objectId,
      functionDeclaration
    }
    await this.client.Runtime.enable()
    await this.client.Runtime.callFunctionOn(params)
  }

  async _getObjectIdFromNodeId (nodeId) {
    const {object: rObj} = await this.client.DOM.resolveNode({nodeId})
    if (!rObj) {
      return null
    }
    return rObj.objectId
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
      await this.sleep(this.chromy.options.waitFunctionPollingInterval)
    }
    if (error !== null) {
      throw error
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

  async _getNodeId () {
    if (!this.nodeId) {
      let {root} = await this.client.DOM.getDocument()
      this.nodeId = root.nodeId
    }
    return this.nodeId
  }

  _activateOnDocumentUpdatedListener () {
    this._onDocumentUpdatedListener = () => {
      this.nodeId = null
    }
    this.client.DOM.documentUpdated(this._onDocumentUpdatedListener)
  }

}

module.exports = Document
