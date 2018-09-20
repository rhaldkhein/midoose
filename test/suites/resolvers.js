const sinon = require('sinon')
const shortid = require('shortid')
const { body, derive } = require('../../src/resolver')
const create = require('../../src/middlewares/create')


describe('resolvers : body', () => {

  const req = {
    body: {
      name: 'Foo',
      age: 28,
      active: true,
      posts: [
        { title: 'Yoo' },
        { title: 'Rol' },
        { title: 'Par' }
      ]
    },
    query: {
      name: 'Bar',
      age: 31,
      active: false
    },
    params: {
      name: 'Zap',
      age: 42,
      active: false
    }
  }

  const res = {
    locals: {
      title: 'Jar',
      published: false,
      user: {
        name: 'Dar',
        age: 18,
        active: true
      }
    }
  }

  it('should resolve values from body', () => {

    let resolver, data

    // String
    resolver = body('name')
    data = resolver(req, res)

    expect(data).to.be.equal('Foo')

    // Array
    resolver = body([
      'age',
      'posts.0.title'
    ])
    data = resolver(req, res)

    // LAST:

    console.log(data)
    // expect(data.age).to.be.equal(28)
    // expect(data.posts)
    //   .have.nested.property('[0].title')
    //   .and.to.be.equal('Yoo')

    // Object
    resolver = body({
      ageNow: 'age',
      isActive: 'active',
      totalPosts: derive('posts', posts => posts.length)
    })
    data = resolver(req, res)

    expect(data.age).to.be.undefined
    expect(data.ageNow).to.be.equal(28)
    expect(data.active).to.be.undefined
    expect(data.isActive).to.be.true

  })

})