var assert            = require('assert'),

    common            = require('./common'),
    verifyListContent = common.verifyListContent;

function moduleIds(modules){
  return modules.map(function(m){
    return m.id;
  });
}

function init(options, callback){

  callback(null, require(options.target));
}

function test_name(mod, callback){
  assert.equal(mod.name, 'exampleProject');
  callback();
}

function test_findPkg(mod, callback){
  assert.equal(mod.findPkg(mod.map.main,'dependency').name, 'dependency');
  assert.equal(mod.findPkg(mod.map[2], 'subdependency').name, 'subdependency');
  assert.equal(mod.findPkg(mod.map[4], 'sibling').name, 'sibling');
  callback();
}

function test_findModule(mod, callback){
  var g = mod.map[2].modules[1];
  
  g.id != 'g' && ( g = mod.map[2].modules[0] );

  assert.equal(mod.findModule(mod.map[2].main, 'g'), g);
  callback();
}

function test_packageTree(mod, callback){
  assert.equal(mod.map.main.dependencies.length, 2);
  assert.equal(mod.map.main.dependencies[0].name, 'dependency');
  assert.equal(mod.map.main.dependencies[1].name, 'sibling');
  assert.equal(mod.map.main.dependencies[0].dependencies[0].name, 'subdependency');
  callback();
}

function test_moduleTree(mod, callback){
  assert.ok( verifyListContent(moduleIds(mod.map[1].modules), ['a', 'b'] ) );
  assert.ok( verifyListContent(moduleIds(mod.map[3].modules), ['i', 'j'] ) );
  callback();
}

function test_packageCtx(mod, callback){

  var p = mod.map[1];
  assert.equal(p.name, 'example-project');
  assert.equal(p.id, 1);
  assert.equal(p.parent);
  assert.equal(p.mainModuleId, 'a');
  assert.equal(p.main.id, 'a');

  assert.ok( verifyListContent(moduleIds(p.modules), ['a', 'b']) );

  assert.equal(p.dependencies.length, 2);

  callback();
}

function test_moduleCtx(mod, callback){
  var a, b;

  a = mod.map[1].modules[0];

  a.id == 'b' && ( a = mod.map[1].modules[1] );

  assert.equal(a.id, 'a');
  assert.equal(a.pkg.name, 'example-project');
  assert.equal(typeof a.wrapper, 'function');
  assert.ok(a.require('dependency').f);
  assert.ok(a.require('./b').b);

  b = mod.map.main.dependencies[ mod.map.main.dependencies[0].name == 'sibling' ? 0 :1 ].main;

  assert.equal(b.id, 'n');
  assert.equal(b.pkg.name, 'sibling');
  assert.equal(typeof b.wrapper, 'function');
  assert.ok(b.require('dependency').f);
  assert.ok(b.require('./p/r').r);

  callback();
}

function test_main(mod, callback){
  assert.equal(mod.main, mod.map.main.main.call);
  callback();
}

function test_process(mod, callback){
  var proc = mod.lib.process;

  assert.ok(proc);
  assert.equal(typeof proc.Stream, 'function');
  assert.equal(typeof proc.Buffer, 'function');

  assert.equal(proc.binding('buffer').Buffer, proc.Buffer);
  assert.equal(proc.binding('buffer').SlowBuffer, proc.Buffer);

  assert.equal(proc.argv.length, 2);
  assert.equal(proc.argv[0], 'node');
  assert.equal(proc.argv[1], 'one.js');

  assert.ok(proc.env);

  assert.ok(proc.stderr instanceof proc.Stream);
  assert.ok(proc.stdin instanceof proc.Stream);
  assert.ok(proc.stdout instanceof proc.Stream);

  assert.equal(proc.version, process.version);
  assert.equal(proc.versions.node, process.versions.node);
  assert.equal(proc.versions.v8, process.versions.v8);

  assert.ok(proc.pid == proc.uptime);
  assert.ok(proc.arch == proc.execPath == proc.installPrefix == proc.platform == proc.title == '');

  var isNextTickAsync = false;
  proc.nextTick(function(){
    assert.ok(isNextTickAsync);
    callback();
  });

  isNextTickAsync = true;
}

function test_require(mod, callback){
  assert.ok(mod.require('./b').b);
  assert.ok(mod.require('dependency').f);
  
  callback();
}

function test_globals(mod, callback){
  var globals = mod.require('./a');
  assert.equal(typeof globals.Buffer, 'function');
  assert.ok(globals.process);
  assert.ok(globals.process.env);
  callback();
}

module.exports = {
  'init':init,
  'test_name':test_name,
  'test_packageTree':test_packageTree,
  'test_moduleTree':test_moduleTree,
  'test_packageCtx':test_packageCtx,
  'test_moduleCtx':test_moduleCtx,
  'test_findPkg':test_findPkg,
  'test_findModule':test_findModule,
  'test_require':test_require,
  'test_process':test_process,
  'test_globals':test_globals,
  'test_main':test_main
};
