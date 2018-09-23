'use strict'

const _defaults = require('lodash.defaults')
const { handlers: { error } } = require('..')

module.exports = (model, condSelector, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result',
    document: false
  })

  return (req, res, next) => {
    model.findOne(
      condSelector(req, res),
      !opt.document && '+_id',
      opt.options)
      .then(doc => {
        if (doc && opt.end) throw new Error('document must not exist')
        res.locals[opt.key] = opt.document ? doc : !doc
        next(opt.next)
        return null
      })
      .catch(err => error(res, err))
  }

}