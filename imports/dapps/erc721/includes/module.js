'use strict';

var Module = class {
	
	constructor() {
		this.name = 'erc721';
		this.current_version = "0.20.12.2021.04.07";
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		this.controllers = null;
	}
	
	init() {
		console.log('module init called for ' + this.name);
		
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

		// noticebook
		var modulescriptloader = global.getScriptLoader('erc721loader', parentscriptloader);
		
		var moduleroot = './dapps/erc721/includes';

		modulescriptloader.push_script( moduleroot + '/control/controllers.js');

		modulescriptloader.push_script( moduleroot + '/model/smartcontract.js');
		modulescriptloader.push_script( moduleroot + '/model/erc721token.js');
		
		modulescriptloader.push_script( moduleroot + '/model/interface/erc721token-contractinterface.js');
		modulescriptloader.push_script( moduleroot + '/model/interface/erc721token-localpersistor.js');
		
		modulescriptloader.load_scripts(function() { self.init(); if (callback) callback(null, self); });
		
		return modulescriptloader;
	}
	
	isReady() {
		return this.isready;
	}

	hasLoadStarted() {
		return this.isloading;
	}

	// optional  module functions
	registerHooks() {
		console.log('module registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('getVersionInfo_hook', this.name, this.getVersionInfo_hook);

		global.registerHook('postFinalizeGlobalScopeInit_hook', 'erc721', this.postFinalizeGlobalScopeInit_hook);
		
		global.registerHook('creatingSession_hook', this.name, this.creatingSession_hook);
		
		// signal module is ready
		var rootscriptloader = global.getRootScriptLoader();
		rootscriptloader.signalEvent('on_erc721_module_ready');
	}

	postRegisterModule() {
		console.log('postRegisterModule called for ' + this.name);
		if (!this.isloading) {
			var global = this.global;
			var self = this;
			
			var parentscriptloader = global.findScriptLoader('dappsmodelsloader');;
			
			this.loadModule(parentscriptloader, function() {
				if (self.registerHooks)
				self.registerHooks();
			});
		}
	}

	//
	// hooks
	//
	getVersionInfo_hook(result, params) {
		console.log('getVersionInfo_hook called for ' + this.name);
		
		var global = this.global;
		
		var versioninfos = params[0];
		
		var versioninfo = {};
		
		versioninfo.label = global.t('ethereum erc20');
		versioninfo.value = this.current_version;

		versioninfos.push(versioninfo);

		
		result.push({module: this.name, handled: true});
		
		return true;
	}

	postFinalizeGlobalScopeInit_hook(result, params) {
		console.log('postFinalizeGlobalScopeInit_hook called for ' + this.name);
		
		var global = this.global;
		
		var commonmodule = this.global.getModuleObject('common');

		result.push({module: this.name, handled: true});
		
		return true;
	}
	
	creatingSession_hook(result, params) {
		console.log('creatingSession_hook called for ' + this.name);
		
		var global = this.global;
		var session = params[0];
		
		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contracts = ethnodemodule.getContractsObject(session);
		
		// register TokenERC721 in the contracts global object
		// (could be transfered to preFinalizeGlobalScopeInit_hook if necessary)
		contracts.registerContractClass('TokenERC721', this.ERC721Token);
		
		// force refresh of list
		ethnodemodule.getContractsObject(session, true);
		result.push({module: this.name, handled: true});
		
		return true;
	}



	
	//
	// control
	//
	
	getControllersObject() {
		if (this.controllers)
			return this.controllers;
		
		this.controllers = new this.Controllers(this);
		
		return this.controllers;
	}

	//
	// model
	//
	
	// erc721 tokens
	_filterLocalContracts(contracts) {
		var array = [];
		
		if (!contracts)
			return array;
		
		var locals = contracts.getLocalOnlyContractObjects();

		for (var i = 0; i < locals.length; i++) {
			var local = locals[i];
			
			if (local.getContractType() == 'TokenERC721')
			array.push(local);
		}

		return array;
	}
	
	_filterContracts(contracts) {
		var array = [];
		
		if (!contracts)
			return array;
		
		var contractarray = contracts.getContractObjectsArray();

		for (var i = 0; i < contractarray.length; i++) {
			var contract = contractarray[i];
			
			if (contract.getContractType() == 'TokenERC721')
			array.push(contract);
		}

		return array;
	}
	
	getERC721Tokens(session, bForceRefresh, callback) {
		var global = this.global;
		var self = this;
		
		var commonmodule = global.getModuleObject('common');
		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contracts = ethnodemodule.getContractsObject(session, bForceRefresh, function(err, contracts) {
			if (callback) {
				var array = self._filterContracts(contracts);
				
				callback(null, array);
			}
		});
		
		var array = this._filterContracts(contracts);
		
		return array;
	}
	
	getLocalERC721Tokens(session, bForceRefresh, callback) {
		var global = this.global;
		var self = this;
		
		var commonmodule = global.getModuleObject('common');
		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contracts = ethnodemodule.getContractsObject(session, bForceRefresh, function(err, contracts) {
			if (callback) {
				var array = self._filterLocalContracts(contracts);
				
				callback(null, array);
			}
		});
		
		var array = this._filterLocalContracts(contracts);
		
		return array;
	}
	
	getChainERC721Tokens(session, bForceRefresh) {
		var global = this.global;
		var commonmodule = global.getModuleObject('common');
		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contracts = ethnodemodule.getContractsObject(session, bForceRefresh);
		
		var array = [];
		
		var chains = contracts.getChainContractObjects();

		for (var i = 0; i < chains.length; i++) {
			var chain = chains[i];
			
			if (chain.getContractType() == 'TokenERC721')
			array.push(chain);
		}

		return array;
	}
	
	findChainERC721Token(noticebookarray, address) {
		if (!address)
			return;
		
		var addr = address.trim().toLowerCase();
		
		for (var i = 0; i < noticebookarray.length; i++) {
			var bookaddress = noticebookarray[i].getAddress().trim().toLowerCase();
			if (bookaddress == addr)
				return noticebookarray[i];
		}
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
_GlobalClass.getGlobalObject().registerModuleDepency('erc721', 'erc721-dapp');

