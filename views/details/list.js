define(["dojo/_base/lang", "dojo/dom", "dojo/_base/connect", "dijit/registry", "../utils/utils"],
function(lang, dom, connect, registry, utils){
	var _connectResults = []; // events connect result
	var itemlistmodel = null;
	var listsmodel = null;

	var refreshData = function(){
		var listWidget = registry.byId('list_list');
		listWidget.destroyDescendants();

		var currentDatamodel = itemlistmodel.model[todoApp.selected_item];

		for(var i=0; i<listsmodel.model.length; i++){
			var options = {label: listsmodel.model[i].title};
			if(currentDatamodel.parentId == listsmodel.model[i].id){ // select current listitem's parent
				options = {label: listsmodel.model[i].title, checked:true};
			}
			var listItem = new dojox.mobile.ListItem(options);
			listWidget.addChild(listItem);
		}
	};

	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;

			var connectResult;
			connectResult = connect.connect(registry.byId("list_list"), "onCheckStateChanged", null, lang.hitch(this, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("list_list"), item);
					var datamodel = this.loadedModels.itemlistmodel.model[todoApp.selected_item];
					if (datamodel) {
						var listsmodel = this.loadedModels.listsmodel.model;
						if(index>=0 && index<listsmodel.length){
							datamodel.parentId = listsmodel[index].id;
						}
					}
				}
			}));
			_connectResults.push(connectResult);
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;
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
