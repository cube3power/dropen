;(function(factory) {
  'use strict';
  
  var w = (0, eval)('this');
  var MODULE_NAME = 'FileDnD',
      registered = false;
  if (typeof define === 'function' && define.amd) {
    define(factory.bind(this, w));
    registered = true;
  }
  if (typeof exports === 'object') {
    module.exports = factory(w);
    registered = true;
  }
  if (registered) { return; }
  var old = w[MODULE_NAME],
      api = w[MODULE_NAME] = factory(w);
  api.noConflict = function () {
    w[MODULE_NAME] = old;
    return api;
  };
})(function(global) {
  'use strict';
  
  var window = global,
      document = window.document;
  function _Emitter() {
    var f = window.document.createDocumentFragment();
    function d(m) {
      this[m] = f[m].bind(f);
    }
    ['addEventListener','dispatchEvent','removeEventListener']
      .forEach(d, this);
  }

  /**
   * Create drag & drop zone for file,
   * and preview read file after file upload.
   *
   * @param {string|HTMLElement} el To define drag & drop file zone element or selector.
   * @param {object} configure configure settings 
   * @prop  {HTMLElement} preview To preview HTMLImageElement's into this element.
   * @prop  {string} dragoverClass Adding class to dndzone when dispached dragover event on dndzone.
   * @example
   *   var el      = document.getElementById('drag-and-drop-zone');
   *   var preview = document.getElementById('preview-zone'); 
   *
   *   var dnd = new FileDnD(el, {
   *     preview: preview,
   *     dragoverClass: 'emphasis'
   *   });
   *   dnd.addEventListener('uploadend', function(e) {
   *     console.log(e.detail);
   *   });
   *
   * @constructor
   */
  function FileDnD(el, configure) {
    _Emitter.call(this);
    console.log();
    if (el instanceof HTMLElement) {
      this._isFileElement = false;
      this._el = _el;
    }
    if (typeof el === 'string') {
      var _el = document.querySelector(el);
      if (!_el) {
          throw Error('Not found in document.querySelector(el)');
      }
      this._el = _el;
    }
    if (this._el instanceof HTMLInputElement) {
      if (this._el.type !== 'file') {
        throw TypeError('"el" is HTMLElement but not input[type="file"].');
      }
      this._isFileElement = true;
    }
    if (!this._el) {
      throw TypeError('"el" is not HTMLElement.');
    }
    this._files = [];
    this._preview = configure.preview;
    this._dragoverClass = configure.dragoverClass;
    this._attachEvent();
  };

  /**
   * Attach event to "el" (HTMLElement)
   */
  FileDnD.prototype._attachEvent = function() {
    var _this = this,
        el = _this._el;

    if (this._isFileElement) {
      el.addEventListener('change', function(e) {
        _utils.removeClass(el, _this._dragoverClass);
        _this.clearFiles();
        _this._files = e.target.files;
        if (_this._preview) {
          _this.previewFiles();
        }
        _this.dispatchEvent(new CustomEvent('uploadend', {
          detail: _this.getFiles()
        }));
      });
    } else {
      el.addEventListener('dragover', function(e) {
        _utils.stopEvent(e);
        _utils.addClass(el, _this._dragoverClass);
      });
      el.addEventListener('dragleave', function(e) {
        _utils.stopEvent(e);
        _utils.removeClass(el, _this._dragoverClass);
      });
      el.addEventListener('drop', function(e) {
        _utils.stopEvent(e);
        _utils.removeClass(el, _this._dragoverClass);
        _this.clearFiles();
        _this._files = e.dataTransfer.files;
        if (_this._preview) {
          _this.previewFiles();
        }
        _this.dispatchEvent(new CustomEvent('uploadend', {
          detail: _this.getFiles()
        }));
      });
    }
  };

  /**
   * Get HTMLElement: drag and drop zone's element.
   */
  FileDnD.prototype.getDragAndDropZone = function() {
    return this._el;
  };

  /**
   * Get HTMLElement: file preview zone's element.
   */
  FileDnD.prototype.getPreviewZone = function() {
    return this._preview;
  };

  /**
   * Get uploaded file list.
   */
  FileDnD.prototype.getFiles = function() {
    return this._files;
  };

  /**
   * Clear uploaded file list and preview zone.
   */
  FileDnD.prototype.clearFiles = function() {
    this._files = [];
    this._preview.innerHTML = '';
  };

  /**
   * Preview uplaoded files.
   */
  FileDnD.prototype.previewFiles = function() {
    if (!this._preview) {
      throw Error('Not configure option: preview');
    }
    var fragment = document.createDocumentFragment();
    Array.prototype.forEach.call(this._files, function(f) {
      var reader = new FileReader(),
          img = document.createElement('img');
      reader.readAsDataURL(f);
      reader.onloadend = function() {
        img.src = reader.result;
      };
      fragment.appendChild(img);
    });
    this._preview.appendChild(fragment);
  };

  var _utils = {
    stopEvent: function(e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      if (e.preventDefault) {
        e.preventDefault();
      }
    },
    addClass: function(to, className) {
      if (className) {
        if (!to.classList.contains(className)) {
          to.classList.add(className);
        }
      }
    },
    removeClass: function(to, className) {
      if (className) {
        if (to.classList.contains(className)) {
           to.classList.remove(className);
        }
      }
    }
  };

  return FileDnD;
  
});
