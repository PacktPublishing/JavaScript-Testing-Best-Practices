"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isIssue = isIssue;
exports.formatIssue = formatIssue;

var _lodash = _interopRequireDefault(require("lodash"));

var _location_helpers = require("./location_helpers");

var _step_result_helpers = require("./step_result_helpers");

var _indentString = _interopRequireDefault(require("indent-string"));

var _status = _interopRequireDefault(require("../../status"));

var _figures = _interopRequireDefault(require("figures"));

var _cliTable = _interopRequireDefault(require("cli-table3"));

var _keyword_type = _interopRequireWildcard(require("./keyword_type"));

var _step_arguments = require("../../step_arguments");

var _gherkin_document_parser = require("./gherkin_document_parser");

var _pickle_parser = require("./pickle_parser");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CHARACTERS = {
  [_status.default.AMBIGUOUS]: _figures.default.cross,
  [_status.default.FAILED]: _figures.default.cross,
  [_status.default.PASSED]: _figures.default.tick,
  [_status.default.PENDING]: '?',
  [_status.default.SKIPPED]: '-',
  [_status.default.UNDEFINED]: '?'
};
const IS_ISSUE = {
  [_status.default.AMBIGUOUS]: true,
  [_status.default.FAILED]: true,
  [_status.default.PASSED]: false,
  [_status.default.PENDING]: true,
  [_status.default.SKIPPED]: false,
  [_status.default.UNDEFINED]: true
};

function formatDataTable(arg) {
  const rows = arg.rows.map(row => row.cells.map(cell => cell.value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')));
  const table = new _cliTable.default({
    chars: {
      bottom: '',
      'bottom-left': '',
      'bottom-mid': '',
      'bottom-right': '',
      left: '|',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      middle: '|',
      right: '|',
      'right-mid': '',
      top: '',
      'top-left': '',
      'top-mid': '',
      'top-right': ''
    },
    style: {
      border: [],
      'padding-left': 1,
      'padding-right': 1
    }
  });
  table.push(...rows);
  return table.toString();
}

function formatDocString(arg) {
  return `"""\n${arg.content}\n"""`;
}

function formatStep({
  colorFns: colorFns,
  isBeforeHook: isBeforeHook,
  keyword: keyword,
  keywordType: keywordType,
  pickleStep: pickleStep,
  snippetBuilder: snippetBuilder,
  testStep: testStep
}) {
  const {
    status: status
  } = testStep.result;
  const colorFn = colorFns[status];
  let identifier;

  if (testStep.sourceLocation) {
    identifier = keyword + (pickleStep.text || '');
  } else {
    identifier = isBeforeHook ? 'Before' : 'After';
  }

  let text = colorFn(`${CHARACTERS[status]} ${identifier}`);
  const {
    actionLocation: actionLocation
  } = testStep;

  if (actionLocation) {
    text += ` # ${colorFns.location((0, _location_helpers.formatLocation)(actionLocation))}`;
  }

  text += '\n';

  if (pickleStep) {
    let str;
    const iterator = (0, _step_arguments.buildStepArgumentIterator)({
      dataTable: arg => str = formatDataTable(arg),
      docString: arg => str = formatDocString(arg)
    });

    _lodash.default.each(pickleStep.arguments, iterator);

    if (str) {
      text += (0, _indentString.default)(`${colorFn(str)}\n`, 4);
    }
  }

  if (testStep.attachments) {
    testStep.attachments.forEach(({
      media: media,
      data: data
    }) => {
      const message = media.type === 'text/plain' ? `: ${data}` : '';
      text += (0, _indentString.default)(`Attachment (${media.type})${message}\n`, 4);
    });
  }

  const message = (0, _step_result_helpers.getStepMessage)({
    colorFns: colorFns,
    keywordType: keywordType,
    pickleStep: pickleStep,
    snippetBuilder: snippetBuilder,
    testStep: testStep
  });

  if (message) {
    text += `${(0, _indentString.default)(message, 4)}\n`;
  }

  return text;
}

function isIssue(status) {
  return IS_ISSUE[status];
}

function formatIssue({
  colorFns: colorFns,
  gherkinDocument: gherkinDocument,
  number: number,
  pickle: pickle,
  snippetBuilder: snippetBuilder,
  testCase: testCase
}) {
  const prefix = `${number}) `;
  let text = prefix;
  const scenarioLocation = (0, _location_helpers.formatLocation)(testCase.sourceLocation);
  text += `Scenario: ${pickle.name} # ${colorFns.location(scenarioLocation)}\n`;
  const stepLineToKeywordMap = (0, _gherkin_document_parser.getStepLineToKeywordMap)(gherkinDocument);
  const stepLineToPickledStepMap = (0, _pickle_parser.getStepLineToPickledStepMap)(pickle);
  let isBeforeHook = true;
  let previousKeywordType = _keyword_type.default.PRECONDITION;

  _lodash.default.each(testCase.steps, testStep => {
    isBeforeHook = isBeforeHook && !testStep.sourceLocation;
    let keyword, keywordType, pickleStep;

    if (testStep.sourceLocation) {
      pickleStep = stepLineToPickledStepMap[testStep.sourceLocation.line];
      keyword = (0, _pickle_parser.getStepKeyword)({
        pickleStep: pickleStep,
        stepLineToKeywordMap: stepLineToKeywordMap
      });
      keywordType = (0, _keyword_type.getStepKeywordType)({
        keyword: keyword,
        language: gherkinDocument.feature.language,
        previousKeywordType: previousKeywordType
      });
    }

    const formattedStep = formatStep({
      colorFns: colorFns,
      isBeforeHook: isBeforeHook,
      keyword: keyword,
      keywordType: keywordType,
      pickleStep: pickleStep,
      snippetBuilder: snippetBuilder,
      testStep: testStep
    });
    text += (0, _indentString.default)(formattedStep, prefix.length);
    previousKeywordType = keywordType;
  });

  return `${text}\n`;
}