define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc","dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"], 
	function(dom, connect, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	return {
		init: function(){
			var widget = registry.byId("item_detailsGroup");
			widget.ref = null;
			widget.set("ref", app.loadedModels.itemlistmodel[window.selected_item]);
		},

		activate: function(){
			var widget = registry.byId("item_detailsGroup");
			widget.ref = null;
			widget.set("ref", app.loadedModels.itemlistmodel[window.selected_item]);
		},

		deactivate: function(){
			console.log("details view deactivate");
		}
	}
});
