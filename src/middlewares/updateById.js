'use strict'

const updateOne = require('./updateOne')

module.exports = (model, idSelector, valueSelector, opt = {}) => {

  return updateOne(
    model,
    (req, res) => ({ _id: idSelector(req, res) }),
    valueSelector,
    opt
  )

}