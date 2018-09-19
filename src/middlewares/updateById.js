'use strict'

const updateOne = require('./updateOne')

module.exports = (model, id, fields, opt = {}) => {

  return updateOne(
    model,
    (req, res) => ({ _id: id(req, res) }),
    fields,
    opt
  )

}