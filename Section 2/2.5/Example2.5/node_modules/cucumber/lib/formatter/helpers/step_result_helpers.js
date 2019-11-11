"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStepMessage = getStepMessage;

var _error_helpers = require("./error_helpers");

var _status = _interopRequireDefault(require("../../status"));

var _indentString = _interopRequireDefault(require("indent-string"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAmbiguousStepResultMessage({
  colorFns: colorFns,
  testStep: testStep
}) {
  return colorFns.ambiguous(testStep.result.exception);
}

function getFailedStepResultMessage({
  colorFns: colorFns,
  testStep: testStep
}) {
  return (0, _error_helpers.formatError)(testStep.result.exception, colorFns);
}

function getPendingStepResultMessage({
  colorFns: colorFns
}) {
  return colorFns.pending('Pending');
}

function getStepMessage({
  colorFns: colorFns,
  keywordType: keywordType,
  snippetBuilder: snippetBuilder,
  testStep: testStep,
  pickleStep: pickleStep
}) {
  switch (testStep.result.status) {
    case _status.default.AMBIGUOUS:
      return getAmbiguousStepResultMessage({
        colorFns: colorFns,
        testStep: testStep
      });

    case _status.default.FAILED:
      return getFailedStepResultMessage({
        colorFns: colorFns,
        testStep: testStep
      });

    case _status.default.UNDEFINED:
      return getUndefinedStepResultMessage({
        colorFns: colorFns,
        keywordType: keywordType,
        snippetBuilder: snippetBuilder,
        pickleStep: pickleStep
      });

    case _status.default.PENDING:
      return getPendingStepResultMessage({
        colorFns: colorFns
      });
  }
}

function getUndefinedStepResultMessage({
  colorFns: colorFns,
  keywordType: keywordType,
  snippetBuilder: snippetBuilder,
  pickleStep: pickleStep
}) {
  const snippet = snippetBuilder.build({
    keywordType: keywordType,
    pickleStep: pickleStep
  });
  const message = `${'Undefined. Implement with the following snippet:' + '\n\n'}${(0, _indentString.default)(snippet, 2)}\n`;
  return colorFns.undefined(message);
}