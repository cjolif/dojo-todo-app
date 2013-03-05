define(["dojo/_base/lang", "dojo/dom", "dijit/registry", "dojox/mvc/getStateful"],
	function(lang, dom, registry, getStateful){

	return {
		init: function(){
			registry.byId("addList_add").on("click", lang.hitch(this, function(e){
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
		},

		beforeActivate: function(){
			dom.byId("titleInput").value = "";
			dom.byId("desInput").value = "";
		}
	}
});
