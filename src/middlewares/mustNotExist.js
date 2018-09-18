'use strict'

const _defaults = require('lodash/defaults')
const { handlers: { error }, evalProps } = require('..')

module.exports = (model, cond, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result',
    document: false
  })

  let isFunc = typeof cond === 'function'

  return (req, res, next) => {
    let evalCond = isFunc ? cond(req, res) : evalProps(cond, req, res)
    model.findOne(
      evalCond,
      '+_id',
      opt.options)
      .then(doc => {
        if (doc && opt.end) throw new Error('document must not exist')
        res.locals[opt.key] = opt.document ? doc : !doc
        next()
        return null
      })
      .catch(err => error(res, err))
  }
}