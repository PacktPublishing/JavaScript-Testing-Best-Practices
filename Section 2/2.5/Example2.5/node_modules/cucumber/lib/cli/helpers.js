"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getExpandedArgv = getExpandedArgv;
exports.getTestCasesFromFilesystem = getTestCasesFromFilesystem;
exports.getTestCases = getTestCases;
exports.orderTestCases = orderTestCases;

var _lodash = _interopRequireDefault(require("lodash"));

var _argv_parser = _interopRequireDefault(require("./argv_parser"));

var _fs = _interopRequireDefault(require("mz/fs"));

var _gherkin = _interopRequireDefault(require("gherkin"));

var _path = _interopRequireDefault(require("path"));

var _profile_loader = _interopRequireDefault(require("./profile_loader"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _knuthShuffleSeeded = _interopRequireDefault(require("knuth-shuffle-seeded"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function getExpandedArgv(_x) {
  return _getExpandedArgv.apply(this, arguments);
}

function _getExpandedArgv() {
  _getExpandedArgv = _asyncToGenerator(function* ({
    argv: argv,
    cwd: cwd
  }) {
    const {
      options: options
    } = _argv_parser.default.parse(argv);

    let fullArgv = argv;
    const profileArgv = yield new _profile_loader.default(cwd).getArgv(options.profile);

    if (profileArgv.length > 0) {
      fullArgv = _lodash.default.concat(argv.slice(0, 2), profileArgv, argv.slice(2));
    }

    return fullArgv;
  });
  return _getExpandedArgv.apply(this, arguments);
}

function getTestCasesFromFilesystem(_x2) {
  return _getTestCasesFromFilesystem.apply(this, arguments);
}

function _getTestCasesFromFilesystem() {
  _getTestCasesFromFilesystem = _asyncToGenerator(function* ({
    cwd: cwd,
    eventBroadcaster: eventBroadcaster,
    featureDefaultLanguage: featureDefaultLanguage,
    featurePaths: featurePaths,
    order: order,
    pickleFilter: pickleFilter
  }) {
    let result = [];
    yield _bluebird.default.each(featurePaths,
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(function* (featurePath) {
        const source = yield _fs.default.readFile(featurePath, 'utf8');
        result = result.concat((yield getTestCases({
          eventBroadcaster: eventBroadcaster,
          language: featureDefaultLanguage,
          source: source,
          pickleFilter: pickleFilter,
          uri: _path.default.relative(cwd, featurePath)
        })));
      });

      return function (_x4) {
        return _ref.apply(this, arguments);
      };
    }());
    orderTestCases(result, order);
    return result;
  });
  return _getTestCasesFromFilesystem.apply(this, arguments);
}

function getTestCases(_x3) {
  return _getTestCases.apply(this, arguments);
} // Orders the testCases in place - morphs input


function _getTestCases() {
  _getTestCases = _asyncToGenerator(function* ({
    eventBroadcaster: eventBroadcaster,
    language: language,
    pickleFilter: pickleFilter,
    source: source,
    uri: uri
  }) {
    const result = [];

    const events = _gherkin.default.generateEvents(source, uri, {}, language);

    events.forEach(event => {
      eventBroadcaster.emit(event.type, _lodash.default.omit(event, 'type'));

      if (event.type === 'pickle') {
        const {
          pickle: pickle
        } = event;

        if (pickleFilter.matches({
          pickle: pickle,
          uri: uri
        })) {
          eventBroadcaster.emit('pickle-accepted', {
            pickle: pickle,
            uri: uri
          });
          result.push({
            pickle: pickle,
            uri: uri
          });
        } else {
          eventBroadcaster.emit('pickle-rejected', {
            pickle: pickle,
            uri: uri
          });
        }
      }

      if (event.type === 'attachment') {
        throw new Error(`Parse error in '${uri}': ${event.data}`);
      }
    });
    return result;
  });
  return _getTestCases.apply(this, arguments);
}

function orderTestCases(testCases, order) {
  let [type, seed] = order.split(':');

  switch (type) {
    case 'defined':
      break;

    case 'random':
      if (!seed) {
        seed = Math.floor(Math.random() * 1000 * 1000).toString();
        console.warn(`Random order using seed: ${seed}`);
      }

      (0, _knuthShuffleSeeded.default)(testCases, seed);
      break;

    default:
      throw new Error('Unrecgonized order type. Should be `defined` or `random`');
  }
}