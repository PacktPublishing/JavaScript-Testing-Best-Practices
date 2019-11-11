"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ = _interopRequireDefault(require("./"));

var _status = _interopRequireDefault(require("../status"));

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SnippetsFormatter extends _.default {
  constructor(options) {
    super(options);
    options.eventBroadcaster.on('test-step-finished', this.logUndefinedTestStepSnippet.bind(this));
  }

  logUndefinedTestStepSnippet({
    testCase: {
      sourceLocation: sourceLocation
    },
    index: index,
    result: result
  }) {
    if (result.status === _status.default.UNDEFINED) {
      const {
        gherkinDocument: gherkinDocument,
        testCase: testCase
      } = this.eventDataCollector.getTestCaseData(sourceLocation);
      const {
        pickleStep: pickleStep,
        gherkinKeyword: gherkinKeyword
      } = this.eventDataCollector.getTestStepData({
        testCase: testCase,
        index: index
      });
      const previousKeywordType = this.getPreviousKeywordType({
        gherkinDocument: gherkinDocument,
        testCase: testCase,
        index: index
      });
      const keywordType = (0, _helpers.getStepKeywordType)({
        keyword: gherkinKeyword,
        language: gherkinDocument.feature.language,
        previousKeywordType: previousKeywordType
      });
      const snippet = this.snippetBuilder.build({
        keywordType: keywordType,
        pickleStep: pickleStep
      });
      this.log(`${snippet}\n\n`);
    }
  }

  getPreviousKeywordType({
    gherkinDocument: gherkinDocument,
    testCase: testCase,
    index: index
  }) {
    let previousKeywordType = _helpers.KeywordType.PRECONDITION;

    for (let i = 0; i < index; i += 1) {
      const {
        gherkinKeyword: gherkinKeyword
      } = this.eventDataCollector.getTestStepData({
        testCase: testCase,
        index: i
      });
      previousKeywordType = (0, _helpers.getStepKeywordType)({
        keyword: gherkinKeyword,
        language: gherkinDocument.feature.language,
        previousKeywordType: previousKeywordType
      });
    }

    return previousKeywordType;
  }

}

exports.default = SnippetsFormatter;