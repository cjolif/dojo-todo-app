define(["dojo/_base/lang", "dijit/registry", "../utils/utils"], function(lang, registry, utils){
	var itemlistmodel = null;

	var refreshData = function(){
		var datamodel = itemlistmodel.model[this.app.selected_item];
		if (datamodel) {
			// select repeat type
			var widget = registry.byId("list_priority");
			var priorityWidget = utils.getListItemByIndex(widget, datamodel.priority);
			if (priorityWidget) {
				priorityWidget.set("checked", true);
			}
		}
	};

	return {
		init: function(){
			this.loadedModels.itemlistmodel = this.app.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
		
			registry.byId("list_priority").on("checkStateChanged", lang.hitch(this, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("list_priority"), item);
					var datamodel = itemlistmodel.model[this.app.selected_item];
					if (datamodel) {
						datamodel.priority = index;
					}
				}
			}));
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = this.app.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			refreshData();
		},

		destroy: function(){
			// _WidgetBase.on listener is automatically destroyed when the Widget itself his.
		}
	}
});
