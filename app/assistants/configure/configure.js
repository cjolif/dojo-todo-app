define(["dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mobile/TransitionEvent", "../utils/utils"],
function(lang, dom, dstyle, connect, registry, TransitionEvent, utils){
	return {
		init: function(){
			dojo.connect(registry.byId("configure_list"), "onCheckStateChanged", null, function(item, state){
				// save the select value to data store
				if (state) {
					var index = utils.getIndexByListItem(registry.byId("configure_list"), item);
					todoApp.selected_configuration_item = index;

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
		}
	}
});
