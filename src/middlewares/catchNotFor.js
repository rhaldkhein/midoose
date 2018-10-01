'use strict'

const parallel = require('async.parallel')
const _reduce = require('lodash.reduce')
const _mapValues = require('lodash.mapvalues')
const { reducer } = require('./catchAll')

module.exports = (errName, errCode, ...mids) => {

  mids = _reduce(mids, reducer, {})

  return (err, req, res, next) => {
    if (err.name === errName && err.code === errCode) {
      next(err)
    } else {
      parallel(
        _mapValues(mids, item => callback => item(req, res, callback)),
        newErr => next(newErr || err)
      )
    }
  }

}