define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojox/mobile/TransitionEvent", "../utils/utils"], function(dom, dstyle, connect, registry, mvc, TransitionEvent, utils){
	return {
		init: function(){
			// Edit configuration items done, commit the data to server/data store.
			function done(){
				//commit configuration data
				var datamodel = app.loadedModels.listsmodel;
				datamodel.commit();
				//console.log(datamodel.toPlainObject());

				//TODO: stop click event bubble, wait for update data to server ready.
				//      then bubble this event and let TabBarButton transition
			};

			connect.connect(dom.byId('configuration_done'), "click", function(){
				done();
			});

			//bind deleteItem function to global window object because we want call in directly in button onclick.
			window.addNewConfItem = this._addNewConfItem;
			window.editConfItem = this._editConfItem;
			window.updateConfItemData = this._updateConfItemData;
			window.addConfItemData = this._addConfItemData;
			window.deleteConfItem = this._deleteConfItem;

			window.refreshList = this.refresh;
			this.refresh();
		},

		// delete configuration item.
		// Here we need to bind this function scope to global window object because we want to call in directly in button's onclick,
		// and the button is in the global scope.
		_deleteConfItem: function(index){
			console.log("deleteItem ", index);
			if(!window.confirm('Are you sure to delete this item ?')){
				return;
			}
			var datamodel = app.loadedModels.listsmodel;
			var len = datamodel.length;
			if (index >= 0 && index < len) {
				datamodel.remove(index);
				datamodel.commit(); //need to commit after delete. TODO: need to enhance the performance
			}
			//Refresh the view
			window.refreshList();
		},

		// Add a configuration item to configration data model.
		_addNewConfItem: function(node){
			console.log("add a configuration item.");
			function showEditBox(elem){
				var text = elem.innerHTML;
				elem.innerHTML = '<input style="border: none; height:35px; width: 200px;" type="text" onblur="addConfItemData(this);" placeholder="' + text + '"/>';
				elem.onclick = '';
			};
			showEditBox(node);
		},

		_addConfItemData: function(node){
			var datamodel = app.loadedModels.listsmodel;
			var index = datamodel.length;
			var insert = mvc.newStatefulModel({
				"data": {
					"title": node.value,
					"id": (new Date().getTime()),
					"itemsurl": "../resources/data/items-for-" + index + ".json"
				}
			});
			datamodel.add(index, insert);
			datamodel.commit(); //need to commit after delete. TODO: need to enhance the performance
			//Refresh the view
			window.refreshList();
		},

		_updateConfItemData: function(node, index){
			console.log("update item data", node, index);
			// ToDo: how to update data model by set method
			// datamodel.set('title', 'New Name') doesn't work.
			var datamodel = app.loadedModels.listsmodel[index];
			var newTitle = node.value;
			datamodel.data.title = newTitle;
			datamodel.title.data = newTitle;
			datamodel.title.value = newTitle;

			//refresh view
			window.refreshList();
		},

		_editConfItem: function(index){
			console.log("edit item", index);
			var eleNode = window.event.srcElement;
			function showEditBox(elem, index){
				var node = elem;
				var text = node.innerHTML;
				node.innerHTML = '<input type="text" style="border: none; height:35px; width: 200px;" onblur="updateConfItemData(this, ' + index + ');" value="' + text + '"/>';
				node.onclick = '';
			};
			showEditBox(eleNode, index);
		},

		activate: function(){
			this.refresh();
		},

		deactivate: function(){
		},

		refresh: function(){
			var listsmodel = app.loadedModels.listsmodel;
			var listWidget = registry.byId('configure_edit');
			listWidget.destroyDescendants();

			var listItem = new dojox.mobile.ListItem({
				label: '<div style="position:relative; left: 34px;">Completed</div>'
			});
			listWidget.addChild(listItem);

			for (var i = 0; i < listsmodel.length; i++) {
				var options = {
					label: '<div onclick="deleteConfItem(' + i + ')" class="mblListItemDeleteIcon" style="float: left; position:relative; top: 8px;"> \
								<div class="mblDomButtonRedCircleMinus mblDomButton"><div><div><div></div></div></div></div> \
								</div> \
								<img alt="" src="images/tab-icon-11.png" class="mblImageIcon mblListItemRightIcon"> \
								<div onclick="editConfItem(' +
					i +
					');" class="mblListItemTextBox" style="float: left; position:relative; left: 8px;">' +
					listsmodel[i].title.value +
					'</div>'
				};

				listItem = new dojox.mobile.ListItem(options);
				listWidget.addChild(listItem);
			}
			// add new item
			listItem = new dojox.mobile.ListItem({
				label: '<div style="position:relative; left: 34px;" onclick="addNewConfItem(this);">Create New List...</div>'
			});
			listWidget.addChild(listItem);
		}
	}
});
