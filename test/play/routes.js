'use strict'

/* 
  eslint 
  no-unused-vars: "off",
  no-console: "off" 
*/

const {
  end,
  deleteAll,
  deleteById,
  update,
  updateById,
  updateOne,
  create,
  mustExist,
  mustExistById,
  mustNotExist,
  find,
  body,
  query,
  locals,
  raw,
  combine,
  catchError
} = require('../../src')



module.exports = app => {

  app.get('/', (req, res) => res.json({ message: 'Hello World!' }))

  app.delete('/post',
    mustExistById(Model.Post, raw('5ba2402fd506d14586b871d6')),
    deleteById(Model.Post, raw('5ba2402fd506d14586b871d6'))
  )

  app.post('/user',
    mustNotExist(Model.User, body(['email'])),
    create(Model.User,
      body(['email', 'password']),
      { end: false, key: 'user' }
    ),
    create(Model.Post,
      combine(
        body(['title', 'published']),
        locals({ user: 'user._id' })
      ),
      { end: false }
    ),
    catchError(deleteAll(Model.User, body(['email']))),
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
        .catch(err => {
          Model.User.deleteOne({ email: req.body.email })
          next(err)
        })
    }
  )

  app.post('/async/user',
    async (req, res, next) => {
      try {
        let exists = await Model.User.where({ email: req.body.email }).exists()
        if (exists) throw new Error('already exist')
        let user = await Model.User.create({
          email: req.body.email,
          password: req.body.password
        })
        await Model.Post.create({
          user: user.id,
          title: req.body.title,
          published: req.body.published
        })
        res.json(user)
      } catch (error) {
        Model.User.deleteOne({ email: req.body.email })
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
    console.error(err.message)
    res.status(500).json(err)
  })

}