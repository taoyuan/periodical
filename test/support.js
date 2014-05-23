"use strict";

var Writable = require('stream').Writable;

exports.createWritable = function (fn) {
    var ws = Writable();
    ws._write = function (chunk, enc, next) {
        if (fn) {
            return fn.call(this, chunk, enc, next);
        } else {
            next();
        }
    };
    return ws;
};