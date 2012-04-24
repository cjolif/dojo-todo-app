define(["dojo/dom", "dijit/registry", "dojox/mobile/TransitionEvent"], 
function(dom, registry, TransitionEvent){
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
