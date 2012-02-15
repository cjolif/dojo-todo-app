define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"],
function(dom, connect, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	return {
		init: function(){
			this.refresh();
			connect.connect(registry.byId('remind_day_switch'), 'onStateChanged', function(newState){
				console.log("remind_day_switch = ", newState);
				// update remind on a day value to the data model
				var datamodel = app.loadedModels.itemlistmodel[window.selected_item];
				var result = false;
				if (newState == "on") {
					result = true;
				}

				if (datamodel) {
					if (!datamodel.onAday) {
						datamodel.onAday = {};
					}
					datamodel.onAday.data = result;
					datamodel.onAday.value = result;
				}
			});

			connect.connect(registry.byId('remind_location_switch'), 'onStateChanged', function(newState){
				console.log("remind_location_switch = ", newState);
				// update remind on a day value to the data model
				var datamodel = app.loadedModels.itemlistmodel[window.selected_item];
				var result = false;
				if (newState == "on") {
					result = true;
				}

				if (datamodel) {
					if (!datamodel.atAlocation) {
						datamodel.atAlocation = {};
					}
					datamodel.atAlocation.data = result;
					datamodel.atAlocation.value = result;
				}
			});
		},

		activate: function(){
			this.refresh();
		},

		deactivate: function(){
		},

		refresh: function(){
			var datamodel = app.loadedModels.itemlistmodel[window.selected_item];
			if (datamodel) {
				// need to add onAday property to the original data store
				var widget = registry.byId('remind_day_switch');
				if (datamodel.onAday && datamodel.onAday.value) { //set on a day switch
					widget.set("value", "on");
				}
				else {
					widget.set("value", "off");
				}

				// need to add atAlocation property to the original data store
				widget = registry.byId('remind_location_switch');
				if (datamodel.atAlocation && datamodel.atAlocation.value) { //set on a day switch
					widget.set("value", "on");
				}
				else {
					widget.set("value", "off");
				}

				//set remind time
				widget = registry.byId('remind_time');
				if (datamodel.reminder && widget) { //set on a day switch
					widget.set("label", datamodel.reminder.value);
				}
			}
		}
	}
});
