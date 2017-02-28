var _ = require('lodash');
var process = require('process');
window.Benchmark = window.Benchmark.runInContext({ _: _, process: process });
