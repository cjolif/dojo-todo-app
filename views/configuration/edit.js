define(["dojo/dom", "dojo/on"], function(dom, on){
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
				var index = getIndexFromId(e.target, "editList");
				_deleteConfItem(index);
			});
			signals.push(signal);
		},

		// repeate view destroy
		destroy: function(){
			var signal = signals.pop();
			while(signal){
				signal.remove();
				signal = signals.pop();
			}
		}
	}
});
