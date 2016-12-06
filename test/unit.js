import assert from 'power-assert'
import dropen from '../lib/bundle'

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
  text() {
    return new Blob(['test text'], {type:'text/plain'});
  }
};


describe("Dropen", function() {
  var instance;
  
  beforeEach(function() {
    document.body.innerHTML = window.__html__['test/index.html'];

    instance = dropen('#drop-zone', {
      preview: '#preview-zone'
    });
  });

  it("dropen()", function () {

    var dropZoneElm = document.getElementById('drop-zone'),
        dropFileElm = document.getElementById('drop-file');

    assert(dropen(dropZoneElm, {}));
    assert(dropen(dropFileElm, {}));
    assert(dropen('#drop-file', {}));
    assert(dropen('#drop-zone', {}));
    assert(dropen('#drop-zone')
           .config({
             dragoverClass: 'hoge'
           })
           ._dragoverClass === 'hoge');
  });
  
  it('#onChange', function() {
    var instance = dropen('#drop-file', {});
    instance.onChange(event);

    assert(instance.getFiles().length === 3);
    
    instance.onChange(event);
    assert(instance.getFiles().length === 3);
  });

  it('#onChange(autoRefresh=false)', function() {
    var instance = dropen('#drop-file', {
      autoRefresh: false
    });
    instance.onChange(event);
    assert(instance.getFiles().length === 3);

    instance.onChange(event);
    assert(instance.getFiles().length === 6);
  });

  it('#onDragover', function() {
    var instance = dropen('#drop-zone', {
      dragoverClass: 'testclass'
    });
    instance.onDragover(event);
    assert(instance._el.classList.contains('testclass'));
  });

  it('#onDragleave', function() {
    var instance = dropen('#drop-zone', {
      dragoverClass: 'testclass'
    });

    instance.onDragover(event);
    assert(instance._el.classList.contains('testclass'));
    instance.onDragleave(event);
    assert(!instance._el.classList.contains('testclass'));

  });

  it('#onDrop', function() {
    var instance = dropen('#drop-zone', {});
    instance.onDrop(event);
    assert(instance.getFiles().length === 2);
    
    instance.onDrop(event);
    assert(instance.getFiles().length === 2);
  });

  it('#onDrop(autoRefresh=false)', function() {
    var instance = dropen('#drop-zone', {
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

  it("#remove", function() {
    var previewZone = instance._preview;
    instance.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    instance.remove(1);
    assert(previewZone.getElementsByTagName('pre').length === 2);
  });

  it("#apply", function() {
    var previewZone = instance._preview;
    instance.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    assert(previewZone.getElementsByTagName('pre').length === 0);
    instance.apply();
    assert(previewZone.getElementsByTagName('pre').length === 3);
  });

  it("#clear", function() {
    var previewZone = instance._preview;
    instance.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    instance.apply();
    assert(previewZone.getElementsByTagName('pre').length === 3);
    instance.clear();
    assert(previewZone.getElementsByTagName('pre').length === 0);
  });

  it("#apply, #clear", function() {
    var previewZone = instance._preview;
    instance.addFiles([
      files.text(),
      files.text(),
    ]);
    instance.apply();
    assert(previewZone.getElementsByTagName('pre').length === 2);
    instance.clear();

    instance.addFiles([
      files.text(),
      files.text(),
      files.text(),
    ]);
    instance.apply();
    assert(previewZone.getElementsByTagName('pre').length === 3);
    instance.clear();
    
    instance.addFiles([files.text()]);
    instance.apply();
    assert(previewZone.getElementsByTagName('pre').length === 1);
    instance.clear();
  });

});

