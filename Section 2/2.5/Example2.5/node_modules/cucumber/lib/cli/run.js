"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = run;

var _ = _interopRequireDefault(require("./"));

var _verror = _interopRequireDefault(require("verror"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function exitWithError(error) {
  console.error(_verror.default.fullStack(error)); // eslint-disable-line no-console

  process.exit(1);
}

function run() {
  return _run.apply(this, arguments);
}

function _run() {
  _run = _asyncToGenerator(function* () {
    const cwd = process.cwd();
    const cli = new _.default({
      argv: process.argv,
      cwd: cwd,
      stdout: process.stdout
    });
    let result;

    try {
      result = yield cli.run();
    } catch (error) {
      exitWithError(error);
    }

    const exitCode = result.success ? 0 : 1;

    if (result.shouldExitImmediately) {
      process.exit(exitCode);
    } else {
      process.exitCode = exitCode;
    }
  });
  return _run.apply(this, arguments);
}