define(["dojo/_base/lang", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent", "../utils/utils"],
function(lang, connect, registry, at, TransitionEvent, utils){
	window.at = at;	// set global namespace for dojox.mvc.at
	dojox.debugDataBinding = true;	//disable dojox.mvc data binding debug
	var _connectResults = []; // events connect result

	return {
		init: function(){
			var connectResult;
			connectResult = connect.connect(registry.byId("configure_list"), "onCheckStateChanged", null, function(item, state){
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
			_connectResults.push(connectResult);
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
