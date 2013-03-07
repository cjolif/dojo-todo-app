define(["dojo/dom", "dojo/_base/lang", "dojo/dom-style", "dojo/on", "dijit/registry", "dojox/mvc/at",
        "dojo/date/stamp", "dojo/dom-class"],
	function(dom, lang, domStyle, on, registry, at, stamp, domClass){
	var itemlistmodel = null;
	var signals = [];

	return {
		init: function(){
			this.loadedModels.itemlistmodel = this.app.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			var signal;
		
			registry.byId("remind_day_switch").on("stateChanged", lang.hitch(this, function(newState){
				//console.log("remind_day_switch = ", newState);
				// update remind on a day value to the data model
				//ToDo: Why is the reminderOnAday not updated by the at() set above?
				var datamodel = this.loadedModels.itemlistmodel.model[this.app.selected_item];
				datamodel.set("reminderOnAday",newState);
				if(datamodel.reminderOnAday == "on"){
					domStyle.set(dom.byId('remind_date'), 'display', '');
					if(!activateInProgress){
						this.showDateDialog("remind_day_switch");
					}
				}else{
					datamodel.set("reminderDate","");
					domStyle.set(dom.byId('remind_date'), 'display', 'none');					
				}				
			}));

			registry.byId("remind_location_switch").on("stateChanged", lang.hitch(this, function(newState){
				//console.log("remind_location_switch = ", newState);
				// update remind on a day value to the data model
				//ToDo: Why is the reminderOnAlocation not updated by the at() set above?
				var datamodel = this.loadedModels.itemlistmodel.model[this.app.selected_item];
				datamodel.set("reminderOnAlocation",newState);				
			}));

			registry.byId("remind_date").on("click", lang.hitch(this, function(e){
				//console.log("remind_date clicked call showDateDialog ");
				this.showDateDialog('remind_date');
			}));

			registry.byId("reminddlgSet").on("click", lang.hitch(this, function(){
				//console.log("reminddlgSet clicked ");
				// update remind on a day value to the data model
				var datamodel = this.loadedModels.itemlistmodel.model[this.app.selected_item];
				date = registry.byId("reminddlgpicker1").get("value");
				// have to check to see if the date is valid
				var todayDate = stamp.toISOString(new Date(), {selector: "date"});
				if(date < todayDate){
					domStyle.set(dom.byId("invalidDate"), "visibility", "visible");
					registry.byId("reminddlgpicker1").set("value", todayDate);							
				}else{
					datamodel.set("reminderDate", date);
					domClass.remove(registry.byId('remind_date').domNode, "dateLabelInvalid");
					registry.byId("datePicker").hide(true);
					domStyle.set(dom.byId("invalidDate"), "visibility", "hidden");
				}
			}));

			registry.byId("reminddlgCancel").on("click", lang.hitch(this, function(){
				//console.log("reminddlgCancel clicked ");
				domStyle.set(dom.byId("invalidDate"), "visibility", "hidden");
				registry.byId("datePicker").hide(false);
				var datamodel = itemlistmodel.model[this.app.selected_item];
				date = datamodel.get("reminderDate");
				if(!date){ // cancelled and no date set, so need to set 
					datamodel.set("reminderOnAday", "off");
				}
			}));
		},

		beforeActivate: function(){
			activateInProgress = true;
			this.loadedModels.itemlistmodel = this.app.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			this.refreshData();
			activateInProgress = false;
		},

		showDateDialog: function(widgetid){
			var datamodel = itemlistmodel.model[this.app.selected_item];
			var date = datamodel.get("reminderDate");
			if(!date){
				date = stamp.toISOString(new Date(), {selector: "date"});
			}
			registry.byId("reminddlgpicker1").set("value", date);
			registry.byId("datePicker").show(dom.byId(widgetid),['above-centered','below-centered','after','before']);
		},

		refreshData: function(){
			var datamodel = itemlistmodel.model[this.app.selected_item];
			if(datamodel){
				// need to add reminderOnAday property to the original data store
				var widget = registry.byId('remind_day_switch');
				widget.set("value", at(datamodel, "reminderOnAday"));

				// need to add reminderOnAlocation property to the original data store
				widget = registry.byId('remind_location_switch');
				widget.set("value", at(datamodel, "reminderOnAlocation"));

				//set remind time
				widget = registry.byId('remind_date');
				if(widget){
					widget.set("label", at(datamodel, "reminderDate"));
					var value = datamodel.get("reminderDate");
					if(value && value < stamp.toISOString(new Date(), {selector: "date"})){
						domClass.add(widget.domNode, "dateLabelInvalid");
					}else{
						domClass.remove(widget.domNode, "dateLabelInvalid");
					}
					if(datamodel.reminderOnAday == "on"){
						domStyle.set(dom.byId('remind_date'), 'display', '');
					}else{
						domStyle.set(dom.byId('remind_date'), 'display', 'none');
					}
				}
			}
		}
	}
});
