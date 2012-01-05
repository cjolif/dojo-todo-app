define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc","dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"], 
	function(dom, connect, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	return {
		// delete "items-for-2.json" because the generate item id not consist with the data file parent id.
		dataFile: ["items-for-0.json", "items-for-1.json"],

		init: function(){
			// override ListItem onClick event
			function showItemDetails(node, index, e){
				window.selected_item = index;

				// publish transition event
				node.select();
				var transOpts = {
					title:"Details",
					target:"details,detail",
					url: "#details,detail"
				};
				new TransitionEvent(node.domNode,transOpts,e).dispatch();
			};
			window.showItemDetails = showItemDetails;

			// show data
			if(!window.selected_configuration_item){
				window.selected_configuration_item = 0;
			}
			app.loadedModels.itemlistsmodel = []; // initial the cache models
			this.showData();

			// connect edit button
			connect.connect(dom.byId('items_list_edit'), "click", function(){
				var transOpts = {
					title:"List Edit",
					target:"items,list_edit",
					url: "#items,list_edit"
				};
				var e = window.event;
				new TransitionEvent(e.srcElement,transOpts,e).dispatch();
			});
		},

		showData: function(){
			var select_data = app.loadedModels.listsmodel[window.selected_configuration_item];
			// get data model in cache
			if(app.loadedModels.itemlistsmodel[select_data.id.data]){ // read data from cache
				app.loadedModels.itemlistmodel = app.loadedModels.itemlistsmodel[select_data.id.data];

				var widget = registry.byId("itemlist_repeat");
				widget.ref = null;
				widget.set("ref", app.loadedModels.itemlistmodel);
				return;
			}
			// create in-memory store if the file not exists
			// TODO: use the exists file in an array in this demo.
			else if(!isFileExist(select_data.itemsurl.data, this.dataFile)){
				console.log("file not exist.", select_data.itemsurl.data);
				var tempStore = new dojo.store.Memory({ "data" : []});
				var datamodel = mvc.newStatefulModel({
					"store": tempStore
				});
				app.loadedModels.itemlistmodel = datamodel;
				app.loadedModels.itemlistsmodel[select_data.id.data] = datamodel;

				var widget = registry.byId("itemlist_repeat");
				widget.ref = null;
				widget.set("ref", datamodel);
			}
			// load data model from data file
			else{
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
			};

			function isFileExist(filename, files){
				for(var file in files){
					if(filename.indexOf(files[file]) > 0){
						return true;
					}
				}
				return false;
			};
		},

		activate: function(){
			this.showData();
		},

		deactivate: function(){
		}
	}
});
