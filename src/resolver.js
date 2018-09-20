'use strict'

const _get = require('lodash/get')

const translateObject = (src, from, req, res) => {
  let key, elem, to = {}
  for (key in from) {
    elem = from[key]
    if (typeof elem === 'function') {
      let val = _get(src, elem.path)
      to[key] = elem(val, req, res)
    } else {
      to[key] = _get(src, elem)
    }
  }
  return to
}

const translateValue = (src, from, req, res) => {
  if (typeof from === 'function') {
    let val = _get(src, from.path)
    return from(val, req, res)
  } else {
    return _get(src, from)
  }
}

const translateArray = (src, from, req, res) => {
  let i, elem, to = {}
  for (i = from.length - 1; i >= 0; i--) {
    elem = from[i]
    if (typeof elem === 'function') {
      let val = _get(src, elem.path)
      to[elem.path] = elem(val, req, res)
    } else {
      to[elem] = _get(src, elem)
    }
  }
  return to
}

exports.body = any => {
  if (Array.isArray(any))
    return (req, res) => translateArray(req.body, any, req, res)
  else if (typeof any === 'string')
    return (req, res) => translateValue(req.body, any, req, res)
  else
    return (req, res) => translateObject(req.body, any, req, res)
}

exports.query = any => {
  if (Array.isArray(any))
    return (req, res) => translateArray(req.query, any, req, res)
  else if (typeof any === 'string')
    return (req, res) => translateValue(req.query, any, req, res)
  else
    return (req, res) => translateObject(req.query, any, req, res)
}

exports.params = any => {
  if (Array.isArray(any))
    return (req, res) => translateArray(req.params, any, req, res)
  else if (typeof any === 'string')
    return (req, res) => translateValue(req.params, any, req, res)
  else
    return (req, res) => translateObject(req.params, any, req, res)
}

exports.locals = any => {
  if (Array.isArray(any))
    return (req, res) => translateArray(res.locals, any, req, res)
  else if (typeof any === 'string')
    return (req, res) => translateValue(res.locals, any, req, res)
  else
    return (req, res) => translateObject(res.locals, any, req, res)
}

exports.raw = any => () => any

exports.derive = (path, fn) => {
  fn.path = path
  return fn
}