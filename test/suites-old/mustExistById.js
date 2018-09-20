const sinon = require('sinon')
const mustExistById = require('../../src/middlewares/mustExistById')

describe('mustExistById', () => {

  let stubUserFindOne

  before(() => {

    /**
     * User stubs
     */
    stubUserFindOne = sinon.stub(Model.User, 'findById')
    stubUserFindOne.withArgs('error').rejects(new Error('sample error'))
    stubUserFindOne.withArgs('options', sinon.match.any, sinon.match.any)
      .rejects(new Error('ok options'))
    samples.users.reverse().forEach(item => {
      stubUserFindOne.withArgs(item._id).resolves(item)
      stubUserFindOne.withArgs(item._id, 'name').resolves({
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
    mustExistById(
      Model.User
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
    mustExistById(
      Model.User,
      req => req.body.id
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
    mustExistById(
      Model.User,
      'body.id',
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
    mustExistById(
      Model.User,
      'body.id',
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
    mustExistById(
      Model.User,
      'body.id',
      {
        document: true,
        key: 'customResult'
      }
    )(req, res, next)
  })

  it('should require query options', done => {
    const req = {}
    const res = mockRes(payload => {
      try {
        // This is a fake Error. A hack to check that options is 
        // required for model query.
        expect(payload).to.be.instanceOf(Error)
          .with.property('message', 'ok options')
        done()
      } catch (error) {
        done(error)
      }
    })
    mustExistById(
      Model.User,
      () => 'options'
    )(req, res)
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
    mustExistById(
      Model.User,
      () => 'error'
    )(req, res)
  })

})