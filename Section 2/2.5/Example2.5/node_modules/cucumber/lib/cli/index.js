"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helpers = require("../formatter/helpers");

var _helpers2 = require("./helpers");

var _install_validator = require("./install_validator");

var I18n = _interopRequireWildcard(require("./i18n"));

var _configuration_builder = _interopRequireDefault(require("./configuration_builder"));

var _events = _interopRequireDefault(require("events"));

var _builder = _interopRequireDefault(require("../formatter/builder"));

var _fs = _interopRequireDefault(require("mz/fs"));

var _path = _interopRequireDefault(require("path"));

var _pickle_filter = _interopRequireDefault(require("../pickle_filter"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _master = _interopRequireDefault(require("../runtime/parallel/master"));

var _runtime = _interopRequireDefault(require("../runtime"));

var _support_code_library_builder = _interopRequireDefault(require("../support_code_library_builder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Cli {
  constructor({
    argv: argv,
    cwd: cwd,
    stdout: stdout
  }) {
    this.argv = argv;
    this.cwd = cwd;
    this.stdout = stdout;
  }

  getConfiguration() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const fullArgv = yield (0, _helpers2.getExpandedArgv)({
        argv: _this.argv,
        cwd: _this.cwd
      });
      return _configuration_builder.default.build({
        argv: fullArgv,
        cwd: _this.cwd
      });
    })();
  }

  initializeFormatters({
    eventBroadcaster: eventBroadcaster,
    formatOptions: formatOptions,
    formats: formats,
    supportCodeLibrary: supportCodeLibrary
  }) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const streamsToClose = [];
      const eventDataCollector = new _helpers.EventDataCollector(eventBroadcaster);
      yield _bluebird.default.map(formats,
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* ({
          type: type,
          outputTo: outputTo
        }) {
          var _context;

          let stream = _this2.stdout;

          if (outputTo) {
            const fd = yield _fs.default.open(_path.default.resolve(_this2.cwd, outputTo), 'w');
            stream = _fs.default.createWriteStream(null, {
              fd: fd
            });
            streamsToClose.push(stream);
          }

          const typeOptions = _objectSpread({
            eventBroadcaster: eventBroadcaster,
            eventDataCollector: eventDataCollector,
            log: (_context = stream).write.bind(_context),
            stream: stream,
            supportCodeLibrary: supportCodeLibrary
          }, formatOptions);

          if (!formatOptions.hasOwnProperty('colorsEnabled')) {
            typeOptions.colorsEnabled = !!stream.isTTY;
          }

          if (type === 'progress-bar' && !stream.isTTY) {
            console.warn(`Cannot use 'progress-bar' formatter for output to '${outputTo || 'stdout'}' as not a TTY. Switching to 'progress' formatter.`);
            type = 'progress';
          }

          return _builder.default.build(type, typeOptions);
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
      return function () {
        return _bluebird.default.each(streamsToClose, stream => _bluebird.default.promisify(stream.end.bind(stream))());
      };
    })();
  }

  getSupportCodeLibrary({
    supportCodeRequiredModules: supportCodeRequiredModules,
    supportCodePaths: supportCodePaths
  }) {
    supportCodeRequiredModules.map(module => require(module));

    _support_code_library_builder.default.reset(this.cwd);

    supportCodePaths.forEach(codePath => require(codePath));
    return _support_code_library_builder.default.finalize();
  }

  run() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      yield (0, _install_validator.validateInstall)(_this3.cwd);
      const configuration = yield _this3.getConfiguration();

      if (configuration.listI18nLanguages) {
        _this3.stdout.write(I18n.getLanguages());

        return {
          success: true
        };
      }

      if (configuration.listI18nKeywordsFor) {
        _this3.stdout.write(I18n.getKeywords(configuration.listI18nKeywordsFor));

        return {
          success: true
        };
      }

      const supportCodeLibrary = _this3.getSupportCodeLibrary(configuration);

      const eventBroadcaster = new _events.default();
      const cleanup = yield _this3.initializeFormatters({
        eventBroadcaster: eventBroadcaster,
        formatOptions: configuration.formatOptions,
        formats: configuration.formats,
        supportCodeLibrary: supportCodeLibrary
      });
      const testCases = yield (0, _helpers2.getTestCasesFromFilesystem)({
        cwd: _this3.cwd,
        eventBroadcaster: eventBroadcaster,
        featureDefaultLanguage: configuration.featureDefaultLanguage,
        featurePaths: configuration.featurePaths,
        order: configuration.order,
        pickleFilter: new _pickle_filter.default(configuration.pickleFilterOptions)
      });
      let success;

      if (configuration.parallel) {
        const parallelRuntimeMaster = new _master.default({
          eventBroadcaster: eventBroadcaster,
          options: configuration.runtimeOptions,
          supportCodePaths: configuration.supportCodePaths,
          supportCodeRequiredModules: configuration.supportCodeRequiredModules,
          testCases: testCases
        });
        yield new _bluebird.default(resolve => {
          parallelRuntimeMaster.run(configuration.parallel, s => {
            success = s;
            resolve();
          });
        });
      } else {
        const runtime = new _runtime.default({
          eventBroadcaster: eventBroadcaster,
          options: configuration.runtimeOptions,
          supportCodeLibrary: supportCodeLibrary,
          testCases: testCases
        });
        success = yield runtime.start();
      }

      yield cleanup();
      return {
        shouldExitImmediately: configuration.shouldExitImmediately,
        success: success
      };
    })();
  }

}

exports.default = Cli;