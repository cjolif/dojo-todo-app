require(["dojox/app/main", "dojox/json/ref", "dojo/sniff"],
	function(Application, json, has){
	var isTablet = false;
	var configurationFile = "./config.json";
	var width = window.innerWidth || document.documentElement.clientWidth;
	if(width > 600){
		isTablet = true;
	}
	require(["dojo/text!"+configurationFile], function(configJson){
		has.add("phone", !isTablet);
		has.add("ie9orLess", has("ie") && (has("ie") <= 9));
		var config = json.fromJson(configJson);
		Application(config);
	});
});
