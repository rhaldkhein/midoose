const sinon = require('sinon')
const _filter = require('lodash/filter')
const findAll = require('../../src/middlewares/findAll')

describe('findAll', () => {

  let stubUserFind
  let stubPostFind

  const req = {
    body: {
      active: true,
      published: false
    },
    query: {
      active: false,
      published: true
    }
  }

  before(() => {

    /**
     * User stubs
     */
    stubUserFind = sinon.stub(Model.User, 'find')
    stubUserFind.withArgs({ active: true }).returns(Promise.resolve(
      _filter(samples.users, { active: true })
    ))
    stubUserFind.withArgs({ active: false }).returns(Promise.resolve(
      _filter(samples.users, { active: false })
    ))
    stubUserFind.withArgs({ active: true, age: 2 }).returns(Promise.resolve(
      _filter(samples.users, { active: true, age: 2 })
    ))
    // stub.withArgs('error').returns(
    //   Promise.reject(new Error('sample error'))
    // )
    stubUserFind.returns(Promise.resolve(samples.users))

    /**
     * Post stubs
     */
    stubPostFind = sinon.stub(Model.Post, 'find')
    stubPostFind.withArgs({ published: true }).returns(Promise.resolve(
      _filter(samples.posts, { published: true })
    ))
    stubPostFind.withArgs({ published: false }).returns(Promise.resolve(
      _filter(samples.posts, { published: false })
    ))
    stubPostFind.returns(Promise.resolve(samples.posts))


  })

  after(() => {
    stubUserFind.restore()
    stubPostFind.restore()
  })

  it('should find all (default)', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.have.lengthOf(4)
        expect(payload[0]._id).to.be.equal('101')
        expect(payload[1]._id).to.be.equal('102')
        expect(payload[2]._id).to.be.equal('103')
        expect(payload[3]._id).to.be.equal('104')
        done()
      } catch (error) {
        done(error)
      }
    })

    findAll(
      Model.User
    )(req, res)

  })

  it('should find all with condition', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.have.lengthOf(3)
        expect(payload[0]._id).to.be.equal('202')
        expect(payload[1]._id).to.be.equal('204')
        expect(payload[2]._id).to.be.equal('207')
        done()
      } catch (error) {
        done(error)
      }
    })

    findAll(
      Model.Post,
      { published: false }
    )(req, res)

  })

  it('should find all with condition from body', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.have.lengthOf(2)
        expect(payload[0].name).to.be.equal('FooUser')
        expect(payload[1].name).to.be.equal('BazUser')
        done()
      } catch (error) {
        done(error)
      }
    })

    findAll(
      Model.User,
      { active: 'body.active' }
    )(req, res)

  })

  it('should find all with more condition from body and locals', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.have.lengthOf(1)
        expect(payload[0]._id).to.be.equal('103')
        expect(payload[0].name).to.be.equal('BazUser')
        done()
      } catch (error) {
        done(error)
      }
    })

    res.locals.age = 2

    findAll(
      Model.User,
      {
        active: 'body.active',
        age: 'locals.age'
      }
    )(req, res)

  })

  it('should find all with function condition', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.have.lengthOf(5)
        expect(payload[4].title).to.be.equal('YooPost')
        done()
      } catch (error) {
        done(error)
      }
    })

    findAll(
      Model.Post,
      (req) => {
        return { published: req.query.published }
      }
    )(req, res)

  })

})