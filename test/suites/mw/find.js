const sinon = require('sinon')
const _find = require('lodash/find')
const _filter = require('lodash/filter')
const find = require('../../../src/middlewares/find')
const { raw, body } = require('../../../src/selector')

describe('find', () => {

  let stubUserFind
  let stubPostFind
  let stubPostPopulate

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
    stubUserFind.withArgs('error').rejects(new Error('sample error'))
    stubUserFind.withArgs('options', sinon.match.any, sinon.match.any)
      .rejects(new Error('ok options'))
    stubUserFind.withArgs({ active: true }).resolves(
      _filter(samples.users, { active: true })
    )
    stubUserFind.withArgs({ active: false }).resolves(
      _filter(samples.users, { active: false })
    )
    stubUserFind.withArgs({ active: true, age: 2 }).resolves(
      _filter(samples.users, { active: true, age: 2 })
    )
    stubUserFind.withArgs(sinon.match.any, 'name').resolves(
      samples.users.map(item => ({ _id: item._id, name: item.name }))
    )
    stubUserFind.resolves(samples.users)

    /**
     * Post stubs
     */

    // Find
    stubPostFind = sinon.stub(Model.Post, 'find')
    stubPostFind.withArgs({ published: true }).resolves(
      _filter(samples.posts, { published: true })
    )
    stubPostFind.withArgs({ published: false }).resolves(
      _filter(samples.posts, { published: false })
    )
    stubPostFind.resolves(samples.posts)

    // Populate
    stubPostPopulate = sinon.stub(Model.Post, 'populate')
    stubPostPopulate.withArgs(sinon.match.any, 'user').resolves(
      samples.posts.map(item => {
        return {
          ...item,
          user: _find(samples.users, { _id: item.user })
        }
      })
    )

  })

  after(() => {
    stubUserFind.restore()
    stubPostFind.restore()
    stubPostPopulate.restore()
  })

  it('should find all', done => {

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

    find(
      Model.User,
      raw({})
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

    find(
      Model.Post,
      raw({ published: false })
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

    find(
      Model.User,
      body(['active'])
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

    find(
      Model.Post,
      (req) => {
        return { published: req.query.published }
      }
    )(req, res)

  })

  it('should find all with select / projection', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.have.lengthOf(4)
        expect(payload[0]._id).to.be.equal('101')
        expect(payload[3]._id).to.be.equal('104')
        expect(payload[0].age).to.be.undefined
        expect(payload[3].age).to.be.undefined
        done()
      } catch (error) {
        done(error)
      }
    })

    find(
      Model.User,
      raw({}),
      {
        select: 'name'
      }
    )(req, res)

  })

  it('should find all and populate', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.have.lengthOf(8)
        expect(payload[7]).to.be.property('_id')
        expect(payload[7]).to.be.property('user')
        expect(payload[7].user._id).to.be.a('string')
        expect(payload[7].user.name).to.be.equal('ZapUser')
        done()
      } catch (error) {
        done(error)
      }
    })

    find(
      Model.Post,
      raw({}),
      {
        populate: 'user'
      }
    )(req, res)

  })

  it('should find all and mapped results', done => {

    const res = mockRes(payload => {
      try {
        expect(payload).to.have.lengthOf(4)
        expect(payload[3]._id).to.be.undefined
        expect(payload[3]).to.be.property('greeting')
        expect(payload[3].greeting).to.be.equal('Hello ZapUser')
        done()
      } catch (error) {
        done(error)
      }
    })

    find(
      Model.User,
      raw({}),
      {
        map: item => {
          return {
            greeting: 'Hello ' + item.name
          }
        }
      }
    )(req, res)

  })

  it('should find but DO NOT end', done => {

    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('result')
        expect(res.locals.result).to.be.a('array')
        expect(res.locals.result[3]._id).to.be.equal('104')
        done()
      } catch (error) {
        done(error)
      }
    }

    find(
      Model.User,
      raw({}),
      {
        end: false
      }
    )(req, res, next)

  })

  it('should find but DO NOT end and with custom key result', done => {

    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)
    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.be.property('customResult')
        expect(res.locals.customResult).to.be.a('array')
        expect(res.locals.customResult[3]._id).to.be.equal('104')
        done()
      } catch (error) {
        done(error)
      }
    }

    find(
      Model.User,
      raw({}),
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
    find(
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
    find(
      Model.User,
      () => 'error'
    )(req, res, next)
  })

})