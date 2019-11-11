"use strict";

var _mocha = require("mocha");

var _chai = require("chai");

var _usage_formatter = _interopRequireDefault(require("./usage_formatter"));

var _events = _interopRequireDefault(require("events"));

var _gherkin = _interopRequireDefault(require("gherkin"));

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(0, _mocha.describe)('UsageFormatter', () => {
  (0, _mocha.describe)('handleFeaturesResult', () => {
    (0, _mocha.beforeEach)(function () {
      this.eventBroadcaster = new _events.default();
      this.output = '';

      const logFn = data => {
        this.output += data;
      };

      this.supportCodeLibrary = {
        stepDefinitions: []
      };
      this.usageFormatter = new _usage_formatter.default({
        eventBroadcaster: this.eventBroadcaster,
        eventDataCollector: new _helpers.EventDataCollector(this.eventBroadcaster),
        log: logFn,
        supportCodeLibrary: this.supportCodeLibrary
      });
    });
    (0, _mocha.describe)('no step definitions', () => {
      (0, _mocha.beforeEach)(function () {
        this.eventBroadcaster.emit('test-run-finished');
      });
      (0, _mocha.it)('outputs "No step definitions"', function () {
        (0, _chai.expect)(this.output).to.eql('No step definitions');
      });
    });
    (0, _mocha.describe)('with one step definition', () => {
      (0, _mocha.beforeEach)(function () {
        this.stepDefinition = {
          line: 1,
          pattern: '/^abc?$/',
          uri: 'steps.js'
        };
        this.supportCodeLibrary.stepDefinitions = [this.stepDefinition];
      });
      (0, _mocha.describe)('unused', () => {
        (0, _mocha.beforeEach)(function () {
          this.eventBroadcaster.emit('test-run-finished');
        });
        (0, _mocha.it)('outputs the step definition as unused', function () {
          (0, _chai.expect)(this.output).to.eql('┌────────────────┬──────────┬────────────┐\n' + '│ Pattern / Text │ Duration │ Location   │\n' + '├────────────────┼──────────┼────────────┤\n' + '│ /^abc?$/       │ UNUSED   │ steps.js:1 │\n' + '└────────────────┴──────────┴────────────┘\n');
        });
      });
      (0, _mocha.describe)('used', () => {
        (0, _mocha.beforeEach)(function () {
          const events = _gherkin.default.generateEvents('Feature: a\nScenario: b\nWhen abc\nThen ab', 'a.feature');

          events.forEach(event => {
            this.eventBroadcaster.emit(event.type, event);

            if (event.type === 'pickle') {
              this.eventBroadcaster.emit('pickle-accepted', {
                type: 'pickle-accepted',
                pickle: event.pickle,
                uri: event.uri
              });
            }
          });
          this.testCase = {
            sourceLocation: {
              uri: 'a.feature',
              line: 2
            }
          };
          this.eventBroadcaster.emit('test-case-prepared', _objectSpread({}, this.testCase, {
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
                line: 1
              }
            }]
          }));
        });
        (0, _mocha.describe)('in dry run', () => {
          (0, _mocha.beforeEach)(function () {
            this.eventBroadcaster.emit('test-step-finished', {
              index: 0,
              testCase: this.testCase,
              result: {}
            });
            this.eventBroadcaster.emit('test-step-finished', {
              index: 1,
              testCase: this.testCase,
              result: {}
            });
            this.eventBroadcaster.emit('test-run-finished');
          });
          (0, _mocha.it)('outputs the step definition without durations', function () {
            (0, _chai.expect)(this.output).to.eql('┌────────────────┬──────────┬─────────────┐\n' + '│ Pattern / Text │ Duration │ Location    │\n' + '├────────────────┼──────────┼─────────────┤\n' + '│ /^abc?$/       │ -        │ steps.js:1  │\n' + '│   ab           │ -        │ a.feature:4 │\n' + '│   abc          │ -        │ a.feature:3 │\n' + '└────────────────┴──────────┴─────────────┘\n');
          });
        });
        (0, _mocha.describe)('not in dry run', () => {
          (0, _mocha.beforeEach)(function () {
            this.eventBroadcaster.emit('test-step-finished', {
              index: 0,
              testCase: this.testCase,
              result: {
                duration: 1
              }
            });
            this.eventBroadcaster.emit('test-step-finished', {
              index: 1,
              testCase: this.testCase,
              result: {
                duration: 0
              }
            });
            this.eventBroadcaster.emit('test-run-finished');
          });
          (0, _mocha.it)('outputs the step definition with durations in desending order', function () {
            (0, _chai.expect)(this.output).to.eql('┌────────────────┬──────────┬─────────────┐\n' + '│ Pattern / Text │ Duration │ Location    │\n' + '├────────────────┼──────────┼─────────────┤\n' + '│ /^abc?$/       │ 0.5ms    │ steps.js:1  │\n' + '│   abc          │ 1ms      │ a.feature:3 │\n' + '│   ab           │ 0ms      │ a.feature:4 │\n' + '└────────────────┴──────────┴─────────────┘\n');
          });
        });
      });
    });
    (0, _mocha.describe)('with multiple definition', () => {
      (0, _mocha.beforeEach)(function () {
        this.supportCodeLibrary.stepDefinitions = [{
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
        }];

        const events = _gherkin.default.generateEvents('Feature: a\nScenario: b\nGiven abc\nWhen def', 'a.feature');

        events.forEach(event => {
          this.eventBroadcaster.emit(event.type, event);

          if (event.type === 'pickle') {
            this.eventBroadcaster.emit('pickle-accepted', {
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
        this.eventBroadcaster.emit('test-case-prepared', _objectSpread({}, testCase, {
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
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: testCase,
          result: {
            duration: 1
          }
        });
        this.eventBroadcaster.emit('test-step-finished', {
          index: 1,
          testCase: testCase,
          result: {
            duration: 2
          }
        });
        this.eventBroadcaster.emit('test-run-finished');
      });
      (0, _mocha.it)('outputs the step definitions ordered by mean duration descending with unused steps at the end', function () {
        (0, _chai.expect)(this.output).to.eql('┌────────────────┬──────────┬─────────────┐\n' + '│ Pattern / Text │ Duration │ Location    │\n' + '├────────────────┼──────────┼─────────────┤\n' + '│ /def/          │ 2ms      │ steps.js:2  │\n' + '│   def          │ 2ms      │ a.feature:4 │\n' + '├────────────────┼──────────┼─────────────┤\n' + '│ /abc/          │ 1ms      │ steps.js:1  │\n' + '│   abc          │ 1ms      │ a.feature:3 │\n' + '├────────────────┼──────────┼─────────────┤\n' + '│ /ghi/          │ UNUSED   │ steps.js:3  │\n' + '└────────────────┴──────────┴─────────────┘\n');
      });
    });
  });
});