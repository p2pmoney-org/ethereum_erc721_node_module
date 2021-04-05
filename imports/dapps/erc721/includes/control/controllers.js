'use strict';

var ModuleControllers = class {
	
	constructor(module) {
		this.module = module;
	}
	
	// erc721 tokens
	createERC721TokenObject(session, data) {
		console.log("Controllers.createERC721TokenObject called");
		
		var module = this.module;
		var global = module.global;
		
		var SessionClass = global.getModuleClass('common', 'Session');
		if (session instanceof SessionClass !== true)
			throw 'must pass a session object as first parameter!';
		
		var global = session.getGlobalObject();

		var address = (data && data['address'] ? data['address'] : null);

		var name = (data && data['name'] ? data['name'] : null);
		var symbol = (data && data['symbol'] ? data['symbol'] : null);
		var basetokenuri = (data && data['basetokenuri'] ? data['basetokenuri'] : null);
		
		var description = (data && data['description'] ? data['description'] : null);


		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contracts = ethnodemodule.getContractsObject(session);
		
		
		var contract = contracts.createBlankContractObject('TokenERC721');
		
		contract.setAddress(address);

		contract.setLocalName(name);
		contract.setLocalSymbol(symbol);
		contract.setLocalBaseTokenURI(basetokenuri);

		contract.setLocalDescription(description);
		
		return contract;
	}
	
	modifyERC721TokenObject(session, contract, data) {
		console.log("Controllers.modifyERC721TokenObject called");
		
		var module = this.module;
		var global = module.global;
		
		var SessionClass = global.getModuleClass('common', 'Session');
		if (session instanceof SessionClass !== true)
			throw 'must pass a session object as first parameter!';
		
		var global = session.getGlobalObject();

		var address = (data && data['address'] ? data['address'] : null);

		var name = (data && data['name'] ? data['name'] : null);
		var symbol = (data && data['symbol'] ? data['symbol'] : null);
		var basetokenuri = (data && data['basetokenuri'] ? data['basetokenuri'] : null);
		
		var description = (data && data['description'] ? data['description'] : null);


		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contracts = ethnodemodule.getContractsObject(session);
		
		
		contract.setAddress(address);

		contract.setLocalName(name);
		contract.setLocalSymbol(symbol);
		contract.setLocalBaseTokenURI(basetokenuri);

		contract.setLocalDescription(description);
		
		return contract;
	}
	
	removeERC721TokenObject(session, contract) {
		if (!contract)
			return;
		
		var module = this.module;
		var global = module.global;
		
		var SessionClass = global.getModuleClass('common', 'Session');
		if (session instanceof SessionClass !== true)
			throw 'must pass a session object as first parameter!';
		
		var global = session.getGlobalObject();
		
		var commonmodule = global.getModuleObject('common');
		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contracts = ethnodemodule.getContractsObject(session);

		contracts.removeContractObject(contract);
	}
		

	getERC721TokenFromKey(session, contractindex) {
		console.log("Controllers.getERC721TokenFromKey called with index: " + contractindex);

		var module = this.module;
		var global = module.global;
		
		var SessionClass = global.getModuleClass('common', 'Session');
		if (session instanceof SessionClass !== true)
			throw 'must pass a session object as first parameter!';
		
		var global = session.getGlobalObject();
		
		var contracts = session.getContractsObject();
		
		
		var contract = contracts.getContractObjectFromKey(contractindex);
		
		return contract;
	}
	
	getERC721TokenFromUUID(session, contractuuid) {
		console.log("Controllers.getERC721TokenFromUUID called with uuid: " + contractuuid);

		var module = this.module;
		var global = module.global;
		
		var SessionClass = global.getModuleClass('common', 'Session');
		if (session instanceof SessionClass !== true)
			throw 'must pass a session object as first parameter!';
		
		var global = session.getGlobalObject();

		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contracts = ethnodemodule.getContractsObject(session);
		
		
		var contract = contracts.getContractObjectFromUUID(contractuuid);
		
		return contract;
	}

	// tranfers
	getAccountTokenTransferDefaultValues(session, contract, fromaccount, divcue) {
		var values = [];
		
		var module = this.module;
		var global = module.global;
		
		var SessionClass = global.getModuleClass('common', 'Session');
		if (session instanceof SessionClass !== true)
			throw 'must pass a session object as first parameter!';
		
		var global = session.getGlobalObject();
		
		var commonmodule = global.getModuleObject('common');
		
		var commoncontrollers = commonmodule.getControllersObject();

		var ethnodemodule = global.getModuleObject('ethnode');

		var gaslimit = ethnodemodule.getDefaultGasLimit(session);
		var gasPrice = ethnodemodule.getDefaultGasPrice(session);
		
		values['gaslimit'] = gaslimit;
		values['gasprice'] = gasPrice;
		
		var walletaddress = null;
		
		if (session) {
			var sessionaccount = session.getMainSessionAccountObject();
			
			// erc20token.sol does not support "in name of" transactions
			// we necessarily use fromaccount as wallet
			walletaddress = (fromaccount ? fromaccount.getAddress() : null);
			
			if (walletaddress) {
				
				values['walletused'] = walletaddress;
				
				if (divcue) {
					// we display the balance in the div passed
					var wallet = session.getAccountObject(walletaddress);
					
					this.writebalance(session, wallet, contract, fromaccount, divcue);
				}
			}
		}
	
		
		return values;
	}
	
	writebalance(session, wallet, contract, account, divbalance) {
		console.log('spawning write of getBalance');
		var self = this;
		var global = this.module.global;
		
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();

		var ethnodemodule = global.getModuleObject('ethnode');
		var ethnodecontrollers = ethnodemodule.getControllersObject();
		
		var innerhtml = ''; // to avoid mvc-controller writing default wallet in-between our promises
		
		divbalance.currentwalletaddress = wallet.getAddress();

		var web3providerurl = (contract ? contract.getWeb3ProviderUrl() : null);

		var res = ethnodemodule.getAltChainAccountBalance(session, wallet, web3providerurl, function(err, res) {
			if (!err) {

				var balancetext = ethnodecontrollers.getEtherStringFromWei(res);
				
				console.log('writebalance ether balance is ' + balancetext);
				innerhtml = global.t('The account') + ' ' + wallet.getAddress() + ' ' + global.t('has') + ' ' + balancetext + ' ' + global.t('Ether');
				divbalance.innerHTML = innerhtml;
			}
			else {
				console.log('writebalance ether balance error: ' + err);
			}
		})
		.then(function() {
			if ((contract) && (account)) {
				contract.balanceOf(account, function(err, res) {
					if (!err) {
						if (divbalance.currentwalletaddress.toLowerCase()  == wallet.getAddress().toLowerCase()) {
							// we write the balance, if indeed we are the current wallet selected for the div
							var global = self.module.global;
							var balancetext = res;
							
							console.log('writebalance token balance is ' + balancetext);
							innerhtml += '<br>' + global.t('The account') + ' ' + account.getAddress() + ' ' + global.t('has') + ' ' + balancetext + ' ' + global.t('Token(s)');
							divbalance.innerHTML = innerhtml;
						}
					}
					else {
						console.log('writebalance token balance error: ' + err);
					}
				});
			}
			else {
				if (!contract) console.log('writebalance error: contract is undefined');
				if (!account) console.log('writebalance error: account is undefined');
			}
		});
	}
	
	// asynchrone functions
	saveERC721TokenObject(session, contract, callback) {
		if (!contract)
			return;
		
		var module = this.module;
		var global = module.global;
		
		var SessionClass = global.getModuleClass('common', 'Session');
		if (session instanceof SessionClass !== true)
			throw 'must pass a session object as first parameter!';
		
		var global = session.getGlobalObject();

		console.log("Controllers.saveERC721TokenObject called for contract uuid " + contract.getUUID());

		var commonmodule = global.getModuleObject('common');
		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contracts = ethnodemodule.getContractsObject(session);
		
		var contractindex = contract.getContractIndex();
		var contractuuid = contract.getUUID();
		
		contract.saveLocalJson(function(err, res) {
			if (callback)
				callback(err, contracts);
		});
		
	}

	saveERC721Tokens(session, callback) {
		console.log("Controllers.saveERC721Tokens called");
		
		var module = this.module;
		var global = module.global;
		
		var SessionClass = global.getModuleClass('common', 'Session');
		if (session instanceof SessionClass !== true)
			throw 'must pass a session object as first parameter!';
		
		var global = session.getGlobalObject();

		var commonmodule = global.getModuleObject('common');
		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contracts = ethnodemodule.getContractsObject(session);

		ethnodemodule.saveContractObjects(session, contracts, function(err, res) {
			console.log('saveERC721Tokens returning from save');
			if (callback)
				callback(err, contracts);
		});
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

_GlobalClass.registerModuleClass('erc721', 'Controllers', ModuleControllers);
