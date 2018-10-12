# Midoose
Composable utility middlewares for Mongoose + Express API  

#### Prerequisites

- [Express](http://expressjs.com/) (4.x)
- [Mongoose](https://mongoosejs.com/) (5.x)

#### Installation

`npm install midoose`

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

Selectors are functions that resolves an argument (string, array, object) to values from `req` and `res`. And are designed for use in Middlewares.

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

### find(model, selector [, options])

Finds documents that matches the selector. Options: `end`, `key`, `next`, `options`, `select`, `populate`, `map`.

```javascript
// Find users that matches the value of `req.query.age`
app.find('/users', find(User, query(['age'])))
```

### findById(model, selector [, options])

Finds a document that matches the id selector. Options: `end`, `key`, `next`, `options`, `select`, `populate`, `map`.

### findOne(model, selector [, options])

Finds a document that matches the selector. Options: `end`, `key`, `next`, `options`, `select`, `populate`, `map`.

### mustExist(model, selector [, options])

Make sure a document exists that matches the selector. Otherwise, throws an error `ERR_DOC_MUST_EXIST`. Options: `end`, `key`, `next`, `options`, `document`.

### mustExistById(model, selector [, options])

Make sure a document exists that matches the id selector. Otherwise, throws an error `ERR_DOC_MUST_EXIST`. Options: `end`, `key`, `next`, `options`, `document`.

### mustNotExist(model, selector [, options])

Make sure a document does NOT exists that matches the selector. Otherwise, throws an error `ERR_DOC_MUST_NOT_EXIST`. Options: `end`, `key`, `next`, `options`, `document`.

### update(model, conditionSelector, valueSelector [, options])

Updates all documents that matches the condition selector and apply the value selector. Options: `end`, `key`, `next`, `options`, `document`.
```javascript
// If sample body { active: false } and params { age: 20 }
app.put('/users/:age', update(User, params(['age']), body(['active'])))
// will update all users with age 20 to be inactive
```