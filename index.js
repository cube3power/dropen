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
  function _emitter() {
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
   * @param {object} [configure] configure settings 
   * @prop  {HTMLElement} [preview] To preview HTMLImageElement's into this element.
   * @prop  {string} [dragoverClass] Adding class to dndzone when dispached dragover event on dndzone.
   * @prop  {boolean} [autoPreview] will automatically preview when `el` get files. default true.
   * @prop  {boolean} [autoRefresh] will automatically refresh preview element when files uploaded. default true.
   * @prop  {string} [imageMinWidth] min-width of preview's <img>. default null.
   * @prop  {string} [imageMinHeight] min-height of preview's <img>. default null.
   * @prop  {string} [imageMaxWidth] max-width of preview's <img>. default null.
   * @prop  {string} [imageMaxHeight] max-height of preview's <img>. default null.
   *   var el      = document.getElementById('drag-and-drop-zone');
   *   var preview = document.getElementById('preview-zone'); 
   *
   *   var dnd = new FileDnD(el, {
   *     preview: preview,
   *     dragoverClass: 'emphasis',
   *     autoPreview: true
   *     autoRefresh: true
   *     imageMinWidth: '100px',
   *     imageMinHeight: '100px',
   *     imageMaxWidth: '100%',
   *     imageMaxHeight: '100%',
   *   });
   *   dnd.addEventListener('uploadend', function(e) {
   *     console.log(e.detail);
   *   });
   *
   * @constructor
   */
  function FileDnD(el, configure) {
    var _configure = configure || {},
        _el = _utils.makeElement(el);
    
    _emitter.call(this);

    this._isFileElement = false;

    if (_el instanceof HTMLInputElement) {
      if (_el.type !== 'file') {
        throw TypeError('"el" is HTMLElement but not input[type="file"].');
      }
      this._isFileElement = true;
    }

    this._el = _el;
    
    this._files = [];

    if (_configure.preview) {
      this._preview = _utils.makeElement(_configure.preview);
    }
    
    if (_configure.dragoverClass) {
      this._dragoverClass = _configure.dragoverClass;
    }

    this._autoPreview = typeof _configure.autoPreview === 'undefined' ?
      true : _configure.autoPreview;

    this._autoRefresh = typeof _configure.autoRefresh === 'undefined' ?
      true : _configure.autoRefresh;

    this._imageMinWidth  = _configure.imageMinWidth  || null;
    this._imageMinHeight = _configure.imageMinHeight || null;
    this._imageMaxWidth  = _configure.imageMaxWidth  || null;
    this._imageMaxHeight = _configure.imageMaxHeight || null;
    
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

        _this.dispatchEvent(new CustomEvent('upload', {
          detail: e
        }));
        
        if (_this._dragoverClass) {
          _utils.removeClass(el, _this._dragoverClass);
        }

        if (_this._autoRefresh) {
          _this.clearFiles();
          _this.applyToHTML();
        }
        
        _this.addFiles(e.target.files);

        if (_this._autoPreview) {
          _this.applyToHTML();
        }
        
        _this.dispatchEvent(new CustomEvent('uploadend', {
          detail: _this.getFiles()
        }));
      });
    } else {
      el.addEventListener('dragover', function(e) {
        _utils.stopEvent(e);
        if (_this._dragoverClass) {
          _utils.addClass(el, _this._dragoverClass);
        }
      });
      el.addEventListener('dragleave', function(e) {
        _utils.stopEvent(e);
        if (_this._dragoverClass) {
          _utils.removeClass(el, _this._dragoverClass);
        }
      });
      el.addEventListener('drop', function(e) {
        _utils.stopEvent(e);

        _this.dispatchEvent(new CustomEvent('upload', {
          detail: e
        }));
        
        if (_this._dragoverClass) {
          _utils.removeClass(el, _this._dragoverClass);
        }

        if (_this._autoRefresh) {
          _this.clearFiles();
          _this.applyToHTML();
        }
        
        _this.addFiles(e.dataTransfer.files);
        
        if (_this._autoPreview) {
          _this.applyToHTML();
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
   * Add file list.
   * @param {Array} files Files from drag and drop or input[type=file] changed.
   */
  FileDnD.prototype.addFiles = function(files) {
    var _this = this;
    if (files instanceof Array || files instanceof FileList) {
      [].filter.call(files, function(f) {
        return f instanceof File || f instanceof Blob;
      }).forEach(function(f) {
        _this.addFile(f);
      });
    }
    if (files instanceof File || files instanceof Blob) {
      _this.addFile(files);
    }
  };

  /**
   * Add a file.
   * @param {File|Blob} file push to FileDnD#_files
   */
  FileDnD.prototype.addFile = function(file) {
    if (file instanceof File || file instanceof Blob) {
      this._files.push(file);
    }
  };

  /**
   * Clear uploaded file list and preview zone.
   */
  FileDnD.prototype.clearFiles = function() {
    this._files = [];
  };

  /**
   * Has files apply to html source
   */
  FileDnD.prototype.applyToHTML = function() {
    if (this._preview) {
      this.removeFromPreviewHTML();
      this.appendToPreviewHTML();
    }
  };

  /**
   * remove html from preview element.
   */
  FileDnD.prototype.removeFromPreviewHTML = function() {
    if (this._preview) {
      this._preview.innerHTML = '';
    }
  };

  /**
   * Preview uplaoded files.
   */
  FileDnD.prototype.appendToPreviewHTML = function() {
    var _this = this;
    if (!_this._preview) {
      throw Error('Not configure option: preview');
    }
    var fragment = document.createDocumentFragment();

    Array.prototype.forEach.call(_this._files, function(f) {

      var obj = _previewElementFactory(f);

      obj.style['min-width']  = _this._imageMinWidth;
      obj.style['min-height'] = _this._imageMinHeight;
      obj.style['max-width']  = _this._imageMaxWidth;
      obj.style['max-height'] = _this._imageMaxHeight;

      fragment.appendChild(obj);
    });
    _this._preview.appendChild(fragment);
  };


  function _previewElementFactory(file) {
    if (!(file instanceof File || file instanceof Blob)) {
      throw TypeError('invalid argument type: required File or Blob, but found ' + file.type);
    }

    var reader = new FileReader();
    
    if (/image\/.*/.test(file.type)) {
      var img = document.createElement('img');
      reader.readAsDataURL(file);
      reader.onloadend = function() {
        img.src = reader.result;
      };
      return img;
    }

    if (/application\/pdf/.test(file.type)) {
      var obj = document.createElement('object');
      obj.type = 'application/pdf';
      reader.readAsDataURL(file);
      reader.onloadend = function() {
        obj.data = reader.result;
      };
      return obj;
    }

    if (/text\/(.+)/.test(file.type)) {
      var pre = document.createElement('pre');
      reader.readAsText(file);
      reader.onloadend = function() {
        pre.innerHTML = _utils.escape(reader.result);
      };
      return pre;
    }

    throw TypeError('Not support file type: ' + file.type);
  }

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
    },
    makeElement: function(el) {
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
    },
    escape: function(str) {
      return typeof str !== 'string' ? str :
        str.replace(/[&'`"<>]/g, function(match) {
          return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;'
          }[match];
        });
    }
  };

  return FileDnD;
});
