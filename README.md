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

// Compose your API route. 
// A very basic composition of middlewares
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

Select and gets data from `req.body`.

```javascript
const { body } = require('midoose')
// Sample req.body data from Express: { name: 'Foo', pass: 'Bar', age: 80 }

// Resolves to string
body('name') // => 'Foo'
// Resolves to object
body(['name', 'age']) // => { email: 'Foo', age: 80 }
// Resolves to object with custom keys
body({ custom: 'name' }) // => { custom: 'Foo' }
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

...

### create(model, selector [, options])

Creates a middleware that saves one or more documents to the database. Associated options are `end`, `key`, `moreDocs`, `populate`, `next`. See options section for details.

```javascript
// Saves single document. Get values form `req.body`
app.post('/user', create(User, body(['email', 'password'])))
```

### deleteAll(model, selector [, options])

...

```javascript
// Delete all inactive users
app.delete('/user/clean', deleteAll(User, raw({active: false})))
```