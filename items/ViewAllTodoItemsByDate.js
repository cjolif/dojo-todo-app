define(["dojo/dom","dojo/_base/lang", "dojo/sniff", "dojo/dom-style", "dojo/when", "dijit/registry", "dojox/mvc/at",
        "dojox/mvc/EditStoreRefListController", "dojox/mvc/getStateful", 
		"dojox/mvc/WidgetList", "dojox/mvc/Templated", "dojox/mvc/_InlineTemplateMixin",
        "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojo/date/stamp"],
function(dom, lang, has, domStyle, when, registry, at, EditStoreRefListController, getStateful, WidgetList,
		 Templated, _InlineTemplateMixin, ItemFileWriteStore, DataStore, stamp){

	var app = null;

	showItemDetails = function(index){
		// summary:
		//		set the cursorIndex for this.app.currentItemListModel so the selected item will be displayed after transition to details 

		//console.log("in views/items/ViewAllTodoItemsByDate select item ", index);
		app.selected_item = parseInt(index);
		app.currentItemListModel.set("cursorIndex", app.selected_item);
	};

	dateListClassTransform = {
		format : function(value){
			// check to see if the date is in the past, if so display it in red
			if(value && value < stamp.toISOString(new Date(), {selector: "date"})){
				return "dateLabelInvalid";
			}else{
				return "";
			}
		}
	};

	return {
		init: function(){
			// summary:
			//		view life cycle init()
			// description:
			//		nothing to do in init, beforeActivate will call refreshData to create the
			//		model/controller and show the list.
			app = this.app;
		},

		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			// description:
			//		beforeActivate will call refreshData to create the
			//		model/controller and show the list.
			this.app.selected_item = 0; // reset selected item to 0, -1 is out of index
			if(dom.byId("itemslistwrapper")){ 
				domStyle.set(dom.byId("itemslistwrapper"), "visibility", "hidden"); // hide the item list before showing the date items list
			}
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
			if(!this.app._addNewItemCommit && this.app.currentItemListModel){
				this.app.currentItemListModel.commit(); //commit mark item as Complete change
			}
			this.app._addNewItemCommit = false;
		},
	
		refreshData: function(){
			// summary:
			//		Display the selected list if click on the navigation list.
			//
			// description:
			//
			//		1. Determine which todoList to display, and set this.app.selected_configuration_item to the appropriate value if it is not already set.
			//		2. Call showListType to show the Completed Items or the selected items as appropriate
			//		3. Setup the query for the Completed Items or the selected items as appropriate
			//		4. Create the EditStoreRefListController and query the store, then set this.app.currentItemListModel and display the list
			//
			this.showListType(this.loadedModels.listsmodel);

			// TODO select_data is un-used, check if that is needed
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
			var listCtl = this.app.currentItemListModel;
			if(!listCtl){
				var writestore = this.app.stores.allitemlistStore.store;
				listCtl = new EditStoreRefListController({store: new DataStore({store: writestore}), cursorIndex: 0});
			}
			when(listCtl.queryStore(query,options), lang.hitch(this, function(datamodel){
				this.app.currentItemListModel = listCtl;
				this.showListData(listCtl);
				domStyle.set(dom.byId("itemswrapper"), "visibility", "visible"); // show the items heading and toolbar from items.html
				domStyle.set(dom.byId("datewrapper"), "visibility", "visible"); // show the date items list
				this.app.showProgressIndicator(false);
				// TODO: showProgressIndicator does this, so why do we need it?
				this.app.progressIndicator.domNode.style.visibility = "hidden";
			}));
		},

		showListData: function(/*dojox/mvc/EditStoreRefListController*/ datamodel){
			// summary:
			//		set the children for items_list widget to the datamodel to show the items in the selected list.
			//
			// datamodel: dojox/mvc/EditStoreRefListController
			//		The EditStoreRefListController whose model holds the items for the selected list.
			//
			var listWidget = registry.byId("itemsDate_list");
			var datamodel = at(datamodel, "model");
			listWidget.set("children", datamodel);
		},

		showListType: function(/*dojox/mvc/EditStoreRefListController*/ listsmodel){
			// summary:
			//		update the heading for the date view into the list_type dom node.
			//
			// listsmodel: dojox/mvc/EditStoreRefListController
			//		The EditStoreRefListController whose model holds the available lists.
			//
			dom.byId("list_type").innerHTML = "All items by date";
		}
	};
});
