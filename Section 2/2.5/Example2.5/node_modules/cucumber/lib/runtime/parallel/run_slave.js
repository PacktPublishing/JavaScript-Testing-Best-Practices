"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = run;

var _slave = _interopRequireDefault(require("./slave"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function run() {
  return _run.apply(this, arguments);
}

function _run() {
  _run = _asyncToGenerator(function* () {
    const slave = new _slave.default({
      sendMessage: m => process.send(m),
      cwd: process.cwd(),
      exit: () => process.exit()
    });
    process.on('message', m => slave.receiveMessage(m));
  });
  return _run.apply(this, arguments);
}