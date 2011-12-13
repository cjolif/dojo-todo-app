define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojox/mobile/TransitionEvent"],
function(dom, dstyle, connect, registry, mvc, TransitionEvent){
	return {
		init: function(){
			function done(widget){
				//commit configuration data
				var itemDatamodel = widget.loadedModels.itemlistmodel[window.selected_list_item];
				itemDatamodel.commit();
				console.log(itemDatamodel.toPlainObject());
				app.loadedModels.itemlistmodel = widget.loadedModels.itemlistmodel;

				var transOpts = {
					title:"Edit List",
					target:"items,list_edit",
					url: "#items,list_edit"
				};
				var e = window.event;
				new TransitionEvent(e.srcElement,transOpts,e).dispatch();
			};

			connect.connect(dom.byId('edit_list_done'), "click", dojo.hitch(this, function(){
				done(this);
			}));

			var widget = registry.byId("itemlist_detailsGroup");

			// workaround for dojox.mvc bind index 0 bug.
			// _DataBindingMixin.js  line: 176
			if(window.selected_list_item == 0){
				window.selected_list_item += "";
			}
			widget.set("ref", window.selected_list_item);
		},

		activate: function(){
			var widget = registry.byId("itemlist_detailsGroup");

			// workaround for dojox.mvc bind index 0 bug.
			// _DataBindingMixin.js  line: 176
			if(window.selected_list_item == 0){
				window.selected_list_item += "";
			}
			widget.set("ref", window.selected_list_item);
			// console.log("set ref in configure_edit_item view activate");
		},

		deactivate: function(){
			// console.log("configure_edit_item view deactivate, unbind data");
		}
	}
});
