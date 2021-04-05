'use strict';

var SmartContract = class {
	
	constructor(session, contractaddress, web3providerurl) {
		this.session = session;
		this.address = contractaddress;
		
		this.uuid = null;
		

		// local data
		this.contractindex = null; // index in list of contracts
		
		this.local_description = null;
		
		this.local_creation_date = new Date().getTime();
		this.local_submission_date = null;

		// chain data
		
		// web3 provider
		var global = session.getGlobalObject();
		var commonmodule = global.getModuleObject('common');
		var ethnodemodule = global.getModuleObject('ethnode');
		
		this.web3providerurl = (web3providerurl ? web3providerurl : ethnodemodule.getWeb3ProviderUrl(session));
		
		// Contracts class
		var global = session.getGlobalObject();
		var commonmodule = global.getModuleObject('common');
		var ethnodemodule = global.getModuleObject('ethnode');
		
		this.Contracts = ethnodemodule.Contracts;
		
		this.savedstatus = this.Contracts.STATUS_LOCAL;
		
		this.livestatus = this.Contracts.STATUS_LOCAL;
	}

	getAddress() {
		return this.address;
	}
	
	setAddress(address) {
		this.address = address;
	}
	
	getWeb3ProviderUrl() {
		return this.web3providerurl;
	}
	
	setWeb3ProviderUrl(url) {
		this.web3providerurl = url;
	}
	
	getUUID() {
		if (this.uuid)
			return this.uuid;
		
		this.uuid = this.session.getUUID();
		
		return this.uuid;
	}
	
	// local part
	isLocalOnly() {
		if (this.address == null)
			return true;
		else
			return false;
	}
	
	isLocal() {
		return true; // necessarily true for contracts
	}
	
	isOnChain() {
		if (this.address == null)
			return false;
		else
			return true;
		//return (this.livestatus == this.Contracts.STATUS_ON_CHAIN);
	}
	
	getStatus() {
		// 4 local saved status STATUS_LOCAL, STATUS_LOST, STATUS_CANCELLED, STATUS_REJECTED
		// 2 local saved transient status STATUS_SENT, STATUS_PENDING
		// 1 chain saved status STATUS_DEPLOYED
		return this.savedstatus;
	}
	
	getLiveStatus() {
		// 3 local live status STATUS_LOCAL, STATUS_SENT, STATUS_PENDING
		// 2 chain live status STATUS_NOT_FOUND, STATUS_ON_CHAIN
		return this.livestatus;
	}
	
	setStatus(status) {
		switch(status) {
			case this.Contracts.STATUS_LOST:
			case this.Contracts.STATUS_LOCAL:
			case this.Contracts.STATUS_SENT:
			case this.Contracts.STATUS_PENDING:
			case this.Contracts.STATUS_DEPLOYED:
			case this.Contracts.STATUS_CANCELLED:
			case this.Contracts.STATUS_REJECTED:
				this.savedstatus = status;
				break;
			default:
				// do not change for a unknown status
				break;
		}
	}
	
	getContractIndex() {
		return this.contractindex;
	}
	
	setContractIndex(index) {
		return this.contractindex = index;
	}

	getLocalDescription() {
		return this.local_description;
	}
	
	setLocalDescription(description) {
		this.local_description = description;
	}

	getLocalCreationDate() {
		return this.local_creation_date;
	}
	
	setLocalCreationDate(creation_date) {
		this.local_creation_date = creation_date;
	}
	
	getLocalSubmissionDate() {
		return this.local_submission_date;
	}
	
	setLocalSubmissionDate(submission_date) {
		this.local_submission_date = submission_date;
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

_GlobalClass.registerModuleClass('common', 'SmartContract', SmartContract);