'use strict'

const update = require('../../src/middlewares/update')
const updateById = require('../../src/middlewares/updateById')
const updateOne = require('../../src/middlewares/updateOne')
const { body } = require('../../src')

module.exports = app => {

  app.get('/', (req, res) => res.json({ message: 'Hello World!' }))

  app.post('/update',
    update(
      Model.Post,
      body({ published: 'publish' }), // Resolves to { published: req.body.publish }
      body(['title']) // Resolves to { title: req.body.title }
    )
  )

  app.post('/update/id',
    updateById(
      Model.Post,
      body('id'), // Resolves to value of `body.id`
      body(['title', 'published'])
    )
  )

  app.post('/update/one',
    updateOne(
      Model.Post,
      body({ _id: 'id' }),
      body(['title', 'published']) // Resolves to { title: req.body.title, ... }
    )
  )


}

/*

// Returns new object with resolved data

body({
  // key: <req.body.published>
  publish: 'published'
})

*/