'use strict'
const net = require('net')

function AggClient () {
  let self = this
}

exports.createClient = function () {
  return new AggClient(arguments)
}

require('./lib/commands')
