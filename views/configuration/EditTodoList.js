define(["dojo/_base/lang", "dojo/dom", "dojo/on", "dojox/mvc/getStateful", "../utils"],
	function(lang, dom, on, getStateful, utils){
	var signals = []; // events connect result

	return {
		init: function(){
			var signal = on(dom.byId("addList_add"), "click", lang.hitch(this, function(e){
				var title = dom.byId("titleInput").value;
				if(title){
					// stop transition because listsmodel update will trigger transition to items,ViewListTodoItemsByPriority view by default.
					this.app.stopTransition = true;

					this.loadedModels.listsmodel.model.push(new getStateful({
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
			utils.destroySignals(signals);
		}
	}
});
