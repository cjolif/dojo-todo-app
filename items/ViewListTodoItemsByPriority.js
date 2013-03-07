define(["dojo/dom", "dojo/_base/lang", "dojo/sniff", "dojo/_base/declare", "dojo/dom-style", "dojo/when", "dijit/registry", "dojox/mvc/at",  
		"dojox/mvc/Repeat", "dojox/mobile/RoundRectList", "dojox/mvc/WidgetList", "dojox/mvc/Templated",
		"dojox/mobile/ListItem", "dojox/mvc/EditStoreRefListController", "dojox/mvc/getStateful", 
        "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/parser", 	
        "dojo/text!../items/RoundRectWidListTemplate.html"],
function(dom, lang, has, declare, domStyle, when, registry, at, Repeat, RoundRectList, WidgetList, Templated, ListItem,
		 EditStoreRefListController, getStateful, ItemFileWriteStore, DataStore, parser, RoundRectWidListTemplate){

	var roundRectWidList = null;

	return {
		init: function(){
			// summary:
			//		view life cycle init()
			// description:
			//		init is doing the same thing as beforeAcitvate only to handle the case where a page  
			//		page refresh is done on a selected item, without this code in init the details will not display.
			this.app.selected_item = 0; // reset selected item to 0, -1 is out of index
			this.app.showProgressIndicator(true);
			registry.byId("tabButtonList").set("selected", true);
			this.refreshData();
			if(dom.byId("todoListswrapper")){
				domStyle.set(dom.byId("todoListswrapper"), "visibility", "visible"); // show the itemsList from ViewTodoLists.html
			}			
		},

		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			// description:
			//		beforeAcitvate will call refreshData to create the  
			//		model/controller and show the list.
			this.app.selected_item = 0; // reset selected item to 0, -1 is out of index
			if(dom.byId("datewrapper")){ 
				domStyle.set(dom.byId("datewrapper"), "visibility", "hidden"); // hide the date item list before showing the date items list
			}
			this.app.showProgressIndicator(true);
			registry.byId("tabButtonList").set("selected", true);
			this.refreshData();
		},

		afterDeactivate: function(){
			// summary:
			//		view life cycle afterDeactivate()
			domStyle.set(dom.byId("itemslistwrapper"), "visibility", "hidden"); // hide the items list
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
			var select_data = this.loadedModels.listsmodel.model[this.app.selected_configuration_item]; // display the selected one or the same index list
			if(!select_data){
				if((this.loadedModels.listsmodel.model.length > 0) && (this.app.selected_configuration_item >= this.loadedModels.listsmodel.model.length)){
					this.app.selected_configuration_item = 0; // display the first list
					select_data = this.loadedModels.listsmodel.model[0];
				}else{
					this.app.selected_configuration_item = -1; // select Completed list
				}
			}
			// show list type
			this.showListType(this.loadedModels.listsmodel);

			var query = {};  
			var options = {sort:[{attribute:"priority", descending: true}]};  // sort by priority
			if(this.app.selected_configuration_item == -1){
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
				this.loadedModels.listsmodel.model[this.app.selected_configuration_item].set("Checked", true);
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
				domStyle.set(dom.byId("itemslistwrapper"), "visibility", "visible"); // show the items in the list
				this.app.showProgressIndicator(false);
				// TODO: showProgressIndicator does this, so why do we need it?
				this.app.progressIndicator.domNode.style.visibility = "hidden";
			}));
		},

		showListData: function(/*dojox/mvc/EditStoreRefListController*/ datamodel){
			// summary:
			//		create the WidgetList programatically if it has not been created, and
			//		set the children for items_list widget to the datamodel to show the items in the selected list.
			//		RoundRectWidListTemplate is used for the templateString of the WidgetList.
			//
			// datamodel: dojox/mvc/EditStoreRefListController
			//		The EditStoreRefListController whose model holds the items for the selected list.
			//
			if(!roundRectWidList){
				var clz = declare([WidgetList, RoundRectList], {});
				var view = this;
				roundRectWidList = new clz({
					children: at(datamodel, "model"),
					childClz: declare([Templated /* dojox/mvc/Templated module return value */, ListItem /* dojox/mobile/ListItem module return value */]),
					childParams: {
						transitionOptions: {title: "Detail",target: "details,EditTodoItem",url: "#details,EditTodoItem"},
						clickable: true,
						onClick: function(){view.showItemDetails(this.indexAtStartup);}
					},
					childBindings: {
						titleNode: {value: at("rel:", "title")},
						checkedNode: {checked: at("rel:", "completed")}
					},
					templateString: RoundRectWidListTemplate
				});
				roundRectWidList.placeAt(dom.byId("addWidgetHere"));
				roundRectWidList.startup();
			}else{
				roundRectWidList.set("children", at(datamodel, 'model'));
			}
		},

		showListType: function(listsmodel){
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
		},

		showItemDetails: function(index){
			// summary:
			//		set the cursorIndex for this.app.currentItemListModel so the selected item will be displayed after transition to details
			this.app.selected_item = parseInt(index);
			this.app.currentItemListModel.set("cursorIndex", this.app.selected_item);
		}
	};
});
