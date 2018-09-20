'use strict'

const _get = require('lodash/get')

const translateObject = (src, from) => {
  let key, elem, to = {}
  for (key in from) {
    elem = from[key]
    if (typeof elem === 'function') {
      let val = _get(src, elem._path)
      to[key] = elem(val, src)
    } else {
      to[key] = _get(src, elem)
    }
  }
  return to
}

const translateValue = (src, from) => {
  if (typeof from === 'function') {
    let val = _get(src, from._path)
    return from(val, src)
  } else {
    return _get(src, from)
  }
}

const translateArray = (src, from) => {
  let i, elem, to = {}
  for (i = from.length - 1; i >= 0; i--) {
    elem = from[i]
    if (typeof elem === 'function') {
      let val = _get(src, elem._path)
      to[elem._key] = elem(val, src)
    } else {
      to[elem] = _get(src, elem)
    }
  }
  return to
}

exports.body = any => {
  if (Array.isArray(any))
    return req => translateArray(req.body, any)
  else if (typeof any === 'object')
    return req => translateObject(req.body, any)
  else
    return req => translateValue(req.body, any)
}

exports.query = any => {
  if (Array.isArray(any))
    return req => translateArray(req.query, any)
  else if (typeof any === 'object')
    return req => translateObject(req.query, any)
  else
    return req => translateValue(req.query, any)
}

exports.params = any => {
  if (Array.isArray(any))
    return req => translateArray(req.params, any)
  else if (typeof any === 'object')
    return req => translateObject(req.params, any)
  else
    return req => translateValue(req.params, any)
}

exports.locals = any => {
  if (Array.isArray(any))
    return (req, res) => translateArray(res.locals, any)
  else if (typeof any === 'object')
    return (req, res) => translateObject(res.locals, any)
  else
    return (req, res) => translateValue(res.locals, any)
}

exports.raw = any => () => any

exports.derive = (path, key, fn) => {
  if (typeof key === 'function') {
    fn = key
    key = path
  }
  fn._key = key
  fn._path = path
  return fn
}