
const _get = require('lodash/get')
const _pick = require('lodash/pick')

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

const translateProps = (src, from) => {
  let key, to = {}
  for (key in from) to[key] = _get(src, from[key])
  return to
}

exports.evalProps = evalProps
exports.translateProps = translateProps

/**
 * Result handlers
 */

exports.handlers = {
  done: (res, payload) => { res.json(payload) },
  error: (res, err) => { res.status(400).json(err) }
}

/**
 * Payload resolvers
 */

exports.body = any => {
  if (Array.isArray(any))
    return req => _pick(req.body, any)
  else if (typeof any === 'string')
    return req => _get(req.body, any)
  else
    return req => translateProps(req.body, any)
}

exports.query = any => {
  if (Array.isArray(any))
    return req => _pick(req.query, any)
  else if (typeof any === 'string')
    return req => _get(req.body, any)
  else
    return req => translateProps(req.query, any)
}

exports.params = any => {
  if (Array.isArray(any))
    return req => _pick(req.params, any)
  else if (typeof any === 'string')
    return req => _get(req.body, any)
  else
    return req => translateProps(req.params, any)
}

exports.locals = any => {
  if (Array.isArray(any))
    return (req, res) => _pick(res.locals, any)
  else if (typeof any === 'string')
    return (req, res) => _get(res.locals, any)
  else
    return (req, res) => translateProps(res.locals, any)
}
