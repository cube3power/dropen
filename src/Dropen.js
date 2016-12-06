import { EventEmitter } from 'events'
import { stopEvent, addClass, removeClass  } from './utils'
import { makeElement, createPreviewElement } from './helpers'




export default class Dropen extends EventEmitter {



  constructor(el, configure={}) {
    super();
    
    this._el             = makeElement(el);
    this._files          = [];
    this._isFileElement  = (this._el instanceof HTMLInputElement &&
                            this._el.type === 'file');

    this.config(configure);

    this._attachEvent();
  }

  

  /**
   * set configure options. 
   */
  config({preview, dragoverClass, autoApply=true, autoRefresh=true}={}) {
    this._preview        = makeElement(preview);
    this._autoApply      = autoApply;
    this._autoRefresh    = autoRefresh;
    this._dragoverClass  = dragoverClass;
    return this;
  }


  
  /**
   * Attach event to "el" (HTMLElement)
   */
  _attachEvent() {
    if (this._isFileElement) {
      this._el.addEventListener('change',    this.onChange.bind(this));
    } else {
      this._el.addEventListener('dragover',  this.onDragover.bind(this));
      this._el.addEventListener('dragleave', this.onDragleave.bind(this));
      this._el.addEventListener('drop',      this.onDrop.bind(this));
    }
  }


  
  /**
   * when this instance's `el` is input[type="files"] or that selecter,
   * this function called as `el`'s onchange event listener.
   *
   * @param {Event} e input[type=\"file\"] `onchange` event.
   */
  onChange(e) {
    removeClass(this._el, this._dragoverClass);

    if (this._autoRefresh) {
      this._clearFiles();
      this.apply();
    }

    this.addFiles(e.target.files);

    if (this._autoApply) {
      this.apply();
    }

    this.emit('uploadend', {
      currentFiles: this.getFiles(),
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
    stopEvent(e);
    addClass(this._el, this._dragoverClass);
  }



  /**
   * when this instance's `el` is normal HTMLElement or that selecter,
   * this function called as `el`'s ondragleave event listener.
   *
   * @param {Event} e this.el's `ondragleave` event.
   */
  onDragleave(e) {
    stopEvent(e);
    removeClass(this._el, this._dragoverClass);
  };




  /**
   * when this instance's `el` is normal HTMLElement or that selecter,
   * this function called as `el`'s ondragleave event listener.
   *
   * @param {Event} e this.el's `ondrop` event.
   */
  onDrop(e) {
    stopEvent(e);
    
    removeClass(this._el, this._dragoverClass);

    if (this._autoRefresh) {
      this._clearFiles();
      this.apply();
    }
    
    this.addFiles(e.dataTransfer.files);
    
    if (this._autoApply) this.apply();
    
    this.emit('uploadend', {
      currentFiles: this.getFiles(),
      targetFiles: e.dataTransfer.files
    });
  };


  

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
    if (files instanceof Array || files instanceof FileList) {
      [...files]
        .filter(f => f instanceof File || f instanceof Blob)
        .forEach(f => this._files.push(f));
    }
    if (files instanceof File || files instanceof Blob) {
      this.addFile(files);
    }
  }


  /**
   * Remove a uploaded file,
   * and remove image from `preview` element.
   */
  remove(index) {
    const _exist = this._files[index];

    if (!_exist) return;

    const _removed = this._files.splice(index, 1);

    if (this._autoApply)
      this.apply();

    this.emit('remove', {
      file: _removed,
      currentFiles: this.getFiles()
    });
  }



  /**
   * Clear uploaded files and preview zone,
   * and apply to `preview` element.
   */
  clear() {
    this._files = [];

    if (this._autoApply)
      this.apply();

    this.emit('clear', {
      currentFiles: this.getFiles()
    });
    
  };

  
  
  /**
   * Has files apply to html source
   */
  apply() {
    if (!this._preview) return;

    this._removeFromPreviewHTML();
    this._appendToPreviewHTML();

    this.emit('apply', {
      currentFiles: this.getFiles()
    });
  };


  
  /**
   * Setting up preview style.
   * ex)
   * dropen(el).setPreviewstyle({
   *   'min-width' : '100px',
   *   'min-height': '100px',
   *   'max-width' : '100%',
   *   'max-height': '100%',
   * });
   */
  setPreviewStyle(style) {
    this._previewStyle = style;
  }
  


  




  /*
   * private functions
   ====================*/


  /**
   * Clear uploaded file list and preview zone.
   */
  _clearFiles() {
    this._files = [];
  };

  /**
   * Preview uploaded files.
   */
  _appendToPreviewHTML() {

    if (!this._preview)
      throw Error('Not configured option: preview');

    [...this._files].forEach((f, i, arr) => {
      
      const o = createPreviewElement(f);

  
      for (let k in this._previewStyle) {
        o.style[k] = this._previewStyle[k];
      }
      o.dataset.index = i;
      this._preview.appendChild(o);

      this.emit('upload', {
        currentFiles: arr,
        targetFile: f,
        target: o
      });
      
    });
  };

  /**
   * remove html from preview element.
   */
  _removeFromPreviewHTML() {
    if (this._preview)
      this._preview.innerHTML = '';
  };


}
