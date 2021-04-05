'use strict';

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


var SmartContractClass = _GlobalClass.getGlobalObject().getModuleClass('common', 'SmartContract');

var ERC721Token = class extends SmartContractClass {
	
	constructor(session, contractaddress, web3providerurl) {
		super(session, contractaddress, web3providerurl);

		// local data
		this.local_name = null;
		this.local_symbol = null;

		this.local_basetokenuri = null;
	}

	getContractType() {
		return 'TokenERC721';
	}
	
	getContractLocalPersistor() {
		if (this.contractlocalpersistor)
			return this.contractlocalpersistor;
		
		var session = this.session;
		var contractuuid = this.getUUID();
		
		var global = session.getGlobalObject();
		var erc721tokenmodule = global.getModuleObject('erc721');
		
		this.contractlocalpersistor = new erc721tokenmodule.ERC721TokenLocalPersistor(session, contractuuid)
		
		return this.contractlocalpersistor;
	}
	
	// initialization of object
	initContract(json) {
		console.log('ERC721Token.initContract called for ' + this.address);
		
		//console.log('json is ' + JSON.stringify(json));
		
		var session = this.session;
		var global = session.getGlobalObject();
		var erc721tokenmodule = global.getModuleObject('erc721');
		
		// load local ledger elements (if any)
		
		if (json["uuid"])
			this.uuid = json["uuid"];
		
		if (json["status"])
			this.setStatus(json["status"]);
		
		if (json["name"])
			this.local_name = json["name"];
		
		if (json["symbol"])
			this.local_symbol = json["symbol"];
		
		if (json["basetokenuri"])
			this.local_basetokenuri = json["basetokenuri"];
		
		if (json["description"])
			this.local_description = json["description"];
		
		if (json["creationdate"])
			this.setLocalCreationDate(json["creationdate"]);
			
		if (json["submissiondate"])
			this.setLocalSubmissionDate(json["submissiondate"]);
			
		
	}
	
	// local part
	getLocalJson() {
		// ledger part
		var uuid = this.getUUID();
		var address = this.getAddress();
		var contracttype = this.getContractType();
		var web3providerurl = this.getWeb3ProviderUrl();
		
		var status = this.getStatus();
		
		var name = this.getLocalName();
		var symbol = this.getLocalSymbol();
		var basetokenuri = this.getLocalBaseTokenURI();
		
		var description = this.getLocalDescription();
		
		var creationdate = this.getLocalCreationDate();
		var submissiondate = this.getLocalSubmissionDate();

		
		var json = {uuid: uuid, address: address, contracttype: contracttype, web3providerurl: web3providerurl, status: status, 
				name: name, symbol: symbol, basetokenuri: basetokenuri,
				creationdate: creationdate, submissiondate: submissiondate,
				description: description};
		
		return json;
	}
	
	saveLocalJson(callback) {
		console.log('ERC721Token.saveLocalJson called for ' + this.address);

		var persistor = this.getContractLocalPersistor();
		
		persistor.saveERC721TokenJson(this, callback);
	}

	getLocalName() {
		return this.local_name;
	}
	
	setLocalName(name) {
		this.local_name = name;
	}
	
	getLocalSymbol() {
		return this.local_symbol;
	}
	
	setLocalSymbol(symbol) {
		this.local_symbol = symbol;
	}

	getLocalBaseTokenURI() {
		return this.local_basetokenuri;
	}

	setLocalBaseTokenURI(basetokenuri) {
		this.local_basetokenuri = basetokenuri;
	}

	
	// chain part
	getContractInterface() {
		if (this.contractinterface)
			return this.contractinterface;
		
		var session = this.session;
		var contractaddress = this.address;
		var web3providerurl = this.web3providerurl;
		
		var global = session.getGlobalObject();
		var erc721tokenmodule = global.getModuleObject('erc721');
		
		this.contractinterface = new erc721tokenmodule.ERC721TokenContractInterface(session, contractaddress, web3providerurl);
		
		return this.contractinterface;
	}
	
	//
	// asynchronous methods
	//
	
	
	checkStatus(callback) {
		var Contracts = this.Contracts;
		var chaintestfunction = (this.isOnChain).bind(this);
		var contractinstance = this.getContractInterface().getContractInstance();
		
		return Contracts.checkStatus(this, chaintestfunction, contractinstance, callback);
	}
	
	isOnChain(callback) {
		return this.getChainName(callback);
	}
	
	getChainName(callback) {
		var contractinterface = this.getContractInterface();
		
		return contractinterface.getName()
		.then(res => {
			console.log('ERC721Token.getChainName returns ' + res);

			if (callback)
				callback(null, res);
			
			return res;
		})
		.catch(err => {
			console.log('error in ERC721Token.getChainName: ' + err);

			if (callback)
				callback(err, null);

			throw err;
		});
	}
	
	getChainSymbol(callback) {
		var contractinterface = this.getContractInterface();
		
		return contractinterface.getSymbol()
		.then(res => {
			console.log('ERC721Token.getChainSymbol returns ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		})
		.catch(err => {
			console.log('error in ERC721Token.getChainSymbol: ' + err);

			if (callback)
				callback(err, null);

			throw err;
		});
	}

	getChainTokenURI(tokenId, callback) {
		var contractinterface = this.getContractInterface();
		
		return contractinterface.getTokenURI(tokenId)
		.then(res => {
			console.log('ERC721Token.getChainTokenURI returns ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		})
		.catch(err => {
			console.log('error in ERC721Token.getChainTokenURI: ' + err);

			if (callback)
				callback(err, null);

			throw err;
		});
	}

	getTotalSupply(callback) {
		var contractinterface = this.getContractInterface();
		
		return contractinterface.getTotalSupply()
		.then(res => {
			console.log('ERC721Token.getTotalSupply returns ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		})
		.catch(err => {
			console.log('error in ERC721Token.getTotalSupply: ' + err);

			if (callback)
				callback(err, null);

			throw err;
		});
	}


	supportsInterface(interfaceId, callback) {
		var contractinterface = this.getContractInterface();
		
		return contractinterface.supportsInterface(interfaceId)
		.then(res => {
			console.log('ERC721Token.supportsInterface returns ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		})
		.catch(err => {
			console.log('error in ERC721Token.supportsInterface: ' + err);
			
			if (callback)
				callback(err, null);

			throw err;
		});
	}

	balanceOf(account, callback) {
		var self = this;
		var session = this.session;
		
		var address = account.getAddress();

		var contractinterface = this.getContractInterface();
		
		return contractinterface.balanceOf(address)
		.then(res => {
			console.log('ERC721Token.balanceOf returns ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		})
		.catch(err => {
			console.log('error in ERC721Token.balanceOf: ' + err);
			
			if (callback)
				callback(err, null);

			throw err;
		});
	}

	ownerOf(tokenId, callback) {
		var contractinterface = this.getContractInterface();
		
		return contractinterface.ownerOf(tokenId)
		.then(res => {
			console.log('ERC721Token.ownerOf returns ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		})
		.catch(err => {
			console.log('error in ERC721Token.ownerOf: ' + err);
			
			if (callback)
				callback(err, null);

			throw err;
		});
	}

	getApproved(tokenId, callback) {
		var contractinterface = this.getContractInterface();
		
		return contractinterface.getApproved(tokenId)
		.then(res => {
			console.log('ERC721Token.getApproved returns ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		})
		.catch(err => {
			console.log('error in ERC721Token.getApproved: ' + err);
			
			if (callback)
				callback(err, null);

			throw err;
		});
	}

	isApprovedForAll(owneraddress, operatoraddress, callback) {
		var contractinterface = this.getContractInterface();
		
		return contractinterface.isApprovedForAll(owneraddress, operatoraddress)
		.then(res => {
			console.log('ERC721Token.isApprovedForAll returns ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		})
		.catch(err => {
			console.log('error in ERC721Token.isApprovedForAll: ' + err);
			
			if (callback)
				callback(err, null);

			throw err;
		});
	}



	// transactions

	approve(address, tokenId, ethtx, callback) {
		if (!ethtx)
			return Promise.reject('ethereum transaction is undefined');

		var contractinterface = this.getContractInterface();

		return contractinterface.approve(address, tokenId, ethtx)
		.then(res => {
			if (callback)
				callback(null, res);

			return res;
		})
		.catch(err => {
			if (callback)
				callback(err, null);

			throw err;
		});
	}

	setApprovalForAll(operatoraddress, approved, ethtx, callback) {
		if (!ethtx)
			return Promise.reject('ethereum transaction is undefined');

		var contractinterface = this.getContractInterface();

		return contractinterface.setApprovalForAll(operatoraddress, approved, ethtx)
		.then(res => {
			if (callback)
				callback(null, res);

			return res;
		})
		.catch(err => {
			if (callback)
				callback(err, null);

			throw err;
		});
	}

	transferFrom(fromaccount, toaccount, tokenId, ethtx, callback) {
		if (!ethtx)
			return Promise.reject('ethereum transaction is undefined');

		var fromaddress = fromaccount.getAddress();
		var toaddress = toaccount.getAddress();

		var contractinterface = this.getContractInterface();

		return contractinterface.transferFrom(fromaddress, toaddress, tokenId, ethtx)
		.then(res => {
			if (callback)
				callback(null, res);

			return res;
		})
		.catch(err => {
			if (callback)
				callback(err, null);

			throw err;
		});
	}

	safeTransferFrom(fromaccount, toaccount, tokenId, data, ethtx, callback) {
		if (!ethtx)
			return Promise.reject('ethereum transaction is undefined');

		var fromaddress = fromaccount.getAddress();
		var toaddress = toaccount.getAddress();

		var contractinterface = this.getContractInterface();

		return contractinterface.safeTransferFrom(fromaddress, toaddress, tokenId, data, ethtx)
		.then(res => {
			if (callback)
				callback(null, res);

			return res;
		})
		.catch(err => {
			if (callback)
				callback(err, null);

			throw err;
		});
	}


	// mintable part

	// deployment
	deploy(ethtx, callback) {
		var self = this;
		var session = this.session;
		//var EthereumNodeAccess = session.getEthereumNodeAccessInstance();

		var contractinterface = this.getContractInterface();
		
		var name = this.getLocalName();
		var symbol = this.getLocalSymbol();
		var tokenbaseuri = this.getLocalBaseTokenURI();
		
		var transactionuuid = ethtx.getTransactionUUID();

		if (!transactionuuid) {
			transactionuuid = this.getUUID();
			ethtx.setTransactionUUID(transactionuuid);
		}
		
		this.setStatus(self.Contracts.STATUS_SENT);
		
		return contractinterface.deploy(name, symbol, tokenbaseuri, ethtx, function (err, res) {
			console.log('ERC721Token.deploy transaction committed, transaction hash is: ' + res);
			
			self.setStatus(self.Contracts.STATUS_PENDING);
		})
		.then(function(res) {
			console.log('ERC721Token.deploy promise of deployment resolved, address is: ' + res);
			
			if (res) {
				self.setAddress(contractinterface.getAddress());
				self.setStatus(self.Contracts.STATUS_DEPLOYED);
				
				if (callback)
					callback(null, res);
			}
			else {
				if (callback)
					callback('error deploying token ' + name, null);
			}
			
			return res;
		})		
		.catch(err => {
			if (callback)
				callback(err, null);

			throw err;
		});
	}
	
	mint(minteraccount, ethtx, callback) {
		if (!ethtx)
			return Promise.reject('ethereum transaction is undefined');

		var contractinterface = this.getContractInterface();

		return contractinterface.mint(minteraccount, ethtx, function(err, res) {
			// function can be called multiple times, once with res and then err
			if (err) {
				if (callback)
					callback(err, null);
			}
			else {
				callback(null, res);
			}

		})
		.then(res => {
			if (callback)
				callback(null, res);

			return res;
		})
		.catch(err => {
			if (callback)
				callback(err, null);

			throw err;
		});
	}
}


_GlobalClass.registerModuleClass('erc721', 'ERC721Token', ERC721Token);
		
