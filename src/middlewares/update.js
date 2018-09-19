'use strict'

const _pick = require('lodash/pick')
const _defaults = require('lodash/defaults')
const {
  handlers: { done, error },
  evalProps
} = require('..')

module.exports = (model, cond, doc, opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result',
    from: 'body'
  })

  let isFuncCond = typeof cond === 'function'
  let isFuncDoc = typeof doc === 'function'

  return (req, res, next) => {

    // Get data be placed
    let docNew = isFuncDoc ? doc(req, res) : _pick(req[opt.from], doc)

    // Add more data to docs through options object
    if (opt.moreDoc) docNew = opt.moreDoc(docNew, req, res)

    // Trigger create
    model.updateMany(
      // Criteria to find docs
      isFuncCond ? cond(req, res) : evalProps(cond, req, res),
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