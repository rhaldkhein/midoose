'use strict'

const _defaults = require('lodash/defaults')
const { body } = require('../selector')
const { handlers: { done, error } } = require('..')

/**
 * Creates a findById middleware. 
 * 
 * Basic Usage: `/users/123`
 * 
 *    const router = express.Router()
 *    const findById = require(...)
 * 
 *    router.get(
 *          '/users/:id', 
 *           findById(ModelUser),
 *           ... )
 * 
 * 
 * @param {Object} model  
 *  - Mongoose model to find from
 * 
 * @param {Selector} idSelector   
 *  - Optional. Selector function
 * 
 * @param {Object} opt    
 *  - Optional. Options object
 * 
 *  end {Boolean}     - Ends the middleware chain if true, will NOT trigger next()
 *                      but will trigger global `done` handler if document exists
 *                      or trigger global `error` handler if error occured
 * 
 *  key {String}      - The property name to attach the result to `res.locals`
 *                      for next middleware to access
 *  
 *  select {S|O}      - Mongoose `projection` argument for `find`
 * 
 *  populate {Object} - Mongoose `options` argument for `Model.populate()` method
 *                      https://mongoosejs.com/docs/api.html#model_Model.populate
 * 
 *  options {Object}  - Mongoose `options` argument for `findById`
 * 
 */
module.exports = (model, idSelector = body('id'), opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result'
  })

  return (req, res, next) => {
    model.findById(
      idSelector(req, res),
      opt.select,
      opt.options)
      .then(doc => {
        if (!doc && opt.end) throw new Error('document not found')
        if (doc && opt.populate) {
          return model.populate(doc, opt.populate)
        }
        return doc
      })
      .then(doc => {
        if (opt.end) return done(res, doc)
        else res.locals[opt.key] = doc
        next()
        return null
      })
      .catch(err => error(res, err))
  }

}