"use strict";

var util = require('util');
var Readable = require('stream').Readable;
var NanoTimer = require('nanotimer');

module.exports = Periodical;

function Periodical(options) {
    if (!(this instanceof Periodical)) {
        return new Periodical(options);
    }
    options = options || {};
    this._handler = options.handler;
    if (options.freq) {
        this._period = parseInt(1000 / parseFloat(options.freq)) + 'm';
    }
    if (options.period) {
        this._period = typeof options.period === 'string' ? options.period : options.period + 'm';
    }
    this._period = this._period || '1s';

    this.stats = {
        total: 0,
        executed: 0,
        skipped: 0
    };

    Readable.call(this);
}

util.inherits(Periodical, Readable);

Periodical.prototype._read = function () {
    this._reading = true;
    if (!this._timer) this.schedule();
};

Periodical.prototype.schedule = function (period) {
    var self = this;
    if (this._timer) this._timer.clearInterval();

    if (period) {
        period = typeof period === 'string' ? period : period + 'm';
    }
    period ? this._period = period : period = this._period;

    var timer = this._timer = new NanoTimer();
    timer.setInterval(function () {
        if (self.isEnded()) return;

        if (self._reading) {
            self._reading = false;
            self._execute();
        } else {
            self._stat('skipped');
        }
    }, '', period);
};

Periodical.prototype._execute = function () {
    this._stat('executed');
    return this._handler.call(this, this, function () {
        // done
    });
};

Periodical.prototype._stat = function (kpi) {
    this.stats[kpi]++;
    if (kpi == 'skipped' || kpi == 'executed') {
        this.stats.total++;
    }
};

Periodical.prototype.isEnded = function () {
    return this._readableState.ended;
};

Periodical.prototype.stop = function () {
    if (this._timer) {
        this._timer.clearInterval();
        this._timer = null;
    }
    this.push(null);
};

Periodical.prototype.safepush = function (chunk, encoding) {
    if (!this.isEnded()) {
        return this.push(chunk, encoding);
    }
};