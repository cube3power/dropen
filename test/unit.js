var assert  = require('power-assert');
var FileDnD = require('../index');
var event = {
  dataTransfer: {
    files: [
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'}),
    ]
  },
  defaultPrevented:true,
  detail:0,
  isTrusted:true,
  target: {
    files: [
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'}),
      new Blob(['test text'], {type:'text/plain'})
    ]
  }
};
var files = {
  text: function() {
    return new Blob(['test text'], {type:'text/plain'});
  }
};


describe("FileDnD", function() {
  var filednd;
  
  beforeEach(function() {
    document.body.innerHTML = window.__html__['test/index.html'];

    filednd = new FileDnD('#drop-zone', {
      preview: '#preview-zone'
    });
  });
  
  it("new FileDnD()", function () {

    var dropZoneElm = document.getElementById('drop-zone'),
        dropFileElm = document.getElementById('drop-file');
    
    assert(new FileDnD(dropZoneElm, {}));
    assert(new FileDnD(dropFileElm, {}));
    assert(new FileDnD('#drop-file', {}));
    assert(new FileDnD('#drop-zone', {}));
  });

  it('#onChangeDefault', function() {
    var filednd = new FileDnD('#drop-file', {});
    filednd.onChangeDefault(event);
    assert(filednd.getFiles().length === 3);
  });

  it('#onDragoverDefault', function() {
    var filednd = new FileDnD('#drop-zone', {
      dragoverClass: 'testclass'
    });
    filednd.onDragoverDefault(event);
    assert(filednd.getEl().classList.contains('testclass'));
  });

  it('#onDragleaveDefault', function() {
    var filednd = new FileDnD('#drop-zone', {
      dragoverClass: 'testclass'
    });

    filednd.onDragoverDefault(event);
    assert(filednd.getEl().classList.contains('testclass'));
    filednd.onDragleaveDefault(event);
    assert(!filednd.getEl().classList.contains('testclass'));

  });

  it('#onDropDefault', function() {
    var filednd = new FileDnD('#drop-zone', {});
    filednd.onDropDefault(event);
    assert(filednd.getFiles().length === 2);
  });

  it("#addFiles", function() {
    filednd.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    assert(filednd._files.length === 3);
    filednd.addFiles([
      files.text(),
      files.text(),
    ]);
    assert(filednd._files.length === 5);
  });
  
  it("#getFiles", function() {
    filednd.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    assert(filednd.getFiles().length === 3);
  });

  it("#clearFiles", function() {
    filednd.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    filednd.clearFiles();
    assert(filednd.getFiles().length === 0);
  });

  it("#appendToPreviewHTML", function() {
    var previewZone = filednd.getPreviewZone();
    filednd.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    assert(previewZone.innerHTML === '');
    filednd.appendToPreviewHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
  });

  it("#removeFromPreviewHTML", function() {
    var previewZone = filednd.getPreviewZone();
    filednd.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    filednd.appendToPreviewHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
    filednd.removeFromPreviewHTML();
    assert(previewZone.innerHTML === '');
  });

    it("#appendToPreviewHTML", function() {
    var previewZone = filednd.getPreviewZone();
    filednd.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    assert(previewZone.innerHTML === '');
    filednd.appendToPreviewHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
  });

  it("#applyToHTML", function() {
    var previewZone = filednd.getPreviewZone();
    filednd.addFiles([
      files.text(),
      files.text(),
    ]);
    filednd.applyToHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre>');
    filednd.clearFiles();

    filednd.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    filednd.applyToHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
    filednd.clearFiles();
    
    filednd.addFiles([
      files.text(),
    ]);
    filednd.applyToHTML();
    assert(previewZone.innerHTML === '<pre></pre>');
    filednd.clearFiles();
  });

});

