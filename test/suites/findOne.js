const sinon = require('sinon')
const _find = require('lodash/find')
const _filter = require('lodash/filter')
const _isMatch = require('lodash/isMatch')
const findOne = require('../../src/middlewares/findOne')

describe('findOne', () => {

  let stubUserFindOne
  let stubPostFindOne
  let stubPostPopulate

  before(() => {

    /**
     * User stubs
     */
    stubUserFindOne = sinon.stub(Model.User, 'findOne')
    stubUserFindOne.withArgs('error').rejects(new Error('sample error'))
    samples.users.reverse().forEach(item => {
      let matcher = sinon.match(value => _isMatch(item, value))
      stubUserFindOne.withArgs(matcher).resolves(item)
      stubUserFindOne.withArgs(matcher, 'name').resolves({
        _id: item._id,
        name: item.name
      })
    })
    stubUserFindOne.resolves(null)

    /**
     * Post stubs
     */
    stubPostFindOne = sinon.stub(Model.Post, 'findOne')
    stubPostPopulate = sinon.stub(Model.Post, 'populate')
    stubPostFindOne.withArgs('error').rejects(new Error('sample error'))
    samples.posts.reverse().forEach(item => {
      let matcher = sinon.match(value => _isMatch(item, value))
      stubPostFindOne.withArgs(matcher).resolves(item)
      stubPostPopulate.withArgs(matcher, 'user')
        .resolves(
          {
            ...item,
            user: _find(samples.users, { _id: item.user })
          }
        )
    })
    stubPostFindOne.resolves(null)

  })

  after(() => {
    stubUserFindOne.restore()
    stubPostFindOne.restore()
    stubPostPopulate.restore()
  })

  it('should find one (default)', done => {
    const req = {}
    const res = mockRes(payload => {
      try {
        expect(payload).to.be.not.a('array')
        expect(payload._id).to.be.equal('101')
        done()
      } catch (error) {
        done(error)
      }
    })
    findOne(
      Model.User
    )(req, res)
  })

  it('should find one with condition', done => {
    const req = {}
    const res = mockRes(payload => {
      try {
        expect(payload).to.be.not.a('array')
        expect(payload._id).to.be.equal('102')
        done()
      } catch (error) {
        done(error)
      }
    })
    findOne(
      Model.User,
      { country: `$AE` }
    )(req, res)
  })

  it('should find one with condition from body and params', done => {
    const req = {
      body: { age: 2 },
      params: { active: true }
    }
    const res = mockRes(payload => {
      try {
        expect(payload).to.be.not.a('array')
        expect(payload._id).to.be.equal('103')
        done()
      } catch (error) {
        done(error)
      }
    })
    findOne(
      Model.User,
      {
        age: 'body.age',
        active: 'params.active'
      }
    )(req, res)
  })

  it('should find one with condition from locals', done => {
    const req = { body: { age: 3 } }
    const res = mockRes(payload => {
      try {
        expect(payload).to.be.not.a('array')
        expect(payload._id).to.be.equal('104')
        done()
      } catch (error) {
        done(error)
      }
    })
    findOne(
      Model.User,
      { age: 'body.age' }
    )(req, res)
  })

  it('should find one with function condition', done => {
    const req = { body: { age: 3 } }
    const res = mockRes(payload => {
      try {
        expect(payload).to.be.not.a('array')
        expect(payload._id).to.be.equal('104')
        done()
      } catch (error) {
        done(error)
      }
    })
    findOne(
      Model.User,
      req => {
        return { age: req.body.age }
      }
    )(req, res)
  })

  it('should find one with select / projection', done => {
    const req = { body: { age: 3 } }
    const res = mockRes(payload => {
      try {
        expect(payload).to.be.not.a('array')
        expect(payload._id).to.be.equal('104')
        expect(payload.age).to.be.undefined
        done()
      } catch (error) {
        done(error)
      }
    })
    findOne(
      Model.User,
      { age: 'body.age' },
      {
        select: 'name'
      }
    )(req, res)
  })

  it('should find one and populate', done => {
    const req = { body: { id: '206' } }
    const res = mockRes(payload => {
      try {
        expect(payload).to.be.not.a('array')
        expect(payload._id).to.be.equal('206')
        expect(payload).to.be.property('user')
        expect(payload.user._id).to.be.equal('103')
        done()
      } catch (error) {
        done(error)
      }
    })
    findOne(
      Model.Post,
      { _id: 'body.id' },
      {
        populate: 'user'
      }
    )(req, res)
  })

  it('should find but DO NOT end', done => {
    const req = { query: { title: 'FaaPost' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('result')
        expect(res.locals.result._id).to.be.equal('207')
        done()
      } catch (error) {
        done(error)
      }
    }
    findOne(
      Model.Post,
      { title: 'query.title' },
      {
        end: false
      }
    )(req, res, next)
  })

  it('should find but DO NOT end and with custom key result', done => {
    const req = { query: { title: 'FaaPost' } }
    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('customResult')
        expect(res.locals.customResult._id).to.be.equal('207')
        done()
      } catch (error) {
        done(error)
      }
    }
    findOne(
      Model.Post,
      { title: 'query.title' },
      {
        end: false,
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
    findOne(
      Model.User,
      () => 'error'
    )(req, res)
  })

  it('should catch for no document and `end` is true', done => {
    const req = { body: { id: 'no_id' } }
    const res = mockRes(payload => {
      try {
        expect(payload).to.be.instanceOf(Error)
          .with.property('message', 'document not found')
        done()
      } catch (error) {
        done(error)
      }
    })
    findOne(
      Model.User,
      'body.id',
      {
        end: true
      }
    )(req, res)
  })

})