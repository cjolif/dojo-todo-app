require(["dojox/mobile/ProgressIndicator", "dojox/app/main", "dojox/json/ref"],
	function(ProgressIndicator, Application, json){
	window.todoApp = {};
	// the default select_item is 0, or will throw an error if directly transition to #details,EditTodoItem view
	todoApp.selected_item = 0;
	todoApp.selected_configuration_item = 0;
	todoApp.progressIndicator = null;

	var configurationFile = "./config-phone.json";
	if(window.innerWidth > 600){
		configurationFile = "./config-tablet.json";
		todoApp.isTablet = true;
	}

	require(["dojo/text!"+configurationFile], function(config){
		Application(json.fromJson(config));
	});
	
	/*
	 * show or hide global progress indicator
	 */
	todoApp.showProgressIndicator = function(show){
		if(!todoApp.progressIndicator){
			todoApp.progressIndicator = ProgressIndicator.getInstance({removeOnStop:false, startSpinning:true, size:40, center:true, interval:30});
			// TODO: use dojo.body will throw no appendChild method error.
			var body = document.getElementsByTagName("body")[0];
			body.appendChild(todoApp.progressIndicator.domNode);
			todoApp.progressIndicator.domNode.style.zIndex = 999;
		}
		if(show){
			todoApp.progressIndicator.domNode.style.visibility = "visible";
			todoApp.progressIndicator.start();
		}else{
			todoApp.progressIndicator.stop();
			todoApp.progressIndicator.domNode.style.visibility = "hidden";
		}
	};
});
