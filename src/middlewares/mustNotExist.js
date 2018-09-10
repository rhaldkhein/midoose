'use strict'

const { hydrateObject } = require('../../utils/helpers')
const _defaults = require('lodash/defaults')

module.exports = (model, cond, opt = {}) => {
  _defaults(opt, {
    key: 'result'
  })
  let _isFunc = typeof cond === 'function'
  return (req, res, next) => {
    let _cond = _isFunc ? cond(req, res) : hydrateObject(cond, req, res)
    model.findOne(_cond, '+_id', opt.options)
      .then(doc => {
        if (doc) throw Code.error('EAAX')
        res.locals[opt.key] = _cond
        next()
        return null
      })
      .catch(err => res.jsonError(err))
  }
}