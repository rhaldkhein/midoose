'use strict'

const sinon = require('sinon')
const _find = require('lodash/find')
const findById = require('../../../src/middlewares/findById')
const { query, body } = require('../../../src/selector')

describe('findById', () => {

  let stubUserFindById
  let stubPostFindById
  let stubPostPopulate

  before(() => {

    /**
     * User stubs
     */
    stubUserFindById = sinon.stub(Model.User, 'findById')
    stubUserFindById.withArgs('error').rejects(new Error('sample error'))
    stubUserFindById.withArgs('options', sinon.match.any, sinon.match.any)
      .rejects(new Error('ok options'))
    samples.users.map(item => {
      stubUserFindById.withArgs(item._id).resolves(item)
      stubUserFindById.withArgs(item._id, 'name').resolves({
        _id: item._id,
        name: item.name
      })
    })
    stubUserFindById.resolves(null)

    /**
     * Post stubs
     */

    // Find
    stubPostFindById = sinon.stub(Model.Post, 'findById')
    stubPostPopulate = sinon.stub(Model.Post, 'populate')
    samples.posts.map(item => {
      stubPostFindById.withArgs(item._id).resolves(item)
      stubPostPopulate.withArgs(sinon.match({ _id: item._id }), 'user')
        .resolves(
          {
            ...item,
            user: _find(samples.users, { _id: item.user })
          }
        )
    })
    stubPostFindById.resolves(null)

  })

  after(() => {
    stubUserFindById.restore()
    stubPostFindById.restore()
    stubPostPopulate.restore()
  })

  it('should find by id from body', done => {

    const req = { body: { id: '103' } }

    const res = mockRes(payload => {
      try {
        expect(payload._id).to.be.equal('103')
        expect(payload.name).to.be.equal('BazUser')
        done()
      } catch (error) {
        done(error)
      }
    })

    findById(
      Model.User,
      body('id')
    )(req, res)

  })

  it('should find by id from query', done => {

    const req = { query: { id: '103' } }

    const res = mockRes(payload => {
      try {
        expect(payload._id).to.be.equal('103')
        expect(payload.name).to.be.equal('BazUser')
        done()
      } catch (error) {
        done(error)
      }
    })

    findById(
      Model.User,
      query('id')
    )(req, res)

  })

  it('should find by function of id', done => {

    const req = { query: { id: '103' } }

    const res = mockRes(payload => {
      try {
        expect(payload._id).to.be.equal('103')
        expect(payload.name).to.be.equal('BazUser')
        done()
      } catch (error) {
        done(error)
      }
    })

    findById(
      Model.User,
      req => req.query.id
    )(req, res)

  })

  it('should find by id with select / projection', done => {

    const req = { body: { id: '104' } }

    const res = mockRes(payload => {
      try {
        expect(payload._id).to.be.equal('104')
        expect(payload.name).to.be.equal('ZapUser')
        expect(payload.age).to.be.undefined
        done()
      } catch (error) {
        done(error)
      }
    })

    findById(
      Model.User,
      body('id'),
      {
        select: 'name'
      }
    )(req, res)

  })

  it('should find by id from body and populate', done => {

    const req = { body: { id: '203' } }

    const res = mockRes(payload => {
      try {
        expect(payload._id).to.be.equal('203')
        expect(payload).to.have.property('user')
        expect(payload.user._id).to.be.equal('102')
        done()
      } catch (error) {
        done(error)
      }
    })

    findById(
      Model.Post,
      body('id'),
      {
        populate: 'user'
      }
    )(req, res)

  })

  it('should find but DO NOT end', done => {
    const req = { body: { id: '103' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('result')
        expect(res.locals.result._id).to.be.equal('103')
        done()
      } catch (error) {
        done(error)
      }
    }
    findById(
      Model.User,
      body('id'),
      {
        end: false
      }
    )(req, res, next)
  })

  it('should find but DO NOT end and with custom key result', done => {
    const req = { body: { id: '103' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('customResult')
        expect(res.locals.customResult._id).to.be.equal('103')
        done()
      } catch (error) {
        done(error)
      }
    }
    findById(
      Model.User,
      body('id'),
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
        // If error is `document not found`. That means that `options`
        // is missing and should be fixed.
        expect(err).to.be.instanceOf(Error)
          .with.property('message', 'ok options')
        done()
      } catch (error) {
        done(error)
      }
    }
    const res = {}
    findById(
      Model.User,
      () => 'options'
    )(req, res, next)
  })

  it('should catch on error', done => {
    const req = {}
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
    findById(
      Model.User,
      () => 'error'
    )(req, res, next)
  })

  it('should catch for no document if `end` is true', done => {
    const req = { body: { id: 'no_id' } }
    const next = err => {
      try {
        expect(err).to.be.instanceOf(Error)
          .with.property('message', 'document not found')
        done()
      } catch (error) {
        done(error)
      }
    }
    const res = {}
    findById(
      Model.User,
      body('id'),
      {
        end: true
      }
    )(req, res, next)
  })

})