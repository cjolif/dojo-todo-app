define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"], 
function(dom, connect, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	return {
		init: function(){
			this.refresh();
		},

		activate: function(){
			this.refresh();
		},

		deactivate: function(){
		},

		refresh: function(){
			var widget = registry.byId("item_detailsGroup");
			widget.ref = null;
			widget.set("ref", app.loadedModels.itemlistmodel[window.selected_item]);
		}
	}
});
