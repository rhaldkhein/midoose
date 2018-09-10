'use strict'

const _defaults = require('lodash/defaults')

module.exports = (model, opt = {}) => {
  _defaults(opt, {
    send: true,
    key: 'result'
  })
  return (req, res, next) => {
    model.findById(
      req.params.id,
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