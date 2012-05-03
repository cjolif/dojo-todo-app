define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent"], 
function(dom, connect, registry, at, TransitionEvent){
	window.at = at;	// set global namespace for dojox.mvc.at
	dojox.debugDataBinding = false;	//disable dojox.mvc data binding debug

	var _connectResults = []; // events connect result
	var listsmodel = null;

	todoApp.selectItems = function(node, index){
		if (todoApp.selected_configuration_item == index) {
			return;
		}
		todoApp.selected_configuration_item = index;

		// publish transition event
		var transOpts = {
			title:"List",
			target:"items,list",
			url: "#items,list"
		};
		var e = window.event;
		new TransitionEvent(e.srcElement,transOpts,e).dispatch();
	};

	var editConfiguration = function(){
		// publish transition event
		var transOpts = {
			title:"Edit",
			target:"configuration,edit",
			url: "#configuration,edit"
		};
		var e = window.event;
		new TransitionEvent(e.srcElement,transOpts,e).dispatch();
	};
	
	return {
		init: function(){
			listsmodel = this.loadedModels.listsmodel;

			var connectResult;
			connectResult = connect.connect(dom.byId('setting'), "click", dojo.hitch(this, function(e){
				editConfiguration();
			}));
			_connectResults.push(connectResult);
			console.log("navigation view init ok");
		},
		
		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	};
});
