import { EventEmitter } from 'events'
import { stopEvent, addClass, removeClass  } from './utils'
import { makeElement, createPreviewElement } from './helpers'

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
class Dropen extends EventEmitter {

  constructor(el, {
    preview,
    dragoverClass,
    autoPreview=true,
    autoRefresh=true,
    imageMinWidth,
    imageMinHeight,
    imageMaxWidth,
    imageMaxHeight
  }) {

    super();
    
    let _el = makeElement(el);
    
    this._isFileElement = false;

    if (_el instanceof HTMLInputElement) {
      if (_el.type !== 'file') {
        throw TypeError('"el" is HTMLElement but not input[type="file"].');
      }
      this._isFileElement = true;
    }

    this._el             = _el;
    this._files          = [];
    this._preview        = makeElement(preview);
    this._autoPreview    = autoPreview;
    this._autoRefresh    = autoRefresh;
    this._dragoverClass  = dragoverClass;
    this._imageMinWidth  = imageMinWidth;
    this._imageMinHeight = imageMinHeight;
    this._imageMaxWidth  = imageMaxWidth;
    this._imageMaxHeight = imageMaxHeight;
    
    this._attachEvent();
  }


  
  /**
   * Attach event to "el" (HTMLElement)
   */
  _attachEvent() {
    const _this = this,
          el = _this._el;

    if (this._isFileElement) {
      el.addEventListener('change',    this.onChange.bind(this));
    } else {
      el.addEventListener('dragover',  this.onDragover.bind(this));
      el.addEventListener('dragleave', this.onDragleave.bind(this));
      el.addEventListener('drop',      this.onDrop.bind(this));
    }
  }


  
  /**
   * when this instance's `el` is input[type="files"] or that selecter,
   * this function called as `el`'s onchange event listener.
   *
   * @param {Event} e input[type=\"file\"] `onchange` event.
   */
  onChange(e) {
    let _this = this,
        el = _this._el;

    _this.emit('upload', {
      currentFiles: _this.getFiles(),
      targetFiles: e.target.files
    });
    
    removeClass(el, _this._dragoverClass);

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
  onDragover(e) {
    var _this = this,
        el = _this._el;
    stopEvent(e);
    addClass(el, _this._dragoverClass);
  }



  /**
   * when this instance's `el` is normal HTMLElement or that selecter,
   * this function called as `el`'s ondragleave event listener.
   *
   * @param {Event} e this.el's `ondragleave` event.
   */
  onDragleave(e) {
    var _this = this,
        el = _this._el;
    stopEvent(e);
    removeClass(el, _this._dragoverClass);
  };




  /**
   * when this instance's `el` is normal HTMLElement or that selecter,
   * this function called as `el`'s ondragleave event listener.
   *
   * @param {Event} e this.el's `ondrop` event.
   */
  onDrop(e) {
    var _this = this,
        el = _this._el;
    
    stopEvent(e);

    _this.emit('upload', {
      currentFiles: _this.getFiles(),
      targetFiles: e.dataTransfer.files
    });
    
    removeClass(el, _this._dragoverClass);

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
  };


  
  /**
   * Get HTMLElement: `el` drag and drop zone's element.
   */
  getEl() {
    return this._el;
  }



  /**
   * Get HTMLElement: file preview zone's element.
   */
  getPreview() {
    return this._preview;
  }



  /**
   * Get uploaded file list.
   */
  getFiles() {
    return this._files;
  };
  


  /**
   * Add a file.
   * @param {File|Blob} file push to Dropen#_files
   */
  addFile(file) {
    if (file instanceof File || file instanceof Blob) {
      this._files.push(file);
    }
  }



  
  /**
   * Add file list.
   * @param {Array} files Files from drag and drop or input[type=file] changed.
   */
  addFiles(files) {
    const _this = this;
    if (files instanceof Array || files instanceof FileList) {
      [].filter
        .call(files, f => f instanceof File || f instanceof Blob)
        .forEach(f => _this.addFile(f));
    }
    if (files instanceof File || files instanceof Blob) {
      _this.addFile(files);
    }
  }



  /**
   * Clear uploaded file list and preview zone.
   */
  clearFiles() {
    this._files = [];
  };



  
  /**
   * Has files apply to html source
   */
  applyToHTML() {
    if (this._preview) {
      this.removeFromPreviewHTML();
      this.appendToPreviewHTML();
    }
  };



  /**
   * remove html from preview element.
   */
  removeFromPreviewHTML() {
    if (this._preview) {
      this._preview.innerHTML = '';
    }
  };



  /**
   * Preview uploaded files.
   */
  appendToPreviewHTML() {
    var _this = this;
    if (!_this._preview) {
      throw Error('Not configure option: preview');
    }
    var fragment = document.createDocumentFragment();

    Array.prototype.forEach.call(_this._files, f => {

      var obj = createPreviewElement(f);

      obj.style['min-width']  = _this._imageMinWidth;
      obj.style['min-height'] = _this._imageMinHeight;
      obj.style['max-width']  = _this._imageMaxWidth;
      obj.style['max-height'] = _this._imageMaxHeight;

      fragment.appendChild(obj);
      
    });
    _this._preview.appendChild(fragment);
  };
}

global.Dropen = Dropen;

export default Dropen;
