'use strict'

const _defaults = require('lodash/defaults')
const { hydrateObject } = require('../../utils/helpers')

module.exports = (model, cond, opt = {}) => {
  _defaults(opt, {
    key: 'result'
  })
  let _isFunc = typeof cond === 'function'
  return (req, res, next) => {
    let _cond = _isFunc ? cond(req, res) : hydrateObject(cond, req, res)
    model.findOne(_cond, opt.options)
      .then(doc => {
        if (!doc) throw Code.error('EANF')
        res.locals[opt.key] = doc.id
        next()
        return null
      })
      .catch(err => res.jsonError(err))
  }
}