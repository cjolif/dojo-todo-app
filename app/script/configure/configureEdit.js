define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojox/mobile/TransitionEvent"],
function(dom, dstyle, connect, registry, mvc, TransitionEvent){
	return {
		init: function(){
			// Edit configuration items done, commit the data to server/data store.
			function done(){
				//commit configuration data
				var datamodel = app.loadedModels.listsmodel;
				datamodel.commit();
//				console.log(datamodel.toPlainObject());

				//TODO: stop click event bubble, wait for update data to server ready.
				//      then bubble this event and let TabBarButton transition
			};

			// Add a configuration item to configration data model.
			function addItem(){
				console.log("add a configuration item.");
				var datamodel = app.loadedModels.listsmodel;
				var index = datamodel.length;
				var insert = mvc.newStatefulModel({
					"data": {
						"title": "New Item "+index,
						"id": (new Date().getTime()),
						"itemsurl": "../resources/data/items-for-" + index + ".json"
					}
				});
				datamodel.add(index, insert);
				datamodel.commit();	//need to commit after delete. TODO: need to enhance the performance
			};

			// delete configuration item.
			// Here we need to bind this function scope to global window object because we want to call in directly in button's onclick,
			// and the button is in the global scope.
			function deleteItem(index){
				console.log("deleteItem ", index);
				var datamodel = app.loadedModels.listsmodel;
				var len = datamodel.length;
				if(index>=0 && index<len){
					datamodel.remove(index);
					datamodel.commit(); //need to commit after delete. TODO: need to enhance the performance
				}

				// stop bubble onclick event to ListItem
				var evt = window.event;
				if (evt.preventDefault){
					evt.preventDefault();
				}
				evt.cancelBubble = true;
				if(evt.stopPropagation){
				    evt.stopPropagation();
				}
			};

			// override ListItem onClick event
			function selectConfigurationItem(node, index){
				if(window.selected_configuration_item == index){
					return;
				}
				window.selected_configuration_item = index;

				// publish transition event
				registry.byNode(node).select();
				var transOpts = {
					title:"Configuration Detail",
					target:"configuration,configure_edit_item",
					url: "#configuration,configure_edit_item"
				};
				var e = window.event;
				new TransitionEvent(node,transOpts,e).dispatch();
			};

			connect.connect(dom.byId('configuration_done'), "click", function(){
				done();
			});

			connect.connect(dom.byId('configuration_add'), "click", function(){
				addItem();
			});

			//bind deleteItem function to global window object because we want call in directly in button onclick.
			window.deleteItem = deleteItem;
			window.selectConfigurationItem = selectConfigurationItem;
		},

		activate: function(){
			var datamodel = app.loadedModels.listsmodel;
			var widget = registry.byId('configure_edit_repeat');
			widget.ref = null;
			widget.set("ref", datamodel);

			// refresh tablet configuration repeat group.
			if(window.isTablet){
				widget = registry.byId('tablet_configuration_repeat');
				widget.ref = null;
				widget.set("ref", datamodel);
			}
		},

		deactivate: function(){
		}
	}
});
