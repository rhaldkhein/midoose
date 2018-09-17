// const sinon = require('sinon')
// const _find = require('lodash/find')
// const _filter = require('lodash/filter')
// const findOne = require('../../src/middlewares/findOne')

// describe('findOne', () => {

//   let stubUserFind
//   let stubPostFind
//   let stubPostPopulate

//   const req = {
//     body: {
//       active: true,
//       published: false
//     },
//     query: {
//       active: false,
//       published: true
//     }
//   }

//   before(() => {

//     /**
//      * User stubs
//      */
//     stubUserFind = sinon.stub(Model.User, 'findOne')
//     stubUserFind.withArgs({ active: true }).resolves(
//       _filter(samples.users, { active: true })
//     )
//     stubUserFind.withArgs({ active: false }).resolves(
//       _filter(samples.users, { active: false })
//     )
//     stubUserFind.withArgs({ active: true, age: 2 }).resolves(
//       _filter(samples.users, { active: true, age: 2 })
//     )
//     stubUserFind.withArgs(sinon.match.any, 'name').resolves(
//       samples.users.map(item => ({ _id: item._id, name: item.name }))
//     )
//     stubUserFind.withArgs('error').rejects(
//       new Error('sample error')
//     )
//     stubUserFind.resolves(samples.users)

//     /**
//      * Post stubs
//      */

//     // Find
//     stubPostFind = sinon.stub(Model.Post, 'findOne')
//     stubPostFind.withArgs({ published: true }).resolves(
//       _filter(samples.posts, { published: true })
//     )
//     stubPostFind.withArgs({ published: false }).resolves(
//       _filter(samples.posts, { published: false })
//     )
//     stubPostFind.resolves(samples.posts)

//     // Populate
//     stubPostPopulate = sinon.stub(Model.Post, 'populate')
//     stubPostPopulate.withArgs(sinon.match.any, 'user').resolves(
//       samples.posts.map(item => {
//         return {
//           ...item,
//           user: _find(samples.users, { _id: item.user })
//         }
//       })
//     )

//   })

//   after(() => {
//     stubUserFind.restore()
//     stubPostFind.restore()
//     stubPostPopulate.restore()
//   })

//   it('should find all (default)', done => {

//     const res = mockRes(payload => {
//       try {
//         expect(payload).to.have.lengthOf(4)
//         expect(payload[0]._id).to.be.equal('101')
//         expect(payload[1]._id).to.be.equal('102')
//         expect(payload[2]._id).to.be.equal('103')
//         expect(payload[3]._id).to.be.equal('104')
//         done()
//       } catch (error) {
//         done(error)
//       }
//     })

//     findOne(
//       Model.User
//     )(req, res)

//   })

//   it('should find all with condition', done => {

//     const res = mockRes(payload => {
//       try {
//         expect(payload).to.have.lengthOf(3)
//         expect(payload[0]._id).to.be.equal('202')
//         expect(payload[1]._id).to.be.equal('204')
//         expect(payload[2]._id).to.be.equal('207')
//         done()
//       } catch (error) {
//         done(error)
//       }
//     })

//     findOne(
//       Model.Post,
//       { published: false }
//     )(req, res)

//   })

//   it('should find all with condition from body', done => {

//     const res = mockRes(payload => {
//       try {
//         expect(payload).to.have.lengthOf(2)
//         expect(payload[0].name).to.be.equal('FooUser')
//         expect(payload[1].name).to.be.equal('BazUser')
//         done()
//       } catch (error) {
//         done(error)
//       }
//     })

//     findOne(
//       Model.User,
//       { active: 'body.active' }
//     )(req, res)

//   })

//   it('should find all with more condition from body and locals', done => {

//     const res = mockRes(payload => {
//       try {
//         expect(payload).to.have.lengthOf(1)
//         expect(payload[0]._id).to.be.equal('103')
//         expect(payload[0].name).to.be.equal('BazUser')
//         done()
//       } catch (error) {
//         done(error)
//       }
//     })

//     res.locals.age = 2

//     findOne(
//       Model.User,
//       {
//         active: 'body.active',
//         age: 'locals.age'
//       }
//     )(req, res)

//   })

//   it('should find all with function condition', done => {

//     const res = mockRes(payload => {
//       try {
//         expect(payload).to.have.lengthOf(5)
//         expect(payload[4].title).to.be.equal('YooPost')
//         done()
//       } catch (error) {
//         done(error)
//       }
//     })

//     findOne(
//       Model.Post,
//       (req) => {
//         return { published: req.query.published }
//       }
//     )(req, res)

//   })

//   it('should find all with select / projection', done => {

//     const res = mockRes(payload => {
//       try {
//         expect(payload).to.have.lengthOf(4)
//         expect(payload[0]._id).to.be.equal('101')
//         expect(payload[3]._id).to.be.equal('104')
//         expect(payload[0].age).to.be.undefined
//         expect(payload[3].age).to.be.undefined
//         done()
//       } catch (error) {
//         done(error)
//       }
//     })

//     findOne(
//       Model.User,
//       {},
//       {
//         select: 'name'
//       }
//     )(req, res)

//   })

//   it('should find all and populate', done => {

//     const res = mockRes(payload => {
//       try {
//         expect(payload).to.have.lengthOf(8)
//         expect(payload[7]).to.be.property('_id')
//         expect(payload[7]).to.be.property('user')
//         expect(payload[7].user._id).to.be.a('string')
//         expect(payload[7].user.name).to.be.equal('ZapUser')
//         done()
//       } catch (error) {
//         done(error)
//       }
//     })

//     findOne(
//       Model.Post,
//       {},
//       {
//         populate: 'user'
//       }
//     )(req, res)

//   })

//   it('should find all and mapped results', done => {

//     const res = mockRes(payload => {
//       try {
//         expect(payload).to.have.lengthOf(4)
//         expect(payload[3]._id).to.be.undefined
//         expect(payload[3]).to.be.property('greeting')
//         expect(payload[3].greeting).to.be.equal('Hello ZapUser')
//         done()
//       } catch (error) {
//         done(error)
//       }
//     })

//     findOne(
//       Model.User,
//       {},
//       {
//         map: item => {
//           return {
//             greeting: 'Hello ' + item.name
//           }
//         }
//       }
//     )(req, res)

//   })

//   it('should find but DO NOT end', done => {

//     const resJsonEnd = sinon.spy()
//     const res = mockRes(resJsonEnd)
//     const next = () => {
//       try {
//         expect(resJsonEnd).to.have.not.been.called
//         expect(res.locals).to.be.property('result')
//         expect(res.locals.result).to.be.a('array')
//         expect(res.locals.result[3]._id).to.be.equal('104')
//         done()
//       } catch (error) {
//         done(error)
//       }
//     }

//     findOne(
//       Model.User,
//       {},
//       {
//         end: false
//       }
//     )(req, res, next)

//   })

//   it('should find but DO NOT end with custom key result', done => {

//     const resJsonEnd = sinon.spy()
//     const res = mockRes(resJsonEnd)
//     const next = () => {
//       try {
//         expect(resJsonEnd).to.have.not.been.called
//         expect(res.locals).to.be.property('customResult')
//         expect(res.locals.customResult).to.be.a('array')
//         expect(res.locals.customResult[3]._id).to.be.equal('104')
//         done()
//       } catch (error) {
//         done(error)
//       }
//     }

//     findOne(
//       Model.User,
//       {},
//       {
//         end: false,
//         key: 'customResult'
//       }
//     )(req, res, next)

//   })

//   it('should catch', done => {

//     const res = mockRes(payload => {
//       try {
//         expect(payload).to.be.instanceOf(Error)
//           .with.property('message', 'sample error')
//         done()
//       } catch (error) {
//         done(error)
//       }
//     })

//     findOne(
//       Model.User,
//       () => 'error'
//     )(req, res)

//   })

// })