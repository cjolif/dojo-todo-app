define(["dojo/dom", "dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dojo/Deferred", "dojo/when", "dijit/registry", "dojox/mvc/at", 
        "dojox/mvc/EditStoreRefListController", "dojox/mvc/getStateful", 
        "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent", "dojox/mobile/CheckBox"],
function(dom, lang, dom, dstyle, Deferred, when, registry, at, EditStoreRefListController, getStateful, itemfilewritestore, datastore, TransitionEvent){
	window.at = at;	// set global namespace for dojox.mvc.at
	dojox.debugDataBinding = false;	//disable dojox.mvc data binding debug

	//set todoApp showItemDetails function
	todoApp.cachedDataModel = {};
	todoApp.currentItemListModel = null;

	todoApp.showItemDetails = function(index){
		console.log("in items/lists select item ", index);
		todoApp.selected_item = index;
		itemlistmodel.set("cursorIndex",index);
	};

	// delete "items-for-2.json" because the generate item id not consist with the data file parent id.
	var dataFile = ["items-for-0.json", "items-for-1.json"];
	var listsmodel = null;
	var itemlistmodel = null;
	var completedmodel = null;

	var showListData = function(datamodel){
		console.log("in items/lists showListData datamodel =", datamodel);
		var listWidget = registry.byId("items_list");
		// if the datamodel is empty, view not refreshed by set("children", datamodel)
		// what expect is the view refresh and display empty.
		var datamodel = at(datamodel, 'model');
		listWidget.set("children", datamodel);		
	};

	var checkForCompleted = function(){
		console.log("in items/lists checkForCompleted ");
		var model = itemlistmodel.model;
		if(todoApp.selected_configuration_item == -1){
			model = completedmodel.model;
			for(var a = model, i = a.length-1; i >= 0 ; i--){
				if(!a[i].completed){
						moveFromComplete(completedmodel.model, itemlistmodel.model, i, false);						
				} 
			}
		}else{
			for(var a = model, i = a.length-1; i >= 0 ; i--){
				if(a[i].completed){
						moveToComplete(itemlistmodel.model, completedmodel.model, i, true);						
				} 
			}				
		}
	};

	var showListType = function(){
		console.log("in items/lists showListType ");
		var type;
		if(todoApp.selected_configuration_item == -1){
			type = "Completed";			
			//dstyle.set(dom.byId("addNewItemUl"), 'visibility', 'hidden'); // hide the new item link
			dstyle.set(dom.byId("addNewItemUl"), 'display', 'none'); // hide the new item link
		}else{
			//dstyle.set(dom.byId("addNewItemUl"), 'visibility', ''); // show the new item link			
			dstyle.set(dom.byId("addNewItemUl"), 'display', ''); // hide the new item link
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
		//console.log("in items/lists isFileExist filename =", filename);
		for(var file in files){
			if(filename.indexOf(files[file]) > 0){
				return true;
			}
		}
		return false;
	};

	// called when an item is completed
	moveToComplete = function(fromModel, toModel, i, value) {
		console.log("****in items/lists moveToComplete value = ",value);
		var t = fromModel.splice(i, 1);
		t[0].set("completed", value);
		toModel.push(t[0]);
	};

	// called when a completed items is unchecked
	moveFromComplete = function(fromModel, toModel, i, value) {
		console.log("****in items/lists moveFromComplete value = ",value);
		var t = fromModel.splice(i, 1);
		t[0].set("completed", value);
		toModel = todoApp.cachedDataModel[t[0].get('parentId')].model;
		toModel.push(t[0]);
	};

	return {
		init: function(){
			console.log("****in items/lists init ");
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
			console.log("items/lists beforeActivate called ",this.loadedModels.itemlistmodel);
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;
			completedmodel = this.loadedModels.completedmodel;
			this.refreshData();
		},

		afterDeactivate: function(){
			console.log("items/lists afterDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
		},
	
		beforeDeactivate: function(){
			console.log("items/lists beforeDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
			var model = itemlistmodel.model;
			if(todoApp.selected_configuration_item == -1){
				model = completedmodel.model;
				for(var a = model, i = 0; i < a.length; i++){
					if(!a[i].completed){
						//	window.setTimeout(todoApp.moveFromComplete(completedmodel.model, itemlistmodel.model, i, false), 500);						
							moveFromComplete(completedmodel.model, itemlistmodel.model, i, false);						
					} 
				}
			}else{
				for(var a = model, i = 0; i < a.length; i++){
					if(a[i].completed){
						//	window.setTimeout(todoApp.moveToComplete(itemlistmodel.model, completedmodel.model, i, true), 500);						
							moveToComplete(itemlistmodel.model, completedmodel.model, i, true);						
					} 
				}				
			}
		},
	
		refreshData: function(){
			console.log("****in items/lists refreshData ");
			checkForCompleted();
			showListType();
			if(todoApp.selected_configuration_item == -1){
				showListData(completedmodel);
				todoApp.currentItemListModel = completedmodel;
				// when show completed need to un-select the other list.
				//this.loadedModels.listsmodel
				for(var i in this.loadedModels.listsmodel.model){
					if(this.loadedModels.listsmodel.model[i].Checked){
						this.loadedModels.listsmodel.model[i].set("Checked", false);
					}
				}
				return;
			}
	
			var select_data = listsmodel.model[todoApp.selected_configuration_item];
			// get data model in cache
			if(todoApp.cachedDataModel[select_data.id]){ // read data from cache
				console.log("****in items/lists refreshData data was found in the cache");
				this.loadedModels.itemlistmodel = todoApp.cachedDataModel[select_data.id];
				showListData(this.loadedModels.itemlistmodel);
				todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
				itemlistmodel = this.loadedModels.itemlistmodel;
				listsmodel = this.loadedModels.listsmodel;
				completedmodel = this.loadedModels.completedmodel;
				return;
			}else if(!isFileExist(select_data.itemsurl, dataFile)){
				// create in-memory store if the file not exists
				// TODO: use the exists file in an array in this demo.
				console.log("****in items/lists refreshData data was not found in the cache and");
				console.log("file not exist.", select_data.itemsurl);
				var tempStore = new dojo.store.Memory({
					"data": []
				});
				listCtln = new EditStoreRefListController({store: tempStore, cursorIndex: 0});
				when(listCtln.queryStore(), lang.hitch(this, function(datamodel){
					this.loadedModels.itemlistmodel = listCtln;
					todoApp.cachedDataModel[select_data.id] = listCtln;
					todoApp.currentItemListModel = this.loadedModels.itemlistmodel;

					itemlistmodel = listCtln;
					listsmodel = this.loadedModels.listsmodel;
					completedmodel = this.loadedModels.completedmodel;
					
					showListData(listCtln);
				}));
			}else{ // load data model from data file
				console.log("****in items/lists refreshData in else load data model from file");
				var writestore = new itemfilewritestore({
					url: select_data.itemsurl
				});
				var listCtl = new EditStoreRefListController({store: new datastore({store: writestore}), cursorIndex: 0});
				when(listCtl.queryStore(), lang.hitch(this, function(datamodel){
					var listId = datamodel[0].parentId;
					if(listId == todoApp.selected_configuration_item){
						this.loadedModels.itemlistmodel = listCtl;
						todoApp.cachedDataModel[listId] = listCtl;
						todoApp.currentItemListModel = this.loadedModels.itemlistmodel;

						itemlistmodel = listCtl;
						listsmodel = this.loadedModels.listsmodel;
						completedmodel = this.loadedModels.completedmodel;
						
						showListData(listCtl);
					}
				}));
			}	
		}
	};
});
