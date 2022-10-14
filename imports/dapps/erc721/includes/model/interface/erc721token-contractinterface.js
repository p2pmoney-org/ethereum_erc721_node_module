'use strict';

var ERC721TokenContractInterface = class {
	
	constructor(session, contractaddress) {
		this.session = session;
		this.address = contractaddress;
		
		this.contractpath = './contracts/TokenERC721.json';
		
		this.web3providerurl = null;

		this.chainid = null;
		this.networkid = null;

		// operating variables
		this.finalized_init = null;
		
		this.contractinstance = null;
		
		var global = session.getGlobalObject();
		this.ethnodemodule = global.getModuleObject('ethnode');
	}
	
	getContractPath() {
		return this.contractpath;
	}

	setContractPath(path) {
		this.contractpath = path;
		this.contractinstance = null;
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
	
	getChainId() {
		return this.chainid;
	}

	setChainId(chainid) {
		this.chainid = chainid;
	}

	getNetworkId() {
		return this.networkid;
	}

	setNetworkId(networkid) {
		this.networkid = networkid;
	}

	getContractInstance() {
		if (this.contractinstance)
			return this.contractinstance;
		
		var session = this.session;
		var global = session.getGlobalObject();
		var ethnodemodule = global.getModuleObject('ethnode');

		var contractpath = this.getContractPath();

		this.contractinstance = ethnodemodule.getContractInstance(session, this.address, contractpath, this.web3providerurl);

		if (this.chainid)
		this.contractinstance.setChainId(this.chainid);
		
		if (this.networkid)
		this.contractinstance.setNetworkId(this.networkid);
		
		return this.contractinstance;
	}
	
	validateTransactionExecution(payingaccount, gas, gasPrice, callback) {
		var session = this.session;
		var ethnodemodule = this.ethnodemodule;

		// we check the account is unlocked
		if (ethnodemodule.isAccountLocked(session, payingaccount))
			throw 'account ' + payingaccount.getAddress() + ' is locked, unable to initiate transaction';
		
		return true;
	}
	
	validateTransferFromExecution(fromaccount, toaddress, tokenid, callback) {
		var session = this.session;
		var fromaddress = fromaccount.getAddress();
		
		// we check the account is the owner
		// TODO: otherwise check is it is an operator
		return this.ownerOf(tokenid)
		.then(function(res) {
			if (session.areAddressesEqual(res, fromaddress)) {
				if (callback)
					callback(null, true);

				return true;
			}
			else {
				if (callback)
					callback(null, false);

				throw 'ERR_CAN_NOT_TRANSFER_ERC721TOKEN';
			}
		});
		
	}
	
	validateBurnExecution(fromaccount, amount, callback) {
		var fromaddress = fromaccount.getAddress();
		
		// we check the account balance is sufficient
		return this.balanceOf(fromaddress, function(err, balance) {
			if (err) {
				if (callback)
					callback('error checking balance of ' + err, null);
			}
			else {
				if (parseInt(amount.toString(),10) > parseInt(balance.toString(),10))
					throw 'account ' + fromaddress + ' balance (' + balance + ') is too low to burn '+ amount + ' token(s).';
				
				if (callback)
					callback(null, true);
				
				return true;
			}
		});
		
	}
	
	validateBurnFromExecution(fromaccount, burnedaddress, amount, callback) {
		var fromaddress = fromaccount.getAddress();
		
		// we check the account balance is sufficient
		return this.allowance(burnedaddress, fromaddress, function(err, allowance) {
			if (err) {
				if (callback)
					callback('error checking allowance of ' + err, null);
			}
			else {
				console.log('allowance of ' + fromaddress + ' on ' + burnedaddress + ' is ' + allowance);
				if (parseInt(amount.toString(),10) > parseInt(allowance.toString(),10))
					throw 'account ' + fromaddress + ' allowance (' + allowance + ') is too low to burn '+ amount + ' token(s) from ' + burnedaddress + '.';
				
				if (callback)
					callback(null, true);
				
				return true;
			}
		});
		
	}
	
	// contract api
	activateContractInstance(callback) {
		return this.getContractInstance().activate(callback);
	}
	

	deploy(tokenName, tokenSymbol, tokenBaseURI, ethtx, callback) {
		if (!ethtx)
			return Promise.reject('ethereum transaction is undefined');

		var self = this;
		var session = this.session;

		var fromaccount = ethtx.getFromAccount();
		var payingaccount = ethtx.getPayingAccount();

		payingaccount = (payingaccount ? payingaccount : fromaccount);

		var gas = ethtx.getGas();
		var gasPrice = ethtx.getGasPrice();

		var fromaddress = fromaccount.getAddress();
		var transactionuuid = ethtx.getTransactionUUID();
		var value = ethtx.getValue();
		
		console.log('ERC721TokenContractInterface.deploy called for ' + tokenName + " from " + fromaddress + " with gas limit " + gas + " and gasPrice " + gasPrice + " and transactionuuid " + transactionuuid);
		
		
		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();
		
		var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
				
		contracttransaction.setContractTransactionUUID(transactionuuid);
		contracttransaction.setValue(value);
	
		var args = [];
		
		args.push(tokenName);
		args.push(tokenSymbol);
		args.push(tokenBaseURI);
		
		contracttransaction.setArguments(args);
		
		var promise = contractinstance.contract_new_send(contracttransaction, function(err, res) {
			console.log('ERC721TokenContractInterface.deploy callback called, result is: ' + res);
			
			if (callback)
				callback(null, res); // res is txhash
			
			return res;
		})
		.then(function(res) {
			// res is now address and contractinstance address is set
			console.log('ERC721TokenContractInterface.deploy promise of deployment resolved, result is: ' + res);
			
			self.setAddress(contractinstance.getAddress());
			
			return res;
		})
		.catch(err => {
			if (callback)
				callback(err, null);

			throw err;
		});
		
		return promise;
	}
	
	getName(callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		return contractinstance.method_call("name", params, callback);
	}
	
	getSymbol(callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		return contractinstance.method_call("symbol", params, callback);
	}
	
	getTokenURI(tokenId, callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];

		var _tokenid = parseInt(tokenId);
		
		params.push(_tokenid);
		
		return contractinstance.method_call("tokenURI", params, callback);
	}

	getTotalSupply(callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		return contractinstance.method_call("totalSupply", params, callback);
	}


	supportsInterface(interfaceId, callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		params.push(interfaceId);
		
		return contractinstance.method_call("supportsInterface", params, callback);
	}
	
	balanceOf(address, callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		params.push(address);
		
		return contractinstance.method_call("balanceOf", params, callback);
	}
	
	ownerOf(tokenId, callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];

		var _tokenid = parseInt(tokenId);
		
		params.push(_tokenid);
		
		return contractinstance.method_call("ownerOf", params, callback);
	}

	getApproved(tokenId, callback) {
		var self = this;
		var session = this.session;
		
		console.log('ERC721TokenContractInterface.getApproved called for token ' + tokenId);

		var contractinstance = this.getContractInstance();
		var params = [];

		var _tokenId = parseInt(tokenId);
		
		params.push(_tokenId);
		
		return contractinstance.method_call("getApproved", params, callback);

	}

	isApprovedForAll(owner, operator, callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];

		params.push(owner);
		params.push(operator);
		
		return contractinstance.method_call("isApprovedForAll", params, callback);
	}

	

	
	// transactions
	getAddressFromTransactionUUID(transactionuuid, callback) {
		console.log('ERC721TokenContractInterface.getAddressFromTransactionUUID called for transactionuuid ' + transactionuuid);

		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();

		var promise = contractinstance.findAddressFromUUID(transactionuuid)
		.then(function(res) {
			
			if (callback)
				callback(( res ? null: 'error'), res);
				
			return res;
		});
		
		return promise;
		
	}

	approve(address, tokenId, ethtx, callback) {
		var self = this;
		var session = this.session;
		
		var fromaccount = ethtx.getFromAccount();
		var payingaccount = ethtx.getPayingAccount();

		payingaccount = (payingaccount ? payingaccount : fromaccount);

		var gas = ethtx.getGas();
		var gasPrice = ethtx.getGasPrice();

		var fromaddress = fromaccount.getAddress();
		var transactionuuid = ethtx.getTransactionUUID();
		var value = ethtx.getValue();
		
		console.log('ERC721TokenContractInterface.approve called for ' + address + " on token " + tokenId + " with gas limit " + gas + " and gasPrice " + gasPrice + " and transactionuuid " + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();
		var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
		
		contracttransaction.setContractTransactionUUID(transactionuuid);
		contracttransaction.setValue(value);
	
		var args = [];

		var _tokenId = parseInt(tokenId);
		
		args.push(address);
		args.push(_tokenId);
		
		contracttransaction.setArguments(args);
		
		contracttransaction.setContractTransactionUUID(transactionuuid);

		contracttransaction.setMethodName('approve');
		
		var promise = contractinstance.method_send(contracttransaction, callback)
		.then(function(res) {
			console.log('ERC721TokenContractInterface.approve promise resolved, result is ' + res);
			
			return res;
		})
		.catch(err => {
			console.log('ERC721TokenContractInterface.approve error: ' + err);

			if (callback)
				callback(err, null);

			throw err;
		});

		return promise;
	}
	
	setApprovalForAll(operatoraddress, approved, ethtx, callback) {
		var self = this;
		var session = this.session;
		
		var fromaccount = ethtx.getFromAccount();
		var payingaccount = ethtx.getPayingAccount();

		payingaccount = (payingaccount ? payingaccount : fromaccount);

		var gas = ethtx.getGas();
		var gasPrice = ethtx.getGasPrice();

		var fromaddress = fromaccount.getAddress();
		var transactionuuid = ethtx.getTransactionUUID();
		var value = ethtx.getValue();
		
		console.log('ERC721TokenContractInterface.setApprovalForAll called for operator ' + operatoraddress + " with gas limit " + gas + " and gasPrice " + gasPrice + " and transactionuuid " + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();
		var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
		
		contracttransaction.setContractTransactionUUID(transactionuuid);
		contracttransaction.setValue(value);
	
		var args = [];

		args.push(operatoraddress);
		args.push(approved);
		
		contracttransaction.setArguments(args);
		
		contracttransaction.setContractTransactionUUID(transactionuuid);

		contracttransaction.setMethodName('setApprovalForAll');
		
		var promise = contractinstance.method_send(contracttransaction, callback)
		.then(function(res) {
			console.log('ERC721TokenContractInterface.setApprovalForAll promise resolved, result is ' + res);
			
			return res;
		})
		.catch(err => {
			console.log('ERC721TokenContractInterface.setApprovalForAll error: ' + err);

			if (callback)
				callback(err, null);

			throw err;
		});

		return promise;
	}
	
	transferFrom(fromaddress, toaddress, tokenid, ethtx, callback) {
		var self = this;
		var session = this.session;
		
		var fromaccount = ethtx.getFromAccount();
		var payingaccount = ethtx.getPayingAccount();

		payingaccount = (payingaccount ? payingaccount : fromaccount);

		var gas = ethtx.getGas();
		var gasPrice = ethtx.getGasPrice();

		var transactionuuid = ethtx.getTransactionUUID();
		var value = ethtx.getValue();
		
		console.log('ERC721TokenContractInterface.transferFrom called for token ' + tokenid + " from " + fromaddress + " to " + toaddress + " with gas limit " + gas + " and gasPrice " + gasPrice + " and transactionuuid " + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();

		var promise = this.validateTransferFromExecution(fromaccount, toaddress, tokenid)
		.then(function(res) {
			// then call the transfer transaction
			var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
		
			contracttransaction.setContractTransactionUUID(transactionuuid);
			contracttransaction.setValue(value);
		
			var args = [];
	
			var _tokenid = parseInt(tokenid);
			
			args.push(fromaddress);
			args.push(toaddress);
			args.push(_tokenid);
			
			contracttransaction.setArguments(args);
			
			contracttransaction.setContractTransactionUUID(transactionuuid);
	
			contracttransaction.setMethodName('transferFrom');
	
			return contractinstance.method_send(contracttransaction, callback);
		})
		.then(function(res) {
			console.log('ERC721TokenContractInterface.transferFrom promise resolved, result is ' + res);
			
			return res;
		})
		.catch(err => {
			console.log('ERC721TokenContractInterface.transferFrom error: ' + err);

			if (callback)
				callback(err, null);

			throw err;
		});

		return promise;
	}
	

	safeTransferFrom(fromaddress, toaddress, tokenid, data, ethtx, callback) {
		var self = this;
		var session = this.session;
		
		var fromaccount = ethtx.getFromAccount();
		var payingaccount = ethtx.getPayingAccount();

		payingaccount = (payingaccount ? payingaccount : fromaccount);

		var gas = ethtx.getGas();
		var gasPrice = ethtx.getGasPrice();

		var transactionuuid = ethtx.getTransactionUUID();
		var value = ethtx.getValue();
		
		console.log('ERC721TokenContractInterface.safeTransferFrom called for token ' + tokenid + " from " + fromaddress + " to " + toaddress + " with gas limit " + gas + " and gasPrice " + gasPrice + " and transactionuuid " + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();
		
		var promise = this.validateTransferFromExecution(fromaccount, toaddress, tokenid)
		.then(function(res) {
			// then call the transfer transaction
			var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
		
			contracttransaction.setContractTransactionUUID(transactionuuid);
			contracttransaction.setValue(value);
		
			var args = [];
	
			var _tokenid = parseInt(tokenid);
			
			args.push(fromaddress);
			args.push(toaddress);
			args.push(_tokenid);
			
			if (data) {
				var _data = data; // could check this is a buffer, and transform if not

				args.push(_data);
			}
			
			contracttransaction.setArguments(args);
			
			contracttransaction.setContractTransactionUUID(transactionuuid);
	
			contracttransaction.setMethodName("safeTransferFrom");

			return contractinstance.method_send(contracttransaction, callback);
		})
		.then(function(res) {
			console.log('ERC721TokenContractInterface.safeTransferFrom promise resolved, result is ' + res);
			
			return res;
		})
		.catch(err => {
			console.log('ERC721TokenContractInterface.safeTransferFrom error: ' + err);

			if (callback)
				callback(err, null);

			throw err;
		});

		return promise;
	}

	// mintable part
	mint(minteraccount, ethtx, callback) {
		var self = this;
		var session = this.session;

		var minteraddress = minteraccount.getAddress();
		
		var fromaccount = ethtx.getFromAccount();
		var payingaccount = ethtx.getPayingAccount();

		payingaccount = (payingaccount ? payingaccount : fromaccount);

		var gas = ethtx.getGas();
		var gasPrice = ethtx.getGasPrice();

		var fromaddress = fromaccount.getAddress();
		var toaddress = ethtx.getToAddress();
		
		var transactionuuid = ethtx.getTransactionUUID();
		var value = ethtx.getValue();
		
		console.log('ERC721TokenContractInterface.mint called for address ' + minteraddress + " with gas limit " + gas + " and gasPrice " + gasPrice + " and transactionuuid " + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();
		var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
		
		contracttransaction.setContractTransactionUUID(transactionuuid);
		contracttransaction.setValue(value);
	
		var args = [];

		args.push(minteraddress);
		
		contracttransaction.setArguments(args);
		
		contracttransaction.setContractTransactionUUID(transactionuuid);

		contracttransaction.setMethodName('mint');
		
		var promise = contractinstance.method_send(contracttransaction,  function(err, res) {
			// function can be called multiple times, once with res and then err
			if (err) {
				if (callback)
					callback(err, null);
			}
			else {
				callback(null, res);
			}

		})
		.then(function(res) {
			console.log('ERC721TokenContractInterface.mint promise resolved, result is ' + res);
			
			if (callback)
				callback(null, res);

			return res;
		})
		.catch(err => {
			console.log('ERC721TokenContractInterface.mint error: ' + err);

			if (callback)
				callback(err, null);

			throw err;
		});

		return promise;
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

_GlobalClass.registerModuleClass('erc721', 'ERC721TokenContractInterface', ERC721TokenContractInterface);
