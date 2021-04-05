'use strict';

var modulecontrollers;

var ModuleControllers = class {
	
	constructor() {
		this.module = null;
		
		this.ethereum_erc721 = require('../../../ethereum_erc721').getObject();
		this.ethereum_core = this.ethereum_erc721.ethereum_core;
		
		this.global = this.ethereum_erc721.getGlobalObject();

		this.session = null;
	}
	
	
	//
	// ERC721
	//
	
	

	
	// static
	static getObject() {
		if (modulecontrollers)
			return modulecontrollers;
		
		modulecontrollers = new ModuleControllers();
		
		return modulecontrollers;
	}
}

module.exports = ModuleControllers; 