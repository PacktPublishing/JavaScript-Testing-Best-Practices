"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _time = _interopRequireDefault(require("./time"));

var _uncaught_exception_manager = _interopRequireDefault(require("./uncaught_exception_manager"));

var _util = _interopRequireDefault(require("util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class UserCodeRunner {
  static run({
    argsArray: argsArray,
    thisArg: thisArg,
    fn: fn,
    timeoutInMilliseconds: timeoutInMilliseconds
  }) {
    return _asyncToGenerator(function* () {
      const callbackPromise = new _bluebird.default((resolve, reject) => {
        argsArray.push((error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
      let fnReturn;

      try {
        fnReturn = fn.apply(thisArg, argsArray);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(_util.default.format(e));
        return {
          error: error
        };
      }

      const racingPromises = [];
      const callbackInterface = fn.length === argsArray.length;
      const promiseInterface = fnReturn && typeof fnReturn.then === 'function';

      if (callbackInterface && promiseInterface) {
        return {
          error: new Error('function uses multiple asynchronous interfaces: callback and promise\n' + 'to use the callback interface: do not return a promise\n' + 'to use the promise interface: remove the last argument to the function')
        };
      } else if (callbackInterface) {
        racingPromises.push(callbackPromise);
      } else if (promiseInterface) {
        racingPromises.push(fnReturn);
      } else {
        return {
          result: fnReturn
        };
      }

      let exceptionHandler;
      const uncaughtExceptionPromise = new _bluebird.default((resolve, reject) => {
        exceptionHandler = reject;

        _uncaught_exception_manager.default.registerHandler(exceptionHandler);
      });
      racingPromises.push(uncaughtExceptionPromise);
      let timeoutId;

      if (timeoutInMilliseconds >= 0) {
        const timeoutPromise = new _bluebird.default((resolve, reject) => {
          timeoutId = _time.default.setTimeout(() => {
            const timeoutMessage = 'function timed out, ensure the ' + (callbackInterface ? 'callback is executed' : 'promise resolves') + ` within ${timeoutInMilliseconds} milliseconds`;
            reject(new Error(timeoutMessage));
          }, timeoutInMilliseconds);
        });
        racingPromises.push(timeoutPromise);
      }

      let error, result;

      try {
        result = yield _bluebird.default.race(racingPromises);
      } catch (e) {
        if (e instanceof Error) {
          error = e;
        } else if (e) {
          error = new Error(_util.default.format(e));
        } else {
          error = new Error('Promise rejected without a reason');
        }
      }

      _time.default.clearTimeout(timeoutId);

      _uncaught_exception_manager.default.unregisterHandler(exceptionHandler);

      return {
        error: error,
        result: result
      };
    })();
  }

}

exports.default = UserCodeRunner;