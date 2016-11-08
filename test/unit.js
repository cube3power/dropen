var assert = require('power-assert');
var FileDnD = require('../index');

describe("FileDnD", function() {
  var filednd;
  
  beforeEach(function() {
    document.body.innerHTML = window.__html__['test/index.html'];

    filednd = new FileDnD('#drop-zone', {
      preview: '#preview-zone'
    });
  });
  
  it("HTMLElement params constructor", function () {

    var dropZoneElm = document.getElementById('drop-zone'),
        dropFileElm = document.getElementById('drop-file');
    
    assert(new FileDnD(dropZoneElm, {}));
    assert(new FileDnD(dropFileElm, {}));
  });

  it("String params constructor", function () {
    
    assert(new FileDnD('#drop-file', {}));
    assert(new FileDnD('#drop-zone', {}));
  });

  it("#addFiles", function() {
    filednd.addFiles([
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'})
    ]);
    assert(filednd._files.length === 3);
    filednd.addFiles([
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'}),
    ]);
    assert(filednd._files.length === 5);
  });
  
  it("#getFiles", function() {
    filednd.addFiles([
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'})
    ]);
    assert(filednd.getFiles().length === 3);
  });

  it("#clearFiles", function() {
    filednd.addFiles([
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'})
    ]);
    filednd.clearFiles();
    assert(filednd.getFiles().length === 0);
  });

  it("#appendToPreviewHTML", function() {
    var previewZone = filednd.getPreviewZone();
    filednd.addFiles([
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'})
    ]);
    assert(previewZone.innerHTML === '');
    filednd.appendToPreviewHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
  });

  it("#removeFromPreviewHTML", function() {
    var previewZone = filednd.getPreviewZone();
    filednd.addFiles([
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'})
    ]);
    filednd.appendToPreviewHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
    filednd.removeFromPreviewHTML();
    assert(previewZone.innerHTML === '');
  });

    it("#appendToPreviewHTML", function() {
    var previewZone = filednd.getPreviewZone();
    filednd.addFiles([
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'})
    ]);
    assert(previewZone.innerHTML === '');
    filednd.appendToPreviewHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
  });

  it("#applyToHTML", function() {
    var previewZone = filednd.getPreviewZone();
    filednd.addFiles([
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'})
    ]);
    filednd.applyToHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre>');
    filednd.clearFiles();

    filednd.addFiles([
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'}), 
      new Blob(['test text'], {type:'text/plain'})
    ]);
    filednd.applyToHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
    filednd.clearFiles();
    
    filednd.addFiles([new Blob(['test text'], {type:'text/plain'})]);
    filednd.applyToHTML();
    assert(previewZone.innerHTML === '<pre></pre>');
    filednd.clearFiles();
  });

});

