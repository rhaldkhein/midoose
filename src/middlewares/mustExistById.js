'use strict'

const _defaults = require('lodash.defaults')
const { __CONFIG__: { end, key } } = require('..')

module.exports = (model, id, opt = {}) => {

  _defaults(opt, {
    end: end,
    key: key,
    document: false
  })

  let midware = (req, res, next) => {
    let opt = midware._opt
    model.findById(
      // Auto resolve id
      id(req, res),
      // Return all fields if document is true
      !opt.document && '+_id',
      // Options for model query
      opt.options)
      .then(doc => {
        if (!doc && opt.end) throw new Error('document must exist')
        res.locals[opt.key] = opt.document ? doc : !!doc
        next(opt.next)
        return null
      })
      .catch(next)
  }

  midware._opt = opt
  return midware
}