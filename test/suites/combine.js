const sinon = require('sinon')
const _find = require('lodash/find')
const _filter = require('lodash/filter')
const find = require('../../src/middlewares/find')
const { body, query, params, locals } = require('../../src/selector')
const combine = require('../../src/combine')

describe('combine', () => {

  let stubUserFind
  let stubPostFind
  let stubPostPopulate

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
    stubUserFind.withArgs({ age: 2 }).resolves(
      _filter(samples.users, { age: 2 })
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

  it('should combine selectors', () => {

    const req = {
      body: { name: 'Foo' },
      query: { age: 21 },
      params: { active: true }
    }

    const res = {
      locals: { surname: 'Jar' }
    }

    let selectors = combine(
      body(['name']),
      query(['age']),
      params(['active']),
      locals(['surname'])
    )

    let result = selectors(req, res)

    expect(result).to.be.a('object')
    expect(result).to.have.property('name').and.to.equal('Foo')
    expect(result).to.have.property('age').and.to.equal(21)
    expect(result).to.have.property('active').and.to.equal(true)
    expect(result).to.have.property('surname').and.to.equal('Jar')

  })

  it('should combine middlewares and end by default', (done) => {

    const req = {
      body: {
        active: true,
        published: false
      },
      query: {
        country: 'US'
      }
    }

    const res = mockRes(payload => {
      try {
        expect(payload).to.have.property('0')
        expect(payload).to.have.property('1')
        expect(payload[0]).to.be.a('array')
        expect(payload[1]).to.be.a('array')
        expect(payload[0][1]._id).to.be.equal('103')
        expect(payload[1][2]._id).to.be.equal('207')
        done()
      } catch (error) {
        done(error)
      }
    })

    let middlewares = combine(
      find(Model.User, body(['active'])),
      find(Model.Post, body(['published']))
    )

    middlewares(req, res, () => null)

  })

  it('should combine middlewares and DO NOT end with custom result key', (done) => {

    const req = {
      body: {
        active: true,
        published: false
      },
      query: {
        country: 'US'
      }
    }

    const resJsonEnd = sinon.spy()
    const res = mockRes(resJsonEnd)

    const next = () => {
      try {
        expect(resJsonEnd).to.have.not.been.called
        expect(res.locals).to.have.property('customResult')
          .and.to.be.a('object')
        expect(res.locals.customResult[0]).to.be.a('array')
        expect(res.locals.customResult[0][1]._id).to.be.equal('103')
        expect(res.locals).to.not.have.property('resultB')
        expect(res.locals.customResult).to.have.property('resultB')
          .and.to.be.a('array')
        expect(res.locals.customResult.resultB[2]._id)
          .to.be.equal('207')
        done()
      } catch (error) {
        done(error)
      }
    }

    let middlewares = combine(
      find(Model.User, body(['active'])),
      find(Model.Post, body(['published']), { key: 'resultB' }),
      { end: false, key: 'customResult' }
    )

    middlewares(req, res, next)

  })

})