define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc"], function(dom, dstyle, connect, registry, mvc){
	return {
		init: function(){
			var configure = {
				editable: false
			};

			function edit(){
				if (!configure.editable) {
					dstyle.set(dom.byId('configuration_add'), "display", "block");
					dom.byId('configuration_edit').innerHTML = "Done";
				}
				else {
					dstyle.set(dom.byId('configuration_add'), "display", "none");
					dom.byId('configuration_edit').innerHTML = "Edit";

					//commit configuration data
					var datamodel = app.loadedModels.listsmodel;
					datamodel.commit();
					console.log(datamodel.toPlainObject());
				}
				configure.editable = !configure.editable;
			};

			function add(){
				console.log("add a configuration item.");
				var datamodel = app.loadedModels.listsmodel;
				var index = datamodel.length;
				var insert = mvc.newStatefulModel({
					"data": {
						"title": "New Item",
						"id": index,
						"itemsurl": "../../demos/toDoAppLayout/data/items-for-" + index + ".json"
					}
				});
				datamodel.add(index, insert);

				fixListItemClick(datamodel);
			};

			function fixListItemClick(data){
//				console.log(data.length);
//				for (var i = 0; i < data.length; i++) {
//					var itemNode = registry.byId('configure_item' + i);
//					connect.connect(itemNode.rightIconNode, "click", function(e){
//						console.log("show details");
//						showDetails(e);
//					});
//				}
			}

			function showDetails(e){
				console.log("showDetails", e);
			};

			connect.connect(dom.byId('configuration_edit'), "click", function(){
				edit();
			});

			connect.connect(dom.byId('configuration_add'), "click", function(){
				add();
			});

			// init datamodel maybe is a deferred object, so we need to wait after data binding.
			if (!configure.editable) {
				// console.log("need to bind showdetails function.");
				var datamodel = app.loadedModels.listsmodel;
				if (datamodel && datamodel.then) {
					datamodel.then(function(data){
						fixListItemClick(data);
					});
				}
			}
			else {
				console.log("editable, need to click done button to complete edit operation.");
			}
		},

		activate: function(){
			// console.log("configure view activate, bind data");
		},

		deactivate: function(){
			// console.log("configure view deactivate, unbind data");
		}
	}
});
