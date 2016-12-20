'use strict';

function Command (command, args, callback) {
    this.command = command;
    this.args = args;
    this.callback = callback;
}

module.exports = Command;