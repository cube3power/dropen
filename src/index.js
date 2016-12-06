import Dropen from './Dropen'

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
 * @example
 *   var el      = document.getElementById('drag-and-drop-zone');
 *   var preview = document.getElementById('preview-zone'); 
 *
 *   var instance = dropen(el, {
 *     preview: preview,
 *     dragoverClass: 'emphasis',
 *     autoPreview: true
 *     autoRefresh: true
 *   });
 *
 *   // or 
 *
 *   var instance = dropen(el).config({
 *     preview: preview,
 *     dragoverClass: 'emphasis',
 *     autoPreview: true
 *     autoRefresh: true
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
 */
const dropen = (el, configure={}) => {

  if (!(el instanceof HTMLElement || typeof el === 'string'))
    throw TypeError(`"el"(${typeof el}) is not supported type.`);

  if (el instanceof HTMLInputElement && el.type !== 'file')
    throw TypeError('"el" is HTMLElement but not input[type="file"].');

  return new Dropen(el, configure);
};

if (window) {
  window.dropen = dropen;
}

export default dropen;
