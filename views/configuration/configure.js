define(["dojo/dom", "dojo/_base/lang", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent", "../utils/utils"],
function(dom, lang, dstyle, connect, registry, at, TransitionEvent, utils){
	var _connectResults = []; // events connect result

	return {
		init: function(){
			var connectResult;
			connectResult = connect.connect(registry.byId("configure_list"), "onCheckStateChanged", null, function(item, state){
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
			_connectResults.push(connectResult);
		},
		beforeActivate: function(){
			todoApp.stopTransition = false;
			console.log("configuration/configure beforeActivate called todoApp.selected_configuration_item=",todoApp.selected_configuration_item);
		},
		
		afterActivate: function(){
			console.log("configuration/configure afterActivate called todoApp.selected_configuration_item=",todoApp.selected_configuration_item);
			console.log("setting configurewrapper visible 1");
			dstyle.set(dom.byId("configurewrapper"), 'visibility', 'visible'); // show the items list
		},
		
		beforeDeactivate: function(){
			console.log("configuration/configure beforeDeactivate called todoApp.selected_configuration_item=",todoApp.selected_configuration_item);
		},

		afterDeactivate: function(){
			console.log("configuration/configure afterDeactivate called todoApp.selected_configuration_item=",todoApp.selected_configuration_item);
			console.log("setting configurewrapper hidden");
			dstyle.set(dom.byId("configurewrapper"), 'visibility', 'hidden'); // hide the items list 
		},

		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	}
});
