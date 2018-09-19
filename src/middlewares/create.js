'use strict'

const _pick = require('lodash/pick')
const _defaults = require('lodash/defaults')
const { handlers: { done, error } } = require('..')

module.exports = (model, fields, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result',
    from: 'body'
  })

  let isFunc = typeof fields === 'function'

  return (req, res, next) => {

    // Get single or multiple docs data
    let docsNew = isFunc ? fields(req, res) : _pick(req[opt.from], fields)

    // Add more data to docs through options object
    if (opt.moreDocs) docsNew = opt.moreDocs(docsNew, req, res)

    // Trigger create
    model.create(docsNew, opt.options)
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