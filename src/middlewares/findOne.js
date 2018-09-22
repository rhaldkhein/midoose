'use strict'

const _defaults = require('lodash/defaults')
const { raw } = require('../selector')
const { handlers: { done, error } } = require('..')

module.exports = (model, condSelector = raw({}), opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result'
  })

  return (req, res, next) => {
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
        else res.locals[opt.key] = doc
        next()
        return null
      })
      .catch(err => error(res, err))
  }

}