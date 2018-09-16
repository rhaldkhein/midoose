const sinon = require('sinon')
const _filter = require('lodash/filter')
const findAll = require('../../src/middlewares/findAll')

describe('findAll', () => {

  let stub

  const req = {
    body: {
      active: true
    },
    query: {
      active: false
    }
  }

  before(() => {
    stub = sinon.stub(Model.User, 'find')
    stub.withArgs({ active: true }).returns(Promise.resolve(
      _filter(samples.users, { active: true })
    ))
    // stub.withArgs('456').returns(Promise.resolve([
    //   { _id: '123' }
    // ]))
    // stub.withArgs('error').returns(
    //   Promise.reject(new Error('sample error'))
    // )
    stub.returns(Promise.resolve(samples.users))
  })

  after(() => {
    stub.restore()
  })

  it('should find many (default)', done => {

    const res = mockRes(payload => {
      try {
        console.log(payload)
        // expect(payload).to.be.property('_id')
        // expect(payload._id).to.be.equal('123')
        done()
      } catch (error) {
        done(error)
      }
    })

    findAll(
      Model.User
    )(req, res)


  })

})