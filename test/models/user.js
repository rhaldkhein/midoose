'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({

  name: String,

  age: Number,

  active: Boolean,

  country: String

})

module.exports = mongoose.model('User', schema)