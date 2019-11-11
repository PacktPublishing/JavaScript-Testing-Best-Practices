"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUsage = getUsage;

var _lodash = _interopRequireDefault(require("lodash"));

var _location_helpers = require("../location_helpers");

var _pickle_parser = require("../pickle_parser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildEmptyMapping(stepDefinitions) {
  const mapping = {};
  stepDefinitions.forEach(stepDefinition => {
    const location = (0, _location_helpers.formatLocation)(stepDefinition);
    mapping[location] = {
      line: stepDefinition.line,
      pattern: stepDefinition.pattern,
      matches: [],
      uri: stepDefinition.uri
    };
  });
  return mapping;
}

function buildMapping({
  stepDefinitions: stepDefinitions,
  eventDataCollector: eventDataCollector
}) {
  const mapping = buildEmptyMapping(stepDefinitions);

  _lodash.default.each(eventDataCollector.testCaseMap, testCase => {
    const {
      pickle: pickle
    } = eventDataCollector.getTestCaseData(testCase.sourceLocation);
    const stepLineToPickledStepMap = (0, _pickle_parser.getStepLineToPickledStepMap)(pickle);
    testCase.steps.forEach(testStep => {
      const {
        actionLocation: actionLocation,
        sourceLocation: sourceLocation,
        result: {
          duration: duration
        }
      } = testStep;

      if (actionLocation && sourceLocation) {
        const location = (0, _location_helpers.formatLocation)(actionLocation);
        const match = {
          line: sourceLocation.line,
          text: stepLineToPickledStepMap[sourceLocation.line].text,
          uri: sourceLocation.uri
        };

        if (isFinite(duration)) {
          match.duration = duration;
        }

        if (mapping[location]) {
          mapping[location].matches.push(match);
        }
      }
    });
  });

  return mapping;
}

function invertNumber(key) {
  return obj => {
    const value = obj[key];

    if (isFinite(value)) {
      return -1 * value;
    }

    return 1;
  };
}

function buildResult(mapping) {
  return _lodash.default.chain(mapping).map(({
    line: line,
    matches: matches,
    pattern: pattern,
    uri: uri
  }) => {
    const sortedMatches = _lodash.default.sortBy(matches, [invertNumber('duration'), 'text']);

    const result = {
      line: line,
      matches: sortedMatches,
      pattern: pattern,
      uri: uri
    };

    const meanDuration = _lodash.default.meanBy(matches, 'duration');

    if (isFinite(meanDuration)) {
      result.meanDuration = meanDuration;
    }

    return result;
  }).sortBy(invertNumber('meanDuration')).value();
}

function getUsage({
  stepDefinitions: stepDefinitions,
  eventDataCollector: eventDataCollector
}) {
  const mapping = buildMapping({
    stepDefinitions: stepDefinitions,
    eventDataCollector: eventDataCollector
  });
  return buildResult(mapping);
}