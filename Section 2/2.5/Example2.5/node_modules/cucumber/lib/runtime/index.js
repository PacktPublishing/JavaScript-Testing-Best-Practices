"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _helpers = require("../formatter/helpers");

var _bluebird = _interopRequireDefault(require("bluebird"));

var _stack_trace_filter = _interopRequireDefault(require("../stack_trace_filter"));

var _status = _interopRequireDefault(require("../status"));

var _test_case_runner = _interopRequireDefault(require("./test_case_runner"));

var _user_code_runner = _interopRequireDefault(require("../user_code_runner"));

var _verror = _interopRequireDefault(require("verror"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Runtime {
  // options - {dryRun, failFast, filterStacktraces, strict}
  constructor({
    eventBroadcaster: eventBroadcaster,
    options: options,
    supportCodeLibrary: supportCodeLibrary,
    testCases: testCases
  }) {
    this.eventBroadcaster = eventBroadcaster;
    this.options = options || {};
    this.stackTraceFilter = new _stack_trace_filter.default();
    this.supportCodeLibrary = supportCodeLibrary;
    this.testCases = testCases || [];
    this.result = {
      duration: 0,
      success: true
    };
  }

  runTestRunHooks(key, name) {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield _bluebird.default.each(_this.supportCodeLibrary[key],
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (hookDefinition) {
          const {
            error: error
          } = yield _user_code_runner.default.run({
            argsArray: [],
            fn: hookDefinition.code,
            thisArg: null,
            timeoutInMilliseconds: hookDefinition.options.timeout || _this.supportCodeLibrary.defaultTimeout
          });

          if (error) {
            const location = (0, _helpers.formatLocation)(hookDefinition);
            throw new _verror.default(error, `${name} hook errored, process exiting: ${location}`);
          }
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    })();
  }

  runTestCase(testCase) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const skip = _this2.options.dryRun || _this2.options.failFast && !_this2.result.success;
      const testCaseRunner = new _test_case_runner.default({
        eventBroadcaster: _this2.eventBroadcaster,
        skip: skip,
        supportCodeLibrary: _this2.supportCodeLibrary,
        testCase: testCase,
        worldParameters: _this2.options.worldParameters
      });
      const testCaseResult = yield testCaseRunner.run();

      if (testCaseResult.duration) {
        _this2.result.duration += testCaseResult.duration;
      }

      if (_this2.shouldCauseFailure(testCaseResult.status)) {
        _this2.result.success = false;
      }
    })();
  }

  start() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      if (_this3.options.filterStacktraces) {
        _this3.stackTraceFilter.filter();
      }

      _this3.eventBroadcaster.emit('test-run-started');

      yield _this3.runTestRunHooks('beforeTestRunHookDefinitions', 'a BeforeAll');
      yield _bluebird.default.each(_this3.testCases, _this3.runTestCase.bind(_this3));
      yield _this3.runTestRunHooks('afterTestRunHookDefinitions', 'an AfterAll');

      _this3.eventBroadcaster.emit('test-run-finished', {
        result: _this3.result
      });

      if (_this3.options.filterStacktraces) {
        _this3.stackTraceFilter.unfilter();
      }

      return _this3.result.success;
    })();
  }

  shouldCauseFailure(status) {
    return _lodash.default.includes([_status.default.AMBIGUOUS, _status.default.FAILED, _status.default.UNDEFINED], status) || status === _status.default.PENDING && this.options.strict;
  }

}

exports.default = Runtime;