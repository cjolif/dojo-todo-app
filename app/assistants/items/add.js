define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojox/mobile/TransitionEvent"],
function(dom, dstyle, connect, registry, mvc, TransitionEvent){
	return {
		init: function(){
			connect.connect(dom.byId('edit_list_done'), "click", dojo.hitch(this, function(){
				this.add();
			}));
		},
		
		add: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			var datamodel = this.loadedModels.itemlistmodel;

			var parentId;
			try {
				parentId = datamodel[0].parentId.data;
			} 
			catch (e) {
				console.log("Warning: itemlistmodel is empty, get parentId from listsmodel");
				parentId = this.loadedModels.listsmodel[todoApp.selected_configuration_item].id.data;
			}
			var index = datamodel.length;
			var insert = mvc.newStatefulModel({
				"data": {
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
				}
			});
			datamodel.add(index, insert);
			datamodel.commit();
			console.log(datamodel.toPlainObject());

			var transOpts = {
				title:"List",
				target:"items,list",
				url: "#items,list"
			};
			var e = window.event;
			new TransitionEvent(e.srcElement,transOpts,e).dispatch();
		},
		
		beforeActivate: function(){
			dom.byId('item_title').value = '';
			dom.byId('item_notes').value = '';
		}
	}
});
