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
  constructor (message) {
    super(message)
    this.name = 'WaitTimeoutError'
  }
}

class EvaluateTimeoutError extends TimeoutError {
  constructor (message) {
    super(message)
    this.name = 'WaitTimeoutError'
  }
}

exports.TimeoutError = TimeoutError
exports.GotoTimeoutError = GotoTimeoutError
exports.WaitTimeoutError = WaitTimeoutError
exports.EvaluateTimeoutError = EvaluateTimeoutError

