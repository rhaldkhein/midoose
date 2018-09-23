'use strict'

const _defaults = require('lodash/defaults')
const updateOne = require('./updateOne')

module.exports = (model, condSelector, docSelector, opt = {}) => {

  _defaults(opt, {
    options: { upsert: true }
  })

  return updateOne(
    model,
    condSelector,
    docSelector,
    opt
  )

}