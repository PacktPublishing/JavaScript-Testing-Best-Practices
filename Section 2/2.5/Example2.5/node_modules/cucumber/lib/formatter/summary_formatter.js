"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _helpers = require("./helpers");

var _2 = _interopRequireDefault(require("./"));

var _status = _interopRequireDefault(require("../status"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SummaryFormatter extends _2.default {
  constructor(options) {
    super(options);
    options.eventBroadcaster.on('test-run-finished', this.logSummary.bind(this));
  }

  isTestCaseFailure(testCase) {
    return _lodash.default.includes([_status.default.AMBIGUOUS, _status.default.FAILED], testCase.result.status);
  }

  isTestCaseWarning(testCase) {
    return _lodash.default.includes([_status.default.PENDING, _status.default.UNDEFINED], testCase.result.status);
  }

  logSummary(testRun) {
    const failures = [];
    const warnings = [];

    _lodash.default.each(this.eventDataCollector.testCaseMap, testCase => {
      if (this.isTestCaseFailure(testCase)) {
        failures.push(testCase);
      } else if (this.isTestCaseWarning(testCase)) {
        warnings.push(testCase);
      }
    });

    if (failures.length > 0) {
      this.logIssues({
        issues: failures,
        title: 'Failures'
      });
    }

    if (warnings.length > 0) {
      this.logIssues({
        issues: warnings,
        title: 'Warnings'
      });
    }

    this.log((0, _helpers.formatSummary)({
      colorFns: this.colorFns,
      testCaseMap: this.eventDataCollector.testCaseMap,
      testRun: testRun
    }));
  }

  logIssues({
    issues: issues,
    title: title
  }) {
    this.log(`${title}:\n\n`);
    issues.forEach((testCase, index) => {
      const {
        gherkinDocument: gherkinDocument,
        pickle: pickle
      } = this.eventDataCollector.getTestCaseData(testCase.sourceLocation);
      this.log((0, _helpers.formatIssue)({
        colorFns: this.colorFns,
        gherkinDocument: gherkinDocument,
        number: index + 1,
        pickle: pickle,
        snippetBuilder: this.snippetBuilder,
        testCase: testCase
      }));
    });
  }

}

exports.default = SummaryFormatter;