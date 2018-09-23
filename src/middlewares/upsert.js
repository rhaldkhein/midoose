'use strict'

const _defaults = require('lodash/defaults')
const update = require('./update')

module.exports = (model, condSelector, docSelector, opt = {}) => {

  _defaults(opt, {
    options: { upsert: true }
  })

  return update(
    model,
    condSelector,
    docSelector,
    opt
  )

}