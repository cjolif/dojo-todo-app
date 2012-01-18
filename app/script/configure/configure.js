define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mobile/TransitionEvent", "../utils/utils"],
function(dom, dstyle, connect, registry, TransitionEvent, utils){
	return {
		init: function(){
			this.refresh();

			dojo.connect(registry.byId("configure_list"), "onCheckStateChanged", null, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("configure_list"), item);
					window.selected_configuration_item = index - 1; // skip Completed item

					// transition to list view
					var transOpts = {
						title:"List",
						target:"items,list",
						url: "#items,list"
					};
					var e = window.event;
					new TransitionEvent(e.srcElement,transOpts,e).dispatch();
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
			var listWidget = registry.byId('configure_list');
			listWidget.destroyDescendants();

			var listItem = new dojox.mobile.ListItem({
				label: "Completed"
			});
			listWidget.addChild(listItem);

			for(var i=0; i<listsmodel.length; i++){
				var options = {label: listsmodel[i].title.value};
				if(window.selected_configuration_item == i){ // select current listitem's parent
					options = {label: listsmodel[i].title.value, checked:true};
				}
				listItem = new dojox.mobile.ListItem(options);
				listWidget.addChild(listItem);
			}
		}
	}
});
