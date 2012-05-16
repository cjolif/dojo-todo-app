define(["dojo/dom", "dojo/_base/lang", "dojo/dom-style", "dojo/_base/connect", 
        "dojo/Deferred", "dojo/when", "dijit/registry", "dojox/mvc/at", 
        "dojox/mobile/TransitionEvent", "dojo/date/stamp"],
function(dom, lang, dstyle, connect, Deferred, when, registry, at, TransitionEvent, datestamp){
	var _connectResults = []; // events connect result
	var itemlistmodel = null;

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
					dstyle.set(dom.byId('remind_date'), 'display', '');
				}else{
					dstyle.set(dom.byId('remind_date'), 'display', 'none');					
				}
			}
		}
	};
	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
		
			var connectResult;
			connectResult = connect.connect(registry.byId('remind_day_switch'), 'onStateChanged', lang.hitch(this, function(newState){
				//console.log("remind_day_switch = ", newState);
				// update remind on a day value to the data model
				//ToDo: Why is the reminderOnAday not updated by the at() set above?
				var datamodel = this.loadedModels.itemlistmodel.model[todoApp.selected_item];
				datamodel.set("reminderOnAday",newState);
				if(datamodel.reminderOnAday == "on"){
					dstyle.set(dom.byId('remind_date'), 'display', '');
					if(!activateInProgress){
						showDateDialog();
					}
				}else{
					dstyle.set(dom.byId('remind_date'), 'display', 'none');					
				}				
			}));
			_connectResults.push(connectResult);

			connectResult = connect.connect(registry.byId('remind_location_switch'), 'onStateChanged', lang.hitch(this, function(newState){
				//console.log("remind_location_switch = ", newState);
				// update remind on a day value to the data model
				//ToDo: Why is the reminderOnAlocation not updated by the at() set above?
				var datamodel = this.loadedModels.itemlistmodel.model[todoApp.selected_item];
				datamodel.set("reminderOnAlocation",newState);				
			}));
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId('remind_date'), 'click', lang.hitch(this, function(){
				//console.log("remind_date clicked call showDateDialog ");
				showDateDialog();
			}));
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId('reminddlgSet'), 'click', lang.hitch(this, function(){
				//console.log("reminddlgSet clicked ");
				// update remind on a day value to the data model
				var datamodel = this.loadedModels.itemlistmodel.model[todoApp.selected_item];
				date = registry.byId("reminddlgpicker1").get("value") 
				datamodel.set("reminderDate", date);
				registry.byId('datePicker').hide(true)
			}));
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId('reminddlgCancel'), 'click', lang.hitch(this, function(){
				//console.log("reminddlgCancel clicked ");
				registry.byId('datePicker').hide(false)
			}));
			_connectResults.push(connectResult);
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
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	}
});
