'use strict'

const _defaults = require('lodash.defaults')
const { handlers: { done } } = require('..')

module.exports = (model, condSelector, docSelector, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result'
  })

  return (req, res, next) => {
    // Get data be placed
    let docNew = docSelector(req, res)
    // Add more data to docs through options object
    if (opt.moreDoc) docNew = opt.moreDoc(docNew, req, res)
    // throw new Error('Test')
    // Trigger create
    model.updateOne(
      // Criteria to find docs
      condSelector(req, res),
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
        next(opt.next)
        return null
      })
      .catch(next)

  }

}