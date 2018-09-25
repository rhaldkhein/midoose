'use strict'

const { body, derive } = require('../../../src/selector')

describe('derive', () => {

  const req = {
    body: {
      name: 'Foo',
      age: 28,
      male: true,
      active: true,
      posts: [
        { title: 'Yoo' },
        { title: 'Rol' },
        { title: 'Par' }
      ]
    }
  }

  const res = {}

  it('should derive a value', () => {

    let selector, data

    selector = body(
      derive('name', val => ('Hello ' + val))
    )
    data = selector(req, res)

    expect(data).to.be.equal('Hello Foo')

  })

  it('should derive values using object', () => {

    let selector, data

    selector = body(
      {
        greetings: derive('name', val => ('Hello ' + val))
      }
    )
    data = selector(req, res)

    expect(data).to.have.property('greetings').and.to.be.equal('Hello Foo')

  })

  it('should derive values using array', () => {

    let selector, data

    selector = body(
      [
        derive('name', (val, body) => ('Hello ' + (body.male ? 'Mr. ' : ' ') + val)),
        derive('age', 'newAge', val => (val + 6))
      ]
    )
    data = selector(req, res)

    expect(data).to.have.property('name').and.to.be.equal('Hello Mr. Foo')
    expect(data).to.have.property('newAge').and.to.be.equal(34)

  })

})