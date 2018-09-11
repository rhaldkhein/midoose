const chai = require('chai')
const sinonChai = require('sinon-chai')
const mongoose = require('mongoose')
const Mockgoose = require('mockgoose').Mockgoose

const mockgoose = new Mockgoose(mongoose)
chai.use(sinonChai)

const { mockReq, mockRes } = require('sinon-express-mock')
const { expect } = chai

global.mockReq = mockReq
global.mockRes = mockRes
global.expect = expect


before(function (done) {
  mockgoose.prepareStorage().then(function () {
    // mongoose connection		
    mongoose.connect('mongodb://example.com/TestingDB', function (err) {
      done(err)
    })
  })
})

require('./express')