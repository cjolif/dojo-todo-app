define(["dojo/_base/lang", "dojo/dom", "dojo/_base/connect", "dijit/registry", "../utils/utils"],
function(lang, dom, connect, registry, utils){
	return {
		init: function(){
			this.refreshData();

			connect.connect(registry.byId("list_list"), "onCheckStateChanged", null, lang.hitch(this, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("list_list"), item);
					var datamodel = this.loadedModels.itemlistmodel[todoApp.selected_item];
					if (datamodel) {
						var listsmodel = this.loadedModels.listsmodel;
						if(index>=0 && index<listsmodel.length){
							//TODO: need to udpate data by dojox.mvc
							datamodel.parentId.data = listsmodel[index].id.value;
							datamodel.parentId.value = listsmodel[index].id.value;
						}
						// datamodel.set("repeat", index);
						// TODO: commit the data change
					}
				}
			}));
		},

		beforeActivate: function(){
			this.refreshData();
		},

		refreshData: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			var listsmodel = this.loadedModels.listsmodel;
			var listWidget = registry.byId('list_list');
			listWidget.destroyDescendants();

			var currentDatamodel = this.loadedModels.itemlistmodel[todoApp.selected_item];

			for(var i=0; i<listsmodel.length; i++){
				var options = {label: listsmodel[i].title.value};
				if(currentDatamodel.parentId == listsmodel[i].id.value){ // select current listitem's parent
					options = {label: listsmodel[i].title.value, checked:true};
				}
				var listItem = new dojox.mobile.ListItem(options);
				listWidget.addChild(listItem);
			}
		}
	}
});
