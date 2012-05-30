define(["dojo/dom", "dojo/_base/lang", "dojo/dom-style", "dojo/when", "dijit/registry", "dojox/mvc/at",
        "dojox/mvc/EditStoreRefListController", "dojox/mvc/getStateful", 
        "dojo/data/ItemFileWriteStore", "dojo/store/DataStore"],
function(dom, lang, domStyle, when, registry, at, EditStoreRefListController, getStateful, ItemFileWriteStore, DataStore){
	//set todoApp showItemDetails function
	todoApp.cachedDataModel = {};
	todoApp.currentItemListModel = null;

	todoApp.showItemDetails = function(index){
		//console.log("in items/lists select item ", index);
		todoApp.selected_item = parseInt(index);
		itemlistmodel.set("cursorIndex", todoApp.selected_item);
	};

	var listsmodel = null;
	var itemlistmodel = null;

	var showListData = function(datamodel){
		//console.log("in showListData datamodel = ",datamodel);
		var listWidget = registry.byId("items_list");
		var datamodel = at(datamodel, "model");
		listWidget.set("children", datamodel);		
	};

	var showListType = function(){
		//console.log("in items/lists showListType ");
		var type;
		if(todoApp.selected_configuration_item == -1){
			type = "Completed";			
			domStyle.set(dom.byId("itemslist_add"), "visibility", "hidden"); // hide the new item link
		}else{
			domStyle.set(dom.byId("itemslist_add"), "visibility", ""); // show the new item link
			var listdata = listsmodel.model[todoApp.selected_configuration_item];
			if(listdata && listdata.title){
				type = listdata.title;
			}else{
				type = "Unknown";
			}
		}
		dom.byId("list_type").innerHTML = type;
	};

	return {
		init: function(){
			//console.log("****in items/lists init ");
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;

			if (itemlistmodel && (itemlistmodel.model[0].listId || 0 == itemlistmodel.model[0].listId)) {
				var index = itemlistmodel.model[0].listId;
				todoApp.cachedDataModel[index] = itemlistmodel;
				todoApp.currentItemListModel = itemlistmodel;
			}
		},

		beforeActivate: function(){
			//console.log("items/lists beforeActivate called ",this.loadedModels.itemlistmodel);
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;
			todoApp.selected_item = 0; // reset selected item to 0, -1 is out of index
			todoApp.showProgressIndicator(true);
			registry.byId("tabButtonList").set("selected", true);
			this.refreshData();
		},

		afterDeactivate: function(){
			//console.log("items/lists afterDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
			domStyle.set(dom.byId("itemslistwrapper"), "visibility", "hidden"); // hide the items list
		},

		beforeDeactivate: function(){
			//console.log("items/lists beforeDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
			if(!todoApp._addNewItemCommit){
				itemlistmodel.commit(); //commit mark item as Complete change
			}
			todoApp._addNewItemCommit = false;
		},
	
		refreshData: function(){
			// Display the selected list if click on the navigation list.
			// when delete one list, the listsmodel length will decrease, the display policy is:
			// 1. display the new list which index is the same as the deleted one (for example: delete index 1, then show the new list which index is 1)
			// 2. if no new list which index the same as the old one, but the listmodels has models, display the first one (index=0)
			// 3. display "Completed" list
			var select_data = listsmodel.model[todoApp.selected_configuration_item]; // 1. display the selected one or the same index list
			if(!select_data){
				if((listsmodel.model.length > 0) && (todoApp.selected_configuration_item >= listsmodel.model.length)){
					todoApp.selected_configuration_item = 0; // 2. display the first list
					select_data = listsmodel.model[0];
				}else{
					todoApp.selected_configuration_item = -1; // 3. select Completed list
				}
			}
			// show list type
			showListType();

			var query = {};  
			var options = {sort:[{attribute:"priority", descending: true}]};  // sort by priority
			if(todoApp.selected_configuration_item == -1){
				query["completed"] = true; // query for completed items
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
				//var query = {"listId": select_data.id, "completed": false};
				query["listId"] = select_data.id;  // query for items in this list which are not completed.
				query["completed"] = false;          
				
				// selected an item so uncheck complete on configure or nav
				if(registry.byId("configure_completeLi")){
					registry.byId("configure_completeLi").set("checked",false);
				}
				if(registry.byId("nav_completeLi")){
					registry.byId("nav_completeLi").set("checked",false);
				}
				this.loadedModels.listsmodel.model[todoApp.selected_configuration_item].set("Checked", true);
			}
			var writestore = todoApp.stores.allitemlistStore.store;
			var listCtl = new EditStoreRefListController({store: new DataStore({store: writestore}), cursorIndex: 0});
			when(listCtl.queryStore(query,options), lang.hitch(this, function(datamodel){
				this.loadedModels.itemlistmodel = listCtl;
				//todoApp.cachedDataModel[select_data.id] = listCtl;
				todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
				itemlistmodel = listCtl;
				listsmodel = this.loadedModels.listsmodel;
				showListData(listCtl);
				domStyle.set(dom.byId("itemslistwrapper"), "visibility", "visible"); // show the items list
				todoApp.showProgressIndicator(false);
				todoApp.progressIndicator.domNode.style.visibility = "hidden";
			}));
		}
	};
});
