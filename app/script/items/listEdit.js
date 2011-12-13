define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojox/mobile/TransitionEvent"],
function(dom, dstyle, connect, registry, mvc, TransitionEvent){
	return {
		init: function(){
			// Edit configuration items done, commit the data to server/data store.
			function done(){
				//commit configuration data
				var datamodel = app.loadedModels.itemlistmodel;
				datamodel.commit();
				console.log(datamodel.toPlainObject());
				app.loadedModels.itemlistsmodel[datamodel[0].parentId.data] = datamodel;

				//TODO: stop click event bubble, wait for update data to server ready.
				//      then bubble this event and let TabBarButton transition
				// publish transition event
				var transOpts = {
					title:"List",
					target:"items,list",
					url: "#items,list"
				};
				var e = window.event;
				new TransitionEvent(e.srcElement,transOpts,e).dispatch();
			};

			// Add a configuration item to configration data model.
			function addItem(){
				console.log("add a list item.");
				var datamodel = app.loadedModels.itemlistmodel;
				var parentId = datamodel[0].parentId.data;
				var index = datamodel.length;
				var insert = mvc.newStatefulModel({
					"data": {
						"id": (new Date().getTime()),
						"parentId":parentId,
						"title": "list item "+index+" for "+parentId,
						"notes": "To do",
						"due": "2010-10-15T11:03:47.681Z",
						"completionDate": "",
						"reminder": "2010-10-15T11:03:47.681Z",
						"repeat": 0,
						"priority": 0,
						"hidden": false,
						"completed": false,
						"deleted": false
					}
				});
				datamodel.add(index, insert);
				datamodel.commit();	//need to commit after delete. TODO: need to enhance the performance

				//update cache
				app.loadedModels.itemlistsmodel[parentId] = datamodel;
			};

			// delete configuration item.
			// Here we need to bind this function scope to global window object because we want to call in directly in button's onclick,
			// and the button is in the global scope.
			function deleteItemList(index){
				console.log("delete Item ", index);
				var datamodel = app.loadedModels.itemlistmodel;
				var len = datamodel.length;
				if(index>=0 && index<len){
					datamodel.remove(index);
					datamodel.commit(); //need to commit after delete. TODO: need to enhance the performance
				}

				// stop bubble onclick event to ListItem
				var evt = window.event;
				if (evt.preventDefault){
					evt.preventDefault();
				}
				evt.cancelBubble = true;
				if(evt.stopPropagation){
				    evt.stopPropagation();
				}
			};

			// override ListItem onClick event
			function selectItemList(node, index){
				if(window.selected_list_item == index){
					return;
				}
				window.selected_list_item = index;

				// publish transition event
				registry.byNode(node).select();
				var transOpts = {
					title:"Edit List",
					target:"items,list_edit_item",
					url: "#items,list_edit_item"
				};
				var e = window.event;
				new TransitionEvent(node,transOpts,e).dispatch();
			};

			connect.connect(dom.byId('items_list_done'), "click", function(){
				done();
			});

			connect.connect(dom.byId('items_list_add'), "click", function(){
				addItem();
			});

			//bind deleteItem function to global window object because we want call in directly in button onclick.
			window.deleteItemList = deleteItemList;
			window.selectItemList= selectItemList;
		},

		activate: function(){
			var datamodel = app.loadedModels.itemlistmodel;
			var widget = registry.byId('list_edit_repeat');
			widget.ref = null;
			widget.set("ref", datamodel);
		},

		deactivate: function(){
			// console.log("configure_edit view deactivate, unbind data");
		}
	}
});
