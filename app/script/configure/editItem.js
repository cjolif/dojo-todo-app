define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc"], function(dom, dstyle, connect, registry, mvc){
	return {
		init: function(){
			var index = 0;

			function done(){
				//commit configuration data
				var itemDatamodel = app.loadedModels.listsmodel[window.selected_configuration_item];
				itemDatamodel.commit();
//				console.log(itemDatamodel.toPlainObject());
			};

			connect.connect(dom.byId('editItem_done'), "click", function(){
				done();
			});

			var widget = registry.byId("configuration_detailsGroup");

			// workaround for dojox.mvc bind index 0 bug.
			// _DataBindingMixin.js  line: 176
			if(window.selected_configuration_item == 0){
				window.selected_configuration_item += "";
			}
			widget.set("ref", window.selected_configuration_item);

			// console.log("init configure_edit_item view ok.");
		},

		activate: function(){
			var widget = registry.byId("configuration_detailsGroup");

			// workaround for dojox.mvc bind index 0 bug.
			// _DataBindingMixin.js  line: 176
			if(window.selected_configuration_item == 0){
				window.selected_configuration_item += "";
			}
			widget.set("ref", window.selected_configuration_item);
			// console.log("set ref in configure_edit_item view activate");
		},

		deactivate: function(){
			// console.log("configure_edit_item view deactivate, unbind data");
		}
	}
});
