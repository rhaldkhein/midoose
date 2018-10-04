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

// Compose your API route
app.post('/api/user',
	// Make sure user with value of email does not exist in database
    // If exists, it will throw error and skips to error handler middleware
	mustNotExist(User, body(['email'])), 
    // Create the user. Getting the values from body
    create(User, body(['email', 'password'])) 
)

// More routes
...
```

## Selectors

...

#### body(any)

Select and gets data from `req.body`

```javascript
// Sample req body data from express
req.body = { name: 'Foo', pass: 'Bar', age: 80 }
// Resolves to string
body('name') // => 'Foo'
// Resolves to object
body(['name', 'age']) // => { email: 'Foo', age: 80 }
// Resolves to object with custom keys
body({ custom: 'name' }) // => { custom: 'Foo' }
```

#### query(any)
Select ang gets data from `req.query`

#### params(any)
Select ang gets data from `req.params`

#### locals(any)
Select ang gets data from `req.locals`



## Methods

Midoose

#### create(model, selector [, options])

Creates a middleware that saves one or more documents to the database

```javascript
// Saves single document. Gets values
create(User, body(['email', 'password']))


```