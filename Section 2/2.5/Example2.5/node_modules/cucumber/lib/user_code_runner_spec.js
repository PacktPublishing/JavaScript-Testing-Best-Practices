"use strict";

var _mocha = require("mocha");

var _chai = require("chai");

var _user_code_runner = _interopRequireDefault(require("./user_code_runner"));

var _bluebird = _interopRequireDefault(require("bluebird"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

(0, _mocha.describe)('UserCodeRunner', () => {
  (0, _mocha.describe)('run()', () => {
    (0, _mocha.beforeEach)(function () {
      this.options = {
        argsArray: [],
        thisArg: {},
        timeoutInMilliseconds: 100
      };
    });
    (0, _mocha.describe)('function uses synchronous interface', () => {
      (0, _mocha.describe)('function throws serializable error', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function () {
            throw 'error'; // eslint-disable-line no-throw-literal
          };
        });
        (0, _mocha.it)('returns the error',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.be.instanceOf(Error);
          (0, _chai.expect)(error.message).to.eql('error');
          (0, _chai.expect)(result).to.eql(undefined);
        }));
      });
      (0, _mocha.describe)('function throws non-serializable error', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function () {
            const error = {};
            error.error = error;
            throw error;
          };
        });
        (0, _mocha.it)('returns the error',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.be.instanceOf(Error);
          (0, _chai.expect)(error.message).to.eql('{ error: [Circular] }');
          (0, _chai.expect)(result).to.eql(undefined);
        }));
      });
      (0, _mocha.describe)('function returns', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function () {
            return 'result';
          };
        });
        (0, _mocha.it)('returns the return value of the function',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.eql(undefined);
          (0, _chai.expect)(result).to.eql('result');
        }));
      });
    });
    (0, _mocha.describe)('function uses callback interface', () => {
      (0, _mocha.describe)('function asynchronously throws', () => {// Cannot unit test because mocha also sets an uncaught exception handler
      });
      (0, _mocha.describe)('function calls back with serializable error', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function (callback) {
            setTimeout(() => {
              callback('error'); // eslint-disable-line standard/no-callback-literal
            }, 25);
          };
        });
        (0, _mocha.it)('returns the error',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.be.instanceOf(Error);
          (0, _chai.expect)(error.message).to.eql('error');
          (0, _chai.expect)(result).to.eql(undefined);
        }));
      });
      (0, _mocha.describe)('function calls back with non-serializable rror', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function (callback) {
            const error = {};
            error.error = error;
            setTimeout(() => {
              callback(error);
            }, 25);
          };
        });
        (0, _mocha.it)('returns the error',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.be.instanceOf(Error);
          (0, _chai.expect)(error.message).to.eql('{ error: [Circular] }');
          (0, _chai.expect)(result).to.eql(undefined);
        }));
      });
      (0, _mocha.describe)('function calls back with result', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function (callback) {
            setTimeout(() => {
              callback(null, 'result');
            }, 25);
          };
        });
        (0, _mocha.it)('returns the what the function calls back with',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.eql(undefined);
          (0, _chai.expect)(result).to.eql('result');
        }));
      });
      (0, _mocha.describe)('function times out', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function (callback) {
            setTimeout(() => {
              callback(null, 'result');
            }, 200);
          };
        });
        (0, _mocha.it)('returns timeout as an error',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.be.instanceof(Error);
          (0, _chai.expect)(error.message).to.eql('function timed out, ensure the callback is executed within 100 milliseconds');
          (0, _chai.expect)(result).to.eql(undefined);
        }));
      });
      (0, _mocha.describe)('timeout of -1', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function (callback) {
            setTimeout(() => {
              callback(null, 'result');
            }, 200);
          };

          this.options.timeoutInMilliseconds = -1;
        });
        (0, _mocha.it)('disables timeout protection',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.eql(undefined);
          (0, _chai.expect)(result).to.eql('result');
        }));
      });
    });
    (0, _mocha.describe)('function uses promise interface', () => {
      (0, _mocha.describe)('function asynchronously throws', () => {// Cannot unit test because mocha also sets an uncaught exception handler
      });
      (0, _mocha.describe)('promise resolves', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function () {
            return _bluebird.default.resolve('result');
          };
        });
        (0, _mocha.it)('returns what the promise resolves to',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.eql(undefined);
          (0, _chai.expect)(result).to.eql('result');
        }));
      });
      (0, _mocha.describe)('promise rejects with reason', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function () {
            return _bluebird.default.reject('error'); // eslint-disable-line prefer-promise-reject-errors
          };
        });
        (0, _mocha.it)('returns what the promise rejects as an error',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.be.instanceOf(Error);
          (0, _chai.expect)(error.message).to.eql('error');
          (0, _chai.expect)(result).to.eql(undefined);
        }));
      });
      (0, _mocha.describe)('promise rejects without reason', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function () {
            return _bluebird.default.reject(); // eslint-disable-line prefer-promise-reject-errors
          };
        });
        (0, _mocha.it)('returns a helpful error message',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.be.instanceOf(Error);
          (0, _chai.expect)(error.message).to.eql('Promise rejected without a reason');
          (0, _chai.expect)(result).to.eql(undefined);
        }));
      });
      (0, _mocha.describe)('promise times out', function () {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function () {
            return _bluebird.default.resolve('result').delay(200);
          };
        });
        (0, _mocha.it)('returns timeout as an error',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.be.instanceof(Error);
          (0, _chai.expect)(error.message).to.eql('function timed out, ensure the promise resolves within 100 milliseconds');
          (0, _chai.expect)(result).to.eql(undefined);
        }));
      });
      (0, _mocha.describe)('timeout of -1', () => {
        (0, _mocha.beforeEach)(function () {
          this.options.fn = function () {
            return _bluebird.default.resolve('result').delay(200);
          };

          this.options.timeoutInMilliseconds = -1;
        });
        (0, _mocha.it)('disables timeout protection',
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          const {
            error: error,
            result: result
          } = yield _user_code_runner.default.run(this.options);
          (0, _chai.expect)(error).to.eql(undefined);
          (0, _chai.expect)(result).to.eql('result');
        }));
      });
    });
    (0, _mocha.describe)('function uses multiple asynchronous interfaces: callback and promise', () => {
      (0, _mocha.beforeEach)(function () {
        this.options.fn = function (callback) {
          callback();
          return _bluebird.default.resolve();
        };
      });
      (0, _mocha.it)('returns an error that multiple interface are used',
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        const {
          error: error,
          result: result
        } = yield _user_code_runner.default.run(this.options);
        (0, _chai.expect)(error).to.be.instanceof(Error);
        (0, _chai.expect)(error.message).to.eql('function uses multiple asynchronous interfaces: callback and promise\n' + 'to use the callback interface: do not return a promise\n' + 'to use the promise interface: remove the last argument to the function');
        (0, _chai.expect)(result).to.eql(undefined);
      }));
    });
  });
});