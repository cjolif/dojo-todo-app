require(["dojox/app/main", "dojox/json/ref", "dojo/sniff"],
	function(Application, json, has){
	var isTablet = false;
	var configurationFile = "./config.json";
	if(window.innerWidth > 600){
		isTablet = true;
	}
	require(["dojo/text!"+configurationFile], function(configJson){
		has.add("tablet", isTablet);
		has.add("phone", !isTablet);
		has.add("ie9orLess", has("ie") && !has("ie") >= 10);
		has.add("notie9orLess", !has("ie") || has("ie") >= 10);
		var config = json.fromJson(configJson);
		Application(config);
	});
});
