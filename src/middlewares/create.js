'use strict'

const _pick = require('lodash/pick')
const _defaults = require('lodash/defaults')
const { handlers: { done, error } } = require('..')

module.exports = (model, docs, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result',
    from: 'body'
  })

  let isFunc = typeof docs === 'function'

  return (req, res, next) => {

    // Get docs data
    let docsRaw = isFunc ? docs(req, res) : _pick(req[opt.from], docs)

    // Add more data to docs through options object
    if (opt.moreDocs) docsRaw = opt.moreDocs(docsRaw, req, res)

    // Trigger create
    model.create(docsRaw, opt.options)
      .then(documents => {
        if (opt.populate) {
          if (Array.isArray(documents)) {
            return model.populate(documents, opt.populate)
          } else {
            return documents.populate(opt.populate).execPopulate()
          }
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