"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAmbiguousStepException = getAmbiguousStepException;

var _location_helpers = require("../formatter/helpers/location_helpers");

var _cliTable = _interopRequireDefault(require("cli-table3"));

var _indentString = _interopRequireDefault(require("indent-string"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAmbiguousStepException(stepDefinitions) {
  const table = new _cliTable.default({
    chars: {
      bottom: '',
      'bottom-left': '',
      'bottom-mid': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      middle: ' - ',
      right: '',
      'right-mid': '',
      top: '',
      'top-left': '',
      'top-mid': '',
      'top-right': ''
    },
    style: {
      border: [],
      'padding-left': 0,
      'padding-right': 0
    }
  });
  table.push(...stepDefinitions.map(stepDefinition => {
    const pattern = stepDefinition.pattern.toString();
    return [pattern, (0, _location_helpers.formatLocation)(stepDefinition)];
  }));
  return `${'Multiple step definitions match:' + '\n'}${(0, _indentString.default)(table.toString(), 2)}`;
}