import '../../imports/dapps/erc721/includes/module.js';
import '../../imports/dapps/erc721/includes/control/controllers.js';
import '../../imports/dapps/erc721/includes/model/smartcontract.js';
import '../../imports/dapps/erc721/includes/model/erc721token.js';
import '../../imports/dapps/erc721/includes/model/interface/erc721token-contractinterface.js';
import '../../imports/dapps/erc721/includes/model/interface/erc721token-localpersistor.js';

console.log('dapps-load.js');

var Bootstrap = window.simplestore.Bootstrap;
var ScriptLoader = window.simplestore.ScriptLoader;

var bootstrapobject = Bootstrap.getBootstrapObject();
var rootscriptloader = ScriptLoader.getRootScriptLoader();

var modulescriptloader = ScriptLoader.findScriptLoader('moduleloader');

var erc721scriptloader = modulescriptloader.getChildLoader('@p2pmoney-org/ethereum_erc721');

rootscriptloader.push_import(erc721scriptloader,'../../imports/dapps/erc721/includes/module.js');
//import '../../imports/dapps/erc721/includes/module.js';

rootscriptloader.push_import(erc721scriptloader,'../../imports/dapps/erc721/includes/control/controllers.js');
//import '../../imports/dapps/erc721/includes/control/controllers.js';

rootscriptloader.push_import(erc721scriptloader,'../../imports/dapps/erc721/includes/model/smartcontract.js');
//import '../../imports/dapps/erc721/includes/model/smartcontract.js';
rootscriptloader.push_import(erc721scriptloader,'../../imports/dapps/erc721/includes/model/erc721token.js');
//import '../../imports/dapps/erc721/includes/model/erc721token.js';
rootscriptloader.push_import(erc721scriptloader,'../../imports/dapps/erc721/includes/model/interface/erc721token-contractinterface.js');
//import '../../imports/dapps/erc721/includes/model/interface/erc721token-contractinterface.js';
rootscriptloader.push_import(erc721scriptloader,'../../imports/dapps/erc721/includes/model/interface/erc721token-localpersistor.js');
//import '../../imports/dapps/erc721/includes/model/interface/erc721token-localpersistor.js';

erc721scriptloader.load_scripts(function() {
	rootscriptloader.signalEvent('@p2pmoney-org/on_erc721_module_load_end');
});