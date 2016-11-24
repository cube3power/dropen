import assert from 'power-assert'
import Dropen from '../lib/dropen'

const event = {
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


describe("Dropen", function() {
  var instance;
  
  beforeEach(function() {
    document.body.innerHTML = window.__html__['test/index.html'];

    instance = new Dropen('#drop-zone', {
      preview: '#preview-zone'
    });
  });
  
  it("new Dropen()", function () {

    var dropZoneElm = document.getElementById('drop-zone'),
        dropFileElm = document.getElementById('drop-file');
    
    assert(new Dropen(dropZoneElm, {}));
    assert(new Dropen(dropFileElm, {}));
    assert(new Dropen('#drop-file', {}));
    assert(new Dropen('#drop-zone', {}));
  });

  it('#onChange', function() {
    var instance = new Dropen('#drop-file', {});
    instance.onChange(event);
    assert(instance.getFiles().length === 3);
    
    instance.onChange(event);
    assert(instance.getFiles().length === 3);
  });

  it('#onChange(autoRefresh=false)', function() {
    var instance = new Dropen('#drop-file', {
      autoRefresh: false
    });
    instance.onChange(event);
    assert(instance.getFiles().length === 3);

    instance.onChange(event);
    assert(instance.getFiles().length === 6);
  });

  it('#onDragover', function() {
    var instance = new Dropen('#drop-zone', {
      dragoverClass: 'testclass'
    });
    instance.onDragover(event);
    assert(instance.getEl().classList.contains('testclass'));
  });

  it('#onDragleave', function() {
    var instance = new Dropen('#drop-zone', {
      dragoverClass: 'testclass'
    });

    instance.onDragover(event);
    assert(instance.getEl().classList.contains('testclass'));
    instance.onDragleave(event);
    assert(!instance.getEl().classList.contains('testclass'));

  });

  it('#onDrop', function() {
    var instance = new Dropen('#drop-zone', {});
    instance.onDrop(event);
    assert(instance.getFiles().length === 2);
    
    instance.onDrop(event);
    assert(instance.getFiles().length === 2);
  });

  it('#onDrop(autoRefresh=false)', function() {
    var instance = new Dropen('#drop-zone', {
      autoRefresh: false
    });
    instance.onDrop(event);
    assert(instance.getFiles().length === 2);

    instance.onDrop(event);
    assert(instance.getFiles().length === 4);
  });

  it("#addFiles", function() {
    instance.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    assert(instance._files.length === 3);
    instance.addFiles([
      files.text(),
      files.text(),
    ]);
    assert(instance._files.length === 5);
  });
  
  it("#getFiles", function() {
    instance.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    assert(instance.getFiles().length === 3);
  });

  it("#clearFiles", function() {
    instance.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    instance.clearFiles();
    assert(instance.getFiles().length === 0);
  });

  it("#appendToPreviewHTML", function() {
    var previewZone = instance.getPreview();
    instance.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    assert(previewZone.innerHTML === '');
    instance.appendToPreviewHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
  });

  it("#removeFromPreviewHTML", function() {
    var previewZone = instance.getPreview();
    instance.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    instance.appendToPreviewHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
    instance.removeFromPreviewHTML();
    assert(previewZone.innerHTML === '');
  });

  it("#applyToHTML", function() {
    var previewZone = instance.getPreview();
    instance.addFiles([
      files.text(),
      files.text(),
    ]);
    instance.applyToHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre>');
    instance.clearFiles();

    instance.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    instance.applyToHTML();
    assert(previewZone.innerHTML === '<pre></pre><pre></pre><pre></pre>');
    instance.clearFiles();
    
    instance.addFiles([
      files.text(),
    ]);
    instance.applyToHTML();
    assert(previewZone.innerHTML === '<pre></pre>');
    instance.clearFiles();
  });

});

