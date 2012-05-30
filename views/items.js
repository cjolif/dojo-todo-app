define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dojox/mobile/TransitionEvent", "dojox/mvc/getStateful"],
function(dom, dstyle, connect, TransitionEvent, getStateful){
	var _connectResults = []; // events connect result
	var listsmodel = null;

	var add = function(){
		// use selected_item = -1 to identify add a new item
		todoApp._addNewItem = true;

		// transition to detail view for edit
		var transOpts = {
			title:"Detail",
			target:"details,EditTodoItem",
			url: "#details,EditTodoItem"
		};
		var e = window.event;
		new TransitionEvent(e.srcElement,transOpts,e).dispatch();
	};
	return {
		init: function(){

			if(todoApp.isTablet){
				dstyle.set(dom.byId("gotoConfigurationView"), "display", "none");
			}

			connectResult = connect.connect(dom.byId('itemslist_add'), "click", dojo.hitch(this, function(e){
				add();
			}));
			_connectResults.push(connectResult);
		},
		
		destroy: function(){
			var connectResult = _connectResults.pop();
			while (connectResult) {
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	}
});
