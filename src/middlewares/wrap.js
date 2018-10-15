'use strict'

const _defaults = require('lodash.defaults')
const { config } = require('../config')

module.exports = (middleware, opt = {}) => {

  _defaults(opt, { end: config.end, key: config.key })

  let midware = (req, res, next) => {

    let mw, opt = midware._opt, cb = result => {
      if (opt.end) return config.done(res, result)
      if (opt.pass) return next(null, result)
      res.locals[opt.key] = result
      next(opt.next)
      return null
    }

    try {
      mw = middleware(req, res)
    } catch (err) {
      next(err)
      return
    }

    if (mw && mw.then) mw.then(cb).catch(next)
    else cb(mw)

  }

  midware._opt = opt
  return midware
}