'use strict'

const parallel = require('async.parallel')
const _defaults = require('lodash.defaults')
const _reduce = require('lodash.reduce')
const _mapValues = require('lodash.mapvalues')

/**
 * Combine multiple middlewares for async query operations
 */

function prepareMiddlewares(mids, opt = {}) {
  _defaults(opt, {})

  mids = _reduce(mids, function (obj, mid) {
    // Do not end. Let the combine middleware end it.
    mid._opt.end = false
    // Pass the result to next callback.
    // Do not change to false, will not work.
    mid._opt.pass = true
    // Add key.
    obj[mid._opt.key] = mid
    return obj
  }, {})

  return (err, req, res, next) => {
    parallel(
      _mapValues(mids, item => callback => item(req, res, callback)),
      newErr => next(newErr || err)
    )
  }
}

module.exports = (...rest) => {
  if (typeof rest[rest.length - 1] !== 'function') {
    return prepareMiddlewares(rest, rest.pop())
  } else {
    return prepareMiddlewares(rest)
  }
}