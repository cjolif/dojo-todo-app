require(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/loader"], function(dojo, lang){
	window.todoApp = {};
	todoApp.selected_item = "-1";
	todoApp.selected_configuration_item = 0;

	var configurationFile = "./config-phone.json"
	if(window.innerWidth > 600){
		configurationFile = "./config-tablet.json"
		todoApp.isTablet = true;
	}

	var requireModules = ["dojo", "dojox/app/main", "dojox/json/ref", "dojo/_base/connect"];
	requireModules.push("dojo/text!"+configurationFile);
	if(window.isTablet){
		requireModules.push("./views/tablet/configuration.js");
	}

	require(requireModules, function(dojo, Application, jsonRef, connect, config){
		app = Application(jsonRef.fromJson(config));
	});
});
