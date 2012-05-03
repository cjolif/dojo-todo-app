define(["dojo/_base/lang", "dojo/dom", "dojo/_base/connect", "dijit/registry", "../utils/utils"],
function(lang, dom, connect, registry, utils){
	var _connectResults = []; // events connect result
	var itemlistmodel = null;

	var refreshData = function(){
		var datamodel = itemlistmodel.model[todoApp.selected_item];
		if (datamodel) {
			// select repeat type
			var widget = registry.byId('list_priority');
			var priorityWidget = utils.getListItemByIndex(widget, datamodel.priority);
			if (priorityWidget) {
				priorityWidget.set("checked", true);
			}
		}
	};

	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
		
			var connectResult;
			connectResult = connect.connect(registry.byId("list_priority"), "onCheckStateChanged", null, lang.hitch(this, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("list_priority"), item);
					var datamodel = itemlistmodel.model[todoApp.selected_item];
					if (datamodel) {
						datamodel.priority = index;
					}
				}
			}));
			_connectResults.push(connectResult);
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			refreshData();
		},

		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	}
});
