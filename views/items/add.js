define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mobile/TransitionEvent", "dojox/mvc/getStateful"],
function(dom, connect, registry, TransitionEvent, getStateful){
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
			"id": parseInt((new Date().getTime())),
			"parentId": parentId,
			"title": dom.byId('item_title').value,
			"notes": dom.byId('item_notes').value,
			"due": null,
			"completionDate": "",
			"reminderOnAday": "off",   
			"reminderDate": "",
			"reminderOnAlocation": "off",   
			"reminderLocation": null,
			"repeat": 0,
			"priority": 0,
			"hidden": false,
			"completed": false,
			"deleted": false
		}));
		itemlistmodel.commit();
	};

	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;

			var connectResult;
			connectResult = connect.connect(dom.byId('addItem_cancel'), "click", dojo.hitch(this, function(e){
				history.back();
			}));
			_connectResults.push(connectResult);
			
			var connectResult;
			connectResult = connect.connect(dom.byId('addItem_add'), "click", dojo.hitch(this, function(e){
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

		afterActivate: function(){
			registry.byId('item_title').focus();
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
