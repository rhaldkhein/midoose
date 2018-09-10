'use strict'

const _get = require('lodash/get')
const _defaults = require('lodash/defaults')

module.exports = (model, id = 'body.id', opt = {}) => {
  _defaults(opt, {
    key: 'result'
  })
  let _isFunc = typeof id === 'function'
  return (req, res, next) => {
    let _id = _isFunc ? id(req, res) :
      req.params.id || req.body.id || _get(req, id)
    model.findById(_id, '+_id', opt.options)
      .then(doc => {
        if (!doc) throw Code.error('EANF')
        res.locals[opt.key] = _id
        next()
        return null
      })
      .catch(err => res.jsonError(err))
  }
}