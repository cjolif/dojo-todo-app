define(["dojo/dom", "dojo/_base/lang", "dojo/dom-style", "dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent", "../utils/utils"],
	function(dom, lang, domStyle, registry, at, TransitionEvent, utils){

	var app = null;
	
	selectCompleted = function(index){
		app.selected_configuration_item = index;
	};

	return {
		init: function(){
			app = this.app;
			
			 registry.byId("configure_list").on("checkStateChanged", lang.hitch(this, function(item, state){
				// save the select value to data store
				if(state && !this.app.stopTransition){
					var index = utils.getIndexByListItem(registry.byId("configure_list"), item);
					//console.log("configure.js onCheckStateChanged setting this.app.selected_configuration_item = "+index);
					this.app.selected_configuration_item = index;

					// transition to list view
					var transOpts = {
						title:"List",
						target:"items,ViewListTodoItemsByPriority",
						url: "#items,ViewListTodoItemsByPriority"
					};
					var e = window.event;
					new TransitionEvent(e.target,transOpts,e).dispatch();
				}
			}));
		},
		beforeActivate: function(){
			this.app.stopTransition = false;
			//console.log("configuration/SelectTodoList beforeActivate called this.app.selected_configuration_item=",this.app.selected_configuration_item);
		},
		
		afterActivate: function(){
			//console.log("configuration/SelectTodoList afterActivate called this.app.selected_configuration_item=",this.app.selected_configuration_item);
			//console.log("setting configurewrapper visible 1");
			domStyle.set(dom.byId("configurewrapper"), "visibility", "visible"); // show the items list
		},
		
		beforeDeactivate: function(){
			//console.log("configuration/SelectTodoList beforeDeactivate called this.app.selected_configuration_item=",this.app.selected_configuration_item);
		},

		afterDeactivate: function(){
			//console.log("configuration/SelectTodoList afterDeactivate called this.app.selected_configuration_item=",this.app.selected_configuration_item);
			//console.log("setting configurewrapper hidden");
			domStyle.set(dom.byId("configurewrapper"), "visibility", "hidden"); // hide the items list 
		},

		destroy: function(){
			// _WidgetBase.on listener is automatically destroyed when the Widget itself his.
		}
	}
});
