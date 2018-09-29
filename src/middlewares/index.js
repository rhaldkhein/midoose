'use strict'

module.exports = {
  create: require('./create'),
  deleteById: require('./deleteById'),
  find: require('./find'),
  findById: require('./findById'),
  findOne: require('./findOne'),
  mustExist: require('./mustExist'),
  mustExistById: require('./mustExistById'),
  mustNotExist: require('./mustNotExist'),
  update: require('./update'),
  updateById: require('./updateById'),
  updateOne: require('./updateOne'),
  upsert: require('./upsert'),
  upsertOne: require('./upsertOne')
}