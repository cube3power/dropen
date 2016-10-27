# FileDnD

[![Build Status](https://travis-ci.org/kashira2339/filednd.svg?branch=master)](https://travis-ci.org/kashira2339/filednd)


## Installation

```bash
npm install --save @kashira2339/filednd
```

## Usage

### function & properties

- **FileDnD** constructor function.
  - **el** `string|HTMLElement|HTMLInputElement` Drop target element. ex) `#area` `input[type="file"]`
  - **configure** Configure paramaters.
    - **preview** `string|HTMLElement|` Into preview images target element.
    - **dragoverClass** `string` Class of want append when dragover "el".

### custom events
- **uploadend** Will dispatch after File dropped or file selected.

```html
<style>
 div {
   /* some styles */
 }
 div.emphasis {
     background-color: #ddfcba
 }
</style>

<div id="drop-zone card">Drag & Drop to this element!</div>

<div id="preview-zone card">Will preview image.</div>
```


```js
// if use javascript module bundler
var FileDnD = require('@kashira2339/filednd');

var dropZone    = document.getElementById('drop-zone');
var previewZone = document.getElementById('preview-zone');

var instance = new FileDnD(dropZone, {

    /**
     * for preview HTMLElement
     */
    preview: previewZone,
    
    /**
     * for add class when file dragover "dropZone".
     */
    dragoverClass: 'emphasis'

});
```

![demo](https://cloud.githubusercontent.com/assets/7392701/19778989/2a93eefa-9cba-11e6-84fd-19c0f0060c57.gif)


---

view license ---> [LICENSE.txt](./LICENSE.txt)
