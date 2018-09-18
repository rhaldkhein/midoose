const sinon = require('sinon')
const _isMatch = require('lodash/isMatch')
const mustExist = require('../../src/middlewares/mustExist')

describe('mustExist', () => {

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
    const req = { body: { id: '103' } }
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
    mustExist(
      Model.User,
      { _id: 'body.id' }
    )(req, res, next)
  })

  it('should result to true by function condition', done => {
    const req = { body: { id: '104' } }
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
    mustExist(
      Model.User,
      req => ({ _id: req.body.id })
    )(req, res, next)
  })

  it('should exit on no document and `end` is true', done => {
    const req = { body: { id: 'no_id' } }
    const res = mockRes(payload => {
      try {
        expect(payload).to.be.instanceOf(Error)
          .with.property('message', 'document must exist')
        done()
      } catch (error) {
        done(error)
      }
    })
    const next = () => null
    mustExist(
      Model.User,
      { _id: 'body.id' },
      {
        end: true // Default
      }
    )(req, res, next)
  })

  it('should NOT exit on no document and `end` is false', done => {
    const req = { body: { id: 'no_id' } }
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
    mustExist(
      Model.User,
      { _id: 'body.id' },
      {
        end: false
      }
    )(req, res, next)
  })

  it('should return document instead of boolean with custom result key', done => {
    const req = { body: { id: '102' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('customResult')
        expect(res.locals.customResult.name).to.be.equal('BarUser')
        done()
      } catch (error) {
        done(error)
      }
    }
    mustExist(
      Model.User,
      { _id: 'body.id' },
      {
        document: true,
        key: 'customResult'
      }
    )(req, res, next)
  })

  it('should catch on error', done => {
    const req = {}
    const res = mockRes(payload => {
      try {
        expect(payload).to.be.instanceOf(Error)
          .with.property('message', 'sample error')
        done()
      } catch (error) {
        done(error)
      }
    })
    mustExist(
      Model.User,
      () => 'error'
    )(req, res)
  })

})