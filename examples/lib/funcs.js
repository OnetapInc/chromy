function A () {
  return 'A'
}

function B () {
  return A()
}

exports.A = A
exports.B = B

