"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _gherkin_document_parser = require("./gherkin_document_parser");

var _pickle_parser = require("./pickle_parser");

class EventDataCollector {
  constructor(eventBroadcaster) {
    eventBroadcaster.on('gherkin-document', this.storeGherkinDocument.bind(this)).on('pickle-accepted', this.storePickle.bind(this)).on('test-case-prepared', this.storeTestCase.bind(this)).on('test-step-attachment', this.storeTestStepAttachment.bind(this)).on('test-step-finished', this.storeTestStepResult.bind(this)).on('test-case-finished', this.storeTestCaseResult.bind(this));
    this.gherkinDocumentMap = {}; // uri to gherkinDocument

    this.pickleMap = {}; // uri:line to {pickle, uri}

    this.testCaseMap = {}; // uri:line to {sourceLocation, steps, result}
  }

  getTestCaseKey({
    uri: uri,
    line: line
  }) {
    return `${uri}:${line}`;
  }

  getTestCaseData(sourceLocation) {
    return {
      gherkinDocument: this.gherkinDocumentMap[sourceLocation.uri],
      pickle: this.pickleMap[this.getTestCaseKey(sourceLocation)],
      testCase: this.testCaseMap[this.getTestCaseKey(sourceLocation)]
    };
  }

  getTestStepData({
    testCase: {
      sourceLocation: sourceLocation
    },
    index: index
  }) {
    const {
      gherkinDocument: gherkinDocument,
      pickle: pickle,
      testCase: testCase
    } = this.getTestCaseData(sourceLocation);
    const result = {
      testStep: testCase.steps[index]
    };

    if (result.testStep.sourceLocation) {
      const {
        line: line
      } = result.testStep.sourceLocation;
      result.gherkinKeyword = (0, _gherkin_document_parser.getStepLineToKeywordMap)(gherkinDocument)[line];
      result.pickleStep = (0, _pickle_parser.getStepLineToPickledStepMap)(pickle)[line];
    }

    return result;
  }

  storeGherkinDocument({
    document: document,
    uri: uri
  }) {
    this.gherkinDocumentMap[uri] = document;
  }

  storePickle({
    pickle: pickle,
    uri: uri
  }) {
    this.pickleMap[`${uri}:${pickle.locations[0].line}`] = pickle;
  }

  storeTestCase({
    sourceLocation: sourceLocation,
    steps: steps
  }) {
    const key = this.getTestCaseKey(sourceLocation);
    this.testCaseMap[key] = {
      sourceLocation: sourceLocation,
      steps: steps
    };
  }

  storeTestStepAttachment({
    index: index,
    testCase: testCase,
    data: data,
    media: media
  }) {
    const key = this.getTestCaseKey(testCase.sourceLocation);
    const step = this.testCaseMap[key].steps[index];

    if (!step.attachments) {
      step.attachments = [];
    }

    step.attachments.push({
      data: data,
      media: media
    });
  }

  storeTestStepResult({
    index: index,
    testCase: testCase,
    result: result
  }) {
    const key = this.getTestCaseKey(testCase.sourceLocation);
    this.testCaseMap[key].steps[index].result = result;
  }

  storeTestCaseResult({
    sourceLocation: sourceLocation,
    result: result
  }) {
    const key = this.getTestCaseKey(sourceLocation);
    this.testCaseMap[key].result = result;
  }

}

exports.default = EventDataCollector;