'use strict'


module.exports = (req, res) => {

  res.json({ foo: req.body.foo + 'x' })

}