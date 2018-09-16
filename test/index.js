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

const users = [
  { _id: '123', name: 'FooUser', age: 1, active: true },
  { _id: '124', name: 'BarUser', age: 2, active: false },
  { _id: '125', name: 'BazUser', age: 3, active: true },
  { _id: '126', name: 'ZapUser', age: 4, active: false }
]
const posts = [
  { user: users[0]._id, title: 'FooPost' },
  { user: users[0]._id, title: 'BarPost' },
  { user: users[1]._id, title: 'BazPost' },
  { user: users[2]._id, title: 'ZapPost' },
  { user: users[2]._id, title: 'JazPost' },
  { user: users[2]._id, title: 'GalPost' },
  { user: users[3]._id, title: 'FaaPost' },
  { user: users[3]._id, title: 'YooPost' }
]
global.samples = { users, posts }

// Get all test suites
glob.sync('./test/suites/**/*.js').forEach(function (file) {
  require(path.resolve(file))
})