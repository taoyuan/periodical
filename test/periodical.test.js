"use strict";

var t = require('chai').assert;
var s = require('./support');
var Periodical = require('../');


describe('Periodical', function () {

    it('should execute in specified frequency', function (done) {
        var count = 0;
        var freq = 100;
        var periodical = new Periodical({
            freq: freq,
            handler: function () {
                this.push('['+new Date()+']' + ++count + '\n');
            }
        });
        periodical.pipe(s.createWritable());

        setTimeout(function () {
            periodical.stop();
            console.log(periodical.stats);
            t.equal(periodical.stats.total, freq + 1);
            done();
        }, 1000);

    });

    it('should execute exactly count for re-schedule', function (done) {
        var count = 0;
        var periodical = new Periodical({
            period: 10,
            handler: function () {
                this.push('['+new Date()+']' + ++count + '\n');
            }
        });
        periodical.pipe(s.createWritable());

        setTimeout(function () {
            periodical.schedule(100);
        }, 500);

        setTimeout(function () {
            periodical.stop();
            console.log(periodical.stats);
            t.equal(periodical.stats.total, 55 + 1);
            done();
        }, 1000);

    });

});