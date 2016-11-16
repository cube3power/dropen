(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPreviewElement = exports.makeElement = undefined;

var _utils = require('./utils');

var window = global;
var document = window.document;

var makeElement = exports.makeElement = function makeElement(el) {
  if (typeof el === 'undefined') {
    return el;
  }
  if (el instanceof HTMLElement) {
    return el;
  }
  if (typeof el === 'string') {
    var _el = document.querySelector(el);
    if (!_el) {
      throw Error('Not found in document.querySelector(el)');
    }
    return _el;
  }
  throw TypeError('"el" is not HTMLElement or valid selector.');
};

var createPreviewElement = exports.createPreviewElement = function createPreviewElement(file) {
  if (!(file instanceof File || file instanceof Blob)) {
    throw TypeError('invalid argument type: required File or Blob, but found ' + file.type);
  }

  var reader = new FileReader();

  if (/image\/.*/.test(file.type)) {
    var img = document.createElement('img');
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      img.src = reader.result;
    };
    return img;
  }

  if (/application\/pdf/.test(file.type)) {
    var obj = document.createElement('object');
    obj.type = 'application/pdf';
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      obj.data = reader.result;
    };
    return obj;
  }

  if (/text\/(.+)/.test(file.type)) {
    var pre = document.createElement('pre');
    reader.readAsText(file);
    reader.onloadend = function () {
      pre.innerHTML = (0, _utils.escapeHTML)(reader.result);
    };
    return pre;
  }

  throw TypeError('Not support file type: ' + file.type);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utils":4}],3:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _utils = require('./utils');

var _helpers = require('./helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Create drag & drop zone for file,
 * and preview read file after file upload.
 *
 * @param {string|HTMLElement} el To define drag & drop file zone element or selector.
 * @param {object} [configure] configure settings
 * @prop  {HTMLElement} [preview] To preview HTMLImageElement's into this element.
 * @prop  {string} [dragoverClass] Adding class to dndzone when dispached dragover event on dndzone.
 * @prop  {boolean} [autoPreview] will automatically preview when `el` get files. default true.
 * @prop  {boolean} [autoRefresh] will automatically refresh preview element when files uploaded. default true.
 * @prop  {string} [imageMinWidth] min-width of preview's <img>. default null.
 * @prop  {string} [imageMinHeight] min-height of preview's <img>. default null.
 * @prop  {string} [imageMaxWidth] max-width of preview's <img>. default null.
 * @prop  {string} [imageMaxHeight] max-height of preview's <img>. default null.
 * @example
 *   var el      = document.getElementById('drag-and-drop-zone');
 *   var preview = document.getElementById('preview-zone'); 
 *
 *   var instance = new Dropen(el, {
 *     preview: preview,
 *     dragoverClass: 'emphasis',
 *     autoPreview: true
 *     autoRefresh: true
 *     imageMinWidth: '100px',
 *     imageMinHeight: '100px',
 *     imageMaxWidth: '100%',
 *     imageMaxHeight: '100%',
 *   });
 *
 *   instance.on('upload', function(e) {
 *     console.log(JSON.stringify(e));
 *   });
 *
 *   instance.on('uploadend', function(e) {
 *     console.log(JSON.stringify(e));
 *   });
 *
 * @constructor
 */
var Dropen = function (_EventEmitter) {
  _inherits(Dropen, _EventEmitter);

  function Dropen(el, _ref) {
    var preview = _ref.preview,
        dragoverClass = _ref.dragoverClass,
        _ref$autoPreview = _ref.autoPreview,
        autoPreview = _ref$autoPreview === undefined ? true : _ref$autoPreview,
        _ref$autoRefresh = _ref.autoRefresh,
        autoRefresh = _ref$autoRefresh === undefined ? true : _ref$autoRefresh,
        imageMinWidth = _ref.imageMinWidth,
        imageMinHeight = _ref.imageMinHeight,
        imageMaxWidth = _ref.imageMaxWidth,
        imageMaxHeight = _ref.imageMaxHeight;

    _classCallCheck(this, Dropen);

    var _this2 = _possibleConstructorReturn(this, (Dropen.__proto__ || Object.getPrototypeOf(Dropen)).call(this));

    var _el = (0, _helpers.makeElement)(el);

    _this2._isFileElement = false;

    if (_el instanceof HTMLInputElement) {
      if (_el.type !== 'file') {
        throw TypeError('"el" is HTMLElement but not input[type="file"].');
      }
      _this2._isFileElement = true;
    }

    _this2._el = _el;
    _this2._files = [];
    _this2._preview = (0, _helpers.makeElement)(preview);
    _this2._autoPreview = autoPreview;
    _this2._autoRefresh = autoRefresh;
    _this2._dragoverClass = dragoverClass;
    _this2._imageMinWidth = imageMinWidth;
    _this2._imageMinHeight = imageMinHeight;
    _this2._imageMaxWidth = imageMaxWidth;
    _this2._imageMaxHeight = imageMaxHeight;

    _this2._attachEvent();
    return _this2;
  }

  /**
   * Attach event to "el" (HTMLElement)
   */


  _createClass(Dropen, [{
    key: '_attachEvent',
    value: function _attachEvent() {
      var _this = this,
          el = _this._el;

      if (this._isFileElement) {
        el.addEventListener('change', this.onChange.bind(this));
      } else {
        el.addEventListener('dragover', this.onDragover.bind(this));
        el.addEventListener('dragleave', this.onDragleave.bind(this));
        el.addEventListener('drop', this.onDrop.bind(this));
      }
    }

    /**
     * when this instance's `el` is input[type="files"] or that selecter,
     * this function called as `el`'s onchange event listener.
     *
     * @param {Event} e input[type=\"file\"] `onchange` event.
     */

  }, {
    key: 'onChange',
    value: function onChange(e) {
      var _this = this,
          el = _this._el;

      _this.emit('upload', {
        currentFiles: _this.getFiles(),
        targetFiles: e.target.files
      });

      (0, _utils.removeClass)(el, _this._dragoverClass);

      if (_this._autoRefresh) {
        _this.clearFiles();
        _this.applyToHTML();
      }

      _this.addFiles(e.target.files);

      if (_this._autoPreview) {
        _this.applyToHTML();
      }

      _this.emit('uploadend', {
        currentFiles: _this.getFiles(),
        targetFiles: e.target.files
      });
    }

    /**
     * when this instance's `el` is normal HTMLElement or that selecter,
     * this function called as `el`'s ondragover event listener.
     *
     * @param {Event} e this.el's `ondragover` event.
     */

  }, {
    key: 'onDragover',
    value: function onDragover(e) {
      var _this = this,
          el = _this._el;
      (0, _utils.stopEvent)(e);
      (0, _utils.addClass)(el, _this._dragoverClass);
    }

    /**
     * when this instance's `el` is normal HTMLElement or that selecter,
     * this function called as `el`'s ondragleave event listener.
     *
     * @param {Event} e this.el's `ondragleave` event.
     */

  }, {
    key: 'onDragleave',
    value: function onDragleave(e) {
      var _this = this,
          el = _this._el;
      (0, _utils.stopEvent)(e);
      (0, _utils.removeClass)(el, _this._dragoverClass);
    }

    /**
     * when this instance's `el` is normal HTMLElement or that selecter,
     * this function called as `el`'s ondragleave event listener.
     *
     * @param {Event} e this.el's `ondrop` event.
     */

  }, {
    key: 'onDrop',
    value: function onDrop(e) {
      var _this = this,
          el = _this._el;

      (0, _utils.stopEvent)(e);

      _this.emit('upload', {
        currentFiles: _this.getFiles(),
        targetFiles: e.dataTransfer.files
      });

      (0, _utils.removeClass)(el, _this._dragoverClass);

      if (_this._autoRefresh) {
        _this.clearFiles();
        _this.applyToHTML();
      }

      _this.addFiles(e.dataTransfer.files);

      if (_this._autoPreview) {
        _this.applyToHTML();
      }

      _this.emit('uploadend', {
        currentFiles: _this.getFiles(),
        targetFiles: e.dataTransfer.files
      });
    }

    /**
     * Get HTMLElement: `el` drag and drop zone's element.
     */

  }, {
    key: 'getEl',
    value: function getEl() {
      return this._el;
    }

    /**
     * Get HTMLElement: file preview zone's element.
     */

  }, {
    key: 'getPreview',
    value: function getPreview() {
      return this._preview;
    }

    /**
     * Get uploaded file list.
     */

  }, {
    key: 'getFiles',
    value: function getFiles() {
      return this._files;
    }

    /**
     * Add a file.
     * @param {File|Blob} file push to Dropen#_files
     */

  }, {
    key: 'addFile',
    value: function addFile(file) {
      if (file instanceof File || file instanceof Blob) {
        this._files.push(file);
      }
    }

    /**
     * Add file list.
     * @param {Array} files Files from drag and drop or input[type=file] changed.
     */

  }, {
    key: 'addFiles',
    value: function addFiles(files) {
      var _this = this;
      if (files instanceof Array || files instanceof FileList) {
        [].filter.call(files, function (f) {
          return f instanceof File || f instanceof Blob;
        }).forEach(function (f) {
          return _this.addFile(f);
        });
      }
      if (files instanceof File || files instanceof Blob) {
        _this.addFile(files);
      }
    }

    /**
     * Clear uploaded file list and preview zone.
     */

  }, {
    key: 'clearFiles',
    value: function clearFiles() {
      this._files = [];
    }

    /**
     * Has files apply to html source
     */

  }, {
    key: 'applyToHTML',
    value: function applyToHTML() {
      if (this._preview) {
        this.removeFromPreviewHTML();
        this.appendToPreviewHTML();
      }
    }

    /**
     * remove html from preview element.
     */

  }, {
    key: 'removeFromPreviewHTML',
    value: function removeFromPreviewHTML() {
      if (this._preview) {
        this._preview.innerHTML = '';
      }
    }

    /**
     * Preview uploaded files.
     */

  }, {
    key: 'appendToPreviewHTML',
    value: function appendToPreviewHTML() {
      var _this = this;
      if (!_this._preview) {
        throw Error('Not configure option: preview');
      }
      var fragment = document.createDocumentFragment();

      Array.prototype.forEach.call(_this._files, function (f) {

        var obj = (0, _helpers.createPreviewElement)(f);

        obj.style['min-width'] = _this._imageMinWidth;
        obj.style['min-height'] = _this._imageMinHeight;
        obj.style['max-width'] = _this._imageMaxWidth;
        obj.style['max-height'] = _this._imageMaxHeight;

        fragment.appendChild(obj);
      });
      _this._preview.appendChild(fragment);
    }
  }]);

  return Dropen;
}(_events.EventEmitter);

global.Dropen = Dropen;

exports.default = Dropen;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./helpers":2,"./utils":4,"events":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var stopEvent = exports.stopEvent = function stopEvent(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
};

var addClass = exports.addClass = function addClass(to, className) {
  if (className) {
    if (!to.classList.contains(className)) {
      to.classList.add(className);
    }
  }
};

var removeClass = exports.removeClass = function removeClass(to, className) {
  if (className) {
    if (to.classList.contains(className)) {
      to.classList.remove(className);
    }
  }
};

var makeElement = exports.makeElement = function makeElement(el) {
  if (typeof el === 'undefined') {
    return el;
  }
  if (el instanceof HTMLElement) {
    return el;
  }
  if (typeof el === 'string') {
    var _el = document.querySelector(el);
    if (!_el) {
      throw Error('Not found in document.querySelector(el)');
    }
    return _el;
  }
  throw TypeError('"el" is not HTMLElement or valid selector.');
};

var escapeHTML = exports.escapeHTML = function escapeHTML(str) {
  return typeof str !== 'string' ? str : str.replace(/[&'`"<>]/g, function (match) {
    return {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;'
    }[match];
  });
};

var createPreviewElement = exports.createPreviewElement = function createPreviewElement(file) {
  if (!(file instanceof File || file instanceof Blob)) {
    throw TypeError('invalid argument type: required File or Blob, but found ' + file.type);
  }

  var reader = new FileReader();

  if (/image\/.*/.test(file.type)) {
    var img = document.createElement('img');
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      img.src = reader.result;
    };
    return img;
  }

  if (/application\/pdf/.test(file.type)) {
    var obj = document.createElement('object');
    obj.type = 'application/pdf';
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      obj.data = reader.result;
    };
    return obj;
  }

  if (/text\/(.+)/.test(file.type)) {
    var pre = document.createElement('pre');
    reader.readAsText(file);
    reader.onloadend = function () {
      pre.innerHTML = escapeHTML(reader.result);
    };
    return pre;
  }

  throw TypeError('Not support file type: ' + file.type);
};

},{}]},{},[3]);
