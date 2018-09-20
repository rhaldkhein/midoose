'use strict'

const _defaults = require('lodash/defaults')
const { handlers: { done, error } } = require('..')

module.exports = (model, docsResolver, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result'
  })

  return (req, res, next) => {

    let docsNew = docsResolver(req, res)

    // Add more data to docs through options object
    if (opt.moreDocs) docsNew = opt.moreDocs(docsNew, req, res)

    // Trigger create
    model.create(docsNew, opt.options)
      .then(documents => {
        return opt.populate ?
          model.populate(documents, opt.populate) :
          documents
      })
      .then(documents => {
        if (opt.end) return done(res, documents)
        else res.locals[opt.key] = documents
        next(opt.next)
        return null
      })
      .catch(err => error(res, err))

  }

}