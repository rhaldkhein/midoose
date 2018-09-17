const sinon = require('sinon')
const deleteById = require('../../src/middlewares/deleteById')


describe('deleteById', () => {

  let stub
  const req = {
    body: {
      id: '123'
    },
    query: {
      id: '456'
    }
  }

  before(() => {
    stub = sinon.stub(Model.User, 'findByIdAndDelete')
    stub.withArgs('123').returns({ exec: () => Promise.resolve({ _id: '123' }) })
    stub.withArgs('456').returns({ exec: () => Promise.resolve({ _id: '456' }) })
    stub.withArgs('error').returns({ exec: () => Promise.reject(new Error('sample error')) })
    stub.returns({ exec: () => Promise.resolve(null) })
  })

  after(() => {
    stub.restore()
  })

  it('should delete by id from body (default)', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.be.property('_id')
        expect(payload._id).to.be.equal('123')
        done()
      } catch (error) {
        done(error)
      }
    })

    deleteById(
      Model.User
    )(req, res)

  })

  it('should delete by id from query', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.be.property('_id')
        expect(payload._id).to.be.equal('456')
        done()
      } catch (error) {
        done(error)
      }
    })

    deleteById(
      Model.User,
      'query.id'
    )(req, res)

  })

  it('should delete by id from locals', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.be.property('_id')
        expect(payload._id).to.be.equal('456')
        done()
      } catch (error) {
        done(error)
      }
    })

    res.locals.id = '456'

    deleteById(
      Model.User,
      'locals.id'
    )(req, res)

  })

  it('should delete by function of id', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.be.property('_id')
        expect(payload._id).to.be.equal('456')
        done()
      } catch (error) {
        done(error)
      }
    })

    deleteById(
      Model.User,
      req => {
        return req.query.id
      }
    )(req, res)

  })

  it('should delete but DO NOT end', done => {

    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('result')
        expect(res.locals.result._id).to.be.equal('123')
        done()
      } catch (error) {
        done(error)
      }
    }

    deleteById(
      Model.User,
      'body.id',
      {
        end: false
      }
    )(req, res, next)

  })

  it('should delete but DO NOT end and with custom key result', done => {

    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('customResult')
        expect(res.locals.customResult._id).to.be.equal('456')
        done()
      } catch (error) {
        done(error)
      }
    }

    deleteById(
      Model.User,
      'query.id',
      {
        end: false,
        key: 'customResult'
      }
    )(req, res, next)

  })

  it('should catch on error', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.be.instanceOf(Error)
          .with.property('message', 'sample error')
        done()
      } catch (error) {
        done(error)
      }
    })

    deleteById(
      Model.User,
      // Force sinon to reject a promise through stub
      () => 'error'
    )(req, res)

  })

})