define(["dojo/dom", "dojo/_base/lang", "dojo/dom-style", "dojo/Deferred", "dojo/when", "dijit/registry", "dojox/mvc/at",
        "dojox/mvc/EditStoreRefListController", "dojox/mvc/getStateful", 
        "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"],
function(dom, lang, dstyle, Deferred, when, registry, at, EditStoreRefListController, getStateful, ItemFileWriteStore, DataStore, TransitionEvent){
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

	var listsmodel = null;
	var itemlistmodel = null;

	var showListData = function(datamodel){
		console.log("in showListData datamodel = ",datamodel);
		var listWidget = registry.byId("itemsDate_list");
		var datamodel = at(datamodel, 'model');
		listWidget.set("children", datamodel);		
	};

	var showListType = function(){
		//console.log("in items/lists showListType ");
		var type;
		if(todoApp.selected_configuration_item == -1){
			type = "Completed";			
			//dstyle.set(dom.byId("addNewItemDateUl"), 'visibility', 'hidden'); // hide the new item link
			dstyle.set(dom.byId("addNewItemDateUl"), 'display', 'none'); // hide the new item link
		}else{
			//dstyle.set(dom.byId("addNewItemDateUl"), 'visibility', ''); // show the new item link			
			dstyle.set(dom.byId("addNewItemDateUl"), 'display', ''); // hide the new item link
			var listdata = listsmodel.model[todoApp.selected_configuration_item];
			if(listdata && listdata.title){
				type = listdata.title;
			}else{
				type = "Unknown";
			}
		}
		dom.byId('list_type').innerHTML = type;
	};

	return {
		init: function(){
			//console.log("****in items/lists init ");
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;

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
			todoApp.selected_item = 0; // reset selected item to 0, -1 is out of index
			this.refreshData();
		},

		afterDeactivate: function(){
			//console.log("items/lists afterDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
		},

		beforeDeactivate: function(){
			console.log("items/lists beforeDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
			itemlistmodel.commit();
		},
	
		refreshData: function(){
			console.log("****in items/lists refreshData ");
			showListType();
			
			var select_data = listsmodel.model[todoApp.selected_configuration_item];
			var query = {};
			var options = {sort:[{attribute:"reminderDate", descending: true}]};
			if(todoApp.selected_configuration_item == -1){
	//			query["completed"] = true;
				if(registry.byId("configure_completeLi")){
					registry.byId("configure_completeLi").set("checked",true);
				}
				if(registry.byId("nav_completeLi")){
					registry.byId("nav_completeLi").set("checked",true);
				}
				
				// when show completed need to un-select the other list.
				for(var a = this.loadedModels.listsmodel.model, i = 0; i < a.length; i++){
					if(this.loadedModels.listsmodel.model[i].Checked){
						this.loadedModels.listsmodel.model[i].set("Checked", false);						
					}
				}
			
			}else{
				//var query = {"completed": false};  // all items together
				//query["parentId"] = select_data.id;
	//			query["completed"] = false;
				// selected an item so uncheck complete on configure or nav
				if(registry.byId("configure_completeLi")){
					registry.byId("configure_completeLi").set("checked",false);
				}
				if(registry.byId("nav_completeLi")){
					registry.byId("nav_completeLi").set("checked",false);
				}
			}
			var writestore = app.stores.allitemlistStore.store
			var listCtl = new EditStoreRefListController({store: new DataStore({store: writestore}), cursorIndex: 0});
			when(listCtl.queryStore(query,options), lang.hitch(this, function(datamodel){
						this.loadedModels.itemlistmodel = listCtl;
						//todoApp.cachedDataModel[select_data.id] = listCtl;
						todoApp.currentItemListModel = this.loadedModels.itemlistmodel;

						itemlistmodel = listCtl;
						listsmodel = this.loadedModels.listsmodel;
						
						showListData(listCtl);
			}));
		}
	};
});
