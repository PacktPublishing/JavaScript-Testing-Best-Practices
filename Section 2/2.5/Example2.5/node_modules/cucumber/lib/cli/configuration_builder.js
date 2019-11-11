"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _argv_parser = _interopRequireDefault(require("./argv_parser"));

var _fs = _interopRequireDefault(require("mz/fs"));

var _path = _interopRequireDefault(require("path"));

var _option_splitter = _interopRequireDefault(require("./option_splitter"));

var _bluebird = _interopRequireWildcard(require("bluebird"));

var _glob = _interopRequireDefault(require("glob"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const globP = (0, _bluebird.promisify)(_glob.default);

class ConfigurationBuilder {
  static build(options) {
    return _asyncToGenerator(function* () {
      const builder = new ConfigurationBuilder(options);
      return builder.build();
    })();
  }

  constructor({
    argv: argv,
    cwd: cwd
  }) {
    this.cwd = cwd;

    const parsedArgv = _argv_parser.default.parse(argv);

    this.args = parsedArgv.args;
    this.options = parsedArgv.options;
  }

  build() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const listI18nKeywordsFor = _this.options.i18nKeywords;
      const listI18nLanguages = !!_this.options.i18nLanguages;
      const unexpandedFeaturePaths = yield _this.getUnexpandedFeaturePaths();
      let featurePaths = [];
      let supportCodePaths = [];

      if (!listI18nKeywordsFor && !listI18nLanguages) {
        featurePaths = yield _this.expandFeaturePaths(unexpandedFeaturePaths);
        let unexpandedSupportCodePaths = _this.options.require;

        if (unexpandedSupportCodePaths.length === 0) {
          unexpandedSupportCodePaths = _this.getFeatureDirectoryPaths(featurePaths);
        }

        supportCodePaths = yield _this.expandPaths(unexpandedSupportCodePaths, '.js');
      }

      return {
        featureDefaultLanguage: _this.options.language,
        featurePaths: featurePaths,
        formats: _this.getFormats(),
        formatOptions: _this.getFormatOptions(),
        listI18nKeywordsFor: listI18nKeywordsFor,
        listI18nLanguages: listI18nLanguages,
        order: _this.options.order,
        parallel: _this.options.parallel,
        profiles: _this.options.profile,
        pickleFilterOptions: {
          featurePaths: unexpandedFeaturePaths,
          names: _this.options.name,
          tagExpression: _this.options.tags
        },
        runtimeOptions: {
          dryRun: !!_this.options.dryRun,
          failFast: !!_this.options.failFast,
          filterStacktraces: !_this.options.backtrace,
          strict: !!_this.options.strict,
          worldParameters: _this.options.worldParameters
        },
        shouldExitImmediately: !!_this.options.exit,
        supportCodePaths: supportCodePaths,
        supportCodeRequiredModules: _this.options.requireModule
      };
    })();
  }

  expandPaths(unexpandedPaths, defaultExtension) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const expandedPaths = yield _bluebird.default.map(unexpandedPaths,
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (unexpandedPath) {
          const matches = yield globP(unexpandedPath, {
            absolute: true,
            cwd: _this2.cwd
          });
          return _bluebird.default.map(matches,
          /*#__PURE__*/
          function () {
            var _ref2 = _asyncToGenerator(function* (match) {
              if (_path.default.extname(match) === '') {
                return globP(`${match}/**/*${defaultExtension}`);
              }

              return match;
            });

            return function (_x2) {
              return _ref2.apply(this, arguments);
            };
          }());
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
      return _lodash.default.flattenDepth(expandedPaths, 2).map(x => _path.default.normalize(x));
    })();
  }

  expandFeaturePaths(featurePaths) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      featurePaths = featurePaths.map(p => p.replace(/(:\d+)*$/g, '')); // Strip line numbers

      return _this3.expandPaths(featurePaths, '.feature');
    })();
  }

  getFeatureDirectoryPaths(featurePaths) {
    const featureDirs = featurePaths.map(featurePath => {
      let featureDir = _path.default.dirname(featurePath);

      let childDir;
      let parentDir = featureDir;

      while (childDir !== parentDir) {
        childDir = parentDir;
        parentDir = _path.default.dirname(childDir);

        if (_path.default.basename(parentDir) === 'features') {
          featureDir = parentDir;
          break;
        }
      }

      return _path.default.relative(this.cwd, featureDir);
    });
    return _lodash.default.uniq(featureDirs);
  }

  getFormatOptions() {
    return _lodash.default.assign({}, this.options.formatOptions, {
      cwd: this.cwd
    });
  }

  getFormats() {
    const mapping = {
      '': 'progress'
    };
    this.options.format.forEach(format => {
      const [type, outputTo] = _option_splitter.default.split(format);

      mapping[outputTo || ''] = type;
    });
    return _lodash.default.map(mapping, (type, outputTo) => ({
      outputTo: outputTo,
      type: type
    }));
  }

  getUnexpandedFeaturePaths() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      if (_this4.args.length > 0) {
        const nestedFeaturePaths = yield _bluebird.default.map(_this4.args,
        /*#__PURE__*/
        function () {
          var _ref3 = _asyncToGenerator(function* (arg) {
            const filename = _path.default.basename(arg);

            if (filename[0] === '@') {
              const filePath = _path.default.join(_this4.cwd, arg);

              const content = yield _fs.default.readFile(filePath, 'utf8');
              return _lodash.default.chain(content).split('\n').map(_lodash.default.trim).compact().value();
            }

            return arg;
          });

          return function (_x3) {
            return _ref3.apply(this, arguments);
          };
        }());

        const featurePaths = _lodash.default.flatten(nestedFeaturePaths);

        if (featurePaths.length > 0) {
          return featurePaths;
        }
      }

      return ['features/**/*.feature'];
    })();
  }

}

exports.default = ConfigurationBuilder;