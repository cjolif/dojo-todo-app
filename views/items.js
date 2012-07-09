define(["dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dojo/on", "dojox/mobile/TransitionEvent", "./utils"],
	function(lang, dom, domStyle, on, TransitionEvent, utils){
	var signals = []; // events connect result

	return {
		init: function(){
			if(this.app.isTablet){
				domStyle.set(dom.byId("gotoConfigurationView"), "display", "none");
			}

			var signal = on(dom.byId("itemslist_add"), "click", lang.hitch(this, function(e){
				// use selected_item = -1 to identify add a new item
				this.app._addNewItem = true;

				// transition to detail view for edit
				var transOpts = {
					title: "Detail",
					target: "details,EditTodoItem",
					url: "#details,EditTodoItem"
				};
				new TransitionEvent(e.srcElement, transOpts, e).dispatch();
			}));
			signals.push(signal);
		},
		
		destroy: function(){
			utils.destroySignals(signals);
		}
	}
});
