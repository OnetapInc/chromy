class FullscreenEmulationManager {
  constructor (chromy, model) {
    this._chromy = chromy
    this._client = chromy.client
    this._model = model
    this.browserInfo = null
  }

  async init () {
    let width = 0
    let height = 0
    const info = await this._chromy.evaluate(function () {
      return {
        devicePixelRatio: window.devicePixelRatio,
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      }
    })
    this.browserInfo = info
    if (this._model === 'box') {
      const DOM = this._client.DOM
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
    this._deviceMetrics = {
      width,
      height,
      deviceScaleFactor: 0,
      mobile: false,
      fitWindow: false
    }
  }

  async emulate () {
    const m = this._deviceMetrics
    await this._client.Emulation.setVisibleSize({width: m.width, height: m.height})
    await this._client.Emulation.forceViewport({x: 0, y: 0, scale: 1})
    await this._client.Emulation.setDeviceMetricsOverride(m)
    await this._chromy.scrollTo(0, 0)
    await this._chromy.sleep(200)
  }

  async reset () {
    const info = this.browserInfo
    await this._client.Emulation.resetViewport()
    await this._client.Emulation.clearDeviceMetricsOverride()
    await this._client.Emulation.setVisibleSize({width: info.viewportWidth, height: info.viewportHeight})
  }
}

async function createFullscreenEmulationManager (chromy, model) {
  const manager = new FullscreenEmulationManager(chromy, model)
  await manager.init()
  return manager
}

exports.createFullscreenEmulationManager = createFullscreenEmulationManager
