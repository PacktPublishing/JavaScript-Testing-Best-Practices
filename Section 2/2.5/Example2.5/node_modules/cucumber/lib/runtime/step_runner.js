"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _status = _interopRequireDefault(require("../status"));

var _time = _interopRequireDefault(require("../time"));

var _user_code_runner = _interopRequireDefault(require("../user_code_runner"));

var _bluebird = _interopRequireDefault(require("bluebird"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const {
  beginTiming: beginTiming,
  endTiming: endTiming
} = _time.default;

function run(_x) {
  return _run.apply(this, arguments);
}

function _run() {
  _run = _asyncToGenerator(function* ({
    defaultTimeout: defaultTimeout,
    hookParameter: hookParameter,
    step: step,
    stepDefinition: stepDefinition,
    world: world
  }) {
    beginTiming();
    let error, result, parameters;

    try {
      parameters = yield _bluebird.default.all(stepDefinition.getInvocationParameters({
        hookParameter: hookParameter,
        step: step,
        world: world
      }));
    } catch (err) {
      error = err;
    }

    if (!error) {
      const timeoutInMilliseconds = stepDefinition.options.timeout || defaultTimeout;
      const validCodeLengths = stepDefinition.getValidCodeLengths(parameters);

      if (_lodash.default.includes(validCodeLengths, stepDefinition.code.length)) {
        const data = yield _user_code_runner.default.run({
          argsArray: parameters,
          fn: stepDefinition.code,
          thisArg: world,
          timeoutInMilliseconds: timeoutInMilliseconds
        });
        error = data.error;
        result = data.result;
      } else {
        error = stepDefinition.getInvalidCodeLengthMessage(parameters);
      }
    }

    const testStepResult = {
      duration: endTiming()
    };

    if (result === 'skipped') {
      testStepResult.status = _status.default.SKIPPED;
    } else if (result === 'pending') {
      testStepResult.status = _status.default.PENDING;
    } else if (error) {
      testStepResult.exception = error;
      testStepResult.status = _status.default.FAILED;
    } else {
      testStepResult.status = _status.default.PASSED;
    }

    return testStepResult;
  });
  return _run.apply(this, arguments);
}

var _default = {
  run: run
};
exports.default = _default;