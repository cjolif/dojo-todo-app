require(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/loader"], function(dojo, lang){
	var path = window.location.pathname;
	if (path.charAt(path.length) != "/") {
		path = path.split("/");
		path.pop();
		path = path.join("/");
	}
	dojo.registerModulePath("app", path);

	var configurationFile = "./config-phone.json"
	if(window.screen.width > 600){
		configurationFile = "./config-tablet.json"
		window.isTablet = true; // set device to tablet.
	}

	var requireModules = ["dojo", "dojox/app/main", "dojox/json/ref", "dojo/_base/connect"];
	requireModules.push("dojo/text!"+configurationFile);
	if(window.isTablet){
		requireModules.push("./script/tablet/configuration.js");
	}

	require(requireModules, function(dojo, Application, jsonRef, connect, config){
		app = Application(jsonRef.fromJson(config));
	});
});
