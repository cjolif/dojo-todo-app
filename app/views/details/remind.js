define(["dojo/_base/lang", "dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"],
function(lang, dom, connect, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	var _connectResults = []; // events connect result
	var itemlistmodel = null;

	var refreshData = function(){
		var datamodel = itemlistmodel.model[todoApp.selected_item];
		if (datamodel) {
			// need to add onAday property to the original data store
			var widget = registry.byId('remind_day_switch');
			if (datamodel.onAday) { //set on a day switch
				widget.set("value", "on");
			}
			else {
				widget.set("value", "off");
			}

			// need to add atAlocation property to the original data store
			widget = registry.byId('remind_location_switch');
			if (datamodel.atAlocation) { //set on a day switch
				widget.set("value", "on");
			}
			else {
				widget.set("value", "off");
			}

			//set remind time
			widget = registry.byId('remind_time');
			if (datamodel.reminder && widget) { //set on a day switch
				widget.set("label", datamodel.reminder);
			}
		}
	};
	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
		
			var connectResult;
			connectResult = connect.connect(registry.byId('remind_day_switch'), 'onStateChanged', lang.hitch(this, function(newState){
				console.log("remind_day_switch = ", newState);
				// update remind on a day value to the data model
				var datamodel = this.loadedModels.itemlistmodel.model[todoApp.selected_item];
				var result = false;
				if (newState == "on") {
					result = true;
				}

				if (datamodel) {
					datamodel.onAday = result;
				}
			}));
			_connectResults.push(connectResult);

			connectResult = connect.connect(registry.byId('remind_location_switch'), 'onStateChanged', lang.hitch(this, function(newState){
				console.log("remind_location_switch = ", newState);
				// update remind on a day value to the data model
				var datamodel = this.loadedModels.itemlistmodel.model[todoApp.selected_item];
				var result = false;
				if (newState == "on") {
					result = true;
				}
				
				if (datamodel) {
					datamodel.atAlocation = result;
				}
			}));
			_connectResults.push(connectResult);
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			refreshData();
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
