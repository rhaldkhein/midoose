'use strict'

const sinon = require('sinon')
const _isMatch = require('lodash/isMatch')
const mustNotExist = require('../../../src/middlewares/mustNotExist')
const { body } = require('../../../src/selector')

describe('mustNotExist', () => {

  let stubUserFindOne

  before(() => {

    /**
     * User stubs
     */
    stubUserFindOne = sinon.stub(Model.User, 'findOne')
    stubUserFindOne.withArgs('error').rejects(new Error('sample error'))
    stubUserFindOne.withArgs('options', sinon.match.any, sinon.match.any)
      .rejects(new Error('ok options'))
    samples.users.reverse().forEach(item => {
      let matcher = sinon.match(value => _isMatch(item, value))
      stubUserFindOne.withArgs(matcher).resolves(item)
      stubUserFindOne.withArgs(matcher, 'name').resolves({
        _id: item._id,
        name: item.name
      })
    })
    stubUserFindOne.resolves(null)

  })

  after(() => {
    stubUserFindOne.restore()
  })

  it('should result to true (default)', done => {
    const req = { body: { id: 'no_id' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('result')
        expect(res.locals.result).to.be.true
        done()
      } catch (error) {
        done(error)
      }
    }
    mustNotExist(
      Model.User,
      body({ _id: 'id' })
    )(req, res, next)
  })

  it('should result to true by function condition', done => {
    const req = { body: { id: 'no_id' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('result')
        expect(res.locals.result).to.be.true
        done()
      } catch (error) {
        done(error)
      }
    }
    mustNotExist(
      Model.User,
      req => ({ _id: req.body.id })
    )(req, res, next)
  })

  it('should exit on found document if `end` is true', done => {
    const req = { body: { id: '103' } }
    const res = {}
    const next = err => {
      try {
        expect(err).to.be.instanceOf(Error)
          .with.property('message', 'document must not exist')
        done()
      } catch (error) {
        done(error)
      }
    }
    mustNotExist(
      Model.User,
      body({ _id: 'id' }),
      {
        end: true // Default
      }
    )(req, res, next)
  })

  it('should NOT exit on found document if `end` is false', done => {
    const req = { body: { id: '103' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('result')
        expect(res.locals.result).to.be.false
        done()
      } catch (error) {
        done(error)
      }
    }
    mustNotExist(
      Model.User,
      body({ _id: 'id' }),
      {
        end: false
      }
    )(req, res, next)
  })

  it('should NOT exit and with custom result key if `end` is false', done => {
    const req = { body: { id: '103' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('customResult')
        expect(res.locals.customResult).to.be.false
        done()
      } catch (error) {
        done(error)
      }
    }
    mustNotExist(
      Model.User,
      body({ _id: 'id' }),
      {
        end: false,
        key: 'customResult'
      }
    )(req, res, next)
  })

  it('should return found document instead of boolean if `end` is false', done => {
    const req = { body: { id: '102' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('result')
        expect(res.locals.result.name).to.be.equal('BarUser')
        done()
      } catch (error) {
        done(error)
      }
    }
    mustNotExist(
      Model.User,
      body({ _id: 'id' }),
      {
        end: false, // This is required to return the document
        document: true
      }
    )(req, res, next)
  })

  it('should return `null` for not found instead of boolean if `end` is false', done => {
    const req = { body: { id: 'no_id' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('result')
        expect(res.locals.result).to.be.null
        done()
      } catch (error) {
        done(error)
      }
    }
    mustNotExist(
      Model.User,
      body({ _id: 'id' }),
      {
        end: false, // This is required to return the document
        document: true
      }
    )(req, res, next)
  })

  it('should require query options', done => {
    const req = {}
    const res = {}
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
    mustNotExist(
      Model.User,
      () => 'options'
    )(req, res, next)
  })

  it('should catch on error', done => {
    const req = {}
    const res = {}
    const next = err => {
      try {
        expect(err).to.be.instanceOf(Error)
          .with.property('message', 'sample error')
        done()
      } catch (error) {
        done(error)
      }
    }
    mustNotExist(
      Model.User,
      () => 'error'
    )(req, res, next)
  })

})