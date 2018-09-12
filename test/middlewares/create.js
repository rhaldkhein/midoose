const create = require('../../src/middlewares/create')
const route = require('../route')
const sinon = require('sinon')

function asyncHello(name, delay, cb) {
  setTimeout(function () {
    console.log("running after ", delay)
    cb("hello " + name)
  }, delay)
}

describe('create', () => {

  it('should foo the bar', () => {

    var cb = sinon.spy()
    asyncHello("foo", 500, cb)

    cb.should.have.been.called

    // const req = {
    //   body: {
    //     name: 'Kinn',
    //     age: 28,
    //     active: true,
    //   }
    // }

    // const res = {
    //   json: sinon.spy()
    // }

    // const req = mockReq(data)
    // const res = mockRes()
    // create(
    //   Model.User,
    //   ['name', 'age', 'active']
    // )(req, res)

    // route(req, res)

    // expect(res.json).to.have.been.called()
    // res.json.should.have.been.called()

    // expect(res.json).to.be.called()
    // expect(res.json).to.be.calledWith({ foo: data.body.foo })

  })

})