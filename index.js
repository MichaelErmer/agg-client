'use strict'
const net		= require('net'),
      _			= require('lodash'),
      inherits		= require('util').inherits,
      EventEmitter	= require('events').EventEmitter,
      byline		= require('byline')

function noop () {};

function AggClient (options) {
  EventEmitter.call(this);
  let self = this;
  self.options = _.defaults(options, {
    port: 4333,
    host: '127.0.0.1',
    keepalive: 10000
  });
  function keepalive (err, data) {
    if (data) self.emit('keepalive', 'PONG');
    if (self.options.keepalive)
      setTimeout(function() {
        self.emit('keepalive', 'PING');
        self.PNG(keepalive);
      }, self.options.keepalive);
  };
  self._client = net.connect({host: options.host, port: options.port}, function() {
    self.emit('connected');
    keepalive();
  });
  self._client.on('error', error => self.emit('error', error));
  self._client.on('close', () => self.emit('close'));
  self._client.on('timeout', () => {
    self._client.destroy();
    self.emit('error', {message: 'connect ETIMEDOUT'});
  });
  self._stream = byline.createStream();
  self._client.pipe(self._stream);
  self._current = "";
  self._stream.on('data', function(data) {
    data = data.toString();
    if (data.match(/^ /)) {
      self._current += "\r\n" + data.trim();
    } else if (data.match(/^ERR /)) {
      self.emit('err', data.slice(4));
    } else if (data.match(/^OK /)) {
      if (!self._current) self._current = data.slice(3);
      self.emit('data', self._current);
      self._current="";
    } else {
      self._current = data.trim();
    }
  });
  
  self._queue = [];
  self.on('err', err => {
    self._queue.shift()(err);
  });
  self.on('data', data => {
    self._queue.shift()(null, data);
  });
  self.internal_send_command = function(command) {
    var message = command.command;
    if (command.args && command.args.length) {
      message += " " + command.args.join(" ");
    }
    message += "\r\n";
    self._client.write(new Buffer(message));
    if (command.callback) {
      self._queue.push(command.callback);
    } else {
      self._queue.push(noop);
    }
  };
}
inherits(AggClient, EventEmitter);

exports.createClient = function (options) {
  return new AggClient(options);
}
exports.AggClient = AggClient;

require('./lib/commands')
