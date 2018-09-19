'use strict'

const _get = require('lodash/get')
const updateOne = require('./updateOne')

module.exports = (model, id = 'body.id', doc = {}, opt = {}) => {

  const isFunc = typeof id === 'function'

  return updateOne(
    model,
    (req, res) => {
      return {
        _id: (isFunc && id(req, res)) ||
          _get(req, id) ||
          _get(res, id)
      }
    },
    doc,
    opt
  )

}