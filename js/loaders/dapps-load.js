//import '../../imports/dapps/module.js';
//import '../../imports/dapps/erc721/module.js';
// dapps and dappsmodel already taken by @p2pmoney-org/ethereum_erc20
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

var dappsscriptloader = ScriptLoader.findScriptLoader('dappmodulesloader');


rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/module.js');
//import '../../imports/dapps/module.js';

var modulescriptloader = dappsscriptloader.getChildLoader('erc721dapploader-2');

rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc721/module.js');
//import '../../imports/dapps/erc721/module.js';

rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc721/includes/module.js');
//import '../../imports/dapps/erc721/includes/module.js';

rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc721/includes/control/controllers.js');
//import '../../imports/dapps/erc721/includes/control/controllers.js';

rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc721/includes/model/smartcontract.js');
//import '../../imports/dapps/erc721/includes/model/smartcontract.js';
rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc721/includes/model/erc721token.js');
//import '../../imports/dapps/erc721/includes/model/erc721token.js';
rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc721/includes/model/interface/erc721token-contractinterface.js');
//import '../../imports/dapps/erc721/includes/model/interface/erc721token-contractinterface.js';
rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc721/includes/model/interface/erc721token-localpersistor.js');
//import '../../imports/dapps/erc721/includes/model/interface/erc721token-localpersistor.js';

dappsscriptloader.load_scripts(function() {
	rootscriptloader.signalEvent('on_dapps_module_load_end');
});


