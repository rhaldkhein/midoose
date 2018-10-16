# Midoose
Composable utility middlewares for Mongoose + Express API  

[![Build Status](https://travis-ci.org/rhaldkhein/midoose.svg?branch=master)](https://travis-ci.org/rhaldkhein/midoose) [![Coverage Status](https://coveralls.io/repos/github/rhaldkhein/midoose/badge.svg?branch=master)](https://coveralls.io/github/rhaldkhein/midoose?branch=master)

#### Objectives

- Readable and clean code
- Faster API creation
- Composable middlewares
- Auto error handling
- Parallel middleware execution

#### Prerequisites

- [Express](http://expressjs.com/) (4.x)
- [Mongoose](https://mongoosejs.com/) (5.x)

#### Installation

`npm install midoose`

#### Table of Contents

- [Selectors](#selectors)
- [Middleware Creators](#middleware-creators)
- [Error Handlers](#error-handlers)
- [Combine](#combine)
- [Options](#options)

### Basic Usage

```javascript
// Setup Express and Mongoose
const express = require('express')
const mongoose = require('mongoose')
const app = express()
...

// Import model
const User = require('./models/user')

// Select some middlewares and selectors to use
const {  create, mustNotExist, body } = require('midoose')

// Compose your API route. A very basic composition of middlewares
app.post('/api/user',
  mustNotExist(User, body(['email'])), 
  create(User, body(['email', 'password'])) 
)

// More routes
...
```



# Selectors

Selectors are functions that resolves an argument (string, array, object) to values from `req` and `res`. Designed for use in Middleware Creators.

### body(any)

Select and get values from `req.body`.

```javascript
const { body } = require('midoose')
// Sample req.body data from Express: { name: 'Foo', pass: 'Bar', age: 80 }

// Resolves to string
body('name') // -> 'Foo'
// Resolves to object
body(['name', 'age']) // -> { email: 'Foo', age: 80 }
// Resolves to object with custom keys
body({ custom: 'name' }) // -> { custom: 'Foo' }
```

### query(any)
Select ang gets data from `req.query`.

### params(any)
Select ang gets data from `req.params`.

### locals(any)
Select ang gets data from `res.locals`.

### req(any)
Select ang gets data from `req` directly.
```javascript
const { req } = require('midoose')

// Resolves to string
body('body.name') // => 'Foo'
// Resolves to object with custom keys
req({ custom: 'body.name' }) // => { custom: 'Foo' }
```

### res(any)
Select ang gets data from `res` directly.

### raw(any)
Directly return any. Instead of resolving from req or res.

### derive(path [, key], fn)
Derive the value before resolving. For use in selectors.
```javascript
body([
  derive('name', val => `Hello ${val}`),
  derive('age', 'message', val => `Your age is ${val}`)
])
// Resolves to { name: 'Hello Foo', message: 'Your age is 90' }
```

#### Custom Selection?
Selectors are just normal functions that takes `req` and `res`.
```javascript
// With selector
app.get('/user',  find(Users, query(['active']))
// Without selector
app.get('/user',  find(Users, (req, res) => { active: req.query.active }))
```

# Middleware Creators

Middleware Creators are functions that creates Express middlewares for certain Mongoose operations.

### create(model, selector [, options])

Saves one or more documents to the database. Associated options are `end`, `key`, `moreDocs`, `populate`, `next`, `options`. See options section for details.

```javascript
// Saves single document. Get values form `req.body`
app.post('/user', create(User, body(['email', 'password'])))
```

### deleteAll(model, selector [, options])

Deletes all documents that matches the selector. Options: `end`, `key`, `next`, `options`.

```javascript
// Delete all inactive users
app.delete('/users/clean', deleteAll(User, raw({active: false})))
```

### deleteById(model, selector [, options])

Deletes a document that matches the id selector. Options: `end`, `key`, `next`, `document`, `options`.

```javascript
// Delete single user by Id
app.delete('/users/:id', deleteById(User, params('id')))
```

### find(model [, selector, options])

Finds documents that matches the selector. Options: `end`, `key`, `next`, `options`, `select`, `populate`, `map`.

```javascript
// Find users that matches the value of `req.query.age`
app.find('/users', find(User, query(['age'])))
```

### findById(model, selector [, options])

Finds a document that matches the id selector. Options are same with `find`.

### findOne(model, selector [, options])

Finds a document that matches the selector. Options are same with `find`.

### mustExist(model, selector [, options])

Make sure a document exists that matches the selector. Otherwise, throws an error `ERR_DOC_MUST_EXIST`. Options: `end`, `key`, `next`, `options`, `document`.

### mustExistById(model, selector [, options])

Same with `mustExist` except it requires id selector (string)

### mustNotExist(model, selector [, options])

Make sure a document does NOT exists that matches the selector. Otherwise, throws an error `ERR_DOC_MUST_NOT_EXIST`. Options: `end`, `key`, `next`, `options`, `document`.

### update(model, conditionSelector, valueSelector [, options])

Updates all documents that matches the condition selector and apply the value selector. Options: `end`, `key`, `next`, `options`, `document`.
```javascript
// If body = { active: false } and params = { age: 20 }
app.put('/users/:age', update(User, params(['age']), body(['active'])))
// will update all users with age 20 to be inactive
```

### updateById(model, idSelector, valueSelector [, options])
Same with `update` except it requires id selector (string) and only affects one document.

### updateOne(model, conditionSelector, valueSelector [, options])
Same with `update` except it only affects the first found document.

### upsert(model, conditionSelector, valueSelector [, options])
Same with `update` except it creates the documents if it doesn't exist.

### upsertOne(model, conditionSelector, valueSelector [, options])
Same with `upsert` except it only creates one document.

### aggregate(model, pipeline, [, options])
Use MongoDB/Mongoose aggregation. `pipeline` can be `array` or `function` that returns the aggregation array. Options: `end` and `key`.
```javascript
app.get('/balance',
  aggregate(User,
    (req, res) => [
      { $group: { _id: null, maxBalance: { $max: '$balance' } } },
      { $project: { _id: 0, maxBalance: 1 } }
    ]
  )
)
```

### wrap(middleware [, options])
If you need complex operation which you can't use pre-defined middleware creators. Just make sure to return a `promise`. Options are `end` and `key`.
```javascript
app.get('/users',
  wrap(
    (req, res) => {
      // Your very complex operation
      return User.find({})
    }
  )
)
```



# Error Handlers

Some middleware creators that creates [Express error middleware](https://expressjs.com/en/guide/error-handling.html#the-default-error-handler). The error handler will only be applied if it matches the condition.

### catchAll(...middlewareCreators)

Catches all errors and apply all given middlewares.

### catchFor(condition, ...middlewareCreators)

Catches all errors that matches the condition and apply all given middlewares.
```javascript
  app.post('/user',
    mustNotExist(User, body(['email'])),
    catchFor({ code: 'ERR_DOC_MUST_NOT_EXIST' },
      update(User, body(['email']), raw({sample: 'data'})),
      // ... more middlewares to apply on this error
    ),
    ...
    // Middlewares in this line will not be applied.
    // Instead it passes the error to the next handler.
  )
```

### catchNotFor(condition, ...middlewareCreators)

Opposite of `catchFor`.

### catchWith(conditionFunction, ...middlewareCreators)

Same with `catchFor` except it accepts a function as condition and pass the error object to it. All middlewares will then be applied if that function returns true.



# Combine

Combines multiple middleware creators for executing operations in parallel or multiple selectors to resolved in single object. Options are `key` and `next`.

### combine(...middlewareCreators [, options])

Execute middlewares in parallel and attach the results to `res.locals.result`.

```javascript
  app.get('/alldata',
    // Executes finds in parallel.
    combine(
      find(User), // Find all users
      find(Post), // Find all posts
      ...
    ),
    end(locals('result')) // End and route and send the results
  )
```

### combine(...selectors)

Combine selectors to resolve in single object.

```javascript
  app.get('/alldata',
    create(User, 
      combine(
        query(['name', 'age']),
        body(['email', 'password'])
      )
      // Resolve to { name: 'Foo', age: 20, email: 'test@email.com', password: 'abc123' }
    )
  )
```


# Options

Following options are available for middleware creators.

| Name | Description | Default | E.g. |
| - | - | - | - |
| end | Directly send out the results of a middleware | true |
| key | Name of the result property attach to `res.locals` | "result" | res.locals.result |
| next | A value to pass to [Express next function](https://expressjs.com/en/guide/using-middleware.html#middleware.router) | null | 'route' |
| options | [Mongoose query options](https://mongoosejs.com/docs/api.html#query_Query-setOptions) used by middleware creators | null | { limit:5 } |
| document | Return the document instead of default result | false |
| select | [Mongoose projection](https://mongoosejs.com/docs/api.html#model_Model.find) or fields selection | null | 'name -password' |
| populate | [Mongoose populate feature](https://mongoosejs.com/docs/api.html#model_Model.populate) | null | 'posts' |
| map | A function that transforms result array before attaching | null |