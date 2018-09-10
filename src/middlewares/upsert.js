'use strict'

const _pick = require('lodash/pick')
const _defaults = require('lodash/defaults')

function updatedFields(res) {
  return {
    date_updated: Date.now(),
    updated_by: res.locals.user.id
  }
}

module.exports = (model, fields, opt = {}) => {
  _defaults(opt, {
    id: true,
    send: true,
    updated: true,
    key: 'result'
  })
  // Precheck function
  let _isFunc = typeof fields === 'function'
  // Return middleware function
  return (req, res, next) => {
    // Setup
    let _fields = _isFunc ? fields(req, res) : _pick(req.body, fields)
    let _prom = _fields.then ? _fields : Promise.resolve().return(_fields)
    // Chain promise
    _prom
      .then(_fields => {
        return model.findById(opt.id ? req.params.id || req.body.id : null)
          .then(doc => {
            let data = {
              // Selected fields from body
              ...(_fields),
              // Update meta
              ...(opt.updated ? updatedFields(res) : null),
              ...(opt.moreFields ? opt.moreFields(req, res) : null)
            }
            if (doc) {
              // Update, return updated version
              return doc.update(data).exec().then(() => model.findById(doc.id))
            } else {
              // Create
              return model.create(data)
            }
          })
      })
      .then(doc => {
        if (opt.populate) {
          return doc.populate(opt.populate).execPopulate()
        }
        return doc
      })
      .then(doc => {
        if (opt.send) return res.jsonSuccess(doc)
        else res.locals[opt.key] = doc
        next()
        return null
      })
      .catch(err => res.jsonError(err))
  }
}