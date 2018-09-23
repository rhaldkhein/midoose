'use strict'

const _defaults = require('lodash/defaults')
const { handlers: { error } } = require('..')

module.exports = (model, condSelector, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result',
    document: false
  })

  return (req, res, next) => {
    model.findOne(
      // Auto resolve condition
      condSelector(req, res),
      // Return all fields if document is true
      !opt.document && '+_id',
      // Options for model query
      opt.options)
      .then(doc => {
        if (!doc && opt.end) throw new Error('document must exist')
        res.locals[opt.key] = opt.document ? doc : !!doc
        next(opt.next)
        return null
      })
      .catch(err => error(res, err))
  }

}