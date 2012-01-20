define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc","dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"], 
	function(dom, connect, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	return {
		// delete "items-for-2.json" because the generate item id not consist with the data file parent id.
		dataFile: ["items-for-0.json", "items-for-1.json"],

		init: function(){
			// show data
			if(!window.selected_configuration_item){
				window.selected_configuration_item = 0;
			}
			app.loadedModels.itemlistsmodel = []; // initial the cache models
			this.refresh();

			//refresh data
			function _refreshLater(datamodel){
				return function(){
					window.showData(datamodel);
				}
			}

			// move an item from Completed data model to original data model
			function _moveFromCompleted(index){
				var datamodel = app.loadedModels.completedmodel;
				if (index >= 0 && index < datamodel.length) {
					var data = datamodel[index];

					//update data
					data.completed.value = false;
					data.completed.data = false;
					data.data.completed = false;

					// move data from complete model to original data modle
					var originalmodel = app.loadedModels.itemlistsmodel[data.parentId.value];
					if(!originalmodel){
						throw("original data model not exist.");
					}

					originalmodel.add(originalmodel.length, mvc.newStatefulModel({
						"data": data.data
					}));
					originalmodel.commit();

					// delete data from current itemlistmodel
					var completedModel = app.loadedModels.completedmodel;
					completedModel.remove(index);
					completedModel.commit();

					window.setTimeout(_refreshLater(completedModel), 500);
				}
			};

			// move an item to Completed data model
			function _moveToCompleted(index){
				var datamodel = app.loadedModels.itemlistmodel;
				if (index >= 0 && index < datamodel.length) {
					var data = datamodel[index];

					//update data
					data.completed.value = true;
					data.completed.data = true;
					data.data.completed = true;

					// move data to complete model
					var completedModel = app.loadedModels.completedmodel;
					completedModel.add(completedModel.length, mvc.newStatefulModel({
						"data": data.data
					}));
					completedModel.commit();

					// delete data from current itemlistmodel
					datamodel.remove(index);
					datamodel.commit();
					window.setTimeout(_refreshLater(datamodel), 500);
				}
			};

			// mark an item done or remark it as not done.
			function _markCompleted(node, index){
				// stop event bubble
				var evt = window.event;
				if (evt.stopPropagation) {
					evt.stopPropagation();
				}

				//TODO: update data model to mark this item as completed
				console.log(node.checked, index);
				if (node.checked) {
					_moveToCompleted(index);
				}
				else {
					_moveFromCompleted(index);
				}
			};
			window.markCompleted = _markCompleted;
			window.showData = this.showData;

			function _addNewItem(node){
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
				app.loadedModels.itemlistsmodel[parentId] = datamodel;
				//refresh view
				window.showData(datamodel);
			};
			window.addNewItem = _addNewItem;
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
					label: '<table><tr><td><input type="checkbox" ' + checked + ' onclick="return markCompleted(this, ' + i + ');"/></td><td>' + data[i].title.value + '</td></tr></table>',
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

		refresh: function(){
			// TODO: deal Completed list
			if (window.selected_configuration_item == -1) {
				this.showData(app.loadedModels.completedmodel);
				return;
			}

			var select_data = app.loadedModels.listsmodel[window.selected_configuration_item];
			// get data model in cache
			if(app.loadedModels.itemlistsmodel[select_data.id.data]){ // read data from cache
				app.loadedModels.itemlistmodel = app.loadedModels.itemlistsmodel[select_data.id.data];

				this.showData(app.loadedModels.itemlistmodel);
				return;
			}
			// create in-memory store if the file not exists
			// TODO: use the exists file in an array in this demo.
			else if(!isFileExist(select_data.itemsurl.data, this.dataFile)){
				console.log("file not exist.", select_data.itemsurl.data);
				var tempStore = new dojo.store.Memory({ "data" : []});
				var datamodel = mvc.newStatefulModel({
					"store": tempStore
				});
				app.loadedModels.itemlistmodel = datamodel;
				app.loadedModels.itemlistsmodel[select_data.id.data] = datamodel;

				this.showData(datamodel);
			}
			// load data model from data file
			else{
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
					if(listId == window.selected_configuration_item){
						app.loadedModels.itemlistmodel = datamodel;
						app.loadedModels.itemlistsmodel[listId] = datamodel;

						this.showData(datamodel);
					}
				}));
			};

			function isFileExist(filename, files){
				for(var file in files){
					if(filename.indexOf(files[file]) > 0){
						return true;
					}
				}
				return false;
			};
		},

		activate: function(){
			this.refresh();
		},

		deactivate: function(){
		}
	}
});
