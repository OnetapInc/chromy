function functionToSource (f, replaces = {}) {
  let s = f.toString()
  for (let key in replaces) {
    let v = replaces[key]
    s = s.replace(key, v)
  }
  return s
}

function toFunctionForm (f, replaces = {}) {
  if ((typeof f) === 'function') {
    return functionToSource(f, replaces)
  } else {
    return 'function () {' + functionToSource(f, replaces) + '}'
  }
}

function functionToEvaluatingSource (f, replaces = {}) {
  let s = '(' + toFunctionForm(f, replaces) + ')()'
  // If the result is an instanceof of Promise, It's resolved in context of nodejs later.
  return `
    {
      let result = ${s};
      if (result instanceof Promise) {
        result
      } else {
        let json = JSON.stringify(result);
        JSON.stringify({type: (typeof result), result: json});
      }
    }
  `.trim()
}

exports.functionToSource = functionToSource
exports.functionToEvaluatingSource = functionToEvaluatingSource

