define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc","dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"], 
	function(dom, connect, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	return {
		init: function(){
			// override ListItem onClick event
			function showItemDetails(node, index, e){
				// console.log(node, index, e);
				window.selected_item = index;

				// publish transition event
				node.select();
				var transOpts = {
					title:"Details",
					target:"details",
					url: "#details"
				};
				new TransitionEvent(node.domNode,transOpts,e).dispatch();
			};
			window.showItemDetails = showItemDetails;
			var select_data = app.loadedModels.listsmodel[window.selected_configuration_item];
			var writeStroe = new itemfilewritestore({url: select_data.itemsurl.data});
			var modelPromise = mvc.newStatefulModel({store: new datastore({store: writeStroe})});
			modelPromise.then(dojo.hitch(this, function(datamodel){
				var listId = datamodel[0].parentId;
				if(listId == window.selected_configuration_item){
					console.log("in init, create data model.", datamodel);
					this.loadedModels.listmodel = datamodel;
					var widget = registry.byId("list_repeat");
					widget.set("ref", datamodel);
				}
			}));
		},

		activate: function(){
			var select_data = app.loadedModels.listsmodel[window.selected_configuration_item];
			var writeStroe = new itemfilewritestore({url: select_data.itemsurl.data});
			var modelPromise = mvc.newStatefulModel({store: new datastore({store: writeStroe})});
			modelPromise.then(dojo.hitch(this, function(datamodel){
				var listId = datamodel[0].parentId;
				if(listId == window.selected_configuration_item){
					console.log("in init, create data model.", datamodel);
					this.loadedModels.listmodel = datamodel;
					var widget = registry.byId("list_repeat");
					widget.set("ref", datamodel);
				}
			}));
		},

		deactivate: function(){
			// console.log("list view deactivate, unbind data to list view");
		}
	}
});
