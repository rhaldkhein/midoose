'use strict'

const parallel = require('async.parallel')
const _defaults = require('lodash.defaults')
const { enums } = require('.')

/**
 * Combine multiple middlewares for async query operations
 */

function combineMiddlewares(mids, opt = {}) {
  _defaults(opt, {})
  return (req, res, next) => {
    parallel(
      mids.map(item => cb => item(req, res, () => cb())),
      () => {
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
  if (rest[0]._kind === enums.SELECTOR)
    return combineSelectors(rest)
  else
    return combineMiddlewares(rest)
}