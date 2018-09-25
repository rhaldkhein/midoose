'use strict'

/* eslint no-unused-vars: "off" */

const update = require('../../src/middlewares/update')
const updateById = require('../../src/middlewares/updateById')
const updateOne = require('../../src/middlewares/updateOne')
const create = require('../../src/middlewares/create')
const mustNotExist = require('../../src/middlewares/mustNotExist')
const { body } = require('../../src/selector')

module.exports = app => {

  app.get('/', (req, res) => res.json({ message: 'Hello World!' }))

  app.post('/user',
    mustNotExist(Model.User, body(['email'])),
    create(Model.User, body(['email', 'password']))
  )

  app.post('/promise/user',
    (req, res, next) => {
      Model.User.findOne({ email: req.body.email })
        .exec()
        .then(doc => {
          if (doc) throw new Error('already exist')
          return Model.User.create({
            email: req.body.email,
            password: req.body.password
          })
        })
        .then(doc => res.json(doc))
        .catch(next)
    }
  )

  app.post('/async/user',
    async (req, res, next) => {
      try {
        let exists = await Model.User.findOne({ email: req.body.email })
        if (exists) throw new Error('already exist')
        let doc = await Model.User.create({
          email: req.body.email,
          password: req.body.password
        })
        res.json(doc)
      } catch (error) {
        next(error)
      }
    }
  )

  app.put('/post/one',
    updateOne(
      Model.Post,
      body({ _id: 'id' }),
      body(['title', 'published']), // Resolves to { title: req.body.title, ... }
      {
        document: true,
        populate: 'user',
        options: { new: true }
      }
    )
  )

  app.put('/old/post/one',
    (req, res, next) => {
      Model.Post.findOneAndUpdate(
        { _id: req.body.id },
        { title: req.body.title, published: req.body.published },
        { new: true })
        .exec()
        .then(doc => res.json(doc))
        .catch(next)
    }
  )

  app.use(function (err, req, res, next) {
    // console.error(err.message)
    res.status(500).json(err)
  })

}

/*

// Returns new object with resolved data

body({
  // key: <req.body.published>
  publish: 'published'
})

*/