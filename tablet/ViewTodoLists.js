define(["dojo/_base/lang", "dijit/registry", "dojox/mobile/TransitionEvent"], function(lang, registry, TransitionEvent){

	var app = null;

	selectItems = function(index){
		//if(app.selected_configuration_item == index){
		//	return;
		//}
		app.selected_configuration_item = index;

		// Solution 1:
		// Refresh list data by transition from "items,ViewListTodoItemsByPriority" to "items,ViewListTodoItemsByPriority". It's a liiter trick here.
		// transition to the "items,ViewListTodoItemsByPriority" view, Do Not record the history.
		// Advantage: Reuse the phone version
		// Disadvantage: low effectiveness
		app.emit("app-transition", {"viewId": "items,ViewListTodoItemsByPriority"});
		app.stopTransition = true;

		// Solution 2:
		// Reset the data model, and bind data model to list view
		// Advantage: high effectiveness
		// Disadvantage: need to add code special for tablet
	};

	var editConfiguration = function(e){
		// publish transition event
		var transOpts = {
			title: "Edit",
			target: "configuration,ModifyTodoLists",
			url: "#configuration,ModifyTodoLists"
		};
		new TransitionEvent(e.target,transOpts,e).dispatch();
	};
	
	return {
		init: function(){
			app = this.app;
			registry.byId("setting").on("click", editConfiguration);
		}
	};
});
