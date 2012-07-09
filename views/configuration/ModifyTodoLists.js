define(["dojo/_base/lang", "dojo/dom", "dojo/on", "dojox/mobile/TransitionEvent", "dijit/registry", "../utils"],
	function(lang, dom, on, TransitionEvent, registry, utils){
	var signals = []; // events connect result

	// get index from dom node id
	var getIndexFromId = function(node, perfix){
		while(node && !node.id){
			node = node.parentNode;
		}
		var nodeId = node.id;
		var len = perfix.length;
		if(nodeId.length <= len){
			throw Error("repeat node id error.");
		}
		var index = nodeId.substring(len, nodeId.length);
		return parseInt(index);
	};
	
	// delete configuration item.
	var deleteConfItem = function(index){
		dom.byId("dlg_titleMod").innerHTML = "Delete";
		dom.byId("dlg_textMod").innerHTML = "Are you sure you want to delete this list?";
		show();
	};

	var show = function(){
		registry.byId("dlg_confirmMod").show();
	};

	var hide = function(){
		registry.byId("dlg_confirmMod").hide();
	};


	return {
		init: function(){
			var configureListDom = dom.byId("configure_edit");
			var signal = on(configureListDom, "div .mblDomButtonRedCircleMinus:click", lang.hitch(this, function(e){
				// stop transition because listsmodel update will trigger transition to items,ViewListTodoItemsByPriority view by default.
				this.app.stopTransition = true;

				var index = getIndexFromId(e.target, "editList");
				this.deleteList = index;
				deleteConfItem(index);
			}));
			signals.push(signal);

			signal = on(dom.byId("confirm_yesMod"), "click", lang.hitch(this, function(){
				var datamodel = this.loadedModels.listsmodel;
				var len = datamodel.length;
				var index = this.deleteList;				
				if (index >= 0 && index < len) {
					datamodel.splice(index, 1);
				}
				//hide confirm dialog
				hide();
			}));
			signals.push(signal);

			signal = on(dom.byId("confirm_noMod"), "click", lang.hitch(this, function(){
				hide();
			}));
			signals.push(signal);
			
			signal = on(dom.byId("configuration_done"), "click", lang.hitch(this, function(e){
				var transOpts;
				// on tablet directly transition to list view because tablet has navigation bar on the left
				if(this.app.isTablet){
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
				new TransitionEvent(e.srcElement,transOpts,e).dispatch();
			}));
			signals.push(signal);
		},

		// destroy the events signals
		destroy: function(){
			utils.destroySignals(signals);
		}
	}
});
