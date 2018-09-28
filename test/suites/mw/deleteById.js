'use strict'

const sinon = require('sinon')
const deleteById = require('../../../src/middlewares/deleteById')
const { body, query } = require('../../../src/selector')


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
    stub.withArgs('error').rejects(new Error('sample error'))
    stub.withArgs('options', sinon.match.any)
      .rejects(new Error('ok options'))
    stub.withArgs('123').resolves({ _id: '123' })
    stub.withArgs('456').resolves({ _id: '456' })
    stub.resolves()
  })

  after(() => {
    stub.restore()
  })

  it('should delete by id from body', done => {

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
      Model.User,
      body('id')
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
      query('id')
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
      body('id'),
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
      query('id'),
      {
        end: false,
        key: 'customResult'
      }
    )(req, res, next)

  })

  it('should require query options', done => {
    const req = {}
    const next = err => {
      try {
        // This is a fake Error. A hack to check that options is 
        // required for model query.
        expect(err).to.be.instanceOf(Error)
          .with.property('message', 'ok options')
        done()
      } catch (error) {
        done(error)
      }
    }
    const res = {}
    deleteById(
      Model.User,
      () => 'options'
    )(req, res, next)
  })

  it('should catch on error', done => {
    const next = err => {
      try {
        expect(err).to.be.instanceOf(Error)
          .with.property('message', 'sample error')
        done()
      } catch (error) {
        done(error)
      }
    }
    const res = {}
    deleteById(
      Model.User,
      // Force sinon to reject a promise through stub
      () => 'error'
    )(req, res, next)
  })

})