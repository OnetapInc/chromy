class GotoTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GotoTimeoutError';
  }
}

class WaitTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WaitTimeoutError';
  }
}

class EvaluateTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WaitTimeoutError';
  }
}

exports.GotoTimeoutError = GotoTimeoutError
exports.WaitTimeoutError = WaitTimeoutError
exports.EvaluateTimeoutError = EvaluateTimeoutError

