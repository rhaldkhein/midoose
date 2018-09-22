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

const getMiddleware = (any, key, isRes) => {
  if (Array.isArray(any))
    return (req, res) => translateArray((isRes ? res : req)[key], any)
  else if (typeof any === 'object')
    return (req, res) => translateObject((isRes ? res : req)[key], any)
  else
    return (req, res) => translateValue((isRes ? res : req)[key], any)
}

exports.body = any => getMiddleware(any, 'body')

exports.query = any => getMiddleware(any, 'query')

exports.params = any => getMiddleware(any, 'params')

exports.locals = any => getMiddleware(any, 'locals', true)

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