define(["dojo/_base/lang", "dojox/mobile/TransitionEvent", "dijit/registry", "dojo/sniff"],
	function(lang, TransitionEvent, registry, has){

	// get index from dom node id
	var getIndexFromId = function(node, prefix){
		while(node && !node.id){
			node = node.parentNode;
		}
		var nodeId = node.id;
		var len = prefix.length;
		if(nodeId.length <= len){
			throw Error("repeat node id error.");
		}
		var index = nodeId.substring(len, nodeId.length);
		return parseInt(index);
	};
	
	var show = function(){
		registry.byId("dlg_confirmMod").show();
	};

	var hide = function(){
		registry.byId("dlg_confirmMod").hide();
	};

	return {
		init: function(){
			registry.byId("configure_edit").on("div .mblDomButtonRedCircleMinus:click", lang.hitch(this, function(e){
				// stop transition because listsmodel update will trigger transition to items,ViewListTodoItemsByPriority view by default.
				this.app.stopTransition = true;
				this._deleteListIndex = getIndexFromId(e.target, "editList");
				show();
			}));

			registry.byId("confirm_yesMod").on("click", lang.hitch(this, function(){
				var datamodel = this.loadedModels.listsmodel.model;
				var len = datamodel.length;
				var index = this._deleteListIndex;
				if(index >= 0 && index < len){
					datamodel.splice(index, 1);
				}
				//hide confirm dialog
				hide();
			}));

			registry.byId("confirm_noMod").on("click", lang.hitch(this, function(){
				hide();
			}));

			registry.byId("configuration_done").on("click", lang.hitch(this, function(e){
				var transOpts;
				// on tablet directly transition to list view because tablet has navigation bar on the left
				if(!has("phone")){
					transOpts = {
						title: "List",
						target: "items,ViewListTodoItemsByPriority",
						url: "#items,ViewListTodoItemsByPriority"
					};
					console.log("tablet transition to list view");
				}else{
					// on phone transition to configure view to select the item
					transOpts = {
						title: "Configuration",
						target: "configuration,SelectTodoList",
						url: "#configuration,SelectTodoList"
					}
				}
				new TransitionEvent(e.target,transOpts,e).dispatch();
			}));
		}
	}
});
