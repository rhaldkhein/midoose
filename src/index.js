
const _get = require('lodash/get')

exports.evalProps = (obj, req, res) => {
  let element, value
  for (let key in obj) {
    element = obj[key]
    if (typeof element !== 'string') continue
    value = _get(req, element)
    obj[key] = value !== undefined ? value : _get(res, element)
  }
  return obj
}

exports.handlers = {
  done: (res, payload) => { res.json(payload) },
  error: (res, err) => { res.status(400).json(err) }
}