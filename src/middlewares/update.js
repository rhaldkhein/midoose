'use strict'

const _pick = require('lodash/pick')
const _defaults = require('lodash/defaults')
const { done, error } = require('..')

module.exports = (model, cond, doc, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result',
    from: 'body'
  })

  let isFunc = typeof docs === 'function'

  return (req, res, next) => {

    // Get docs data
    let docs = isFunc ? docs(req, res) : _pick(req[opt.from], docs)

    // Add more data to docs through options object
    if (opt.moreDocs) docs = opt.moreDocs(docs, req, res)

    // Trigger create
    model.update(docs, opt.options)
      .then(docs => {
        if (opt.populate) {
          if (Array.isArray(docs)) {
            return model.populate(docs, opt.populate)
          } else {
            return docs.populate(opt.populate).execPopulate()
          }
        }
        return docs
      })
      .then(docs => {
        if (opt.end) return done(res, docs)
        else res.locals[opt.key] = docs
        next()
        return null
      })
      .catch(err => error(res, err))

  }

}