const sinon = require('sinon')
const _find = require('lodash/find')
const _isMatch = require('lodash/isMatch')
const findOne = require('../../../src/middlewares/findOne')
const { raw, body, query } = require('../../../src/selector')

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

  it('should find one', done => {
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
      Model.User,
      body('id')
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
      raw({ country: 'AE' })
    )(req, res)
  })

  // it('should find one with condition from body and params', done => {
  //   const req = {
  //     body: { age: 2 },
  //     params: { active: true }
  //   }
  //   const res = mockRes(payload => {
  //     try {
  //       expect(payload).to.be.not.a('array')
  //       expect(payload._id).to.be.equal('103')
  //       done()
  //     } catch (error) {
  //       done(error)
  //     }
  //   })
  //   findOne(
  //     Model.User,
  //     {
  //       age: 'body.age',
  //       active: 'params.active'
  //     }
  //   )(req, res)
  // })

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
      body(['age']),
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
      body({ _id: 'id' }),
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
      query(['title']),
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
      query(['title']),
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
    findOne(
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
    findOne(
      Model.User,
      () => 'error'
    )(req, res, next)
  })

  it('should catch for no document if `end` is true', done => {
    const req = { body: { id: 'no_id' } }
    const res = {}
    const next = err => {
      try {
        expect(err).to.be.instanceOf(Error)
          .with.property('message', 'document not found')
        done()
      } catch (error) {
        done(error)
      }
    }
    findOne(
      Model.User,
      body('id'),
      {
        end: true
      }
    )(req, res, next)
  })

})