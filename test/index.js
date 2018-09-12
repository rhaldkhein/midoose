const mongoose = require('mongoose')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const glob = require('glob')
const path = require('path')

// require('./models')
chai.should()
chai.use(sinonChai)

// global.expect = chai.expect

// Connect to DB
// before(done => {
//   mongoose.connect('mongodb://localhost/midoose', { useNewUrlParser: true })
//     .then(() => {
//       Model.User.deleteOne({}, () => null)
//       done()
//     })
// })

// Disconnect DB
// after(done => {
//   mongoose.connection.close()
//   done()
// })

// Get all test suites
// glob.sync('./test/middlewares/**/*.js').forEach(function (file) {
//   require(path.resolve(file))
// })

function asyncHello(name, delay, cb) {
  setTimeout(function () {
    console.log("running after ", delay)
    cb("hello " + name)
  }, delay)
}

const sinon = require('sinon')

describe('create', () => {

  it('should foo the bar', (done) => {

    var cb = sinon.spy()
    asyncHello("foo", 500, cb)

    cb.should.have.been.called
    setTimeout(done, 1000)
  })

})