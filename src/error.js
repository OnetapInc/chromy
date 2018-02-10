class TimeoutError extends Error {
  constructor (message) {
    super(message)
    this.name = 'TimeoutError'
  }
}

class GotoTimeoutError extends TimeoutError {
  constructor (message) {
    super(message)
    this.name = 'GotoTimeoutError'
  }
}

class WaitTimeoutError extends TimeoutError {
  constructor (message, selector) {
    super(message)
    this.name = 'WaitTimeoutError'
    this.selector = selector
  }
}

class EvaluateTimeoutError extends TimeoutError {
  constructor (message) {
    super(message)
    this.name = 'WaitTimeoutError'
  }
}

class EvaluateError extends Error {
  constructor (message, object) {
    super(message)
    this.object = object
  }
}

exports.TimeoutError = TimeoutError
exports.GotoTimeoutError = GotoTimeoutError
exports.WaitTimeoutError = WaitTimeoutError
exports.EvaluateTimeoutError = EvaluateTimeoutError
exports.EvaluateError = EvaluateError
