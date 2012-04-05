define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"],
function(dom, connect, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	//set todoApp showItemDetails function
	todoApp.cachedDataModel = {};
	todoApp.currentItemListModel = null;

	todoApp.showItemDetails = function(index){
		console.log("select item ", index);
		todoApp.selected_item = index;
	};

	todoApp._addNewItem = function(node){
		console.log(node.value);
		var datamodel = app.loadedModels.itemlistmodel;
		var parentId;
		try {
			parentId = datamodel[0].parentId.data;
		} 
		catch (e) {
			console.log("Warning: itemlistmodel is empty, get parentId from listsmodel");
			parentId = app.loadedModels.listsmodel[window.selected_configuration_item].id.data;
		}
		var index = datamodel.length;
		var insert = mvc.newStatefulModel({
			"data": {
				"id": (new Date().getTime()),
				"parentId": parentId,
				"title": node.value,
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
		datamodel.commit(); //need to commit after delete. TODO: need to enhance the performance
		//update cache
		app.loadedModels.cacheModel[parentId] = datamodel;
		//refresh view
		window.showData(datamodel);
	};

	return {
		// delete "items-for-2.json" because the generate item id not consist with the data file parent id.
		dataFile: ["items-for-0.json", "items-for-1.json"],

		init: function(){
			if (this.loadedModels.itemlistmodel && this.loadedModels.itemlistmodel[0].parentId) {
				var index = this.loadedModels.itemlistmodel[0].parentId.data;
				todoApp.cachedDataModel[index] = this.loadedModels.itemlistmodel;
				todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
			}
		},

		showData: function(data){
			// TODO: use dojox.mvc set ref to when dojox.mvc ready
			//			var widget = registry.byId("itemlist_repeat");
			//			widget.ref = null;
			//			widget.set("ref", datamodel);
			var listItem;
			var listWidget = registry.byId("items_list");
			listWidget.destroyDescendants();
			
			var checked = "";
			for (var i = 0; i < data.length; i++) {
				checked = ""
				if (data[i].completed.value) {
					checked = "checked";
				}
				listItem = new dojox.mobile.ListItem({
					label: '<table><tr><td><input preventTouch="true" type="checkbox" ' + checked + ' onclick="return markCompleted(this, ' + i + ');"/></td><td>' + data[i].title.value + '</td></tr></table>',
					clickable: true,
					transitionOptions: {
						title: "Detail",
						target: "details,detail",
						url: "#details,detail"
					},
					index: i,
					onClick: function(){
						console.log("select item ", this.index);
						window.selected_item = this.index;
					}
				});
				listWidget.addChild(listItem);
			}
			// add edit list
			listWidget.addChild(new dojox.mobile.ListItem({
				label: '<input type="text" style="position:relative; left: 30px; border: none; height:35px; width: 200px;" onblur="addNewItem(this);" placeholder="Add New Item"/>',
			}));
		},

		refreshData: function(){
			this.showListType();
			if (todoApp.selected_configuration_item == -1) {
				this.showListData(this.loadedModels.completedmodel);
				todoApp.currentItemListModel = this.loadedModels.completedmodel;
				return;
			}

			var select_data = this.loadedModels.listsmodel[todoApp.selected_configuration_item];
			// get data model in cache
			if (todoApp.cachedDataModel[select_data.id.data]) { // read data from cache
				this.loadedModels.itemlistmodel = todoApp.cachedDataModel[select_data.id.data];
				this.showListData(this.loadedModels.itemlistmodel);
				todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
				return;
			}else if (!isFileExist(select_data.itemsurl.data, this.dataFile)) {
				// create in-memory store if the file not exists
				// TODO: use the exists file in an array in this demo.
				console.log("file not exist.", select_data.itemsurl.data);
				var tempStore = new dojo.store.Memory({
					"data": []
				});
				var datamodel = mvc.newStatefulModel({
					"store": tempStore
				});
				this.loadedModels.itemlistmodel = datamodel;
				todoApp.cachedDataModel[select_data.id.data] = datamodel;
				todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
				
				this.showListData(datamodel);
			}else { // load data model from data file
				var writeStroe = new itemfilewritestore({
					url: select_data.itemsurl.data
				});
				var modelPromise = mvc.newStatefulModel({
					store: new datastore({
						store: writeStroe
					})
				});
				modelPromise.then(dojo.hitch(this, function(datamodel){
					var listId = datamodel[0].parentId.data;
					if (listId == todoApp.selected_configuration_item) {
						this.loadedModels.itemlistmodel = datamodel;
						todoApp.cachedDataModel[listId] = datamodel;
						todoApp.currentItemListModel = this.loadedModels.itemlistmodel;
						
						this.showListData(datamodel);
					}
				}));
			};

			function isFileExist(filename, files){
				for (var file in files) {
					if (filename.indexOf(files[file]) > 0) {
						return true;
					}
				}
				return false;
			};
		},

		beforeActivate: function(){
			this.refreshData();
		},

		showListData: function(datamodel){
			var listWidget = registry.byId("items_list");
			listWidget.set('ref', datamodel);
		},
		
		showListType: function(){
			var type;
			if(todoApp.selected_configuration_item == -1){
				type="Completed";
			}else{
				var listdata = this.loadedModels.listsmodel[todoApp.selected_configuration_item];
				if(listdata && listdata.title){
					type = listdata.title;
				}else{
					type = "Unknown";
				}
			}
			dom.byId('list_type').innerHTML = type;
		}
	}
});
