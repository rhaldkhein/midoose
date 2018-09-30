'use strict'

const _defaults = require('lodash.defaults')
const { config } = require('../config')

/**
 * Creates a delete middleware. Gets the ID from selector. 
 * 
 * Basic Usage: `/user/123456`
 * 
 *    const router = express.Router()
 *    const deleteById = require(...)
 * 
 *    router.delete(
 *          '/user/:id', 
 *           deleteById(ModelUser, params('id')),
 *           ... )
 * 
 * 
 * @param {Object} model  - Mongoose model to delete from
 * 
 * @param {Selector} idSelector   - Optional. Selector function
 * 
 * @param {Object} opt    - Optional. Options object
 * 
 *  end {Boolean}     - Ends the middleware chain, will NOT trigger next()
 *                      but will trigger global `end` handler
 * 
 *  key {String}      - The property name to attach the result to `res.locals`
 *                      for next middleware to access
 * 
 *  options {Object}  - Mongoose `options` argument for `findByIdAndDelete`
 * 
 */
module.exports = (model, idSelector, opt = {}) => {

  _defaults(opt, { end: config.end, key: config.key })
  let isFuncOptions = typeof opt.options === 'function'

  let midware = (req, res, next) => {

    let opt = midware._opt

    model.findByIdAndDelete(
      idSelector(req, res),
      isFuncOptions ? opt.options(req, res) : opt.options)
      .then(doc => {
        if (!opt.document) doc = true
        if (opt.end) return config.done(res, doc)
        if (opt.pass) return next(null, doc)
        res.locals[opt.key] = doc
        next(opt.next)
        return null
      })
      .catch(next)

  }

  midware._opt = opt
  return midware
}