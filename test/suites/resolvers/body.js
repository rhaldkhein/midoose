const { body } = require('../../../src/resolver')

describe('resolver for body', () => {

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
    }
  }

  const res = {}

  it('should resolve to string', () => {

    let resolver, data

    resolver = body('name')
    data = resolver(req, res)

    expect(data).to.be.equal('Foo')

  })

  it('should resolve to object from body using object', () => {

    let resolver, data

    resolver = body({
      ageNow: 'age',
      isActive: 'active'
    })
    data = resolver(req, res)

    expect(data.age).to.be.undefined
    expect(data.ageNow).to.be.equal(28)
    expect(data.active).to.be.undefined
    expect(data.isActive).to.be.true

  })

  it('should resolve to object from body using array', () => {

    let resolver, data

    resolver = body([
      'age',
      'posts'
    ])
    data = resolver(req, res)

    expect(data.age).to.be.equal(28)
    expect(data.posts)
      .have.nested.property('[0].title')
      .and.to.be.equal('Yoo')

  })

})