'use strict'

const _get = require('lodash/get')
const _defaults = require('lodash/defaults')
const {
  handlers: { done, error }
} = require('..')

/**
 * Creates a delete middleware. Gets the ID from `req.params.id` or `req.body.id`
 * or by specifying the second param as function that returns the ID. 
 * 
 * Basic Usage: `/user/123456`
 * 
 *    const router = express.Router()
 *    const deleteById = require(...)
 * 
 *    router.delete(
 *          '/user/:id', 
 *           deleteById(ModelUser),
 *           ... )
 * 
 * 
 * @param {Object} model  - Mongoose model to delete from
 * 
 * @param {F|S} id        - Optional. Custom function to get the id or a string to resolve
 *                          from req or res object. If not specified, it will try to get 
 *                          from `req.body.id`
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
module.exports = (model, id = 'body.id', opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result'
  })

  const isFunc = typeof id === 'function'

  return (req, res, next) => {
    model.findByIdAndDelete(
      (isFunc && id(req, res)) ||
      _get(req, id) ||
      _get(res, id),
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