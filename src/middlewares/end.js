'use strict'

const { config } = require('../config')

module.exports = (selector, opt = {}) => {

  let midware = (req, res) => {
    config.done(res, selector(req, res))
  }

  midware._opt = opt
  return midware
}