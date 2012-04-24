define(["dojo/dom", "dojo/_base/lang", "dijit/registry", "dojox/mvc", "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"],
function(dom, lang, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	//set todoApp showItemDetails function
	todoApp.cachedDataModel = {};
	todoApp.currentItemListModel = null;

	todoApp.showItemDetails = function(index){
		console.log("select item ", index);
		todoApp.selected_item = index;
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
		var index = datamodel.length;
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
				var datamodel = mvc.newStatefulModel({
					"store": tempStore
				});
				this.loadedModels.itemlistmodel = datamodel;
				todoApp.cachedDataModel[select_data.id.data] = datamodel;
				todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
				
				this.showListData(datamodel);
			}else{ // load data model from data file
				var writeStroe = new itemfilewritestore({
					url: select_data.itemsurl
				});
				var modelPromise = mvc.newStatefulModel({
					store: new datastore({
						store: writeStroe
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
			}	
		}
	};
});
