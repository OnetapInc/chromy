function A (arg) {
  return arg
}

function B (arg) {
  return A(arg)
}

exports.A = A
exports.B = B

