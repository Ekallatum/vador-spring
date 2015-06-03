'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _vador = require('vador');

var _lodashHas = require('lodash.has');

var _lodashHas2 = _interopRequireDefault(_lodashHas);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var debug = new _debug2['default']('halClient [Interceptor]');

var PopulateInterceptor = (function (_ResponseInterceptor) {
  function PopulateInterceptor() {
    _classCallCheck(this, PopulateInterceptor);

    if (_ResponseInterceptor != null) {
      _ResponseInterceptor.apply(this, arguments);
    }
  }

  _inherits(PopulateInterceptor, _ResponseInterceptor);

  _createClass(PopulateInterceptor, [{
    key: 'response',
    value: function response(_response) {
      var _this = this;

      debug('populate interceptor begin');
      var value = _response.value;
      var request = _response.request;

      if (!_response.hasValue() || !request.hasPopulate()) {
        debug('Populate extractor end (do nothing)');
        return _response;
      }

      var promises = [];
      if (Array.isArray(value)) {
        value.forEach(function (val) {
          promises.push(_this._populateOne(val, request));
        });
      } else {
        promises.push(this._populateOne(value, request));
      }

      return Promise.all(promises).then(function () {
        debug('populate interceptor end');
        return _response;
      });
    }
  }, {
    key: '_populateOne',
    value: function _populateOne(object, request) {
      debug('populate one');
      var links = object['**links**'];

      var promises = [];
      var populates = request.populates;

      populates.keys().forEach(function (rel) {
        if (rel && (0, _lodashHas2['default'])(links, rel)) {
          var link = links[rel];
          var url = link.substring(0, link.indexOf(rel));
          var r = request.restResource._createSubInstance(url, rel);
          var promise = r.findAll();
          var subPopulate = populates.getSubPopulate(rel);
          if (Array.isArray(subPopulate) && subPopulate.length) {
            promise.populate.apply(promise, _toConsumableArray(subPopulate));
          }
          promise = promise.sendRequest().then(function (res) {
            object[rel] = res.value;
          });
          promises.push(promise);
        }
      });

      return Promise.all(promises).then(function () {
        return object;
      });
    }
  }, {
    key: 'responseError',
    value: function responseError(error) {
      console.error('populate extractor responseError', error);
    }
  }]);

  return PopulateInterceptor;
})(_vador.ResponseInterceptor);

exports.PopulateInterceptor = PopulateInterceptor;