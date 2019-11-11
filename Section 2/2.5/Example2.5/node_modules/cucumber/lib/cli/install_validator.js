"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateInstall = validateInstall;

var _bluebird = require("bluebird");

var _fs = _interopRequireDefault(require("mz/fs"));

var _path = _interopRequireDefault(require("path"));

var _resolve = _interopRequireDefault(require("resolve"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function validateInstall(_x) {
  return _validateInstall.apply(this, arguments);
}

function _validateInstall() {
  _validateInstall = _asyncToGenerator(function* (cwd) {
    const projectPath = _path.default.join(__dirname, '..', '..');

    if (projectPath === cwd) {
      return; // cucumber testing itself
    }

    const currentCucumberPath = require.resolve(projectPath);

    let localCucumberPath = yield (0, _bluebird.promisify)(_resolve.default)('cucumber', {
      basedir: cwd
    });
    localCucumberPath = yield _fs.default.realpath(localCucumberPath);

    if (localCucumberPath !== currentCucumberPath) {
      throw new Error(`
      You appear to be executing an install of cucumber (most likely a global install)
      that is different from your local install (the one required in your support files).
      For cucumber to work, you need to execute the same install that is required in your support files.
      Please execute the locally installed version to run your tests.

      Executed Path: ${currentCucumberPath}
      Local Path:    ${localCucumberPath}
      `);
    }
  });
  return _validateInstall.apply(this, arguments);
}