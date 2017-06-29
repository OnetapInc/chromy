function InjectedFunc (v1, v2, v3 = 3) {
  const s1 = 'value' + v1
  let s2 = "value" + v2
  var s3 = `value${v3}`
  return s1 + s2 + s3
}

function InjectedFunc2 () {
  let v1 = "\r\n\s"
  let v2 = /regex/g
  return v1.toString() + v2.toString()
}

