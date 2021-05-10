'use strict';

console.log('node-load.js');


class NodeLoad {
	constructor(node_module) {
		this.name = 'nodeload';
		
		this.node_module = node_module;
	}
	
	init(callback) {
		console.log('NodeLoad.init called');

		try {
			var self = this;
			var _globalscope = global; // nodejs global
			var _noderequire = require; // to avoid problems when react-native processes files
			
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
	
			// loading dapps
			let modulescriptloader = ScriptLoader.findScriptLoader('moduleloader');
			
			let erc721modulescriptloader = modulescriptloader.getChildLoader('erc721moduleloader');
			
			// setting script root dir to this node module
			// instead of ethereum_core/imports
			var path = _noderequire('path');
			var script_root_dir = path.join(__dirname, '../imports');
			erc721modulescriptloader.setScriptRootDir(script_root_dir);
			
			
			//modulescriptloader.setScriptRootDir(script_root_dir); // because erc721 uses modulescriptloader instead of erc721modulescriptloader
	
			// dappmodulesloader
			ScriptLoader.reclaimScriptLoaderName('dappmodulesloader'); // is used in ethereum_erc20
			let dappsscriptloader = erc721modulescriptloader.getChildLoader('dappmodulesloader');
			
			// dappsmodelsloader (will receive script from registerModel)
			ScriptLoader.reclaimScriptLoaderName('dappsmodelsloader'); 
			let dappsmodelsloader = dappsscriptloader.getChildLoader('dappsmodelsloader');
			
			// let /dapps/erc721/module in 'dappmodulesloader' then load them
			erc721modulescriptloader.push_script('./dapps/erc721/module.js', function () {
				console.log('erc721 dapp module loaded');
			});
			
			erc721modulescriptloader.load_scripts(function () {
				var _nodeobject = GlobalClass.getGlobalObject();
				
				// loading erc721 dapp
				dappsscriptloader.load_scripts(function() {

				_nodeobject.loadModule('erc721-dapp', erc721modulescriptloader, function() {
					// then load models
					dappsmodelsloader.load_scripts(function() {
						rootscriptloader.signalEvent('on_erc721_dapp_module_load_end');
					});
				});
					
					
				});
			});

			// erc721 module ready (sent by erc721 module at the end of registerHooks)
			rootscriptloader.registerEventListener('on_erc721_module_ready', function(eventname) {
				
				if (callback)
					callback(null, self);
				
			});
		}
		catch(e) {
			console.log('exception in NodeLoad.init: ' + e);
			console.log(e.stack);
		}

		


		
	}
		
}


module.exports = NodeLoad;




