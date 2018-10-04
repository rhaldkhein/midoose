'use strict'

const parallel = require('async.parallel')
const _defaults = require('lodash.defaults')
const _reduce = require('lodash.reduce')
const _mapValues = require('lodash.mapvalues')
const { config: { done, end, key } } = require('./config')

/**
 * Combine multiple middlewares for async operations
 */

function combineMiddlewares(mids, opt = {}) {
  _defaults(opt, { end, key })

  mids = _reduce(mids, function (obj, mid, i) {
    // Do not end. Let the combine middleware end it.
    mid._opt.end = false
    // Pass the result to next callback.
    // Do not change to false, will not work.
    mid._opt.pass = true
    // Add key. If key is default, then assume its omitted
    // and set index instead
    obj[mid._opt.key === key ? i : mid._opt.key] = mid
    return obj
  }, {})

  return (req, res, next) => {
    parallel(
      _mapValues(mids, item => callback => item(req, res, callback)),
      (err, results) => {
        if (err) return next(err)
        if (opt.end) return done(res, results)
        res.locals[opt.key] = results
        next(opt.next)
      }
    )
  }
}

/**
 * Combine selectors
 */

function combineSelectors(sels) {
  return (req, res) => {
    let obj = {}, i = 0
    for (; i < sels.length; i++)
      Object.assign(obj, sels[i](req, res))
    return obj
  }
}

module.exports = (...rest) => {
  if (rest[0].selector) {
    return combineSelectors(rest)
  } else {
    if (typeof rest[rest.length - 1] !== 'function') {
      return combineMiddlewares(rest, rest.pop())
    } else {
      return combineMiddlewares(rest)
    }
  }
}