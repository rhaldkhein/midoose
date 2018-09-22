'use strict'

const _defaults = require('lodash/defaults')
const { body } = require('../selector')
const { handlers: { done, error } } = require('..')

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
module.exports = (model, idSelector = body('id'), opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result'
  })

  return (req, res, next) => {
    model.findByIdAndDelete(
      idSelector(req, res),
      opt.options)
      .exec()
      .then(doc => {
        if (opt.end) return done(res, doc)
        else res.locals[opt.key] = doc
        next()
        return null
      })
      .catch(err => error(res, err))
  }

}