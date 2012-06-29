define(["dojo/dom","dojo/_base/lang", "dojo/dom-style", "dojo/when", "dijit/registry", "dojox/mvc/at",
        "dojox/mvc/EditStoreRefListController", "dojox/mvc/getStateful", 
        "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojo/date/stamp"],
function(dom, lang, domStyle, when, registry, at, EditStoreRefListController, getStateful, ItemFileWriteStore, DataStore, stamp){

	showItemDetails = function(index){
		// summary:
		//		set the cursorIndex for this.app.currentItemListModel so the selected item will be displayed after transition to details 

		//console.log("in views/items/ViewAllTodoItemsByDate select item ", index);
		this.app.selected_item = parseInt(index);
		this.app.currentItemListModel.set("cursorIndex",this.app.selected_item);
	};

	dateListClassTransform = {
		format : function(value) {
			// check to see if the date is in the past, if so display it in red
			if(value && value < stamp.toISOString(new Date(), {selector: "date"})){
				return "dateLabelInvalid";
			}else{
				return "";
			}
		}
	};

	var showListData = function(datamodel){
		// summary:
		//		set the children for items_list widget to the datamodel to show the items in the selected list. 
		var listWidget = registry.byId("itemsDate_list");
		var datamodel = at(datamodel, "model");
		listWidget.set("children", datamodel);		
	};

	var showListType = function(listsmodel){
		// summary:
		//		show the new Item link if the Completed list is not selected, and set the type into the list_type dom node.
		var type;
		if(this.app.selected_configuration_item == -1){
			type = "Completed";			
			domStyle.set(dom.byId("itemslist_add"), "visibility", "hidden"); // hide the new item link
		}else{
			domStyle.set(dom.byId("itemslist_add"), "visibility", ""); // show the new item link			
			var listdata = listsmodel.model[this.app.selected_configuration_item];
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
			// summary:
			//		view life cycle init()
			// description:
			//		nothing to do in init, beforeAcitvate will call refreshData to create the  
			//		model/controller and show the list.
		},

		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			// description:
			//		beforeAcitvate will call refreshData to create the  
			//		model/controller and show the list.
			this.app.selected_item = 0; // reset selected item to 0, -1 is out of index
			this.app.showProgressIndicator(true);
			registry.byId("tabButtonDate").set("selected", true);
			this.refreshData();
			// set stopTransition=true to prevent twice transition when transition from date view to list view.
			this.app.stopTransition = true;
		},

		afterDeactivate: function(){
			// summary:
			//		view life cycle afterDeactivate()
			domStyle.set(dom.byId("datewrapper"), "visibility", "hidden"); // hide the items list 
		},

		beforeDeactivate: function(){
			// summary:
			//		view life cycle beforeDeactivate()
			if(!this.app._addNewItemCommit){
				this.app.currentItemListModel.commit(); //commit mark item as Complete change
			}
			this.app._addNewItemCommit = false;
		},
	
		refreshData: function(){
			// summary:
			//		Display the selected list if click on the navigation list.
			// description:
			//		1) Determine which todoList to display, and set this.app.selected_configuration_item to the appropriate value if it is not already set.
			//		2) Call showListType to show the Completed Items or the selected items as appropriate
			//		3) Setup the query for the Completed Items or the selected items as appropriate
			//		4) Create the EditStoreRefListController and query the store, then set this.app.currentItemListModel and display the list
			showListType(this.loadedModels.listsmodel);
			
			var select_data = this.loadedModels.listsmodel.model[this.app.selected_configuration_item];
			var query = {}; // query empty to show all items by date
			// set options to sort by reminderDate and priority
			var options = {sort:[{attribute:"reminderDate", descending: true},{attribute:"priority", descending: true}]};
			if(this.app.selected_configuration_item == -1){
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
			var writestore = this.app.stores.allitemlistStore.store
			var listCtl = new EditStoreRefListController({store: new DataStore({store: writestore}), cursorIndex: 0});
			when(listCtl.queryStore(query,options), lang.hitch(this, function(datamodel){
				this.app.currentItemListModel = listCtl;
				showListData(listCtl);
				domStyle.set(dom.byId("itemswrapper"), "visibility", "visible"); // show the items heading and toolbar from items.html
				domStyle.set(dom.byId("datewrapper"), "visibility", "visible"); // show the date items list
				this.app.showProgressIndicator(false);
				this.app.progressIndicator.domNode.style.visibility = "hidden";
			}));
		}
	};
});
