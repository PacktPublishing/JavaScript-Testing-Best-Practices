"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatSummary = formatSummary;

var _lodash = _interopRequireDefault(require("lodash"));

var _duration = _interopRequireDefault(require("duration"));

var _status = _interopRequireDefault(require("../../status"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const STATUS_REPORT_ORDER = [_status.default.FAILED, _status.default.AMBIGUOUS, _status.default.UNDEFINED, _status.default.PENDING, _status.default.SKIPPED, _status.default.PASSED];

function formatSummary({
  colorFns: colorFns,
  testCaseMap: testCaseMap,
  testRun: testRun
}) {
  const testCaseResults = [];
  const testStepResults = [];

  _lodash.default.each(testCaseMap, ({
    result: result,
    steps: steps
  }) => {
    testCaseResults.push(result);

    _lodash.default.each(steps, testStep => {
      if (testStep.sourceLocation) {
        testStepResults.push(testStep.result);
      }
    });
  });

  const scenarioSummary = getCountSummary({
    colorFns: colorFns,
    objects: testCaseResults,
    type: 'scenario'
  });
  const stepSummary = getCountSummary({
    colorFns: colorFns,
    objects: testStepResults,
    type: 'step'
  });
  const durationSummary = getDuration(testRun.result.duration);
  return [scenarioSummary, stepSummary, durationSummary].join('\n');
}

function getCountSummary({
  colorFns: colorFns,
  objects: objects,
  type: type
}) {
  const counts = _lodash.default.chain(objects).groupBy('status').mapValues('length').value();

  const total = _lodash.default.reduce(counts, (memo, value) => memo + value) || 0;
  let text = `${total} ${type}${total === 1 ? '' : 's'}`;

  if (total > 0) {
    const details = [];
    STATUS_REPORT_ORDER.forEach(status => {
      if (counts[status] > 0) {
        details.push(colorFns[status](`${counts[status]} ${status}`));
      }
    });
    text += ` (${details.join(', ')})`;
  }

  return text;
}

function getDuration(milliseconds) {
  const start = new Date(0);
  const end = new Date(milliseconds);
  const duration = new _duration.default(start, end);
  return `${duration.minutes}m${duration.toString('%S')}.${duration.toString('%L')}s` + `\n`;
}