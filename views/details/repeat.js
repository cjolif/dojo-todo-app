define.amd.jQuery = true;
define(["http://code.jquery.com/jquery-1.7.2.js", "http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.js"],
	function(){

	// need to disable jQuery Mobile hash support that it clashes with dojox/app own support
	$.mobile.hashListeningEnabled = false;

	var itemlistmodel = null;

	var refreshData = function(){
		var datamodel = itemlistmodel.model[todoApp.selected_item];
		if(datamodel){
			// select repeat type
			$("#radio-choice-"+(datamodel.repeat+1)).attr("checked", true);
			/*
			var widget = registry.byId("list_repeat");
			var repeatWidget = utils.getListItemByIndex(widget, datamodel.repeat);
			if(repeatWidget){
				repeatWidget.set("checked", true);
			}*/
		}
	};

	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;

			// connect a listener on the list that does update the model
			/*
				// save the select value to data store
				if(state){
					var index = utils.getIndexByListItem(registry.byId("list_repeat"), item);
					var datamodel = this.loadedModels.itemlistmodel.model[todoApp.selected_item];
					if(datamodel){
						datamodel.repeat = index;
					}
				}
			*/
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			refreshData();
		},

		destroy: function(){
			// disconnect listener on the list
		}
	}
});
