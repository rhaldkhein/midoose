'use strict'

const { body } = require('../../../src/selector')

describe('selector for body', () => {

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

  it('should select a value from body', () => {

    let selector, data

    selector = body('name')
    data = selector(req, res)

    expect(data).to.be.equal('Foo')

  })

  it('should select values from body using object', () => {

    let selector, data

    selector = body({
      ageNow: 'age',
      isActive: 'active'
    })
    data = selector(req, res)

    expect(data.age).to.be.undefined
    expect(data.ageNow).to.be.equal(28)
    expect(data.active).to.be.undefined
    expect(data.isActive).to.be.true

  })

  it('should select values from body using array', () => {

    let selector, data

    selector = body([
      'age',
      'posts'
    ])
    data = selector(req, res)

    expect(data.age).to.be.equal(28)
    expect(data.posts)
      .have.nested.property('[0].title')
      .and.to.be.equal('Yoo')

  })

})