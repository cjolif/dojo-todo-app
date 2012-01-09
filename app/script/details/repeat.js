define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "app/script/details/utils"],
function(dom, connect, registry, utils){
	return {
		init: function(){
			this.refresh();
			dojo.connect(registry.byId("list_repeat"), "onCheckStateChanged", null, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("list_repeat"), item);
					var datamodel = app.loadedModels.itemlistmodel[window.selected_item];
					if (datamodel) {
						// datamodel.set("repeat", index);
						// TODO: commit the data change
						datamodel.repeat.data = index;
						datamodel.repeat.value = index;
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
				var widget = registry.byId('list_repeat');
				var repeatWidget = utils.getListItemByIndex(widget, datamodel.repeat.value);
				if (repeatWidget) {
					repeatWidget.set("checked", true);
				}
			}
		}
	}
});
