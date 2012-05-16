define(["dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dojo/_base/on", "dijit/registry",
	"dojox/mobile/TransitionEvent", "dojox/mvc/getStateful", "dojox/mvc/at"],
function(lang, dom, domStyle, on, registry, TransitionEvent, getStateful, at){
	var _connectResults = []; // events connect result
	var itemlistmodel = null;
	var listsmodel = null;
	var signals = [];
	var _isComplete = false;
	var _isDelete = false;
	todoApp._addNewItemCommit = false; // identify the new item is committed

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
		var datamodel = itemlistmodel.model;

		var parentId;
		try{
			parentId = datamodel[0].parentId;
		}catch(e){
			console.log("Warning: itemlistmodel is empty, get parentId from listsmodel");
			parentId = listsmodel.model[todoApp.selected_configuration_item].id;
		}

		itemlistmodel.model.push(new getStateful({
			"id": parseInt((new Date().getTime())),
			"parentId": parentId,
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
		todoApp.selected_item = itemlistmodel.model.length - 1;
		itemlistmodel.commit();
	};

	var refreshData = function(){
		if(todoApp.selected_configuration_item === -1){
			//undisplay "Complete" button
			domStyle.set(dom.byId("markAsComplete"), "display", "none");
		}else{
			domStyle.set(dom.byId("markAsComplete"), "display", "");
		}

		var datamodel = itemlistmodel.model[todoApp.selected_item];
		if(!datamodel){
			return;
		}

		var widget = registry.byId("item_detailsGroup");
		widget.target = null;
		itemlistmodel.set("cursorIndex",todoApp.selected_item);
		widget.set("target", at(itemlistmodel, "cursor"));

		console.log("setting detailwrapper visible 1");
		domStyle.set(dom.byId("detailwrapper"), "visibility", "visible"); // show the items list
		
		var repeatArray = ["None", "Every Day", "Every Week", "Every 2 Week", "Every Month", "Every Year"];
		if(datamodel.repeat>=0 && datamodel.repeat<repeatArray.length){
			registry.byId("detail_repeat").set("rightText", repeatArray[datamodel.repeat]);
		}

		var priorityArray = ["None", "Low", "Medium", "High"];
		if(datamodel.priority>=0 && datamodel.priority<priorityArray.length){
			registry.byId("detail_priority").set("rightText", priorityArray[datamodel.priority]);
		}

		if(datamodel.parentId >= 0){
			var parentModel;
			for(var i=0; i<listsmodel.length; i++){
				if(listsmodel[i].id == datamodel.parentId){
					parentModel = listsmodel[i];
					break;
				}
			}

			if(parentModel){
				registry.byId("detail_list").set("rightText", parentModel.title);
			}
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
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			listsmodel = this.loadedModels.listsmodel;

			var signal;

			signal = on(dom.byId("detail_showMore"), "click", function(){
				showMoreDetail();
			});
			signals.push(signal);

			signal = on(dom.byId("markAsComplete"), "click", lang.hitch(this, function(){
				_isComplete = true;
				_isDelete = false;
				dom.byId("dlg_title").innerHTML = "Mark As Complete";
				dom.byId("dlg_text").innerHTML = "Are you sure mark this item as complete?";
				show();
			}));
			signals.push(signal);

			signal = on(dom.byId("deleteCurrentItem"), "click", lang.hitch(this, function(){
				_isComplete = false;
				_isDelete = true;
				dom.byId("dlg_title").innerHTML = "Delete";
				dom.byId("dlg_text").innerHTML = "Are you sure delete this item?";
				show();
			}));
			signals.push(signal);

			signal = on(dom.byId("confirm_yes"), "click", lang.hitch(this, function(){
				var datamodel = this.loadedModels.itemlistmodel;
				var index = todoApp.selected_item;
				if(_isComplete){
					datamodel.model[index].set("completed", true);
				}else if(_isDelete){
					var datamodel = this.loadedModels.itemlistmodel.model;
					var len = datamodel.length;
					//remove from current datamodel
					if(index>=0 && index<len){
						datamodel.splice(index, 1);
					}
				}
				this.loadedModels.itemlistmodel.commit(); // commit updates
				//hide confirm dialog
				hide();
				//transition to list view
				var transOpts = {
						title:"List",
						target:"items,list",
						url: "#items,list"
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
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			if(todoApp._addNewItem){
				addNewItem();
			}
			refreshData();
			registry.byId("detail_todo").focus();
			todoApp._addNewItem = false;
		},

		afterDeactivate: function(){
			//console.log("items/lists afterDeactivate called todoApp.selected_configuration_item =",todoApp.selected_configuration_item);
			console.log("setting detailwrapper hidden");
			domStyle.set(dom.byId("detailwrapper"), "visibility", "hidden"); // hide the items list 
		},

		beforeDeactivate: function(){
			dom.byId("detail_reminder").focus();
			if(todoApp._addNewItem){
				return;	// refresh view operation, DO NOT commit the data change 
			}
			var title = dom.byId("detail_todo").value;
			if(!title){
				// remove this item
				itemlistmodel.model.splice(todoApp.selected_item, 1);
			}
			itemlistmodel.commit();
			todoApp._addNewItemCommit = true;
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
