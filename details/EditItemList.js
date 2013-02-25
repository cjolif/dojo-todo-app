define(["dojo/_base/lang", "dijit/registry", "../utils/utils"], function(lang, registry, utils){

	return {
		init: function(){
			registry.byId("list_list").on("checkStateChanged", lang.hitch(this, function(item, state){
				// save the select value to data store
				if(state){
					var index = utils.getIndexByListItem(registry.byId("list_list"), item);
					var datamodel = this.app.currentItemListModel.model[this.app.selected_item];
					if(datamodel){
						var listsmodel = this.loadedModels.listsmodel.model;
						if(index>=0 && index < listsmodel.length){
							datamodel.listId = listsmodel[index].id;
						}
					}
				}
			}));
		},

		beforeActivate: function(){
			this.refreshData();
		},

		refreshData: function(){
			// summary:
			//		destroy the previous list of todoLists and display the new list of todoLists to choose from.
			var listWidget = registry.byId("list_list");
			listWidget.destroyDescendants();

			var currentDatamodel = this.app.currentItemListModel.model[this.app.selected_item];

			for(var i=0; i < this.loadedModels.listsmodel.model.length; i++){
				var options = {label: this.loadedModels.listsmodel.model[i].title};
				if(currentDatamodel.listId == this.loadedModels.listsmodel.model[i].id){ // select current listitem's parent
					options = {label: this.loadedModels.listsmodel.model[i].title, checked:true};
				}
				var listItem = new dojox.mobile.ListItem(options);
				listWidget.addChild(listItem);
			}
		},

		destroy: function(){
			// _WidgetBase.on listener is automatically destroyed when the Widget itself his.
		}
	}
});
