'use strict'

const _defaults = require('lodash/defaults')
const { handlers: { done, error }, evalProps } = require('..')

module.exports = (model, cond, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result'
  })

  const isFunc = typeof cond === 'function'

  return (req, res, next) => {
    model.findOne(
      isFunc ? cond(req, res) : evalProps(cond, req, res),
      opt.select,
      opt.options)
      .then(doc => {
        if (!doc && opt.end) throw new Error('Document not found')
        if (doc && opt.populate) {
          return doc
            .populate(opt.populate)
            .execPopulate()
            .return(doc)
        }
        return doc
      })
      .then(doc => {
        if (opt.end) return done(res, doc)
        else res.locals[opt.key] = doc
        next()
        return null
      })
      .catch(err => error(res, err))
  }

}