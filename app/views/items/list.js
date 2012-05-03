define(["dojo/dom", "dojo/_base/lang", "dojo/dom-style", "dojo/Deferred", "dojo/when", "dijit/registry", "dojox/mvc/at",
        "dojox/mvc/EditStoreRefListController", "dojox/mvc/getStateful", 
        "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"],
function(dom, lang, dstyle, Deferred, when, registry, at, EditStoreRefListController, getStateful, itemfilewritestore, datastore, TransitionEvent){
	window.at = at;	// set global namespace for dojox.mvc.at
	dojox.debugDataBinding = false;	//disable dojox.mvc data binding debug

	//set todoApp showItemDetails function
	todoApp.cachedDataModel = {};
	todoApp.currentItemListModel = null;

	todoApp.showItemDetails = function(index){
		//console.log("in items/lists select item ", index);
		todoApp.selected_item = index;
		itemlistmodel.set("cursorIndex",index);
	};

	// delete "items-for-2.json" because the generate item id not consist with the data file parent id.
	var dataFile = ["items-for-0.json", "items-for-1.json"];
	var listsmodel = null;
	var itemlistmodel = null;
	var completedmodel = null;

	var showListData = function(datamodel){
		var listWidget = registry.byId("items_list");
		var datamodel = at(datamodel, 'model');
		listWidget.set("children", datamodel);		
	};

	var checkForCompleted = function(){
		//console.log("in items/lists checkForCompleted ");
		var model = itemlistmodel.model;
		if(todoApp.selected_configuration_item == -1){
			model = completedmodel.model;
			for(var a = model, i = a.length-1; i >= 0 ; i--){
				if(!a[i].completed){
					var toModel = todoApp.cachedDataModel[a[i].get('parentId')].model;
					moveItem(completedmodel.model, toModel, i); // move from complete
				} 
			}
		}else{
			for(var a = model, i = a.length-1; i >= 0 ; i--){
				if(a[i].completed){
						moveItem(itemlistmodel.model, completedmodel.model, i); // move to complete					
				} 
			}				
		}
	};

	var showListType = function(){
		//console.log("in items/lists showListType ");
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

	// called to move an item from one list to another
	moveItem = function(fromModel, toModel, i) {
		sel = parseInt(todoApp.selected_item);
		if(sel == i){ // don't move it if it is being edited
			return;  
		}
		if(sel > i){ // need to adjust selected_item if remove one before it in model
			todoApp.selected_item--;
		}
		var t = fromModel.splice(i, 1);
		toModel.push(t[0]);
	};

	return {
		init: function(){
			//console.log("****in items/lists init ");
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
			//console.log("items/lists beforeActivate called ",this.loadedModels.itemlistmodel);
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;
			completedmodel = this.loadedModels.completedmodel;
			todoApp.selected_item = "-1"; // reset selected item
			this.refreshData();
		},

		afterDeactivate: function(){
			//console.log("items/lists afterDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
		},

		beforeDeactivate: function(){
			//console.log("items/lists beforeDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
			// tablet cannot distinguish moveFromComplete or moveToComplete, so need to move both data
			var model;
			if(todoApp.isTablet){
				model = completedmodel.model;
				for(var a = model, i = a.length-1; i >= 0 ; i--){
					if(!a[i].completed){
						var toModel = todoApp.cachedDataModel[a[i].get('parentId')].model;
						moveItem(completedmodel.model, toModel, i); // move from complete
					}
				}

				model = itemlistmodel.model;
				for(var a = model, i = a.length-1; i >= 0 ; i--){
					if(a[i].completed){						
						moveItem(itemlistmodel.model, completedmodel.model, i); // move to complete
					}
				}
				return;
			}

			// for phone
			if(todoApp.selected_configuration_item == -1){
				model = completedmodel.model;
				for(var a = model, i = a.length-1; i >= 0 ; i--){
					if(!a[i].completed){
						var toModel = todoApp.cachedDataModel[a[i].get('parentId')].model;
						moveItem(completedmodel.model, toModel, i); // move from complete
					}
				}
			}else{
				model = itemlistmodel.model;
				for(var a = model, i = a.length-1; i >= 0 ; i--){
					if(a[i].completed){
						moveItem(itemlistmodel.model, completedmodel.model, i); // move to complete
					}
				}				
			}
		},
	
		refreshData: function(){
			//console.log("****in items/lists refreshData ");
			showListType();
			if(todoApp.selected_configuration_item == -1){
				showListData(completedmodel);
				todoApp.currentItemListModel = completedmodel;
				// when show completed need to un-select the other list.
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
				//console.log("****in items/lists refreshData data was found in the cache");
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
				//console.log("****in items/lists refreshData data was not found in the cache and");
				//console.log("file not exist.", select_data.itemsurl);
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
				//console.log("****in items/lists refreshData in else load data model from file");
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
