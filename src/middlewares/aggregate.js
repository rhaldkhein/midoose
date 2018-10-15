'use strict'

const _defaults = require('lodash.defaults')
const { config } = require('../config')

module.exports = (model, pipeline, opt = {}) => {

  _defaults(opt, { end: config.end, key: config.key })
  const isFunc = typeof pipeline === 'function'

  let midware = (req, res, next) => {
    let opt = midware._opt
    model.aggregate(isFunc ? pipeline(req, res) : pipeline)
      .then(result => {
        if (opt.end) return config.done(res, result)
        if (opt.pass) return next(null, result)
        res.locals[opt.key] = result
        next(opt.next)
        return null
      })
      .catch(next)
  }

  midware._opt = opt
  return midware
}