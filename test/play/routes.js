'use strict'

/* eslint no-unused-vars: "off" */

// const update = require('../../src/middlewares/update')
// const updateById = require('../../src/middlewares/updateById')
// const updateOne = require('../../src/middlewares/updateOne')
// const create = require('../../src/middlewares/create')
// const mustNotExist = require('../../src/middlewares/mustNotExist')
// const find = require('../../src/middlewares/find')
// const { body, query, raw } = require('../../src/selector')

const {
  end,
  update,
  updateById,
  updateOne,
  create,
  mustNotExist,
  find,
  body,
  query,
  locals,
  raw,
  combine
} = require('../../src')

module.exports = app => {

  app.get('/', (req, res) => res.json({ message: 'Hello World!' }))

  app.post('/user',

    mustNotExist(Model.User, body(['email'])),

    create(Model.User, body(['email', 'password']), {
      end: false,
      key: 'user'
    }),

    create(Model.Post, combine(
      body(['title', 'published']),
      locals({ user: 'user._id' })
    ), { end: false }),

    // End and series and send the user, instead of post
    end(locals('user'))
  )

  app.post('/promise/user',
    (req, res, next) => {
      Model.User.where({ email: req.body.email }).exists()
        .then(doc => {
          if (doc) throw new Error('already exist')
          return Model.User.create({
            email: req.body.email,
            password: req.body.password
          })
        })
        .then(doc => {
          return Model.Post.create({
            user: doc.id,
            title: req.body.title,
            published: req.body.published
          }).return(doc)
        })
        .then(doc => res.json(doc))
        .catch(next)
    }
  )

  app.post('/async/user',
    async (req, res, next) => {
      try {
        let exists = await Model.User.where({ email: req.body.email }).exists()
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

  app.get('/post',
    find(
      Model.Post,
      raw({}),
      {
        options: query(['limit', 'skip'])
      }
    )
  )

  app.put('/post/one',
    updateOne(
      Model.Post,
      body({ _id: 'id' }),
      body(['title', 'published']),
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
        .then(doc => Model.Post.populate(doc, 'user'))
        .then(doc => res.json(doc))
        .catch(next)
    }
  )

  app.get('/plugin/post',
    Model.Post.midoose().find(raw({ published: true }))
  )

  app.use(function (err, req, res, next) {
    // console.error(err.message)
    res.status(500).json(err)
  })

}