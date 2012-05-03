define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojox/mobile/TransitionEvent", "../utils/utils"], function(dom, dstyle, connect, registry, mvc, TransitionEvent, utils){
	var _connectResults = []; // events connect result

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
		if(!window.confirm('Are you sure to delete this item ?')){
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
			var configureListDom = dom.byId('configure_edit');
			var connectResult;
			connectResult = connect.connect(configureListDom, "div .mblDomButtonRedCircleMinus:click", function(e){
				var index = getIndexFromId(e.target, "editList");
				_deleteConfItem(index);
			});
			_connectResults.push(connectResult);
		},

		// repeate view destroy
		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	}
});
