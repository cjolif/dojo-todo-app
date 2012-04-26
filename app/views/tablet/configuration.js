define(["dojo/dom", "dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent", "dojox/mobile/ListItem", "dojox/mvc/Repeat"], 
function(dom, registry, at, TransitionEvent){
	window.at = at;	// set global namespace for dojox.mvc.at
	dojox.debugDataBinding = true;	//disable dojox.mvc data binding debug
	todoApp.selectItems = function(node, index){
		if (todoApp.selected_configuration_item == index) {
			return;
		}
		todoApp.selected_configuration_item = index;

		// publish transition event
		var transOpts = {
			title:"List",
			target:"items,list",
			url: "#items,list"
		};
		var e = window.event;
		new TransitionEvent(e.srcElement,transOpts,e).dispatch();
	};

	todoApp.editConfiguration = function(){
		// publish transition event
		var transOpts = {
			title:"Edit",
			target:"configuration,configure_edit",
			url: "#configuration,configure_edit"
		};
		var e = window.event;
		new TransitionEvent(e.srcElement,transOpts,e).dispatch();
	};
});
