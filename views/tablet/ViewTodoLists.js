define(["dojo/_base/lang", "dijit/registry", "dojox/mobile/TransitionEvent"],
function(lang, registry, TransitionEvent){
	this.app.stopTransition = false;

	selectItems = function(node, index){
		//if (this.app.selected_configuration_item == index) {
		//	return;
		//}
		this.app.selected_configuration_item = index;

		// Solution 1:
		// Refresh list data by transition from "items,ViewListTodoItemsByPriority" to "items,ViewListTodoItemsByPriority". It's a liiter trick here.
		// transition to the "items,ViewListTodoItemsByPriority" view, Do Not record the history.
		// Advantage: Reuse the phone version
		// Disadvantage: low effectiveness
		this.app.trigger("transition", {"viewId": "items,ViewListTodoItemsByPriority"});
		this.app.stopTransition = true;

		// Solution 2:
		// Reset the data model, and bind data model to list view
		// Advantage: high effectiveness
		// Disadvantage: need to add code special for tablet
	};

	var editConfiguration = function(){
		// publish transition event
		var transOpts = {
			title: "Edit",
			target: "configuration,ModifyTodoLists",
			url: "#configuration,ModifyTodoLists"
		};
		var e = window.event;
		new TransitionEvent(e.srcElement,transOpts,e).dispatch();
	};
	
	return {
		init: function(){
			registry.byId("setting").on("click", lang.hitch(this, function(e){
				editConfiguration();
			}));
			console.log("navigation view init ok");
		}
	};
});
