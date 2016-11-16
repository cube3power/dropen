# Dropen [![Build Status](https://travis-ci.org/kashira2339/dropen.svg?branch=master)](https://travis-ci.org/kashira2339/dropen)

**dropen** is lightweight JavaScript ui library for File Drag & Drop.

## Installation

```bash
npm install --save dropen
```

## Usage

### function & properties

- **Dropen** constructor function.
  - **el** `string|HTMLElement|HTMLInputElement` Drop target element. ex) `#area` `input[type="file"]`
  - **configure** Configure paramaters.
    - **preview** `string|HTMLElement` Into preview images target element.
    - **dragoverClass** `string` Class of want append when dragover "el".
    - **autoPreview** `boolean` will automatically preview when `el` get files. default true.
    - **autoRefresh** `boolean` will automatically refresh preview element when files uploaded. default true.
    - **imageMinWidth** `string` min-width of preview's <img>. default null.
    - **imageMinHeight** `string` min-height of preview's <img>. default null.
    - **imageMaxWidth** `string` max-width of preview's <img>. default null.
    - **imageMaxHeight** `string` max-height of preview's <img>. default null.

### custom events
- **upload** Will dispatch after File dropped or file selected.
- **uploadend** Will dispatch after File dropped or file selected.

#### flow
file drop or change ---> dispatch **upload** ---> file refresh ---> preview ---> dispatch **uploadend**

## Example

```html
<style>
 div {
   /* some styles */
 }
 div.emphasis {
     background-color: #ddfcba
 }
</style>

<div id="drop-zone">Drag & Drop to this element!</div>

<div id="preview-zone">Will preview image.</div>
```


```js
// if use javascript module bundler
var Dropen = require('dropen');

var instance = new Dropen('#drop-zone', {

    /**
     * for preview HTMLElement or selector.
     */
    preview: '#preview-zone',
    
    /**
     * for add class when file dragover "dropZone".
     */
    dragoverClass: 'emphasis',

    /**
     * set preview image styles.
     * ex)
     * image {
     *   min-width: 100px;
     *   min-height: 100px;
     *   man-width: 100%;
     *   max-height: 100%;
     * }
     *
     */
    imageMinWidth: '100px',

    imageMinHeight: '100px',

    imageMaxWidth: '100%',

    imageMaxHeight: '100%',

});

/**
 * Listen custom event, define as below.
 */

instance.on('upload', function(e) {
  console.log(JSON.stringify(e));
});

instance.on('uploadend', function(e) {
  console.log(JSON.stringify(e));
});

```

![demo](https://cloud.githubusercontent.com/assets/7392701/19778989/2a93eefa-9cba-11e6-84fd-19c0f0060c57.gif)

---

view license ---> [LICENSE.txt](./LICENSE.txt)
