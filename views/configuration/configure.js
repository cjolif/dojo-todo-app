define(["dojo/dom", "dojo/_base/lang", "dojo/dom-style", 
	"dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent", "../utils/utils"],
function(dom, lang, domStyle, connect, registry, at, TransitionEvent, utils){

	return {
		init: function(){
			 registry.byId("configure_list").on("checkStateChanged", function(item, state){
				// save the select value to data store
				if(state && !todoApp.stopTransition){
					var index = utils.getIndexByListItem(registry.byId("configure_list"), item);
					//console.log("configure.js onCheckStateChanged setting todoApp.selected_configuration_item = "+index);
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
		},
		beforeActivate: function(){
			todoApp.stopTransition = false;
			console.log("configuration/configure beforeActivate called todoApp.selected_configuration_item=",todoApp.selected_configuration_item);
		},
		
		afterActivate: function(){
			console.log("configuration/configure afterActivate called todoApp.selected_configuration_item=",todoApp.selected_configuration_item);
			console.log("setting configurewrapper visible 1");
			domStyle.set(dom.byId("configurewrapper"), "visibility", "visible"); // show the items list
		},
		
		beforeDeactivate: function(){
			console.log("configuration/configure beforeDeactivate called todoApp.selected_configuration_item=",todoApp.selected_configuration_item);
		},

		afterDeactivate: function(){
			console.log("configuration/configure afterDeactivate called todoApp.selected_configuration_item=",todoApp.selected_configuration_item);
			console.log("setting configurewrapper hidden");
			domStyle.set(dom.byId("configurewrapper"), "visibility", "hidden"); // hide the items list 
		},

		destroy: function(){
			// _WidgetBase.on listener is automatically destroyed when the Widget itself his.
		}
	}
});
