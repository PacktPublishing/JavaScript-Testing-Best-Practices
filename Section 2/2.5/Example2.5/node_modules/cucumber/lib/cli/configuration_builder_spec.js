"use strict";

var _mocha = require("mocha");

var _chai = require("chai");

var _bluebird = require("bluebird");

var _configuration_builder = _interopRequireDefault(require("./configuration_builder"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

var _tmp = _interopRequireDefault(require("tmp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

(0, _mocha.describe)('Configuration', () => {
  (0, _mocha.beforeEach)(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    this.tmpDir = yield (0, _bluebird.promisify)(_tmp.default.dir)({
      unsafeCleanup: true
    });
    yield (0, _bluebird.promisify)(_fsExtra.default.mkdirp)(_path.default.join(this.tmpDir, 'features'));
    this.argv = ['path/to/node', 'path/to/cucumber.js'];
    this.configurationOptions = {
      argv: this.argv,
      cwd: this.tmpDir
    };
  }));
  (0, _mocha.describe)('no argv', () => {
    (0, _mocha.beforeEach)(
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      this.result = yield _configuration_builder.default.build(this.configurationOptions);
    }));
    (0, _mocha.it)('returns the default configuration', function () {
      (0, _chai.expect)(this.result).to.eql({
        featureDefaultLanguage: '',
        featurePaths: [],
        formatOptions: {
          cwd: this.tmpDir
        },
        formats: [{
          outputTo: '',
          type: 'progress'
        }],
        listI18nKeywordsFor: '',
        listI18nLanguages: false,
        order: 'defined',
        parallel: 0,
        pickleFilterOptions: {
          featurePaths: ['features/**/*.feature'],
          names: [],
          tagExpression: ''
        },
        profiles: [],
        runtimeOptions: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          strict: true,
          worldParameters: {}
        },
        shouldExitImmediately: false,
        supportCodePaths: [],
        supportCodeRequiredModules: []
      });
    });
  });
  (0, _mocha.describe)('path to a feature', () => {
    (0, _mocha.beforeEach)(
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      this.relativeFeaturePath = _path.default.join('features', 'a.feature');
      this.featurePath = _path.default.join(this.tmpDir, this.relativeFeaturePath);
      yield _fsExtra.default.outputFile(this.featurePath, '');
      this.supportCodePath = _path.default.join(this.tmpDir, 'features', 'a.js');
      yield _fsExtra.default.outputFile(this.supportCodePath, '');
      this.argv.push(this.relativeFeaturePath);
      this.result = yield _configuration_builder.default.build(this.configurationOptions);
    }));
    (0, _mocha.it)('returns the appropriate feature and support code paths',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const {
        featurePaths: featurePaths,
        pickleFilterOptions: pickleFilterOptions,
        supportCodePaths: supportCodePaths
      } = this.result;
      (0, _chai.expect)(featurePaths).to.eql([this.featurePath]);
      (0, _chai.expect)(pickleFilterOptions.featurePaths).to.eql([this.relativeFeaturePath]);
      (0, _chai.expect)(supportCodePaths).to.eql([this.supportCodePath]);
    }));
  });
  (0, _mocha.describe)('path to a nested feature', () => {
    (0, _mocha.beforeEach)(
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      this.relativeFeaturePath = _path.default.join('features', 'nested', 'a.feature');
      this.featurePath = _path.default.join(this.tmpDir, this.relativeFeaturePath);
      yield _fsExtra.default.outputFile(this.featurePath, '');
      this.supportCodePath = _path.default.join(this.tmpDir, 'features', 'a.js');
      yield _fsExtra.default.outputFile(this.supportCodePath, '');
      this.argv.push(this.relativeFeaturePath);
      this.result = yield _configuration_builder.default.build(this.configurationOptions);
    }));
    (0, _mocha.it)('returns the appropriate feature and support code paths',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const {
        featurePaths: featurePaths,
        pickleFilterOptions: pickleFilterOptions,
        supportCodePaths: supportCodePaths
      } = this.result;
      (0, _chai.expect)(featurePaths).to.eql([this.featurePath]);
      (0, _chai.expect)(pickleFilterOptions.featurePaths).to.eql([this.relativeFeaturePath]);
      (0, _chai.expect)(supportCodePaths).to.eql([this.supportCodePath]);
    }));
  });
  (0, _mocha.describe)('formatters', () => {
    (0, _mocha.it)('adds a default',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const formats = yield getFormats(this.configurationOptions);
      (0, _chai.expect)(formats).to.eql([{
        outputTo: '',
        type: 'progress'
      }]);
    }));
    (0, _mocha.it)('splits relative unix paths',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      this.argv.push('-f', '../custom/formatter:../formatter/output.txt');
      const formats = yield getFormats(this.configurationOptions);
      (0, _chai.expect)(formats).to.eql([{
        outputTo: '',
        type: 'progress'
      }, {
        outputTo: '../formatter/output.txt',
        type: '../custom/formatter'
      }]);
    }));
    (0, _mocha.it)('splits absolute unix paths',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      this.argv.push('-f', '/custom/formatter:/formatter/output.txt');
      const formats = yield getFormats(this.configurationOptions);
      (0, _chai.expect)(formats).to.eql([{
        outputTo: '',
        type: 'progress'
      }, {
        outputTo: '/formatter/output.txt',
        type: '/custom/formatter'
      }]);
    }));
    (0, _mocha.it)('splits absolute windows paths',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      this.argv.push('-f', 'C:\\custom\\formatter:D:\\formatter\\output.txt');
      const formats = yield getFormats(this.configurationOptions);
      (0, _chai.expect)(formats).to.eql([{
        outputTo: '',
        type: 'progress'
      }, {
        outputTo: 'D:\\formatter\\output.txt',
        type: 'C:\\custom\\formatter'
      }]);
    }));
    (0, _mocha.it)('does not split absolute windows paths without an output',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      this.argv.push('-f', 'C:\\custom\\formatter');
      const formats = yield getFormats(this.configurationOptions);
      (0, _chai.expect)(formats).to.eql([{
        outputTo: '',
        type: 'C:\\custom\\formatter'
      }]);
    }));

    function getFormats(_x) {
      return _getFormats.apply(this, arguments);
    }

    function _getFormats() {
      _getFormats = _asyncToGenerator(function* (options) {
        const result = yield _configuration_builder.default.build(options);
        return result.formats;
      });
      return _getFormats.apply(this, arguments);
    }
  });
  (0, _mocha.describe)('formatOptions', () => {
    (0, _mocha.it)('returns the format options passed in with cwd added',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      this.argv.push('--format-options', '{"snippetSyntax": "promise"}');
      const result = yield _configuration_builder.default.build(this.configurationOptions);
      (0, _chai.expect)(result.formatOptions).to.eql({
        snippetSyntax: 'promise',
        cwd: this.tmpDir
      });
    }));
  });
});