'use strict'

const _defaults = require('lodash.defaults')
const { config } = require('../config')

module.exports = (model, condSelector, opt = {}) => {

  _defaults(opt, { end: config.end, key: config.key })
  let isFuncOptions = typeof opt.options === 'function'

  let midware = (req, res, next) => {

    let opt = midware._opt

    model.deleteMany(
      condSelector(req, res),
      isFuncOptions ? opt.options(req, res) : opt.options)
      .then(raw => {
        if (opt.end) return config.done(res, raw)
        if (opt.pass) return next(null, raw)
        res.locals[opt.key] = raw
        next(opt.next)
        return null
      })
      .catch(next)

  }

  midware._opt = opt
  return midware
}