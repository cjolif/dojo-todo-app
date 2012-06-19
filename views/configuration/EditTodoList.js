define(["dojo/_base/lang", "dojo/dom", "dojo/on", "dojox/mvc/getStateful"], function(lang, dom, on, getStateful){
	var signals = []; // events connect result
	var listsmodel = null;

	return {
		init: function(){
			listsmodel = this.loadedModels.listsmodel;

			var signal = on(dom.byId("addList_add"), "click", lang.hitch(this, function(e){
				var title = dom.byId("titleInput").value;
				if(title){
					// stop transition because listsmodel update will trigger transition to items,ViewListTodoItemsByPriority view by default.
					todoApp.stopTransition = true;

					listsmodel.model.push(new getStateful({
						"id": (new Date().getTime()),
						"title": dom.byId("titleInput").value,
						"description": dom.byId("desInput").value
					}));
				}
				history.back();
			}));
			signals.push(signal);
		},

		beforeActivate: function(){
			dom.byId("titleInput").value = "";
			dom.byId("desInput").value = "";
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
