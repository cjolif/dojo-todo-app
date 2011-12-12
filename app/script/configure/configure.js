define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojox/mobile/TransitionEvent"],
function(dom, dstyle, connect, registry, mvc, TransitionEvent){
	return {
		init: function(){
			// override ListItem onClick event
			function setSelectItem(node, index, e){
				// console.log(node, index, e);
				window.selected_configuration_item = index;

				// publish transition event
				node.select();
				var transOpts = {
					title:"List",
					target:"items,list",
					url: "#items,list"
				};
				new TransitionEvent(node.domNode,transOpts,e).dispatch();
			};

			window.setSelectItem = setSelectItem;
		},

		activate: function(){
			var datamodel = app.loadedModels.listsmodel;
			var widget = registry.byId('configure_repeat');
			widget.ref = null;
			widget.set("ref", datamodel);
		},

		deactivate: function(){
			// console.log("configure view deactivate, unbind data");
		}
	}
});
