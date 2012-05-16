define(["dojo/dom", "dojo/on", "dijit/registry", "dojox/mobile/TransitionEvent", "dojox/mvc/getStateful"],
function(dom, on, registry, TransitionEvent, getStateful){
	var itemlistmodel = null;
	var listsmodel = null;
	var signals = [];

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

			var signal;

			signal = on(dom.byId('addItem_cancel'), "click", dojo.hitch(this, function(e){
				history.back();
			}));

			signal = on(dom.byId('addItem_add'), "click", dojo.hitch(this, function(e){
				add();
				var transOpts = {
					title:"List",
					target:"items,list",
					url: "#items,list"
				}
				new TransitionEvent(e.srcElement,transOpts,e).dispatch();
			}));

			signals.push(signal);
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
			var signal = signals.pop();
			while(signal){
				signal.remove();
				signal = signals.pop();
			}
		}
	}
});
