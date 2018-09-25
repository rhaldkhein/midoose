'use strict'

const _defaults = require('lodash.defaults')
const { __CONFIG__: { done, end, key } } = require('..')

module.exports = (model, condSelector, opt = {}) => {

  _defaults(opt, { end, key })

  let midware = (req, res, next) => {
    let opt = midware._opt
    model.findOne(
      condSelector(req, res),
      opt.select,
      opt.options)
      .then(doc => {
        if (!doc && opt.end) throw new Error('document not found')
        if (doc && opt.populate) {
          return model.populate(doc, opt.populate)
        }
        return doc
      })
      .then(doc => {
        if (opt.end) return done(res, doc)
        if (opt.pass) return next(null, doc)
        res.locals[opt.key] = doc
        next(opt.next)
        return null
      })
      .catch(next)
  }

  midware._opt = opt
  return midware
}