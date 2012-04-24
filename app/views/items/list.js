define(["dojo/dom", "dojo/_base/lang", "dijit/registry", "dojox/mvc/at", 
        "dojox/mvc/EditStoreRefListController", "dojox/mvc/getStateful", 
        "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent", "dojox/mobile/CheckBox"],
function(dom, lang, registry, at, EditStoreRefListController, getStateful, itemfilewritestore, datastore, TransitionEvent){
	window.at = at;	// set global namespace for dojox.mvc.at
	dojox.debugDataBinding = true;	//disable dojox.mvc data binding debug

	//set todoApp showItemDetails function
	todoApp.cachedDataModel = {};
	todoApp.currentItemListModel = null;

	todoApp.showItemDetails = function(index){
		console.log("select item ", index);
		todoApp.selected_item = index;
		itemlistmodel.set("cursorIndex",index);
	};

	// delete "items-for-2.json" because the generate item id not consist with the data file parent id.
	var dataFile = ["items-for-0.json", "items-for-1.json"];
	var listsmodel = null;
	var itemlistmodel = null;
	var completedmodel = null;

	var _addNewItem = function(node){
		console.log(node.value);
		var datamodel = app.loadedModels.itemlistmodel;
		var parentId;
		try{
			parentId = datamodel[0].parentId.data;
		}catch (e){
			console.log("Warning: itemlistmodel is empty, get parentId from listsmodel");
			parentId = app.loadedModels.listsmodel[window.selected_configuration_item].id.data;
		}
/*		var index = datamodel.length;
		var insert = mvc.newStatefulModel({
			"data": {
				"id": (new Date().getTime()),
				"parentId": parentId,
				"title": node.value,
				"notes": "To do",
				"due": "2010-10-15T11:03:47.681Z",
				"completionDate": "",
				"reminder": "2010-10-15T11:03:47.681Z",
				"repeat": 0,
				"priority": 0,
				"hidden": false,
				"completed": false,
				"deleted": false
			}
		});
		
		datamodel.add(index, insert);
*/
			var data = {
				"id": (new Date().getTime()),
				"parentId": parentId,
				"title": node.value,
				"notes": "To do",
				"due": "2010-10-15T11:03:47.681Z",
				"completionDate": "",
				"reminder": "2010-10-15T11:03:47.681Z",
				"repeat": 0,
				"priority": 0,
				"hidden": false,
				"completed": false,
				"deleted": false
			};

			datamodel.push(new getStateful(data));
			//var r = registry.byId("repeat");
			//r.performTransition("repeatdetails", 1, "none");
			//setDetailsContext(repeatmodel.length-1);

		
		datamodel.commit(); //need to commit after delete. TODO: need to enhance the performance
		//update cache
		app.loadedModels.cacheModel[parentId] = datamodel;
		//refresh view
		window.showData(datamodel);
	};

	var showListData = function(datamodel){
		var listWidget = registry.byId("items_list");
		listWidget.set('ref', datamodel);
	};

	var showListType = function(){
		var type;
		if(todoApp.selected_configuration_item == -1){
			type = "Completed";
		}else{
			var listdata = listsmodel.model[todoApp.selected_configuration_item];
			if(listdata && listdata.title){
				type = listdata.title;
			}else{
				type = "Unknown";
			}
		}
		dom.byId('list_type').innerHTML = type;
	};

	var isFileExist = function(filename, files){
		for(var file in files){
			if(filename.indexOf(files[file]) > 0){
				return true;
			}
		}
		return false;
	};

	completeConverter = {
			format: function(value){
				console.log("****in completeConverter format value = "+value);
				console.log("****in completeConverter format this.target.id = "+this.target.id);
				console.log(this.target);							
				return value;
			},
			parse: function(value){
				console.log("****in completeConverter parse value = "+value);
				console.log("****in completeConverter parse this.target.id = "+this.target.id);						
				console.log(this.target);
				var model = completedmodel.model;
				if(value){
					model = itemlistmodel.model;
				}
				for(var a = model, i = 0; i < a.length; i++){
					if(a[i].id == this.target.id){
						if(value){ // remove from list and move to completed
							window.setTimeout(moveToComplete(itemlistmodel.model, completedmodel.model, i, value), 500);						
						}else{
							window.setTimeout(moveFromComplete(completedmodel.model, itemlistmodel.model, i, value), 500);						
						}
					} 
				}
				//throw new Error(); // Stop copying the new value for unchecked case
				if(!value){ throw new Error(); } // Stop copying the new value for unchecked case						
				return value;
			}					
	};

	// called when an item is completed
	moveToComplete = function(fromModel, toModel, i, value) {
		console.log("****in moveToComplete value = "+value);
		var t = fromModel.splice(i, 1);
		t[0].set("completed", value);
		toModel.push(t[0]);
	};

	// called when a completed items is unchecked
	moveFromComplete = function(fromModel, toModel, i, value) {
		console.log("****in moveFromComplete value = "+value);
		var t = fromModel.splice(i, 1);
		t[0].set("completed", value);
		toModel = listsCtrls[t[0].get('parentId')].model;
		toModel.push(t[0]);
	};

	return {
		init: function(){
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;
			completedmodel = this.loadedModels.completedmodel;

			if (itemlistmodel && (itemlistmodel.model[0].parentId || 0 == itemlistmodel.model[0].parentId)) {
				var index = itemlistmodel.model[0].parentId;
				todoApp.cachedDataModel[index] = itemlistmodel;
				todoApp.currentItemListModel = itemlistmodel;
			}
		},

		beforeActivate: function(){
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;
			completedmodel = this.loadedModels.completedmodel;
			this.refreshData();
		},
	
		refreshData: function(){
			showListType();
			if(todoApp.selected_configuration_item == -1){
				showListData(completedmodel.model);
				todoApp.currentItemListModel = completedmodel;
				return;
			}
	
			var select_data = listsmodel.model[todoApp.selected_configuration_item];
			// get data model in cache
			if(todoApp.cachedDataModel[select_data.id]){ // read data from cache
				this.loadedModels.itemlistmodel = todoApp.cachedDataModel[select_data.id];
				showListData(this.loadedModels.itemlistmodel.model);
				todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
				return;
			}else if(!isFileExist(select_data.itemsurl, dataFile)){
				// create in-memory store if the file not exists
				// TODO: use the exists file in an array in this demo.
				console.log("file not exist.", select_data.itemsurl);
				var tempStore = new dojo.store.Memory({
					"data": []
				});
				listCtln = new EditStoreRefListController({store: tempStore, cursorIndex: 0});
				when(listCtln.queryStore(), function(datamodel){
					this.loadedModels.itemlistmodel = datamodel;
					todoApp.cachedDataModel[select_data.id.data] = datamodel;
					todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
					
					this.showListData(datamodel);
				});
/*				var datamodel = mvc.newStatefulModel({
					"store": tempStore
				});
				this.loadedModels.itemlistmodel = datamodel;
				todoApp.cachedDataModel[select_data.id.data] = datamodel;
				todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
				
				this.showListData(datamodel);
*/				
			}else{ // load data model from data file
				var writestore = new itemfilewritestore({
					url: select_data.itemsurl
				});
				var listCtl = new EditStoreRefListController({store: new datastore({store: writestore}), cursorIndex: 0});
				when(listCtl.queryStore(), dojo.hitch(this, function(datamodel){
					var listId = datamodel[0].parentId.data;
					if(listId == todoApp.selected_configuration_item){
						this.loadedModels.itemlistmodel = datamodel;
						todoApp.cachedDataModel[listId] = datamodel;
						todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
						
						this.showListData(datamodel);
					}
				}));

/*				var modelPromise = mvc.newStatefulModel({
					store: new datastore({
						store: writestore
					})
				});
				modelPromise.then(dojo.hitch(this, function(datamodel){
					var listId = datamodel[0].parentId.data;
					if(listId == todoApp.selected_configuration_item){
						this.loadedModels.itemlistmodel = datamodel;
						todoApp.cachedDataModel[listId] = datamodel;
						todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
						
						this.showListData(datamodel);
					}
				}));
*/				
			}	
		}
	};
});
