define(["dojo/_base/lang", "dojo/dom", "dojo/_base/connect", "dijit/registry", "../utils/utils"],
function(lang, dom, connect, registry, utils){
	return {
		init: function(){
			this.refreshData();
			dojo.connect(registry.byId("list_repeat"), "onCheckStateChanged", null, lang.hitch(this, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("list_repeat"), item);
					var datamodel = this.loadedModels.itemlistmodel[todoApp.selected_item];
					if (datamodel) {
						datamodel.repeat.data = index;
						datamodel.repeat.value = index;
					}
				}
			}));
		},

		beforeActivate: function(){
			this.refreshData();
		},

		refreshData: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			var datamodel = this.loadedModels.itemlistmodel[todoApp.selected_item];
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
