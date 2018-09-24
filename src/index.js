'use strict'

const _defaults = require('lodash.defaults')

/**
 * Enums
 */

exports.enums = {
  MIDDLEWARE: 1,
  SELECTOR: 2
}

/**
 * Default result handlers
 */


/**
 * Configuration
 */

exports.__CONFIG__ = {
  done: (res, payload) => { res.json(payload) },
  end: true,
  key: 'result'
}

exports.config = options => {
  exports.__CONFIG__ = _defaults(
    options,
    exports.__CONFIG__
  )
}