function functionToSource (f, replaces = {}) {
  let s = f.toString()
  for (let key in replaces) {
    let v = replaces[key]
    s = s.replace(key, v)
  }
  return s
}

function functionToEvaluatingSource (f, replaces = {}) {
  let s = '(' + functionToSource(f, replaces) + ')()'
  return 'JSON.stringify(' + s + ')'
}

exports.functionToSource = functionToSource
exports.functionToEvaluatingSource = functionToEvaluatingSource

