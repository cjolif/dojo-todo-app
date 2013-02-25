define(["dojo/_base/lang", "dijit/registry", "../utils/utils"], function(lang, registry, utils){
	var itemlistmodel = null;

	return {
		init: function(){
			this.loadedModels.itemlistmodel = this.app.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;

			registry.byId("list_repeat").on("checkStateChanged", lang.hitch(this, function(item, state){
				// save the select value to data store
				if(state){
					var index = utils.getIndexByListItem(registry.byId("list_repeat"), item);
					var datamodel = this.loadedModels.itemlistmodel.model[this.app.selected_item];
					if(datamodel){
						datamodel.repeat = index;
					}
				}
			}));
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = this.app.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			this.refreshData();
		},

		destroy: function(){
			// _WidgetBase.on listener is automatically destroyed when the Widget itself his.
		},

		refreshData: function(){
			var datamodel = itemlistmodel.model[this.app.selected_item];
			if(datamodel){
				// select repeat type
				var widget = registry.byId('list_repeat');
				var repeatWidget = utils.getListItemByIndex(widget, datamodel.repeat);
				if(repeatWidget){
					repeatWidget.set("checked", true);
				}
			}
		}
	}
});
