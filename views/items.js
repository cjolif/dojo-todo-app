define(["dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dojo/on", "dojox/mobile/TransitionEvent"],
	function(lang, dom, domStyle, on, TransitionEvent){
	var signals = []; // events connect result

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
				domStyle.set(dom.byId("gotoConfigurationView"), "display", "none");
			}

			var signal = on(dom.byId("itemslist_add"), "click", lang.hitch(this, function(e){
				add();
			}));
			signals.push(signal);
		},
		
		destroy: function(){
			var signal = signals.pop();
			while(signal){
				signal.remove();
				signal = signals.pop();
			}
		}
	}
});
