require(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/loader"], function(dojo, lang){
	window.todoApp = {};
	todoApp.selected_item = 0;
	todoApp.selected_configuration_item = 0;
	
	var configurationFile = "config-phone.json"
	console.log("configuration file: "+configurationFile);

	require(["dojox/app/main", "dojox/json/ref", "dojo/text!./"+configurationFile],
	function(Application, jsonRef, config){
		app = Application(jsonRef.fromJson(config));
	});
});
