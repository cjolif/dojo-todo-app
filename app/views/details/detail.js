define(["dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mobile/TransitionEvent", "dojox/mvc/getStateful"],
function(lang, dom, dstyle, connect, registry, TransitionEvent, getStateful){
	var _connectResults = []; // events connect result
	var itemlistmodel = null;

	var showMoreDetail = function(){
		var widget = dom.byId('moreDetail');
		var display = dstyle.get(widget, 'display');
		if(display == 'none'){
			dstyle.set(widget, 'display', '');
		}else{
			dstyle.set(widget, 'display', 'none');
		}
	};

	// move an item to Completed data model
	var _moveToCompleted = function(datamodel, index, completedModel){
		if (datamodel && completedModel && index >= 0 && index < datamodel.model.length) {
			var data = datamodel.model[index];

			//update data
			data.completed = true;

			// move data to complete model
			completedModel.model.push(new getStateful({
				"id": data.id,
				"parentId": data.parentId,
				"title": data.title,
				"notes": data.notes,
				"due": data.due,
				"completionDate": data.completionDate,
				"reminder": data.reminder,
				"repeat": data.repeat,
				"priority": data.priority,
				"hidden": data.hidden,
				"completed": data.completed,
				"deleted": data.deleted
			}));

			// delete data from current itemlistmodel
			datamodel.model.splice(index, 1);
			//transition to list view
			var transOpts = {
				title:"List",
				target:"items,list",
				url: "#items,list"
			};
			var e = window.event;
			new TransitionEvent(e.srcElement,transOpts,e).dispatch();
		}
	};

	var refreshData = function(){
		if(todoApp.selected_configuration_item === -1){
			//undisplay "Complete" button
			dstyle.set(dom.byId('markAsComplete'), 'display', 'none');
		}else{
			dstyle.set(dom.byId('markAsComplete'), 'display', '');
		}

		var datamodel = itemlistmodel.model[todoApp.selected_item];
		if(!datamodel){
			return;
		}

		var widget = registry.byId("item_detailsGroup");
		widget.ref = null;
		widget.set("ref", datamodel);
		widget.target = null;
		widget.set("target", datamodel);

		// set data to items, this data not set by dojox.mvc
		if(datamodel.reminder){
			registry.byId('detail_reminder').set("rightText", datamodel.reminder);
		}

		var repeatArray = ["None", "Every Day", "Every Week", "Every 2 Week", "Every Month", "Every Year"];
		if(datamodel.repeat>=0 && datamodel.repeat<repeatArray.length){
			registry.byId('detail_repeat').set("rightText", repeatArray[datamodel.repeat]);
		}

		var priorityArray = ["None", "Low", "Medium", "High"];
		if(datamodel.priority>=0 && datamodel.priority<priorityArray.length){
			registry.byId('detail_priority').set("rightText", priorityArray[datamodel.priority]);
		}

		if(datamodel.parentId >= 0){
			var listsmodel = app.loadedModels.listsmodel.model;
			var parentModel;
			for(var i=0; i<listsmodel.length; i++){
				if(listsmodel[i].id == datamodel.parentId){
					parentModel = listsmodel[i];
					break;
				}
			}

			if(parentModel){
				registry.byId('detail_list').set("rightText", parentModel.title);
			}
		}

		if(datamodel.notes){
			var value = '<textarea style="border:none;" onmousedown="event.cancelBubble=true;">'+datamodel.notes.value+'</textarea>';
			registry.byId('detail_note').set("rightText", value);
		}
	};

	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;

			var connectResult;
			connectResult = connect.connect(dom.byId("detail_showMore"), "click", null, function(){
				showMoreDetail();
			});
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId("markAsComplete"), "click", null, lang.hitch(this, function(){
				var complete = window.confirm("Mark this item as Complete?");
				if(!complete){
					return;
				}
				var datamodel = this.loadedModels.itemlistmodel;
				var completedmodel = this.loadedModels.completedmodel;

				_moveToCompleted(datamodel, todoApp.selected_item, completedmodel);
			}));
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId("deleteCurrentItem"), "click", null, lang.hitch(this, function(){
				var del = window.confirm("Are you sure deleting this item?");
				if(!del){
					return;
				}

				var datamodel = this.loadedModels.itemlistmodel;
				var len = datamodel.length;
				if(todoApp.selected_item>=0 && todoApp.selected_item<len){
					datamodel.remove(todoApp.selected_item);
					datamodel.commit(); //need to commit after delete. TODO: need to enhance the performance
				}

				//transition to list view
				var transOpts = {
					title:"List",
					target:"items,list",
					url: "#items,list"
				};
				var e = window.event;
				new TransitionEvent(e.srcElement,transOpts,e).dispatch();
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
