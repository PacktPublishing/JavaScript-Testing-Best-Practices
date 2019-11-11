"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _helpers = require("./helpers");

var _attachment_manager = _interopRequireDefault(require("./attachment_manager"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _status = _interopRequireDefault(require("../status"));

var _step_runner = _interopRequireDefault(require("./step_runner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class TestCaseRunner {
  constructor({
    eventBroadcaster: eventBroadcaster,
    skip: skip,
    testCase: testCase,
    supportCodeLibrary: supportCodeLibrary,
    worldParameters: worldParameters
  }) {
    const attachmentManager = new _attachment_manager.default(({
      data: data,
      media: media
    }) => {
      if (this.testStepIndex > this.maxTestStepIndex) {
        throw new Error('Cannot attach after all steps/hooks have finished running. Ensure your step/hook waits for the attach to finish.');
      }

      this.emit('test-step-attachment', {
        index: this.testStepIndex,
        data: data,
        media: media
      });
    });
    this.eventBroadcaster = eventBroadcaster;
    this.skip = skip;
    this.testCase = testCase;
    this.supportCodeLibrary = supportCodeLibrary;
    this.world = new supportCodeLibrary.World({
      attach: attachmentManager.create.bind(attachmentManager),
      parameters: worldParameters
    });
    this.beforeHookDefinitions = this.getBeforeHookDefinitions();
    this.afterHookDefinitions = this.getAfterHookDefinitions();
    this.testStepIndex = 0;
    this.maxTestStepIndex = this.beforeHookDefinitions.length + this.testCase.pickle.steps.length + this.afterHookDefinitions.length - 1;
    this.result = {
      duration: 0,
      status: this.skip ? _status.default.SKIPPED : _status.default.PASSED
    };
    this.testCaseSourceLocation = {
      uri: this.testCase.uri,
      line: this.testCase.pickle.locations[0].line
    };
  }

  emit(name, data) {
    const eventData = _objectSpread({}, data);

    if (_lodash.default.startsWith(name, 'test-case')) {
      eventData.sourceLocation = this.testCaseSourceLocation;
    } else {
      eventData.testCase = {
        sourceLocation: this.testCaseSourceLocation
      };
    }

    this.eventBroadcaster.emit(name, eventData);
  }

  emitPrepared() {
    const steps = [];
    this.beforeHookDefinitions.forEach(definition => {
      const actionLocation = {
        uri: definition.uri,
        line: definition.line
      };
      steps.push({
        actionLocation: actionLocation
      });
    });
    this.testCase.pickle.steps.forEach(step => {
      const actionLocations = this.getStepDefinitions(step).map(definition => ({
        uri: definition.uri,
        line: definition.line
      }));
      const sourceLocation = {
        uri: this.testCase.uri,
        line: _lodash.default.last(step.locations).line
      };
      const data = {
        sourceLocation: sourceLocation
      };

      if (actionLocations.length === 1) {
        data.actionLocation = actionLocations[0];
      }

      steps.push(data);
    });
    this.afterHookDefinitions.forEach(definition => {
      const actionLocation = {
        uri: definition.uri,
        line: definition.line
      };
      steps.push({
        actionLocation: actionLocation
      });
    });
    this.emit('test-case-prepared', {
      steps: steps
    });
  }

  getAfterHookDefinitions() {
    return this.supportCodeLibrary.afterTestCaseHookDefinitions.filter(hookDefinition => hookDefinition.appliesToTestCase(this.testCase));
  }

  getBeforeHookDefinitions() {
    return this.supportCodeLibrary.beforeTestCaseHookDefinitions.filter(hookDefinition => hookDefinition.appliesToTestCase(this.testCase));
  }

  getStepDefinitions(step) {
    return this.supportCodeLibrary.stepDefinitions.filter(stepDefinition => stepDefinition.matchesStepName(step.text));
  }

  invokeStep(step, stepDefinition, hookParameter) {
    return _step_runner.default.run({
      defaultTimeout: this.supportCodeLibrary.defaultTimeout,
      hookParameter: hookParameter,
      step: step,
      stepDefinition: stepDefinition,
      world: this.world
    });
  }

  isSkippingSteps() {
    return this.result.status !== _status.default.PASSED;
  }

  shouldSkipHook(isBeforeHook) {
    return this.skip || this.isSkippingSteps() && isBeforeHook;
  }

  shouldUpdateStatus(testStepResult) {
    switch (testStepResult.status) {
      case _status.default.FAILED:
      case _status.default.AMBIGUOUS:
        return this.result.status !== _status.default.FAILED || this.result.status !== _status.default.AMBIGUOUS;

      default:
        return this.result.status === _status.default.PASSED || this.result.status === _status.default.SKIPPED;
    }
  }

  aroundTestStep(runStepFn) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.emit('test-step-started', {
        index: _this.testStepIndex
      });

      const testStepResult = yield runStepFn();

      if (testStepResult.duration) {
        _this.result.duration += testStepResult.duration;
      }

      if (_this.shouldUpdateStatus(testStepResult)) {
        _this.result.status = testStepResult.status;
      }

      if (testStepResult.exception) {
        _this.result.exception = testStepResult.exception;
      }

      _this.emit('test-step-finished', {
        index: _this.testStepIndex,
        result: testStepResult
      });

      _this.testStepIndex += 1;
    })();
  }

  run() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      _this2.emitPrepared();

      _this2.emit('test-case-started', {});

      yield _this2.runHooks(_this2.beforeHookDefinitions, {
        sourceLocation: _this2.testCaseSourceLocation,
        pickle: _this2.testCase.pickle
      }, true);
      yield _this2.runSteps();
      yield _this2.runHooks(_this2.afterHookDefinitions, {
        sourceLocation: _this2.testCaseSourceLocation,
        pickle: _this2.testCase.pickle,
        result: _this2.result
      }, false);

      _this2.emit('test-case-finished', {
        result: _this2.result
      });

      return _this2.result;
    })();
  }

  runHook(hookDefinition, hookParameter, isBeforeHook) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      if (_this3.shouldSkipHook(isBeforeHook)) {
        return {
          status: _status.default.SKIPPED
        };
      }

      return _this3.invokeStep(null, hookDefinition, hookParameter);
    })();
  }

  runHooks(hookDefinitions, hookParameter, isBeforeHook) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _bluebird.default.each(hookDefinitions,
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (hookDefinition) {
          yield _this4.aroundTestStep(() => _this4.runHook(hookDefinition, hookParameter, isBeforeHook));
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    })();
  }

  runStep(step) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const stepDefinitions = _this5.getStepDefinitions(step);

      if (stepDefinitions.length === 0) {
        return {
          status: _status.default.UNDEFINED
        };
      } else if (stepDefinitions.length > 1) {
        return {
          exception: (0, _helpers.getAmbiguousStepException)(stepDefinitions),
          status: _status.default.AMBIGUOUS
        };
      } else if (_this5.isSkippingSteps()) {
        return {
          status: _status.default.SKIPPED
        };
      }

      return _this5.invokeStep(step, stepDefinitions[0]);
    })();
  }

  runSteps() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      yield _bluebird.default.each(_this6.testCase.pickle.steps,
      /*#__PURE__*/
      function () {
        var _ref2 = _asyncToGenerator(function* (step) {
          yield _this6.aroundTestStep(() => _this6.runStep(step));
        });

        return function (_x2) {
          return _ref2.apply(this, arguments);
        };
      }());
    })();
  }

}

exports.default = TestCaseRunner;