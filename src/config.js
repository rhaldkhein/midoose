'use strict'

const LocalError = require('./error')

/**
 * Configuration
 */

const defaultConfig = {
  done: (res, payload) => { res.json(payload) },
  end: true,
  key: 'result',
  error: LocalError
}

let config = {}

const set = options => {
  Object.assign(config, options)
}

set(defaultConfig)

module.exports = {
  config,
  set
}