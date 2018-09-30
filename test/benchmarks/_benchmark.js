'use strict'

const Benchmark = require('benchmark')

module.exports = (
  tests,
  opt = {
    async: false
  }) => {
  let suite = new Benchmark.Suite
  for (const name in tests) {
    if (tests.hasOwnProperty(name)) {
      const elem = tests[name]
      suite = Array.isArray(elem) ?
        suite.add(name, elem[0], elem[1]) :
        suite.add(name, elem)
    }
  }
  suite
    .on('cycle', function (event) {
      console.log(String(event.target))
    })
    .on('complete', function () {
      console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run(opt)
}