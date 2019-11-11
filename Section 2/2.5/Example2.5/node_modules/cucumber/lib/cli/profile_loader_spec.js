"use strict";

var _mocha = require("mocha");

var _chai = require("chai");

var _bluebird = require("bluebird");

var _fs = _interopRequireDefault(require("mz/fs"));

var _path = _interopRequireDefault(require("path"));

var _profile_loader = _interopRequireDefault(require("./profile_loader"));

var _tmp = _interopRequireDefault(require("tmp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

(0, _mocha.describe)('ProfileLoader', () => {
  (0, _mocha.describe)('getArgv', () => {
    (0, _mocha.beforeEach)(
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      this.tmpDir = yield (0, _bluebird.promisify)(_tmp.default.dir)({
        unsafeCleanup: true
      });
      this.profileLoader = new _profile_loader.default(this.tmpDir);
    }));
    (0, _mocha.describe)('with no identifiers', () => {
      (0, _mocha.describe)('no definition file', () => {
        (0, _mocha.it)('returns an empty array',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const result = yield this.profileLoader.getArgv([]);
          (0, _chai.expect)(result).to.eql([]);
        }));
      });
      (0, _mocha.describe)('with definition file', () => {
        (0, _mocha.describe)('with a default', () => {
          (0, _mocha.beforeEach)(
          /*#__PURE__*/
          _asyncToGenerator(function* () {
            const fileContent = 'module.exports = {default: "--opt1 --opt2"}';
            yield _fs.default.writeFile(_path.default.join(this.tmpDir, 'cucumber.js'), fileContent);
          }));
          (0, _mocha.it)('returns the argv for the default profile',
          /*#__PURE__*/
          _asyncToGenerator(function* () {
            const result = yield this.profileLoader.getArgv([]);
            (0, _chai.expect)(result).to.eql(['--opt1', '--opt2']);
          }));
        });
        (0, _mocha.describe)('without a default', () => {
          (0, _mocha.beforeEach)(
          /*#__PURE__*/
          _asyncToGenerator(function* () {
            const fileContent = 'module.exports = {profile1: "--opt1 --opt2"}';
            yield _fs.default.writeFile(_path.default.join(this.tmpDir, 'cucumber.js'), fileContent);
          }));
          (0, _mocha.it)('returns an empty array',
          /*#__PURE__*/
          _asyncToGenerator(function* () {
            const result = yield this.profileLoader.getArgv([]);
            (0, _chai.expect)(result).to.eql([]);
          }));
        });
      });
    });
    (0, _mocha.describe)('with identifiers', () => {
      (0, _mocha.describe)('no definition file', () => {
        (0, _mocha.it)('throws',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          let thrown = false;

          try {
            yield this.profileLoader.getArgv(['profile1']);
          } catch (error) {
            thrown = true;
            (0, _chai.expect)(error.message).to.eql('Undefined profile: profile1');
          }

          (0, _chai.expect)(thrown).to.eql(true);
        }));
      });
      (0, _mocha.describe)('with definition file', () => {
        (0, _mocha.beforeEach)(
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const fileContent = 'module.exports = {\n' + '  profile1: "--opt1 --opt2",\n' + '  profile2: "--opt3 \'some value\'"\n' + '}';
          yield _fs.default.writeFile(_path.default.join(this.tmpDir, 'cucumber.js'), fileContent);
        }));
        (0, _mocha.describe)('profile is defined', () => {
          (0, _mocha.it)('returns the argv for the given profile',
          /*#__PURE__*/
          _asyncToGenerator(function* () {
            const result = yield this.profileLoader.getArgv(['profile1']);
            (0, _chai.expect)(result).to.eql(['--opt1', '--opt2']);
          }));
        });
        (0, _mocha.describe)('profile is defined and contains quoted string', () => {
          (0, _mocha.it)('returns the argv for the given profile',
          /*#__PURE__*/
          _asyncToGenerator(function* () {
            const result = yield this.profileLoader.getArgv(['profile2']);
            (0, _chai.expect)(result).to.eql(['--opt3', 'some value']);
          }));
        });
        (0, _mocha.describe)('profile is not defined', () => {
          (0, _mocha.it)('throws',
          /*#__PURE__*/
          _asyncToGenerator(function* () {
            let thrown = false;

            try {
              yield this.profileLoader.getArgv(['profile3']);
            } catch (error) {
              thrown = true;
              (0, _chai.expect)(error.message).to.eql('Undefined profile: profile3');
            }

            (0, _chai.expect)(thrown).to.eql(true);
          }));
        });
      });
    });
  });
});