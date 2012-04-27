define(["dojo/dom", "dojo/_base/connect", "dojox/mobile/TransitionEvent", "dojox/mvc/getStateful"],
function(dom, connect, TransitionEvent, getStateful){
	var _connectResults = []; // events connect result
	var itemlistmodel = null;
	var listsmodel = null;

	var add = function(){
		var datamodel = itemlistmodel.model;

		var parentId;
		try{
			parentId = datamodel[0].parentId;
		}catch(e){
			console.log("Warning: itemlistmodel is empty, get parentId from listsmodel");
			parentId = listsmodel.model[todoApp.selected_configuration_item].id;
		}

		itemlistmodel.model.push(new getStateful({
			"id": (new Date().getTime()),
			"parentId": parentId,
			"title": dom.byId('item_title').value,
			"notes": dom.byId('item_notes').value,
			"due": "2011-10-15T11:03:47.681Z",
			"completionDate": "",
			"reminder": "2011-10-15T11:03:47.681Z",
			"repeat": 0,
			"priority": 0,
			"hidden": false,
			"completed": false,
			"deleted": false
		}));
	};

	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;

			var connectResult;
			connectResult = connect.connect(dom.byId('edit_list_done'), "click", dojo.hitch(this, function(e){
				add();
				var transOpts = {
					title:"List",
					target:"items,list",
					url: "#items,list"
				}
				new TransitionEvent(e.srcElement,transOpts,e).dispatch();
			}));
			_connectResults.push(connectResult);
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			dom.byId('item_title').value = '';
			dom.byId('item_notes').value = '';
		},

		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	}
});
