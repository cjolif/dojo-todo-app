define(["dojo/dom", "dojo/on", "dojox/mobile/TransitionEvent"], function(dom, on, TransitionEvent){
	var signals = []; // events connect result

	var listsmodel = null;	//repeat view data model

	// get index from dom node id
	var getIndexFromId = function(node, perfix){
		while(node && !node.id){
			node = node.parentNode;
		}
		var nodeId = node.id;
		var len = perfix.length;
		if(nodeId.length <= len){
			throw Error("repeate node id error.");
		}
		var index = nodeId.substring(len, nodeId.length);
		return parseInt(index);
	};
	
	// delete configuration item.
	var _deleteConfItem = function(index){
		if(!window.confirm("Are you sure to delete this item ?")){
			return;
		}
		var datamodel = listsmodel.model;
		var len = datamodel.length;
		if (index >= 0 && index < len) {
			datamodel.splice(index, 1);
		}
	};

	return {
		init: function(){
			listsmodel = this.loadedModels.listsmodel;
			var configureListDom = dom.byId("configure_edit");
			var connectResult;
			var signal = on(configureListDom, "div .mblDomButtonRedCircleMinus:click", function(e){
				// stop transition because listsmodel update will trigger transition to items,list view by default.
				todoApp.stopTransition = true;

				var index = getIndexFromId(e.target, "editList");
				_deleteConfItem(index);
			});
			signals.push(signal);
			
			signal = on(dom.byId("configuration_done"), "click", dojo.hitch(this, function(e){
				var transOpts;
				// on tablet directly transition to list view because tablet has navigation bar on the left
				if(todoApp.isTablet){
					transOpts = {
						title: "List",
						target: "items,list",
						url: "#items,list"
					}
					console.log("tablet transition to list view");
				}else{
					// on phone transition to configure view to select the item
					transOpts = {
						title: "Configuration",
						target: "configuration,configure",
						url: "#configuration,configure"
					}
				}
				new TransitionEvent(e.srcElement,transOpts,e).dispatch();
			}));
			signals.push(signal);
		},

		// destroy the events signals
		destroy: function(){
			var signal = signals.pop();
			while(signal){
				signal.remove();
				signal = signals.pop();
			}
		}
	}
});
