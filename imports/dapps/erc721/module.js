'use strict';

var Module = class {
	
	constructor() {
		this.name = 'erc721-dapp';
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		this.controllers = null; // one object, even if plural used
		
		this.plugins = {}; // map
		
		this.registerModel();
	}
	
	init() {
		console.log('module init called for ' + this.name);
		
		var global = this.global;
		var dappsmodule = global.getModuleObject('dapps');
		
		// create controllers
		var erc721controllers = new this.ERC721AngularControllers(global);
		dappsmodule.pushAngularController(erc721controllers);
		
		this.controllers = erc721controllers;
		
		this.isready = true;
	}
	
	// compulsory  module functions
	loadModule(parentscriptloader, callback) {
		console.log('loadModule called for module ' + this.name);

		if (this.isready) {
			if (callback)
				callback(null, this);
			
			return;
		}

		if (this.isloading) {
			var error = 'calling loadModule while still loading for module ' + this.name;
			console.log('error: ' + error);
			
			if (callback)
				callback(error, null);
			
			return;
		}
			
		this.isloading = true;

		var self = this;
		var global = this.global;
		var bootstrapobject = global.getBootstrapObject();

		// erc721 ui
		var modulescriptloader = global.getScriptLoader('erc721dapploader', parentscriptloader);
		
		var moduleroot = './dapps/erc721';

		var mvcui = bootstrapobject.getMvcUI();
		
		if (mvcui == 'angularjs-1.x') {
			modulescriptloader.push_script( moduleroot + '/angular-ui/js/src/control/controllers.js');
			modulescriptloader.push_script( moduleroot + '/angular-ui/js/src/view/views.js');
		}
		
		
		modulescriptloader.load_scripts(function() { self.init(); if (callback) callback(null, self); });
		
		return modulescriptloader;
	}
	
	isReady() {
		return this.isready;
	}

	hasLoadStarted() {
		return this.isloading;
	}

	_getGlobalObject() {
		var _global = (this.global ? this.global : null);
		
		if (!_global) {
			let _GlobalClass;

			if (typeof window !== 'undefined') {
				_GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
			}
			else if (typeof global !== 'undefined') {
				// we are in node js
				_GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
			}
			
			_global = _GlobalClass.getGlobalObject();
		}
			
		return _global;
	}
	
	
	registerModel() {
		var global = this._getGlobalObject();
		
		if (global.isGlobalScopeInitializing())
			throw 'registerModel is called too late, after global scope intialization started.'
		
		console.log('registerModel called for ' + this.name);

		var dappmodelsloader = global.findScriptLoader('dappsmodelsloader');

		var moduleroot = './dapps/erc721';
		
		// erc721 module
		dappmodelsloader.push_script( moduleroot + '/includes/module.js', function() {
			// load module if initialization has finished
			if (global.isReady())
				global.loadModule('erc721', dappmodelsloader);
			else if (global.hasGlobalScopeInitializationStarted())
				console.log('WARNING: erc721 may be too late for load all module!');
		 });
		
	}
	
	// functions
	getControllersObject() {
		if (this.controllers)
			return this.controllers;
		
		var global = this.global;
		this.controllers = new this.Controllers(global);
		
		return this.controllers;
	}
	

}

if ( typeof window !== 'undefined' && typeof window.GlobalClass !== 'undefined' && window.GlobalClass ) {
	var _GlobalClass = window.GlobalClass;
}
else if (typeof window !== 'undefined') {
	var _GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
}
else if (typeof global !== 'undefined') {
	// we are in node js
	var _GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
}

_GlobalClass.getGlobalObject().registerModuleObject(new Module());

// dependencies
_GlobalClass.getGlobalObject().registerModuleDepency('erc721-dapp', 'dapps');		
