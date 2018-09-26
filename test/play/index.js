'use strict'

/* eslint-disable no-console */

// Connect to DB
const mongoose = require('mongoose')
const express = require('express')
const bodyparser = require('body-parser')
const queryparser = require('express-query-int')
const app = express()
const port = 3000

require('../models')

app.use(bodyparser.json())
app.use(queryparser())
app.use(
  bodyparser.urlencoded({
    extended: true
  })
)

require('./routes')(app)

mongoose.connect(
  'mongodb://localhost/midoose',
  { useNewUrlParser: true })
  .then(() => {
    console.log('Database Connected')
    Model.User.find({})
      .then(users => {
        if (users.length) throw new Error()
      })
      .then(() => Model.User.deleteMany({}).exec())
      .then(() => Model.Post.deleteMany({}).exec())
      .then(() => Model.User.create([
        { email: 'foo@gmail.com', password: '123', name: 'FooUser', country: 'US', age: 1, active: true },
        { email: 'bar@gmail.com', password: '123', name: 'BarUser', country: 'AE', age: 2, active: false },
        { email: 'baz@gmail.com', password: '123', name: 'BazUser', country: 'US', age: 2, active: true },
        { email: 'zap@gmail.com', password: '123', name: 'ZapUser', country: 'AE', age: 3, active: false }
      ]))
      .then(users => Model.Post.create([
        { user: users[0]._id, title: 'FooPost', published: true },
        { user: users[0]._id, title: 'BarPost', published: false },
        { user: users[1]._id, title: 'BazPost', published: true },
        { user: users[2]._id, title: 'ZapPost', published: false },
        { user: users[2]._id, title: 'JazPost', published: true },
        { user: users[2]._id, title: 'GalPost', published: true },
        { user: users[3]._id, title: 'FaaPost', published: false },
        { user: users[3]._id, title: 'YooPost', published: true }
      ]))
      .then(() => {
        throw new Error()
      })
      .catch(() => {
        app.listen(port, () => console.log(`Server Running @ localhost:${port}`))
      })
  })