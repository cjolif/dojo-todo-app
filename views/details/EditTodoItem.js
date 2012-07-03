define(["dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dojo/on", "dijit/registry",
	"dojox/mobile/TransitionEvent", "dojox/mvc/getStateful", "dojox/mvc/at", "dojo/date/stamp"],
	function(lang, dom, domStyle, on, registry, TransitionEvent, getStateful, at, stamp){
	var listsmodel = null;
	var signals = [];
	var _isComplete = false;
	var _isDelete = false;
	var _detailsSetup = false;
	this.app._addNewItemCommit = false; // identify the new item is committed

	dateClassTransform2 = {
		format : function(value) {
			// check to see if the date is in the past, if so display it in red
			if(value && value < stamp.toISOString(new Date(), {selector: "date"})){
				return "dateLabelInvalid";
			}else{
				return "";
			}
		}
	};

	// transform the repeat to the correct text
	repeatTransform = {
		format : function(value) {
			var repeatArray = ["None", "Every Day", "Every Week", "Every 2 Week", "Every Month", "Every Year"];
			return repeatArray[value] ? repeatArray[value] : '';
		}
	};

	// transform the priority to the correct text
	priorityTransform = {
		format : function(value) {
			var priorityArray = ["None", "Low", "Medium", "High"];
			return priorityArray[value] ? priorityArray[value] : '';
		}
	};

	// transform the priority to the correct text
	parentTitleTransform = {
		format : function(value) {
			var parentModel;
			// check listsmodel because this transform method will be called by dojox.mvc before EditTodoItem view initial
			if(!listsmodel || !listsmodel.model){
				return "";
			}
			for(var i=0; i<listsmodel.model.length; i++){
				if(listsmodel.model[i].id == value){  // find the listId in the listsmodel
					parentModel = listsmodel.model[i];
					return parentModel.title;  // set the parentModel title
				}
			}
			return "";
		}
	};

	var showMoreDetail = function(){
		var widget = dom.byId("moreDetail");
		var display = domStyle.get(widget, "display");
		if(display == "none"){
			domStyle.set(widget, "display", "");
			domStyle.set(dom.byId("moreDetailNotes"), "display", "");
			registry.byId("detail_showMore").set("label","Show Less...");
		}else{
			domStyle.set(widget, "display", "none");
			domStyle.set(dom.byId("moreDetailNotes"), "display", "none");
			registry.byId("detail_showMore").set("label","Show More...");
		}
	};
	
	var addNewItem = function(){
		var datamodel = this.app.currentItemListModel.model;

		var listId;
		try{
			listId = datamodel[0].listId;
		}catch(e){
			//console.log("Warning: itemlistmodel is empty, get listId from listsmodel");
			listId = listsmodel.model[this.app.selected_configuration_item].id;
		}

		this.app.currentItemListModel.model.push(new getStateful({
			"id": parseInt((new Date().getTime())),
			"listId": listId,
			"title": "",
			"notes": "",
			"due": null,
			"completionDate": "",
			"reminderOnAday": "off",   
			"reminderDate": "",
			"reminderOnAlocation": "off",   
			"reminderLocation": null,
			"repeat": 0,
			"priority": 0,
			"hidden": false,
			"completed": false,
			"deleted": false
		}));
		this.app.selected_item = this.app.currentItemListModel.model.length - 1;
		this.app.currentItemListModel.commit();
		this.app.currentItemListModel.set("cursorIndex", this.app.selected_item);
	};

	var refreshData = function(){
		if(this.app.selected_configuration_item === -1){
			//undisplay "Complete" button
			domStyle.set(dom.byId("markAsComplete"), "display", "none");
		}else{
			domStyle.set(dom.byId("markAsComplete"), "display", "");
		}

		var datamodel = this.app.currentItemListModel.model[this.app.selected_item];
		if(!datamodel){
			return;
		}

		// we need to set the target for the group each time since itemlistmodel is reset for each list
		// the cursorIndex is set in the showItemDetails function in ViewListTodoItemsByPriority or ViewAllTodoItemsByDate 
		registry.byId("item_detailsGroup").set("target", at(this.app.currentItemListModel, "cursor"));

		if(!_detailsSetup){  // these bindings only have to be setup once.
			_detailsSetup = true;

			// Setup data bindings here for the fields inside the item_detailsGroup.
			// use at() to bind the attribute of the widget with the id to value from the model
			var bindingArray = [
				{"id":"detail_todo", "attribute":"value", "atparm1":'rel:', "atparm2":'title',"direction":at.both,"transform":null},
				{"id":"detail_reminderDate", "attribute":"value", "atparm1":'rel:', "atparm2":'reminderDate',"direction":at.both,"transform":null},			
				{"id":"detail_reminderDate", "attribute":"class", "atparm1":'rel:', "atparm2":'reminderDate',"direction":at.from,"transform":dateClassTransform2},			
				{"id":"detail_todoNote", "attribute":"value", "atparm1":'rel:', "atparm2":'notes',"direction":at.both,"transform":null},			
				{"id":"detail_repeat", "attribute":"rightText", "atparm1":'rel:', "atparm2":'repeat',"direction":at.from,"transform":repeatTransform},			
				{"id":"detail_priority", "attribute":"rightText", "atparm1":'rel:', "atparm2":'priority',"direction":at.from,"transform":priorityTransform},			
				{"id":"detail_list", "attribute":"rightText", "atparm1":'rel:', "atparm2":'listId',"direction":at.from,"transform":parentTitleTransform},			
			]
			
			// bind all of the attrbutes setup in the bindingArray, this is a one time setup
			bindAttributes(bindingArray);
		}

		domStyle.set(dom.byId("detailwrapper"), "visibility", "visible"); // show the items list

	};

	var bindAttributes = function(bindingArray){
		for(var i=0; i<bindingArray.length; i++){
				item = bindingArray[i]; 
				var binding = at(item.atparm1, item.atparm2).direction(item.direction);
				if (item.transform){ binding.transform(item.transform); };
				registry.byId(item.id).set(item.attribute, binding);
		}			
	};

	var show = function(){
		registry.byId("dlg_confirm").show();
	};

	var hide = function(){
		registry.byId("dlg_confirm").hide();
	};

	return {
		init: function(){
			listsmodel = this.loadedModels.listsmodel;

			var signal;

			signal = on(dom.byId("detail_showMore"), "click", function(){
				showMoreDetail();
			});
			signals.push(signal);
			
			// use this.backFlag to identify the EditTodoItem view back to items,ViewListTodoItemsByPriority view
			signal = on(dom.byId("detail_back"), "click", lang.hitch(this, function(){
				this.backFlag = true;
				history.back();
			}));
			signals.push(signal);

			signal = on(dom.byId("markAsComplete"), "click", lang.hitch(this, function(){
				_isComplete = true;
				_isDelete = false;
				dom.byId("dlg_title").innerHTML = "Mark As Complete";
				dom.byId("dlg_text").innerHTML = "Are you sure you want to mark this item as complete?";
				show();
			}));
			signals.push(signal);

			signal = on(dom.byId("deleteCurrentItem"), "click", lang.hitch(this, function(){
				_isComplete = false;
				_isDelete = true;
				dom.byId("dlg_title").innerHTML = "Delete";
				dom.byId("dlg_text").innerHTML = "Are you sure you want to delete this item?";
				show();
			}));
			signals.push(signal);

			signal = on(dom.byId("confirm_yes"), "click", lang.hitch(this, function(){
				var datamodel = this.app.currentItemListModel;
				var index = this.app.selected_item;
				if(_isComplete){
					datamodel.model[index].set("completed", true);
				}else if(_isDelete){
					var datamodel = this.app.currentItemListModel.model;
					var len = datamodel.length;
					//remove from current datamodel
					if(index>=0 && index<len){
						datamodel.splice(index, 1);
					}
				}
				this.app.currentItemListModel.commit(); // commit updates
				//hide confirm dialog
				hide();
				//transition to list view
				var transOpts = {
						title:"List",
						target:"items,ViewListTodoItemsByPriority",
						url: "#items,ViewListTodoItemsByPriority"
				};
				var e = window.event;
				new TransitionEvent(dom.byId("item_detailsGroup"), transOpts, null).dispatch();
			}));
			signals.push(signal);

			signal = on(dom.byId("confirm_no"), "click", lang.hitch(this, function(){
				hide();
			}));
			signals.push(signal);
		},

		beforeActivate: function(){
			if(this.app._addNewItem){
				addNewItem();
			}
			refreshData();
			registry.byId("detail_todo").focus();
			this.app._addNewItem = false;
		},

		afterDeactivate: function(){
			//console.log("items/lists afterDeactivate called this.app.selected_configuration_item =",this.app.selected_configuration_item);
			domStyle.set(dom.byId("detailwrapper"), "visibility", "hidden"); // hide the items list 
		},

		beforeDeactivate: function(){
			dom.byId("detail_reminder").focus();
			if(this.app._addNewItem){
				return;	// refresh view operation, DO NOT commit the data change 
			}
			var title = dom.byId("detail_todo").value;
			// a user maybe set "Priority" first and then set title. This operation will cause EditTodoItem view beforeDeactivate() be called.
			// So we use this.backFlag to identify only back from EditTodoItem view and item's title is empty, the item need to be removed.
			if(!title && this.backFlag){
				// remove this item
				this.app.currentItemListModel.model.splice(this.app.selected_item, 1);
			}
			this.app.currentItemListModel.commit();
			this.app._addNewItemCommit = true;
			this.backFlag = false;
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
