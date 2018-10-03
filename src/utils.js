'use strict'

const _isMatch = require('lodash.ismatch')

exports.isMatchIn = (target, sources) => {
  if (!Array.isArray(sources)) return _isMatch(target, sources)
  for (let i = sources.length - 1; i > -1; i--)
    if (_isMatch(target, sources[i])) return true
  return false
}