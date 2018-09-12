'use strict'


module.exports = (req, res) => {

  setTimeout(() => {
    res.json({ foo: req.body.foo })
  }, 1000)

}