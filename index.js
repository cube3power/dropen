;(function(factory) {
  'use strict';
  
  var w = (0, eval)('this');
  var MODULE_NAME = 'filednd',
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
   * @param {HTMLElement} dndzone       To define drag & drop file zone element.
   * @param {object}      configure     configure settings 
   * @prop  {HTMLElement} preview       To preview HTMLImageElement's into this element.
   * @prop  {string}      dragoverClass Adding class to dndzone when dispached dragover event on dndzone.
   * @example
   *   var dndzone = document.getElementById('drag-and-drop-zone');
   *   var preview = document.getElementById('preview-zone'); 
   *
   *   var dnd = new FileDnD(dd, {
   *     preview: preview,
   *     dragoverClass: 'highlight'
   *   });
   *   dnd.addEventListener('uploadend', function(e) {
   *     console.log(e.detail);
   *   });
   *
   * @constructor
   */
  function FileDnD(dndzone, configure) {
    _Emitter.call(this);

    this._dndzone = dndzone;
    this._files = [];
    this._preview = configure.preview;
    this._dragoverClass = configure.dragoverClass;
    this._isFileElement = false;

    if (!(dndzone instanceof HTMLElement)) {
      throw {
        name: 'NotHTMLElementError',
        message: 'constructor paramater "dndzone" is not extends HTMLElement.'
      };
    }
    if (dndzone instanceof HTMLInputElement) {
      if (dndzone.type === 'file') {
        this._isFileElement = true;
      }
      throw {
        name: 'NotFileDroppableElementError',
        message: 'paramater "dndzone" is not dropable HTMLElement.'
      };
    }
    this._attachEvent();
  };

  FileDnD.prototype._attachEvent = function() {
    var _this = this,
        dndzone = _this._dndzone;

    if (this._isFileElement) {
      dndzone.addEventListener('change', function(e) {
        _utils.removeClass(dndzone, _this._dragoverClass);
        _this.clearFiles();
        _this._files = e.files;
        _this.previewFiles();
        _this.dispatchEvent(new CustomEvent('uploadend', {
          detail: _this.getFiles()
        }));
      });
    } else {
      dndzone.addEventListener('dragover', function(e) {
        _utils.stopEvent(e);
        _utils.addClass(dndzone, _this._dragoverClass);
      });
      dndzone.addEventListener('dragleave', function(e) {
        _utils.stopEvent(e);
        _utils.removeClass(dndzone, _this._dragoverClass);
      });
      dndzone.addEventListener('drop', function(e) {
        _utils.stopEvent(e);
        _utils.removeClass(dndzone, _this._dragoverClass);
        _this.clearFiles();
        _this._files = e.dataTransfer.files;
        _this.previewFiles();
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
    return this._dndzone;
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
    var fragment = document.createDocumentFragment();
      for (var i = 0, f; f = this._files[i]; i++) {
        (function(i) {
          var reader = new FileReader(),
              img = document.createElement('img');
          reader.readAsDataURL(f);
          reader.onloadend = function() {
            img.src = reader.result;
          };
          fragment.appendChild(img);
        })(i);
      }
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
