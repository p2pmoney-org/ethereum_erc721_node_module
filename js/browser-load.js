'use strict';

console.log('browser-load.js');


class BrowserLoad {
	constructor(node_module) {
		this.name = 'browserload';
		
		var glob = global;
		
		this.node_module = node_module;
		
		console.log('BrowserLoad constructor');
	}
	
	init(callback) {
		console.log('BrowserLoad.init called');
		
		try {
			var self = this;
			
			// bootstrap of framework
			var _globalscope = window; // browser global
			
			
			// prevent automatic load before we return from import
			_globalscope.global_scope_no_load = true;
			_globalscope.dapp_browser_no_load = true;

			// get ethereum_core
			var ethereum_core = this.node_module.ethereum_core;
			
			if (ethereum_core.initialized === false) {
				console.log('WARNING: ethereum_core should be initialized before initializing ethereum_erc721');
			}
			
			// get node module objects
			var Bootstrap = _globalscope.simplestore.Bootstrap;
			var ScriptLoader = _globalscope.simplestore.ScriptLoader;

			var bootstrapobject = Bootstrap.getBootstrapObject();
			var rootscriptloader = ScriptLoader.getRootScriptLoader();
			
			var GlobalClass = _globalscope.simplestore.Global;
			
			// loading erc721 module
			let modulescriptloader = ScriptLoader.findScriptLoader('moduleloader');

			require('./loaders/erc721-load.js');
			
			// end of modules load
			rootscriptloader.registerEventListener('@p2pmoney-org/on_erc721_module_load_end', function(eventname) {
				if (callback)
					callback(null, self);
			});
			
			
			// erc721 module ready (sent at the end of erc721.registerHooks)
			rootscriptloader.registerEventListener('on_erc721_module_ready', function(eventname) {
				console.log('BrowserLoad.init: erc721 module is now ready ')
			});

			
			
		}
		catch(e) {
			console.log('exception in BrowserLoad.init: ' + e);
			console.log(e.stack);
		}
		
		this._checkLoad();
		
	}
	
	_initLoadObjects(bootstrapobject, rootscriptloader) {
		rootscriptloader.imported_script_files = [];
		
		rootscriptloader.push_import = function(scriptloader, scriptfile) {
			
			if (scriptloader) 
				scriptloader.push_script(scriptfile);
			
			rootscriptloader.imported_script_files.push(scriptfile);
		}
	}
	
	_checkLoad() {
		var _globalscope = window; // browser global

		var Bootstrap = _globalscope.simplestore.Bootstrap;
		var ScriptLoader = _globalscope.simplestore.ScriptLoader;
		
		var bootstrapobject = Bootstrap.getBootstrapObject();
		var rootscriptloader = ScriptLoader.getRootScriptLoader();
		
		var imported_script_files = rootscriptloader.imported_script_files;

		for (var i = 0; i < imported_script_files.length; i++) {
			console.log('script file has been imported: ' + imported_script_files[i]);
		}
		
		// get list of scripts that have been pushed
		var fillPushed = function(scriptfilearray, scriptloader) {
			var scripts = scriptloader.scripts;
			
			for (var k = 0; k < scripts.length; k++) {
				var scriptfile = scripts[k].file;
				
				if (scriptfilearray.indexOf(scriptfile) === -1)
					scriptfilearray.push(scriptfile);
			}
		};
		
		var pushed_script_files = [];
		
		var scriptloaders = ScriptLoader.getScriptLoaders();
		
		
		for (var j = 0; j < scriptloaders.length; j++) {
			var scriptloader = scriptloaders[j];
			fillPushed(pushed_script_files, scriptloader);
		}
		
		// check if we have imported all of them
		var missing_script_files = [];
		
		for (var i = 0; i < pushed_script_files.length; i++) {
			var scriptfile = pushed_script_files[i];
			
			if (imported_script_files.indexOf(scriptfile) === -1) {
				missing_script_files.push(scriptfile);
			}
		}
		
		for (var i = 0; i < missing_script_files.length; i++) {
			var scriptfile = missing_script_files[i];
			
			console.log('script file has NOT been imported: ' + scriptfile);
		}
	}

	

}

module.exports = BrowserLoad;