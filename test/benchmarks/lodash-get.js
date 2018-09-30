'use strict'

const benchmark = require('./_benchmark')

const _ = require('lodash')

const data = {
  body: {
    service: '123456789'
  }
}

benchmark({
  'lodash': () => {
    _.get(data, 'body.service')
  },
  'native': () => {
    data.body.service
  }
})