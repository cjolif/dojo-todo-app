define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojox/mobile/TransitionEvent"],
function(dom, dstyle, connect, registry, mvc, TransitionEvent){
	return {
		init: function(){
			// Edit configuration items done, commit the data to server/data store.
			function done(){
				//commit configuration data
				var itemDatamodel = app.loadedModels.itemlistmodel[window.selected_list_item];
				itemDatamodel.commit();
				console.log(itemDatamodel.toPlainObject());

				var transOpts = {
					title:"Edit List",
					target:"items,list_edit",
					url: "#items,list_edit"
				};
				var e = window.event;
				new TransitionEvent(e.srcElement,transOpts,e).dispatch();
			};

			connect.connect(dom.byId('edit_list_done'), "click", dojo.hitch(this, function(){
				done();
			}));

			var widget = registry.byId("itemlist_detailsGroup");
			widget.ref = null;
			widget.set("ref", app.loadedModels.itemlistmodel[window.selected_list_item]);
		},

		activate: function(){
			var widget = registry.byId("itemlist_detailsGroup");
			widget.ref = null;
			widget.set("ref", app.loadedModels.itemlistmodel[window.selected_list_item]);
		},

		deactivate: function(){
		}
	}
});
