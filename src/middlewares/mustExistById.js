'use strict'

const _defaults = require('lodash/defaults')
const { body } = require('../selector')
const { handlers: { error } } = require('..')

module.exports = (model, id = body('id'), opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result',
    document: false
  })

  return (req, res, next) => {
    model.findById(
      // Auto resolve id
      id(req, res),
      // Return all fields if document is true
      !opt.document && '+_id',
      // Options for model query
      opt.options)
      .then(doc => {
        if (!doc && opt.end) throw new Error('document must exist')
        res.locals[opt.key] = opt.document ? doc : !!doc
        next()
        return null
      })
      .catch(err => error(res, err))
  }

}