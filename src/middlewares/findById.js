'use strict'

const _defaults = require('lodash.defaults')
const { config } = require('../config')
const Error = require('../error')

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
module.exports = (model, idSelector, opt = {}) => {

  _defaults(opt, { end: config.end, key: config.key })
  let isFuncOptions = typeof opt.options === 'function'

  let midware = (req, res, next) => {
    let opt = midware._opt
    model.findById(
      idSelector(req, res),
      opt.select,
      isFuncOptions ? opt.options(req, res) : opt.options)
      .then(doc => {
        if (!doc && opt.end) throw new Error('document not found', Error.ERR_DOC_NOT_FOUND)
        if (doc && opt.populate) {
          return model.populate(doc, opt.populate)
        }
        return doc
      })
      .then(doc => {
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