define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mobile/TransitionEvent"],
function(dom, dstyle, connect, registry, TransitionEvent){
	var showMoreDetail = function(){
		var widget = dom.byId('moreDetail');
		var display = dstyle.get(widget, 'display');
		if(display == 'none'){
			dstyle.set(widget, 'display', '');
		}
		else{
			dstyle.set(widget, 'display', 'none');
		}
	};
	window.showMoreDetail = showMoreDetail;

	var deleteCurrentItem = function(){
		var del = window.confirm("Are you sure deleting this item?");
		if(!del){
			return;
		}

		var datamodel = app.loadedModels.itemlistmodel;
		var len = datamodel.length;
		if(window.selected_item>=0 && window.selected_item<len){
			datamodel.remove(window.selected_item);
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
	};
	window.deleteCurrentItem = deleteCurrentItem;

	return {
		init: function(){
			this.refresh();
		},

		activate: function(){
			this.refresh();
		},

		deactivate: function(){
		},

		refresh: function(){
			var datamodel = app.loadedModels.itemlistmodel[window.selected_item];
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
				var value = '<textarea style="border:none; ">'+datamodel.notes.value+'</textarea>';
				registry.byId('detail_note').set("rightText", value);
			}
		}
	}
});
