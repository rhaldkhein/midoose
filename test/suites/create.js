const sinon = require('sinon')
const shortid = require('shortid')
const create = require('../../src/middlewares/create')


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

  it('should create by array of fields (default)', done => {

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
      ['name', 'age']
    )(req, res)

  })

  it('should create by array of fields from query', done => {

    const stubCreate = sinon.stub(Model.User, 'create')
      .resolves({
        _id: shortid.generate(),
        name: req.query.name,
        age: req.query.age
      })

    const res = mockRes(payload => {
      try {
        expect(payload._id).to.be.a('string')
        expect(payload.name).to.be.equal(req.query.name)
        expect(payload.age).to.be.equal(req.query.age)
        expect(payload.active).to.be.undefined
        done()
      } catch (error) {
        done(error)
      }
      stubCreate.restore()
    })

    create(
      Model.User,
      ['name', 'age'],
      {
        from: 'query'
      }
    )(req, res)

  })

  it('should create and populate', done => {

    const req = {
      body: {
        title: 'NewFooPost'
      }
    }

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
      ['title', 'user'],
      {
        populate: 'user'
      }
    )(req, res)

  })

  it('should create by function of fields', done => {

    const stubCreate = sinon.stub(Model.User, 'create')
      .resolves({
        _id: shortid.generate(),
        ...({
          name: req.body.name,
          age: 101,
          active: false
        })
      })

    const res = mockRes(payload => {
      try {
        expect(payload._id).to.be.a('string')
        expect(payload.name).to.be.equal(req.body.name)
        expect(payload.age).to.be.equal(101)
        expect(payload.active).to.be.equal(false)
        done()
      } catch (error) {
        done(error)
      }
      stubCreate.restore()
    })

    create(
      Model.User,
      req => {
        return {
          name: req.body.name,
          age: 101,
          active: false
        }
      }
    )(req, res)

  })

  it('should create by function of multiple documents', done => {

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
      req => {
        return [{
          name: req.body.name
        }, {
          name: req.query.name
        }]
      }
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
      ['name', 'age', 'active'],
      {
        end: false
      }
    )(req, res, next)

  })

  it('should create but DO NOT end with custom key result', done => {

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
      ['name', 'age', 'active'],
      {
        end: false,
        key: 'customResult'
      }
    )(req, res, next)

  })

  it('should catch on error', done => {

    const stubCreate = sinon.stub(Model.User, 'create')
      .rejects(new Error('sample error'))

    const res = mockRes(payload => {
      try {
        expect(payload).to.be.instanceOf(Error)
          .with.property('message', 'sample error')
        done()
      } catch (error) {
        done(error)
      }
      stubCreate.restore()
    })

    create(
      Model.User,
      ['name', 'age']
    )(req, res)

  })

})