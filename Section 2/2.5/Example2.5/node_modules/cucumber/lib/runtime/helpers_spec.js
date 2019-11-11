"use strict";

var _mocha = require("mocha");

var _chai = require("chai");

var _helpers = require("./helpers");

(0, _mocha.describe)('Helpers', () => {
  (0, _mocha.describe)('getAmbiguousStepException', () => {
    (0, _mocha.beforeEach)(function () {
      this.result = (0, _helpers.getAmbiguousStepException)([{
        line: 3,
        pattern: 'pattern1',
        uri: 'steps1.js'
      }, {
        line: 4,
        pattern: 'longer pattern2',
        uri: 'steps2.js'
      }]);
    });
    (0, _mocha.it)('returns a nicely formatted error', function () {
      (0, _chai.expect)(this.result).to.eql('Multiple step definitions match:\n' + '  pattern1        - steps1.js:3\n' + '  longer pattern2 - steps2.js:4');
    });
  });
});