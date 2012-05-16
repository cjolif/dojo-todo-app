define(["dojo/dom", "dojo/_base/lang", "dojo/dom-style", "dojo/on", "dijit/registry", "dojox/mvc/at",
        "dojo/date/stamp"],
function(dom, lang, domStyle, on, registry, at, datestamp){
	var itemlistmodel = null;
	var signals = [];

	var showDateDialog = function(){
		var datamodel = itemlistmodel.model[todoApp.selected_item];
		date = datamodel.get("reminderDate");
		if(!date){
			var today = new Date();
			date = datestamp.toISOString(today, {selector: "date"});
		}
		//console.log("remind showDateDialog date = ", date);
		registry.byId("reminddlgpicker1").set("value", date);							
		registry.byId('datePicker').show(dom.byId('remind_date'),['above-centered','below-centered','after','before']);
	};	
	
	var refreshData = function(){
		var datamodel = itemlistmodel.model[todoApp.selected_item];
		if (datamodel) {
			// need to add reminderOnAday property to the original data store
			var widget = registry.byId('remind_day_switch');
			widget.set("value", at(datamodel, "reminderOnAday"));

			// need to add reminderOnAlocation property to the original data store
			widget = registry.byId('remind_location_switch');
			widget.set("value", at(datamodel, "reminderOnAlocation"));				

			//set remind time
			widget = registry.byId('remind_date');
			if (widget) { 
				widget.set("label", at(datamodel, "reminderDate"));				
				if(datamodel.reminderOnAday == "on"){
					domStyle.set(dom.byId('remind_date'), 'display', '');
				}else{
					domStyle.set(dom.byId('remind_date'), 'display', 'none');					
				}
			}
		}
	};
	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel
			var signal;
		
			registry.byId("remind_day_switch").on("stateChanged", lang.hitch(this, function(newState){
				//console.log("remind_day_switch = ", newState);
				// update remind on a day value to the data model
				//ToDo: Why is the reminderOnAday not updated by the at() set above?
				var datamodel = this.loadedModels.itemlistmodel.model[todoApp.selected_item];
				datamodel.set("reminderOnAday",newState);
				if(datamodel.reminderOnAday == "on"){
					domStyle.set(dom.byId('remind_date'), 'display', '');
					if(!activateInProgress){
						showDateDialog();
					}
				}else{
					domStyle.set(dom.byId('remind_date'), 'display', 'none');					
				}				
			}));

			registry.byId("remind_location_switch").on("stateChanged", lang.hitch(this, function(newState){
				//console.log("remind_location_switch = ", newState);
				// update remind on a day value to the data model
				//ToDo: Why is the reminderOnAlocation not updated by the at() set above?
				var datamodel = this.loadedModels.itemlistmodel.model[todoApp.selected_item];
				datamodel.set("reminderOnAlocation",newState);				
			}));

			signal = on(dom.byId("remind_date"), "click", lang.hitch(this, function(){
				//console.log("remind_date clicked call showDateDialog ");
				showDateDialog();
			}));
			signals.push(signal);

			signal = on(dom.byId("reminddlgSet"), "click", lang.hitch(this, function(){
				//console.log("reminddlgSet clicked ");
				// update remind on a day value to the data model
				var datamodel = this.loadedModels.itemlistmodel.model[todoApp.selected_item];
				date = registry.byId("reminddlgpicker1").get("value");
				datamodel.set("reminderDate", date);
				registry.byId('datePicker').hide(true)
			}));
			signals.push(signal);

			signal = on(dom.byId("reminddlgCancel"), "click", lang.hitch(this, function(){
				//console.log("reminddlgCancel clicked ");
				registry.byId("datePicker").hide(false)
			}));
			signals.push(signal);
		},

		beforeActivate: function(){
			activateInProgress = true;
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			refreshData();
			activateInProgress = false;
		},

		beforeDeactivate: function(){
			//console.log("remind.js beforeDeactivate called ");
		},

		afterDeactivate: function(){
			//console.log("remind.js afterDeactivate called ");
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
