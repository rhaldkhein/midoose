'use strict'

const _partial = require('lodash.partial')
const _mapValues = require('lodash.mapvalues')
const config = require('./config')
const selectors = require('./selector')
const combine = require('./combine')
const catchError = require('./catchError')
const middlewares = require('./middlewares')

/**
 * Mongoose plugin
 */

let partialed

function plugin(schema) {
  schema.static(
    'midoose',
    function () {
      if (!partialed) {
        partialed = _mapValues(
          middlewares,
          value => _partial(value, this)
        )
      }
      return partialed
    }
  )
}

/**
 * Exports
 */

module.exports = Object.assign(plugin, {
  ...middlewares,
  ...selectors,
  combine,
  catchError,
  config: config.set
})