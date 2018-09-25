'use strict'

const _defaults = require('lodash.defaults')
const { __CONFIG__: { done, end, key } } = require('..')

module.exports = (model, cond, fields, opt = {}) => {

  _defaults(opt, { end, key })

  let midware = (req, res, next) => {
    // Get data be placed
    let opt = midware._opt, docNew = fields(req, res)
    // Add more data to docs through options object
    if (opt.moreDoc) docNew = opt.moreDoc(docNew, req, res)
    // Trigger create
    model.updateMany(
      // Criteria to find docs
      cond(req, res),
      docNew,
      opt.options)
      .then(raw => {
        if (opt.populate) {
          return model.populate(raw, opt.populate)
        }
        return raw
      })
      .then(raw => {
        if (opt.end) return done(res, raw)
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