const { query, params, locals } = require('../../../src/selector')

describe('selector for other sources', () => {

  const req = {
    query: { name: 'Foo' },
    params: { name: 'Bar' }
  }

  const res = {
    locals: { name: 'Zap' }
  }

  it('should select from query', () => {

    let selector, data

    selector = query('name')
    data = selector(req, res)

    expect(data).to.be.equal('Foo')

  })

  it('should select from params', () => {

    let selector, data

    selector = params('name')
    data = selector(req, res)

    expect(data).to.be.equal('Bar')

  })

  it('should select from locals', () => {

    let selector, data

    selector = locals('name')
    data = selector(req, res)

    expect(data).to.be.equal('Zap')

  })

})