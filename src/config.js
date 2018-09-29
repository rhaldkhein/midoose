'use strict'

/**
 * Configuration
 */

const defaultConfig = {
  done: (res, payload) => { res.json(payload) },
  end: true,
  key: 'result'
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