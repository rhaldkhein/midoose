'use strict'

const _defaults = require('lodash.defaults')
const { config } = require('../config')

module.exports = (model, condSelector, fieldSelector, opt = {}) => {

  _defaults(opt, { end: config.end, key: config.key })
  let isFuncOptions = typeof opt.options === 'function'

  let midware = (req, res, next) => {
    // Get data be placed
    let opt = midware._opt, docNew = fieldSelector(req, res)
    // Add more data to docs through options object
    if (opt.moreDoc) docNew = opt.moreDoc(docNew, req, res)
    // Trigger create
    model.updateMany(
      // Criteria to find docs
      condSelector(req, res),
      docNew,
      isFuncOptions ? opt.options(req, res) : opt.options)
      .then(raw => {
        if (opt.populate) {
          return model.populate(raw, opt.populate)
        }
        return raw
      })
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