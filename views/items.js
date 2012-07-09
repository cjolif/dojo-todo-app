define(["dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dojo/on", "dojox/mobile/TransitionEvent", "./utils"],
	function(lang, dom, domStyle, on, TransitionEvent, utils){
	var signals = []; // events connect result

	var add = function(){
		// use selected_item = -1 to identify add a new item
		this.app._addNewItem = true;

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

			if(this.app.isTablet){
				domStyle.set(dom.byId("gotoConfigurationView"), "display", "none");
			}

			var signal = on(dom.byId("itemslist_add"), "click", lang.hitch(this, function(e){
				add();
			}));
			signals.push(signal);
		},
		
		destroy: function(){
			utils.destroySignals(signals);
		}
	}
});
