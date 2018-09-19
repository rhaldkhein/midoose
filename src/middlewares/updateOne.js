'use strict'

const _defaults = require('lodash/defaults')
const {
  handlers: { done, error },
} = require('..')

module.exports = (model, cond, fields, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result'
  })

  return (req, res, next) => {
    // Get data be placed
    let docNew = fields(req, res)
    // Add more data to docs through options object
    if (opt.moreDoc) docNew = opt.moreDoc(docNew, req, res)
    // Trigger create
    model.updateOne(
      // Criteria to find docs
      cond(req, res),
      docNew,
      opt.options)
      .then(documents => {
        if (opt.populate) {
          return model.populate(documents, opt.populate)
        }
        return documents
      })
      .then(documents => {
        if (opt.end) return done(res, documents)
        else res.locals[opt.key] = documents
        next()
        return null
      })
      .catch(err => error(res, err))

  }

}