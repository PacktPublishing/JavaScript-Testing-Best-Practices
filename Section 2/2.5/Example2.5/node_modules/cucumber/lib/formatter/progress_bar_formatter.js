"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helpers = require("./helpers");

var _ = _interopRequireDefault(require("./"));

var _progress = _interopRequireDefault(require("progress"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Inspired by https://github.com/thekompanee/fuubar and https://github.com/martinciu/fuubar-cucumber
class ProgressBarFormatter extends _.default {
  constructor(options) {
    super(options);
    options.eventBroadcaster.on('pickle-accepted', this.incrementStepCount.bind(this)).once('test-case-started', this.initializeProgressBar.bind(this)).on('test-step-finished', this.logProgress.bind(this)).on('test-case-finished', this.logErrorIfNeeded.bind(this)).on('test-run-finished', this.logSummary.bind(this));
    this.numberOfSteps = 0;
    this.issueCount = 0;
  }

  incrementStepCount({
    pickle: pickle
  }) {
    this.numberOfSteps += pickle.steps.length;
  }

  initializeProgressBar() {
    this.progressBar = new _progress.default(':current/:total steps [:bar] ', {
      clear: true,
      incomplete: ' ',
      stream: this.stream,
      total: this.numberOfSteps,
      width: this.stream.columns || 80
    });
  }

  logProgress({
    index: index,
    testCase: {
      sourceLocation: sourceLocation
    }
  }) {
    const {
      testCase: testCase
    } = this.eventDataCollector.getTestCaseData(sourceLocation);

    if (testCase.steps[index].sourceLocation) {
      this.progressBar.tick();
    }
  }

  logErrorIfNeeded({
    sourceLocation: sourceLocation,
    result: result
  }) {
    if ((0, _helpers.isIssue)(result.status)) {
      this.issueCount += 1;
      const {
        gherkinDocument: gherkinDocument,
        pickle: pickle,
        testCase: testCase
      } = this.eventDataCollector.getTestCaseData(sourceLocation);
      this.progressBar.interrupt((0, _helpers.formatIssue)({
        colorFns: this.colorFns,
        gherkinDocument: gherkinDocument,
        number: this.issueCount,
        pickle: pickle,
        snippetBuilder: this.snippetBuilder,
        testCase: testCase
      }));
    }
  }

  logSummary(testRun) {
    this.log((0, _helpers.formatSummary)({
      colorFns: this.colorFns,
      testCaseMap: this.eventDataCollector.testCaseMap,
      testRun: testRun
    }));
  }

}

exports.default = ProgressBarFormatter;