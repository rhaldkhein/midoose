'use strict'

const _get = require('lodash/get')
const _defaults = require('lodash/defaults')
const { handlers: { error } } = require('..')

module.exports = (model, id = 'body.id', opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result',
    document: false
  })

  let isFunc = typeof id === 'function'

  return (req, res, next) => {
    model.findById(
      (isFunc && id(req, res)) ||
      _get(req, id) ||
      _get(res, id),
      '+_id',
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