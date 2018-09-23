'use strict'

/**
 * Enums
 */

exports.enums = {
  MIDDLEWARE: 1,
  SELECTOR: 2,
}

/**
 * Default result handlers
 */

exports.handlers = {
  done: (res, payload) => { res.json(payload) },
  error: (res, err) => { res.status(400).json(err) }
}