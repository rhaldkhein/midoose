'use strict'

const _defaults = require('lodash.defaults')
const { config } = require('../config')

module.exports = (model, docsSelector, opt = {}) => {

  _defaults(opt, { end: config.end, key: config.key })
  let isFuncOptions = typeof opt.options === 'function'

  let midware = (req, res, next) => {

    let opt = midware._opt, docsNew = docsSelector(req, res)

    // Add more data to docs through options object
    if (opt.moreDocs) docsNew = opt.moreDocs(docsNew, req, res)

    // Trigger create
    model.create(
      docsNew,
      isFuncOptions ? opt.options(req, res) : opt.options)
      .then(documents => {
        return opt.populate ?
          model.populate(documents, opt.populate) :
          documents
      })
      .then(documents => {
        if (opt.end) return config.done(res, documents)
        // If `opt.pass` is true, the `next` is a callback 
        // like `callback(err, payload)` and not Express next
        if (opt.pass) return next(null, documents)
        res.locals[opt.key] = documents
        next(opt.next)
        return null
      })
      .catch(next)

  }

  midware._opt = opt
  return midware

}