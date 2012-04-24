define(["dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mobile/TransitionEvent", "dojox/mvc"],
function(lang, dom, dstyle, connect, registry, TransitionEvent, mvc){
	todoApp.showMoreDetail = function(){
		var widget = dom.byId('moreDetail');
		var display = dstyle.get(widget, 'display');
		if(display == 'none'){
			dstyle.set(widget, 'display', '');
		}
		else{
			dstyle.set(widget, 'display', 'none');
		}
	};

	// move an item to Completed data model
	todoApp._moveToCompleted = function(datamodel, index, completedModel){
		if (datamodel && completedModel && index >= 0 && index < datamodel.length) {
			var data = datamodel[index];

			//update data
			data.completed.value = true;
			data.completed.data = true;
			data.data.completed = true;

			// move data to complete model
			completedModel.add(completedModel.length, mvc.newStatefulModel({
				"data": data.data
			}));
			completedModel.commit();

			// delete data from current itemlistmodel
			datamodel.remove(index);
			datamodel.commit();
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

	return {
		init: function(){
			this.refreshData();

			connect.connect(dom.byId("markAsComplete"), "click", null, lang.hitch(this, function(){
				var complete = window.confirm("Mark this item as Complete?");
				if(!complete){
					return;
				}
				var datamodel = this.loadedModels.itemlistmodel;
				var completedmodel = this.loadedModels.completedmodel;

				todoApp._moveToCompleted(datamodel, todoApp.selected_item, completedmodel);
			}));

			connect.connect(dom.byId("deleteCurrentItem"), "click", null, lang.hitch(this, function(){
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
		},

		beforeActivate: function(){
			this.refreshData();
		},

		refreshData: function(){
			if(todoApp.selected_configuration_item === -1){
				//undisplay "Complete" button
				dstyle.set(dom.byId('markAsComplete'), 'display', 'none');
			}
			else{
				dstyle.set(dom.byId('markAsComplete'), 'display', '');
			}
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;

			var datamodel = this.loadedModels.itemlistmodel[todoApp.selected_item];
			if(!datamodel){
				return;
			}

			var widget = registry.byId("item_detailsGroup");
			widget.ref = null;
			widget.set("ref", datamodel);

			// set data to items, this data not set by dojox.mvc
			if(datamodel.reminder){
				registry.byId('detail_reminder').set("rightText", datamodel.reminder.value);
			}

			var repeatArray = ["None", "Every Day", "Every Week", "Every 2 Week", "Every Month", "Every Year"];
			if(datamodel.repeat && datamodel.repeat.value>=0 && datamodel.repeat.value<repeatArray.length){
				registry.byId('detail_repeat').set("rightText", repeatArray[datamodel.repeat.value]);
			}

			var priorityArray = ["None", "Low", "Medium", "High"];
			if(datamodel.priority && datamodel.priority.value>=0 && datamodel.priority.value<priorityArray.length){
				registry.byId('detail_priority').set("rightText", priorityArray[datamodel.priority.value]);
			}

			if(datamodel.parentId){
				var listsmodel = app.loadedModels.listsmodel;
				var parentModel;
				for(var i=0; i<listsmodel.length; i++){
					if(listsmodel[i].id.value == datamodel.parentId){
						parentModel = listsmodel[i];
					}
				}

				if(parentModel){
					registry.byId('detail_list').set("rightText", parentModel.title.value);
				}
			}

			if(datamodel.notes){
				var value = '<textarea style="border:none;" onmousedown="event.cancelBubble=true;">'+datamodel.notes.value+'</textarea>';
				registry.byId('detail_note').set("rightText", value);
			}
		}
	}
});
