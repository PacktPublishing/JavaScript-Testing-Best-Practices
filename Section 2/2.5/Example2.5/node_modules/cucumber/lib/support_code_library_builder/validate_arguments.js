"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validateArguments;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const optionsValidation = {
  expectedType: 'object or function',
  predicate: function ({
    options: options
  }) {
    return _lodash.default.isPlainObject(options);
  }
};
const optionsTimeoutValidation = {
  identifier: '"options.timeout"',
  expectedType: 'integer',
  predicate: function ({
    options: options
  }) {
    return !options.timeout || _lodash.default.isInteger(options.timeout);
  }
};
const fnValidation = {
  expectedType: 'function',
  predicate: function ({
    code: code
  }) {
    return _lodash.default.isFunction(code);
  }
};
const validations = {
  defineTestRunHook: [_objectSpread({
    identifier: 'first argument'
  }, optionsValidation), optionsTimeoutValidation, _objectSpread({
    identifier: 'second argument'
  }, fnValidation)],
  defineTestCaseHook: [_objectSpread({
    identifier: 'first argument'
  }, optionsValidation), {
    identifier: '"options.tags"',
    expectedType: 'string',
    predicate: function ({
      options: options
    }) {
      return !options.tags || _lodash.default.isString(options.tags);
    }
  }, optionsTimeoutValidation, _objectSpread({
    identifier: 'second argument'
  }, fnValidation)],
  defineStep: [{
    identifier: 'first argument',
    expectedType: 'string or regular expression',
    predicate: function ({
      pattern: pattern
    }) {
      return _lodash.default.isRegExp(pattern) || _lodash.default.isString(pattern);
    }
  }, _objectSpread({
    identifier: 'second argument'
  }, optionsValidation), optionsTimeoutValidation, _objectSpread({
    identifier: 'third argument'
  }, fnValidation)]
};

function validateArguments({
  args: args,
  fnName: fnName,
  location: location
}) {
  validations[fnName].forEach(({
    identifier: identifier,
    expectedType: expectedType,
    predicate: predicate
  }) => {
    if (!predicate(args)) {
      throw new Error(`${location}: Invalid ${identifier}: should be a ${expectedType}`);
    }
  });
}