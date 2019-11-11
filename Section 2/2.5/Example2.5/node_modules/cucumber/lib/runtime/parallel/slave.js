"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _helpers = require("../../formatter/helpers");

var _command_types = _interopRequireDefault(require("./command_types"));

var _events = _interopRequireDefault(require("events"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _serializeError = _interopRequireDefault(require("serialize-error"));

var _stack_trace_filter = _interopRequireDefault(require("../../stack_trace_filter"));

var _support_code_library_builder = _interopRequireDefault(require("../../support_code_library_builder"));

var _test_case_runner = _interopRequireDefault(require("../test_case_runner"));

var _user_code_runner = _interopRequireDefault(require("../../user_code_runner"));

var _verror = _interopRequireDefault(require("verror"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const EVENTS = ['test-case-prepared', 'test-case-started', 'test-step-started', 'test-step-attachment', 'test-step-finished', 'test-case-finished'];

function serializeResultExceptionIfNecessary(data) {
  if (data.result && data.result.exception && _lodash.default.isError(data.result.exception)) {
    data.result.exception = (0, _serializeError.default)(data.result.exception);
  }
}

class Slave {
  constructor({
    cwd: cwd,
    exit: exit,
    sendMessage: sendMessage
  }) {
    this.initialized = false;
    this.cwd = cwd;
    this.exit = exit;
    this.sendMessage = sendMessage;
    this.eventBroadcaster = new _events.default();
    this.stackTraceFilter = new _stack_trace_filter.default();
    EVENTS.forEach(name => {
      this.eventBroadcaster.on(name, data => {
        serializeResultExceptionIfNecessary(data);
        this.sendMessage({
          command: _command_types.default.EVENT,
          name: name,
          data: data
        });
      });
    });
  }

  initialize({
    filterStacktraces: filterStacktraces,
    supportCodeRequiredModules: supportCodeRequiredModules,
    supportCodePaths: supportCodePaths,
    worldParameters: worldParameters
  }) {
    var _this = this;

    return _asyncToGenerator(function* () {
      supportCodeRequiredModules.map(module => require(module));

      _support_code_library_builder.default.reset(_this.cwd);

      supportCodePaths.forEach(codePath => require(codePath));
      _this.supportCodeLibrary = _support_code_library_builder.default.finalize();
      _this.worldParameters = worldParameters;
      _this.filterStacktraces = filterStacktraces;

      if (_this.filterStacktraces) {
        _this.stackTraceFilter.filter();
      }

      yield _this.runTestRunHooks('beforeTestRunHookDefinitions', 'a BeforeAll');

      _this.sendMessage({
        command: _command_types.default.READY
      });
    })();
  }

  finalize() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      yield _this2.runTestRunHooks('afterTestRunHookDefinitions', 'an AfterAll');

      if (_this2.filterStacktraces) {
        _this2.stackTraceFilter.unfilter();
      }

      _this2.exit();
    })();
  }

  receiveMessage(message) {
    if (message.command === 'initialize') {
      this.initialize(message);
    } else if (message.command === 'finalize') {
      this.finalize();
    } else if (message.command === 'run') {
      this.runTestCase(message);
    }
  }

  runTestCase({
    testCase: testCase,
    skip: skip
  }) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const testCaseRunner = new _test_case_runner.default({
        eventBroadcaster: _this3.eventBroadcaster,
        skip: skip,
        supportCodeLibrary: _this3.supportCodeLibrary,
        testCase: testCase,
        worldParameters: _this3.worldParameters
      });
      yield testCaseRunner.run();

      _this3.sendMessage({
        command: _command_types.default.READY
      });
    })();
  }

  runTestRunHooks(key, name) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _bluebird.default.each(_this4.supportCodeLibrary[key],
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (hookDefinition) {
          const {
            error: error
          } = yield _user_code_runner.default.run({
            argsArray: [],
            fn: hookDefinition.code,
            thisArg: null,
            timeoutInMilliseconds: hookDefinition.options.timeout || _this4.supportCodeLibrary.defaultTimeout
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

}

exports.default = Slave;