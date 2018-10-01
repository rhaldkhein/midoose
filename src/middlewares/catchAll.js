'use strict'

const parallel = require('async.parallel')
const _reduce = require('lodash.reduce')
const _mapValues = require('lodash.mapvalues')

const reducer = function (obj, mid) {
  // Do not end. Let the combine middleware end it.
  mid._opt.end = false
  // Pass the result to next callback.
  // Do not change to false, will not work.
  mid._opt.pass = true
  // Add key.
  obj[mid._opt.key] = mid
  return obj
}

module.exports = (...mids) => {

  mids = _reduce(mids, reducer, {})

  return (err, req, res, next) => {
    parallel(
      _mapValues(mids, item => callback => item(req, res, callback)),
      newErr => next(newErr || err)
    )
  }

}

module.exports.reducer = reducer