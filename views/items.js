define(["dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dijit/registry", "dojox/mobile/TransitionEvent"],
	function(lang, dom, domStyle, registry, TransitionEvent){
	return {
		init: function(){
			if(this.app.isTablet){
				domStyle.set(dom.byId("gotoConfigurationView"), "display", "none");
			}

			registry.byId("itemslist_add").on("click", lang.hitch(this, function(e){
				// transition to detail view for edit
				var transOpts = {
					title: "Detail",
					target: "details,EditTodoItem",
					url: "#details,EditTodoItem",
					data: {
						addNewItem : true
					}
				};
				new TransitionEvent(e.target, transOpts, e).dispatch();
			}));
		}
	}
});
