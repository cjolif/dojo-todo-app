define(["dojo/_base/lang", "dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mobile/TransitionEvent", "dojox/mvc/getStateful", "dojox/mvc/at"],
function(lang, dom, dstyle, connect, registry, TransitionEvent, getStateful, at){
	window.at = at;	// set global namespace for dojox.mvc.at
	var _connectResults = []; // events connect result
	var itemlistmodel = null;

	var showMoreDetail = function(){
		var widget = dom.byId('moreDetail');
		var display = dstyle.get(widget, 'display');
		if(display == 'none'){
			dstyle.set(widget, 'display', '');
			dstyle.set(dom.byId('moreDetailNotes'), 'display', '');
			registry.byId("detail_showMore").set("label","Show Less...");
		}else{
			dstyle.set(widget, 'display', 'none');
			dstyle.set(dom.byId('moreDetailNotes'), 'display', 'none');
			registry.byId("detail_showMore").set("label","Show More...");
		}
	};

	// move an item to Completed data model
	var _moveToCompleted = function(datamodel, index, completedModel){
		//console.log("in details _moveToCompleted");
		var t = datamodel.model.splice(index, 1);
		t[0].set("completed", true);
		completedModel.model.push(t[0]);
		//transition to list view
		var transOpts = {
				title:"List",
				target:"items,list",
				url: "#items,list"
		};
		var e = window.event;
		new TransitionEvent(e.srcElement,transOpts,e).dispatch();
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
		widget.target = null;
		itemlistmodel.set("cursorIndex",todoApp.selected_item);
		widget.set("target", at(itemlistmodel, 'cursor'));

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

				var datamodel = this.loadedModels.itemlistmodel.model;
				var len = datamodel.length;
				if(todoApp.selected_item>=0 && todoApp.selected_item<len){
					datamodel.splice(todoApp.selected_item, 1);
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
