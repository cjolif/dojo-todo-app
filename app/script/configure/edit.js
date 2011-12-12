define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojox/mobile/TransitionEvent"], 
function(dom, dstyle, connect, registry, mvc, TransitionEvent){
	return {
		init: function(){
			var configure = {
				editable: false
			};

			var selected_configuration_item = 0;

			// Edit configuration items done, commit the data to server/data store.
			function done(){
				//commit configuration data
				var datamodel = app.loadedModels.listsmodel;
				datamodel.commit();
				console.log(datamodel.toPlainObject());

				configure.editable = !configure.editable;

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
			};

			// override ListItem onClick event
			function selectConfigurationItem(node, index, e){
				// console.log(node, index, e);
				window.selected_configuration_item = index;

				// publish transition event
				node.select();
				var transOpts = {
					title:"Configuration Detail",
					target:"configuration,configure_edit_item",
					url: "#configuration,configure_edit_item"
				};
				new TransitionEvent(node.domNode,transOpts,e).dispatch();
			};

			connect.connect(dom.byId('configuration_done'), "click", function(){
				done();
			});

			connect.connect(dom.byId('configuration_add'), "click", function(){
				addItem();
			});

			// init datamodel maybe is a deferred object, so we need to wait after data binding.
			if (!configure.editable) {
				//bind deleteItem function to global window object because we want call in directly in button onclick.
				window.deleteItem = deleteItem;
				window.selected_configuration_item = selected_configuration_item;
				window.selectConfigurationItem = selectConfigurationItem;
			}
			else {
				console.log("editable, need to click done button to complete edit operation.");
			}
		},

		activate: function(){
			var datamodel = app.loadedModels.listsmodel;
			var widget = registry.byId('configure_edit_repeat');
			widget.ref = null;
			widget.set("ref", datamodel);
		},

		deactivate: function(){
			// console.log("configure_edit view deactivate, unbind data");
		}
	}
});
