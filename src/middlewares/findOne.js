'use strict'

const _defaults = require('lodash/defaults')
const { hydrateObject } = require('../../utils/helpers')

module.exports = (model, cond, opt = {}) => {
  _defaults(opt, {
    send: true,
    key: 'result'
  })
  const _isFunc = typeof cond === 'function'
  return (req, res, next) => {
    model.findOne(
      _isFunc ? cond(req, res) : hydrateObject(cond, req, res),
      opt.select,
      opt.options)
      .then(doc => {
        if (!doc) throw Code.error('EANF')
        if (opt.populate) {
          return doc
            .populate(opt.populate)
            .execPopulate()
            .return(doc)
        }
        return doc
      })
      .then(doc => {
        if (opt.send) return res.jsonSuccess(doc)
        else res.locals[opt.key] = doc
        next()
        return null
      })
      .catch(err => res.jsonError(err))
  }
}