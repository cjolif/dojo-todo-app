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
		itemlistmodel.set("cursorIndex",todoApp.selected_item);
	};

	var listsmodel = null;
	var itemlistmodel = null;

	var showListData = function(datamodel){
		//console.log("in showListData datamodel = ",datamodel);
		var listWidget = registry.byId("itemsDate_list");
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
			todoApp.selected_item = 0; // reset selected item to 0, -1 is out of index
			todoApp.showProgressIndicator(true);
			registry.byId("tabButtonDate").set("selected", true);
			this.refreshData();
			// set stopTransition=true to prevent twice transition when transition from date view to list view.
			todoApp.stopTransition = true;
		},

		afterDeactivate: function(){
			//console.log("items/lists afterDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
			domStyle.set(dom.byId("datewrapper"), "visibility", "hidden"); // hide the items list 
		},

		beforeDeactivate: function(){
			//console.log("items/lists beforeDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
			if(!todoApp._addNewItemCommit){
				itemlistmodel.commit(); //commit mark item as Complete change
			}
			todoApp._addNewItemCommit = false;
		},
	
		refreshData: function(){
			//console.log("****in items/lists refreshData ");
			showListType();
			
			var select_data = listsmodel.model[todoApp.selected_configuration_item];
			var query = {}; // query empty to show all items by date
			// set options to sort by reminderDate and priority
			var options = {sort:[{attribute:"reminderDate", descending: true},{attribute:"priority", descending: true}]};
			if(todoApp.selected_configuration_item == -1){
				if(registry.byId("configure_completeLi")){
					registry.byId("configure_completeLi").set("checked",false);
				}
				if(registry.byId("nav_completeLi")){
					registry.byId("nav_completeLi").set("checked",false);
				}
				// when show completed need to un-select the other list.
				for(var a = this.loadedModels.listsmodel.model, i = 0; i < a.length; i++){
					if(this.loadedModels.listsmodel.model[i].Checked){
						this.loadedModels.listsmodel.model[i].set("Checked", false);						
					}
				}
			
			}else{
				// selected an item so uncheck complete on configure or nav
				if(registry.byId("configure_completeLi")){
					registry.byId("configure_completeLi").set("checked",false);
				}
				if(registry.byId("nav_completeLi")){
					registry.byId("nav_completeLi").set("checked",false);
				}
				// when show completed need to un-select the other list.
				for(var a = this.loadedModels.listsmodel.model, i = 0; i < a.length; i++){
					if(this.loadedModels.listsmodel.model[i].Checked){
						this.loadedModels.listsmodel.model[i].set("Checked", false);						
					}
				}
			}
			var writestore = todoApp.stores.allitemlistStore.store
			var listCtl = new EditStoreRefListController({store: new DataStore({store: writestore}), cursorIndex: 0});
			when(listCtl.queryStore(query,options), lang.hitch(this, function(datamodel){
				this.loadedModels.itemlistmodel = listCtl;
				todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
				itemlistmodel = listCtl;
				listsmodel = this.loadedModels.listsmodel;
				showListData(listCtl);
				domStyle.set(dom.byId("datewrapper"), "visibility", "visible"); // show the items list
				todoApp.showProgressIndicator(false);
				todoApp.progressIndicator.domNode.style.visibility = "hidden";
			}));
		}
	};
});
