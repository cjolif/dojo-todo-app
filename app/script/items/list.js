define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc","dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"], 
	function(dom, connect, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	return {
		init: function(){
			// override ListItem onClick event
			function showItemDetails(node, index, e){
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

			if(!window.selected_configuration_item){
				window.selected_configuration_item = 0;
			}

			var select_data = app.loadedModels.listsmodel[window.selected_configuration_item];
			var writeStroe = new itemfilewritestore({url: select_data.itemsurl.data});
			app.loadedModels.itemlistsmodel = []; // cache the loaded model in array

			var modelPromise = mvc.newStatefulModel({store: new datastore({store: writeStroe})});
			modelPromise.then(dojo.hitch(this, function(datamodel){
				var listId = datamodel[0].parentId.data;
				if(listId == window.selected_configuration_item){
					console.log("in list init, create data model.", datamodel);
					this.loadedModels.itemlistmodel = datamodel;
					app.loadedModels.itemlistmodel = datamodel;
					app.loadedModels.itemlistsmodel[listId] = datamodel;

					var widget = registry.byId("itemlist_repeat");
					widget.ref = null;
					widget.set("ref", datamodel);
				}
			}));

			connect.connect(dom.byId('items_list_edit'), 'click', dojo.hitch(this, function(e){
				console.log(this, e);
				var datamodel = this.loadedModels.itemlistmodel;
				var node = e.srcElement;
				var transOpts = {
					title:"List Edit",
					target:"items,list_edit",
					url: "#items,list_edit"
				};
				new TransitionEvent(node,transOpts,e).dispatch();
			}));
		},

		activate: function(){
			var select_data = app.loadedModels.listsmodel[window.selected_configuration_item];
			if(app.loadedModels.itemlistsmodel[select_data.id.data]){ // read data from cache
				app.loadedModels.itemlistmodel = app.loadedModels.itemlistsmodel[select_data.id.data];

				var widget = registry.byId("itemlist_repeat");
				widget.ref = null;
				widget.set("ref", app.loadedModels.itemlistmodel);
				return;
			}

			// not in cache, load data model from data file
			var writeStroe = new itemfilewritestore({url: select_data.itemsurl.data});
			var modelPromise = mvc.newStatefulModel({store: new datastore({store: writeStroe})});
			modelPromise.then(dojo.hitch(this, function(datamodel){
				var listId = datamodel[0].parentId.data;
				if(listId == window.selected_configuration_item){
					app.loadedModels.itemlistmodel = datamodel;
					app.loadedModels.itemlistsmodel[listId] = datamodel;

					var widget = registry.byId("itemlist_repeat");
					widget.ref = null;
					widget.set("ref", datamodel);
				}
			}));
		},

		deactivate: function(){
		}
	}
});
