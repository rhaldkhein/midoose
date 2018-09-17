const glob = require('glob')
const path = require('path')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

require('./models')

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

// Sample data
const users = [
  { _id: '101', name: 'FooUser', country: 'US', age: 1, active: true },
  { _id: '102', name: 'BarUser', country: 'AE', age: 2, active: false },
  { _id: '103', name: 'BazUser', country: 'US', age: 2, active: true },
  { _id: '104', name: 'ZapUser', country: 'AE', age: 3, active: false }
]
const posts = [
  { _id: '201', user: users[0]._id, title: 'FooPost', published: true },
  { _id: '202', user: users[0]._id, title: 'BarPost', published: false },
  { _id: '203', user: users[1]._id, title: 'BazPost', published: true },
  { _id: '204', user: users[2]._id, title: 'ZapPost', published: false },
  { _id: '205', user: users[2]._id, title: 'JazPost', published: true },
  { _id: '206', user: users[2]._id, title: 'GalPost', published: true },
  { _id: '207', user: users[3]._id, title: 'FaaPost', published: false },
  { _id: '208', user: users[3]._id, title: 'YooPost', published: true }
]
global.samples = { users, posts }

// Get all test suites
glob.sync('./test/suites/**/*.js').forEach(function (file) {
  require(path.resolve(file))
})