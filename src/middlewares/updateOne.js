'use strict'

const _defaults = require('lodash.defaults')
const { config } = require('../config')

module.exports = (model, condSelector, docSelector, opt = {}) => {

  _defaults(opt, { end: config.end, key: config.key })

  // Either return the document or the raw object
  let method = opt.document ? 'findOneAndUpdate' : 'updateOne'
  let isFuncOptions = typeof opt.options === 'function'

  let midware = (req, res, next) => {
    // Get data be placed
    let opt = midware._opt, docNew = docSelector(req, res)
    // Add more data to docs through options object
    if (opt.moreDoc) docNew = opt.moreDoc(docNew, req, res)
    // Trigger update
    model[method](
      // Criteria to find docs
      condSelector(req, res),
      docNew,
      isFuncOptions ? opt.options(req, res) : opt.options)
      .then(rawOrDocument => {
        if (opt.populate && opt.document) {
          return model.populate(rawOrDocument, opt.populate)
        }
        return rawOrDocument
      })
      .then(rawOrDocument => {
        if (opt.end) return config.done(res, rawOrDocument)
        if (opt.pass) return next(null, rawOrDocument)
        res.locals[opt.key] = rawOrDocument
        next(opt.next)
        return null
      })
      .catch(next)
  }

  midware._opt = opt
  return midware
}