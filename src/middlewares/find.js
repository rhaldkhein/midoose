'use strict'

const _defaults = require('lodash/defaults')
const { raw } = require('../selector')
const { handlers: { done, error } } = require('..')

/**
 * Creates a findAll middleware. 
 * 
 * Basic Usage: `/users`
 * 
 *    const router = express.Router()
 *    const findAll = require(...)
 * 
 *    router.get(
 *          '/user', 
 *           findAll(ModelUser, { active: true }),
 *           ... )
 * 
 * 
 * @param {Object} model  
 *  - Mongoose model to find from
 * 
 * @param {Selector} condSelector   
 *  - Optional. Selector function that resolves to condition
 * 
 * @param {Object} opt    
 *  - Optional. Options object
 * 
 *  end {Boolean}     - Ends the middleware chain, will NOT trigger next()
 *                      but will trigger global `done` handler
 * 
 *  key {String}      - The property name to attach the result to `res.locals`
 *                      for next middleware to access
 *  
 *  select {S|O}      - Mongoose `projection` argument for `find`
 * 
 *  populate {Object} - Mongoose `options` argument for `Model.populate()` method
 *                      https://mongoosejs.com/docs/api.html#model_Model.populate
 * 
 *  map {Function}    - Maps the results
 * 
 *  options {Object}  - Mongoose `options` argument for `find`
 * 
 */
module.exports = (model, condSelector = raw({}), opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result'
  })

  return (req, res, next) => {
    model.find(
      condSelector(req, res),
      opt.select,
      opt.options)
      .then(docs => {
        if (opt.populate) {
          return model.populate(docs, opt.populate)
        }
        return docs
      })
      .then(docs => opt.map ? docs.map(opt.map) : docs)
      .then(docs => {
        if (opt.end) return done(res, docs)
        else res.locals[opt.key] = docs
        next()
        return null
      })
      .catch(err => error(res, err))
  }
}