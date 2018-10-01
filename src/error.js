'use strict'

class LocalError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'MidooseError'
    this.code = code
  }
}

LocalError.codes = {
  ERR_DOC_MUST_NOT_EXIST: 'ERR_DOC_MUST_NOT_EXIST',
  ERR_DOC_MUST_EXIST: 'ERR_DOC_MUST_EXIST',
  ERR_DOC_NOT_FOUND: 'ERR_DOC_NOT_FOUND'
}

module.exports = LocalError