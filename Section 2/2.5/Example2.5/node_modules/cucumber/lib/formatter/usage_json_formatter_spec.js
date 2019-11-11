"use strict";

var _mocha = require("mocha");

var _chai = require("chai");

var _usage_json_formatter = _interopRequireDefault(require("./usage_json_formatter"));

var _events = _interopRequireDefault(require("events"));

var _gherkin = _interopRequireDefault(require("gherkin"));

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(0, _mocha.describe)('UsageJsonFormatter', () => {
  (0, _mocha.describe)('handleFeaturesResult', () => {
    (0, _mocha.beforeEach)(function () {
      const eventBroadcaster = new _events.default();
      this.output = '';

      const logFn = data => {
        this.output += data;
      };

      const supportCodeLibrary = {
        stepDefinitions: [{
          line: 1,
          pattern: '/abc/',
          uri: 'steps.js'
        }, {
          line: 2,
          pattern: '/def/',
          uri: 'steps.js'
        }, {
          line: 3,
          pattern: '/ghi/',
          uri: 'steps.js'
        }]
      };
      this.usageJsonFormatter = new _usage_json_formatter.default({
        eventBroadcaster: eventBroadcaster,
        eventDataCollector: new _helpers.EventDataCollector(eventBroadcaster),
        log: logFn,
        supportCodeLibrary: supportCodeLibrary
      });

      const events = _gherkin.default.generateEvents('Feature: a\nScenario: b\nGiven abc\nWhen def', 'a.feature');

      events.forEach(event => {
        eventBroadcaster.emit(event.type, event);

        if (event.type === 'pickle') {
          eventBroadcaster.emit('pickle-accepted', {
            type: 'pickle-accepted',
            pickle: event.pickle,
            uri: event.uri
          });
        }
      });
      const testCase = {
        sourceLocation: {
          uri: 'a.feature',
          line: 2
        }
      };
      eventBroadcaster.emit('test-case-prepared', _objectSpread({}, testCase, {
        steps: [{
          sourceLocation: {
            uri: 'a.feature',
            line: 3
          },
          actionLocation: {
            uri: 'steps.js',
            line: 1
          }
        }, {
          sourceLocation: {
            uri: 'a.feature',
            line: 4
          },
          actionLocation: {
            uri: 'steps.js',
            line: 2
          }
        }]
      }));
      eventBroadcaster.emit('test-step-finished', {
        index: 0,
        testCase: testCase,
        result: {
          duration: 1
        }
      });
      eventBroadcaster.emit('test-step-finished', {
        index: 1,
        testCase: testCase,
        result: {
          duration: 2
        }
      });
      eventBroadcaster.emit('test-run-finished');
    });
    (0, _mocha.it)('outputs the usage in json format', function () {
      const parsedOutput = JSON.parse(this.output);
      (0, _chai.expect)(parsedOutput).to.eql([{
        line: 2,
        matches: [{
          duration: 2,
          line: 4,
          text: 'def',
          uri: 'a.feature'
        }],
        meanDuration: 2,
        pattern: '/def/',
        uri: 'steps.js'
      }, {
        line: 1,
        matches: [{
          duration: 1,
          line: 3,
          text: 'abc',
          uri: 'a.feature'
        }],
        meanDuration: 1,
        pattern: '/abc/',
        uri: 'steps.js'
      }, {
        line: 3,
        matches: [],
        pattern: '/ghi/',
        uri: 'steps.js'
      }]);
    });
  });
});