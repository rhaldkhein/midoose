const glob = require('glob')
const path = require('path')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

require('./models')

// chai.should()
chai.use(chaiAsPromised)
chai.use(sinonChai)

global.expect = chai.expect

global.mockRes = json => {
  return {
    json,
    locals: {},
    status: function () { return this }
  }
}


// Connect to DB
// const mongoose = require('mongoose')
// global.samples = {}
// before(done => {
//   mongoose.connect('mongodb://localhost/midoose', { useNewUrlParser: true })
//     .then(() => {
//       Model.User.deleteOne({}, () => null)
//       Model.Post.deleteOne({}, () => null)
//       Model.User.create([
//         { name: 'FooUser', age: 41, active: true },
//         { name: 'BarUser', age: 43, active: false },
//         { name: 'BazUser', age: 46, active: true }
//       ]).then(users => {
//         global.samples.users = users
//         return Model.Post.create([
//           { user: users[0].id, title: 'FooPost' },
//           { user: users[0].id, title: 'BarPost' },
//           { user: users[1].id, title: 'BazPost' },
//           { user: users[2].id, title: 'ZapPost' },
//           { user: users[2].id, title: 'YooPost' }
//         ])
//       }).then(posts => {
//         global.samples.posts = posts
//       }).then(done)
//     })
// })

// Disconnect DB
// after(done => {
//   mongoose.connection.close()
//   done()
// })

// Get all test suites
glob.sync('./test/suites/**/*.js').forEach(function (file) {
  require(path.resolve(file))
})