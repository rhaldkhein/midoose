'use strict'

const _defaults = require('lodash.defaults')
const { config } = require('../config')
const Error = require('../error')

module.exports = (model, condSelector, opt = {}) => {

  _defaults(opt, { end: config.end, key: config.key })
  let isFuncOptions = typeof opt.options === 'function'

  let midware = (req, res, next) => {
    let opt = midware._opt
    model.findOne(
      condSelector(req, res),
      opt.select,
      isFuncOptions ? opt.options(req, res) : opt.options)
      .then(doc => {
        if (!doc && opt.end) throw new Error('document not found', Error.ERR_DOC_NOT_FOUND)
        if (doc && opt.populate) {
          return model.populate(doc, opt.populate)
        }
        return doc
      })
      .then(doc => {
        if (opt.end) return config.done(res, doc)
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