'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({

  title: String,

  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  published: Boolean

})

module.exports = mongoose.model('Post', schema)