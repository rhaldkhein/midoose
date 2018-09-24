'use strict'

const parallel = require('async.parallel')
const _defaults = require('lodash.defaults')
const { enums, __CONFIG__: { done, end, key } } = require('.')

/**
 * Combine multiple middlewares for async query operations
 */

function combineMiddlewares(mids, opt = {}) {
  _defaults(opt, { end, key })
  mids.forEach((item, i) => {
    // item._opt = { end: false, key: '_result' + i }
    item._opt.end = false
  })
  return (req, res, next) => {
    parallel(
      mids.map(item => cb => item(req, res, () => cb())),
      (err) => {
        next(err || opt.next)
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
  if (rest[0]._kind === enums.SELECTOR)
    return combineSelectors(
      rest,
      typeof rest[rest.length - 1] !== 'function' && rest.pop()
    )
  else
    return combineMiddlewares(
      rest
    )
}