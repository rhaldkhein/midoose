'use strict'

const _get = require('lodash/get')

const evalProps = (obj, req, res) => {
  let key, element, value
  for (key in obj) {
    element = obj[key]
    // Retain all non string values
    if (typeof element !== 'string') continue
    // Also retain strings that starts with `$`
    if (element[0] === '$') {
      obj[key] = element.substr(1)
      continue
    }
    // Resolve strings from req or res
    // eg. `body.id` will be from `req.body.id`
    // eg. `locals.name` will be from `res.locals.name`
    value = _get(req, element)
    obj[key] = value !== undefined ? value : _get(res, element)
  }
  return obj
}

exports.evalProps = evalProps

/**
 * Result handlers
 */

exports.handlers = {
  done: (res, payload) => { res.json(payload) },
  error: (res, err) => { res.status(400).json(err) }
}
