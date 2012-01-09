define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "app/script/details/utils"],
function(dom, connect, registry, utils){
	return {
		init: function(){
			this.refresh();

			dojo.connect(registry.byId("list_list"), "onCheckStateChanged", null, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("list_list"), item);
					var datamodel = app.loadedModels.itemlistmodel[window.selected_item];
					if (datamodel) {
						// datamodel.set("repeat", index);
						// TODO: commit the data change
						datamodel.parentId.data = index;
						datamodel.parentId.value = index;
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
			var listsmodel = app.loadedModels.listsmodel;
			var listWidget = registry.byId('list_list');
			listWidget.destroyDescendants();

			var currentDatamodel = app.loadedModels.itemlistmodel[window.selected_item];

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
