"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _fs = _interopRequireDefault(require("mz/fs"));

var _path = _interopRequireDefault(require("path"));

var _stringArgv = _interopRequireDefault(require("string-argv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class ProfileLoader {
  constructor(directory) {
    this.directory = directory;
  }

  getDefinitions() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const definitionsFilePath = _path.default.join(_this.directory, 'cucumber.js');

      const exists = yield _fs.default.exists(definitionsFilePath);

      if (!exists) {
        return {};
      }

      const definitions = require(definitionsFilePath);

      if (typeof definitions !== 'object') {
        throw new Error(`${definitionsFilePath} does not export an object`);
      }

      return definitions;
    })();
  }

  getArgv(profiles) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const definitions = yield _this2.getDefinitions();

      if (profiles.length === 0 && definitions.default) {
        profiles = ['default'];
      }

      const argvs = profiles.map(profile => {
        if (!definitions[profile]) {
          throw new Error(`Undefined profile: ${profile}`);
        }

        return (0, _stringArgv.default)(definitions[profile]);
      });
      return _lodash.default.flatten(argvs);
    })();
  }

}

exports.default = ProfileLoader;