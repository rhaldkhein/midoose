const route = require('./route')


describe('my route', () => {

  it('should foo the bar', () => {

    const request = {
      body: {
        foo: 'bar',
      },
    }

    const req = mockReq(request)
    const res = mockRes()

    route(req, res)

    expect(res.json).to.be.calledWith({ foo: request.body.foo })

  })

})