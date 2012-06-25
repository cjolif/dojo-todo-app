define(["dojo/_base/lang", "dijit/registry", "../utils/utils"], function(lang, registry, utils){
	var itemlistmodel = null;
	var listsmodel = null;

	var refreshData = function(){
		var listWidget = registry.byId("list_list");
		listWidget.destroyDescendants();

		var currentDatamodel = itemlistmodel.model[this.app.selected_item];

		for(var i=0; i < listsmodel.model.length; i++){
			var options = {label: listsmodel.model[i].title};
			if(currentDatamodel.listId == listsmodel.model[i].id){ // select current listitem's parent
				options = {label: listsmodel.model[i].title, checked:true};
			}
			var listItem = new dojox.mobile.ListItem(options);
			listWidget.addChild(listItem);
		}
	};

	return {
		init: function(){
			this.loadedModels.itemlistmodel = this.app.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;

			registry.byId("list_list").on("checkStateChanged", lang.hitch(this, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("list_list"), item);
					var datamodel = this.loadedModels.itemlistmodel.model[this.app.selected_item];
					if (datamodel) {
						var listsmodel = this.loadedModels.listsmodel.model;
						if(index>=0 && index<listsmodel.length){
							datamodel.listId = listsmodel[index].id;
						}
					}
				}
			}));
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = this.app.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;
			refreshData();
		},

		destroy: function(){
		}
	}
});
