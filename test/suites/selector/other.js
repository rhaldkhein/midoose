const { query, params, locals,
  req: selReq, res: selRes } = require('../../../src/selector')

describe('selector for other sources', () => {

  const req = {
    query: { name: 'Foo' },
    params: { name: 'Bar' },
    user: 'Baz'
  }

  const res = {
    locals: { name: 'Zap' },
    kind: 'Fol'
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

  it('should select from req object', () => {

    let selector, data

    selector = selReq('user')
    data = selector(req, res)

    expect(data).to.be.equal('Baz')

  })

  it('should select from res object', () => {

    let selector, data

    selector = selRes('kind')
    data = selector(req, res)

    expect(data).to.be.equal('Fol')

  })

})