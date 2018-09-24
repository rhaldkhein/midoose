const sinon = require('sinon')
const shortid = require('shortid')
const create = require('../../../src/middlewares/create')
const { body } = require('../../../src/selector')


describe('create', () => {

  const req = {
    body: {
      name: 'Foo',
      age: 28,
      active: true
    },
    query: {
      name: 'Bar',
      age: 31,
      active: false
    }
  }

  it('should create', done => {

    const stubCreate = sinon.stub(Model.User, 'create')
      .resolves({
        _id: shortid.generate(),
        name: req.body.name,
        age: req.body.age
      })

    const res = mockRes(payload => {
      try {
        expect(payload._id).to.be.a('string')
        expect(payload.name).to.be.equal(req.body.name)
        expect(payload.age).to.be.equal(req.body.age)
        expect(payload.active).to.be.undefined
        done()
      } catch (error) {
        done(error)
      }
      stubCreate.restore()
    })

    create(
      Model.User,
      body('dummy') // Dummy only as we're testing create function
    )(req, res)

  })

  it('should create and populate', done => {

    const stubCreate = sinon.stub(Model.Post, 'create')
      .resolves({
        _id: shortid.generate()
      })

    const stubPopulate = sinon.stub(Model.Post, 'populate')
      .resolves({
        _id: shortid.generate(),
        ...({
          user: {
            _id: shortid.generate()
          },
        })
      })

    const res = mockRes(payload => {
      try {
        expect(payload).to.be.property('_id')
        expect(payload).to.be.property('user')
        expect(payload._id).to.be.a('string')
        expect(payload.user._id).to.be.a('string')
        done()
      } catch (error) {
        done(error)
      }
      stubCreate.restore()
      stubPopulate.restore()
    })

    create(
      Model.Post,
      body('dummy'),
      {
        populate: 'user'
      }
    )(req, res)

  })

  it('should create multiple documents', done => {

    const stubCreate = sinon.stub(Model.User, 'create')
      .resolves([
        {
          _id: shortid.generate(),
          name: req.body.name
        },
        {
          _id: shortid.generate(),
          name: req.query.name
        }
      ])

    const res = mockRes(payload => {
      try {
        expect(payload).to.be.a('array')
        expect(payload).to.have.lengthOf(2)
        expect(payload[0]._id).to.be.a('string')
        expect(payload[0].name).to.be.equal(req.body.name)
        expect(payload[1]._id).to.be.a('string')
        expect(payload[1].name).to.be.equal(req.query.name)
        done()
      } catch (error) {
        done(error)
      }
      stubCreate.restore()
    })

    create(
      Model.User,
      body('dummy')
    )(req, res)

  })

  it('should create but DO NOT end', done => {

    const stubCreate = sinon.stub(Model.User, 'create')
      .resolves({
        _id: shortid.generate(),
        ...req.body
      })

    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)

    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('result')
        expect(res.locals.result._id).to.be.a('string')
        done()
      } catch (error) {
        done(error)
      }
      stubCreate.restore()
    }

    create(
      Model.User,
      body('dummy'),
      {
        end: false
      }
    )(req, res, next)

  })

  it('should create but DO NOT end and with custom result key', done => {

    const stubCreate = sinon.stub(Model.User, 'create')
      .resolves({
        _id: shortid.generate(),
        ...req.body
      })

    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)

    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('customResult')
        expect(res.locals.customResult._id).to.be.a('string')
        done()
      } catch (error) {
        done(error)
      }
      stubCreate.restore()
    }

    create(
      Model.User,
      body('dummy'),
      {
        end: false,
        key: 'customResult'
      }
    )(req, res, next)

  })

  it('should require mongoose query options', done => {

    const stubCreate = sinon.stub(Model.User, 'create')
    stubCreate.withArgs(sinon.match.any, sinon.match.any).rejects(new Error('ok options'))
    stubCreate.resolves()

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
      stubCreate.restore()
    }

    const res = {}

    create(
      Model.User,
      body('dummy')
    )(req, res, next)

  })

  it('should catch on error', done => {

    const stubCreate = sinon.stub(Model.User, 'create')
      .rejects(new Error('sample error'))

    const next = err => {
      try {
        expect(err).to.be.instanceOf(Error)
          .with.property('message', 'sample error')
        done()
      } catch (error) {
        done(error)
      }
      stubCreate.restore()
    }

    const res = {}

    create(
      Model.User,
      body('dummy')
    )(req, res, next)

  })

  it('should error on missing model', () => {
    try {
      create()(req)
    } catch (err) {
      expect(err).to.be.instanceOf(Error)
    }
  })

  it('should error on missing selector', () => {
    try {
      create(
        Model.User
      )(req)
    } catch (err) {
      expect(err).to.be.instanceOf(Error)
    }
  })

})