'use strict';

var ethereum_erc721;

class Ethereum_erc721 {
	constructor() {
		this.load = null;
		
		this.initializing = false;
		this.initialized = false;
		
		this.initializationpromise = null;
		
		//var Ethereum_core = require('@p2pmoney-org/ethereum_core');
		var Ethereum_core = require('../ethereum_core');
		
		this.ethereum_core = Ethereum_core.getObject();
	}
	
	getVersion() {
		var packagejson = require('./package.json');
		return packagejson.version;
	}
	
	async init(callback) {
		console.log('@p2pmoney-org/ethereum_erc721 init called');

		if (this.initialized) {
			console.log('module @p2pmoney-org/ethereum_erc721 is already initialized.');
			return true;
		}
		
		if (this.initializing ) {
			console.log('module @p2pmoney-org/ethereum_erc721 is already initializing. Wait till it\'s ready.');
			return this.initializationpromise;
		}

		var ethereum_core = this.ethereum_core;

		if (ethereum_core.initialized === false) {
			await ethereum_core.init();
		}

		
		// load contracts
		var jsoncontent = require('./imports/public/contracts/TokenERC721.json');
		ethereum_core.putArtifact('./contracts/TokenERC721.json', jsoncontent);
		
		// create loader
		if (typeof window !== 'undefined') {
			if (typeof document !== 'undefined' && document ) {
				// we are in a browser
				console.log('loading for browser');
				
				var BrowserLoad = require( './js/browser-load.js');

				this.load = new BrowserLoad(this);
			}
			else {
				// we are in react-native
				console.log('loading for react-native');
				
				var ReactNativeLoad = require( './js/react-native-load.js');

				this.load = new ReactNativeLoad(this);
			}
		}
		else if (typeof global !== 'undefined') {
			console.log('loading for nodejs');
			
			// we are in nodejs
			var NodeLoad = require( './js/node-load.js');
			
			this.load = new NodeLoad(this);
		}

		var self = this;
		var promise;
		
		if (this.initializing === false) {
			
			this.initializationpromise = new Promise(function (resolve, reject) {
				self.load.init(function() {
				console.log('@p2pmoney-org/ethereum_erc721 init finished');
				self.initialized = true;
				
				if (callback)
					callback(null, true);
				
				resolve(true);
				});
			});
			
			this.initializing = true;
		}
		
		return this.initializationpromise;
	}
	
	getGlobalObject() {
		if (typeof window !== 'undefined') {
			// we are in react-native
			return window.simplestore.Global.getGlobalObject();
		}
		else if (typeof global !== 'undefined') {
			// we are in nodejs
			return global.simplestore.Global.getGlobalObject();
		}
		
	}
	
	getControllersObject() {
		return require('./js/control/controllers.js').getObject();
	}

	// static methods
	static getObject() {
		if (ethereum_erc721)
			return ethereum_erc721;
		
		ethereum_erc721 = new Ethereum_erc721();
		
		return ethereum_erc721;
	}
	
}

module.exports = Ethereum_erc721;