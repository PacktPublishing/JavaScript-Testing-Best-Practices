"use strict";

var _mocha = require("mocha");

var _chai = require("chai");

var _json_formatter = _interopRequireDefault(require("./json_formatter"));

var _status = _interopRequireDefault(require("../status"));

var _events = _interopRequireDefault(require("events"));

var _gherkin = _interopRequireDefault(require("gherkin"));

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(0, _mocha.describe)('JsonFormatter', () => {
  (0, _mocha.beforeEach)(function () {
    this.eventBroadcaster = new _events.default();
    this.output = '';

    const logFn = data => {
      this.output += data;
    };

    this.jsonFormatter = new _json_formatter.default({
      eventBroadcaster: this.eventBroadcaster,
      eventDataCollector: new _helpers.EventDataCollector(this.eventBroadcaster),
      log: logFn
    });
  });
  (0, _mocha.describe)('no features', () => {
    (0, _mocha.beforeEach)(function () {
      this.eventBroadcaster.emit('test-run-finished');
    });
    (0, _mocha.it)('outputs an empty array', function () {
      (0, _chai.expect)(JSON.parse(this.output)).to.eql([]);
    });
  });
  (0, _mocha.describe)('one scenario with one step', () => {
    (0, _mocha.beforeEach)(function () {
      const events = _gherkin.default.generateEvents('@tag1 @tag2\n' + 'Feature: my feature\n' + 'my feature description\n' + 'Scenario: my scenario\n' + 'my scenario description\n' + 'Given my step', 'a.feature');

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
          line: 4
        }
      };
    });
    (0, _mocha.describe)('passed', () => {
      (0, _mocha.beforeEach)(function () {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [{
            sourceLocation: {
              uri: 'a.feature',
              line: 6
            }
          }]
        });
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: {
            duration: 1,
            status: _status.default.PASSED
          }
        });
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: {
            duration: 1,
            status: _status.default.PASSED
          }
        });
        this.eventBroadcaster.emit('test-run-finished');
      });
      (0, _mocha.it)('outputs the feature', function () {
        (0, _chai.expect)(JSON.parse(this.output)).to.eql([{
          description: 'my feature description',
          elements: [{
            description: 'my scenario description',
            id: 'my-feature;my-scenario',
            keyword: 'Scenario',
            line: 4,
            name: 'my scenario',
            type: 'scenario',
            steps: [{
              arguments: [],
              line: 6,
              keyword: 'Given ',
              name: 'my step',
              result: {
                status: 'passed',
                duration: 1000000
              }
            }],
            tags: [{
              name: '@tag1',
              line: 1
            }, {
              name: '@tag2',
              line: 1
            }]
          }],
          id: 'my-feature',
          keyword: 'Feature',
          line: 2,
          name: 'my feature',
          tags: [{
            name: '@tag1',
            line: 1
          }, {
            name: '@tag2',
            line: 1
          }],
          uri: 'a.feature'
        }]);
      });
    });
    (0, _mocha.describe)('failed', () => {
      (0, _mocha.beforeEach)(function () {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [{
            sourceLocation: {
              uri: 'a.feature',
              line: 6
            }
          }]
        });
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: {
            duration: 1,
            exception: 'my error',
            status: _status.default.FAILED
          }
        });
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: {
            duration: 1,
            status: _status.default.FAILED
          }
        });
        this.eventBroadcaster.emit('test-run-finished');
      });
      (0, _mocha.it)('includes the error message', function () {
        const features = JSON.parse(this.output);
        (0, _chai.expect)(features[0].elements[0].steps[0].result).to.eql({
          status: 'failed',
          error_message: 'my error',
          duration: 1000000
        });
      });
    });
    (0, _mocha.describe)('with a step definition', () => {
      (0, _mocha.beforeEach)(function () {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [{
            actionLocation: {
              uri: 'steps.js',
              line: 10
            },
            sourceLocation: {
              uri: 'a.feature',
              line: 6
            }
          }]
        });
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: {
            duration: 1,
            status: _status.default.PASSED
          }
        });
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: {
            duration: 1,
            status: _status.default.PASSED
          }
        });
        this.eventBroadcaster.emit('test-run-finished');
      });
      (0, _mocha.it)('outputs the step with a match attribute', function () {
        const features = JSON.parse(this.output);
        (0, _chai.expect)(features[0].elements[0].steps[0].match).to.eql({
          location: 'steps.js:10'
        });
      });
    });
    (0, _mocha.describe)('with hooks', () => {
      (0, _mocha.beforeEach)(function () {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [{
            actionLocation: {
              uri: 'steps.js',
              line: 10
            }
          }, {
            sourceLocation: {
              uri: 'a.feature',
              line: 6
            },
            actionLocation: {
              uri: 'steps.js',
              line: 11
            }
          }, {
            actionLocation: {
              uri: 'steps.js',
              line: 12
            }
          }]
        });
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: {
            duration: 1,
            status: _status.default.PASSED
          }
        });
        this.eventBroadcaster.emit('test-run-finished');
      });
      (0, _mocha.it)('outputs the before hook with special properties', function () {
        const features = JSON.parse(this.output);
        const beforeHook = features[0].elements[0].steps[0];
        (0, _chai.expect)(beforeHook).to.not.have.ownProperty('line');
        (0, _chai.expect)(beforeHook.keyword).to.eql('Before');
        (0, _chai.expect)(beforeHook.hidden).to.eql(true);
      });
      (0, _mocha.it)('outputs the after hook with special properties', function () {
        const features = JSON.parse(this.output);
        const beforeHook = features[0].elements[0].steps[2];
        (0, _chai.expect)(beforeHook).to.not.have.ownProperty('line');
        (0, _chai.expect)(beforeHook.keyword).to.eql('After');
        (0, _chai.expect)(beforeHook.hidden).to.eql(true);
      });
    });
    (0, _mocha.describe)('with attachments', () => {
      (0, _mocha.beforeEach)(function () {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [{
            sourceLocation: {
              uri: 'a.feature',
              line: 6
            },
            actionLocation: {
              uri: 'steps.js',
              line: 11
            }
          }]
        });
        this.eventBroadcaster.emit('test-step-attachment', {
          testCase: {
            sourceLocation: this.testCase.sourceLocation
          },
          index: 0,
          data: 'first data',
          media: {
            type: 'first media type'
          }
        });
        this.eventBroadcaster.emit('test-step-attachment', {
          testCase: {
            sourceLocation: this.testCase.sourceLocation
          },
          index: 0,
          data: 'second data',
          media: {
            type: 'second media type'
          }
        });
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: {
            duration: 1,
            status: _status.default.PASSED
          }
        });
        this.eventBroadcaster.emit('test-run-finished');
      });
      (0, _mocha.it)('outputs the step with embeddings', function () {
        const features = JSON.parse(this.output);
        (0, _chai.expect)(features[0].elements[0].steps[0].embeddings).to.eql([{
          data: 'first data',
          mime_type: 'first media type'
        }, {
          data: 'second data',
          mime_type: 'second media type'
        }]);
      });
    });
  });
  (0, _mocha.describe)('one scenario with one step with a doc string', () => {
    (0, _mocha.beforeEach)(function () {
      const events = _gherkin.default.generateEvents('Feature: my feature\n' + '  Scenario: my scenario\n' + '    Given my step\n' + '      """\n' + '      This is a DocString\n' + '      """\n', 'a.feature');

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
            line: 10
          }
        }]
      }));
      this.eventBroadcaster.emit('test-step-finished', {
        index: 0,
        testCase: this.testCase,
        result: {
          duration: 1,
          status: _status.default.PASSED
        }
      });
      this.eventBroadcaster.emit('test-case-finished', _objectSpread({}, this.testCase, {
        result: {
          duration: 1,
          status: _status.default.PASSED
        }
      }));
      this.eventBroadcaster.emit('test-run-finished');
    });
    (0, _mocha.it)('outputs the doc string as a step argument', function () {
      const features = JSON.parse(this.output);
      (0, _chai.expect)(features[0].elements[0].steps[0].arguments).to.eql([{
        line: 4,
        content: 'This is a DocString'
      }]);
    });
  });
  (0, _mocha.describe)('one scenario with one step with a data table string', () => {
    (0, _mocha.beforeEach)(function () {
      const events = _gherkin.default.generateEvents('Feature: my feature\n' + '  Scenario: my scenario\n' + '    Given my step\n' + '      |aaa|b|c|\n' + '      |d|e|ff|\n' + '      |gg|h|iii|\n', 'a.feature');

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
            line: 10
          }
        }]
      }));
      this.eventBroadcaster.emit('test-step-finished', {
        index: 0,
        testCase: this.testCase,
        result: {
          duration: 1,
          status: _status.default.PASSED
        }
      });
      this.eventBroadcaster.emit('test-case-finished', _objectSpread({}, this.testCase, {
        result: {
          duration: 1,
          status: _status.default.PASSED
        }
      }));
      this.eventBroadcaster.emit('test-run-finished');
    });
    (0, _mocha.it)('outputs the data table as a step argument', function () {
      const features = JSON.parse(this.output);
      (0, _chai.expect)(features[0].elements[0].steps[0].arguments).to.eql([{
        rows: [{
          cells: ['aaa', 'b', 'c']
        }, {
          cells: ['d', 'e', 'ff']
        }, {
          cells: ['gg', 'h', 'iii']
        }]
      }]);
    });
  });
});