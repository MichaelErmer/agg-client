'use strict'

const agg = require('../');

function t() {return new Date().getTime().toString(); }

var host = process.argv[2] || '127.0.0.1';

var client = agg.createClient({host});

client.on('error', function(error) { console.log(t(), '> error', error); });
client.on('connected', function() { console.log(t(), '> connected'); });
client.on('keepalive', function(type) { console.log(t(), '> keepalive', type); });

client.GET('ERROR', function(error, value) {
  if (error) return console.error(t(), 'GET', 'ERROR', error);
  console.log(t(), 'GET', value);
});

client.SUM('*', function(error, sum) {
  if (error) return console.error(t(), 'SUM', 'ERROR', error);
  console.log(t(), 'SUM', sum);
});
