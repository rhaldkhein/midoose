'use strict'

const _get = require('lodash/get')
const _defaults = require('lodash/defaults')
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
 * @param {Object|Function} id   
 *  - Optional. Custom function to get the id or a string to resolve from req or 
 *    res object. If not specified, it will try to get from `req.body.id`
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
module.exports = (model, id = 'body.id', opt = {}) => {

  _defaults(opt, {
    end: true,
    key: 'result'
  })

  const isFunc = typeof id === 'function'

  return (req, res, next) => {
    model.findById(
      (isFunc && id(req, res)) ||
      _get(req, id) ||
      _get(res, id),
      opt.select,
      opt.options)
      .then(doc => {
        if (!doc && opt.end) throw new Error('Document not found')
        if (doc && opt.populate) {
          return doc
            .populate(opt.populate)
            .execPopulate()
            .return(doc)
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