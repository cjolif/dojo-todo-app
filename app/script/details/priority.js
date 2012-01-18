define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "../utils/utils"],
function(dom, connect, registry, utils){
	return {
		init: function(){
			this.refresh();
			connect.connect(registry.byId("list_priority"), "onCheckStateChanged", null, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("list_priority"), item);
					var datamodel = app.loadedModels.itemlistmodel[window.selected_item];
					if (datamodel) {
						// datamodel.set("repeat", index);
						// TODO: commit the data change
						datamodel.priority.data = index;
						datamodel.priority.value = index;
					}
				}
			});
		},

		activate: function(){
			this.refresh();
		},

		deactivate: function(){
		},

		refresh: function(){
			var datamodel = app.loadedModels.itemlistmodel[window.selected_item];
			if (datamodel) {
				// select repeat type
				var widget = registry.byId('list_priority');
				var priorityWidget = utils.getListItemByIndex(widget, datamodel.priority.value);
				if (priorityWidget) {
					priorityWidget.set("checked", true);
				}
			}
		}
	}
});
