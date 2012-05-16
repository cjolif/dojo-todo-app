define.amd.jQuery = true;
define(["jquery"], function($){
	// we need to do it like that to workaround jQuery mobile #4364
	$.mobile = {
		// need to disable jQuery Mobile hash support that it clashes with dojox/app own support
		hashListeningEnabled: false,
		// need to disable jQuery Mobile pushState support
		pushStateEnabled: false
	};
	var itemlistmodel = null;

	var refreshData = function(){
		var datamodel = itemlistmodel.model[todoApp.selected_item];
		if(datamodel){
			// we need to try/catch because at first initialization the checkboxes are not yet
			// created and refresh will throw an error
			// deselect everything
			try{
				$("input[type='radio']").attr("checked", false).checkboxradio("refresh");
			}catch(e){
			}
			// select repeat type
			try{
				$("#radio-choice-"+(datamodel.repeat+1)).attr("checked", true).checkboxradio("refresh");
			}catch(e){
			}
		}
	};

	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			// need to load mobile on init, needs to do it here to allow room for
			// the hack to workaround #4364
			require(["jquerym"], function(){
				// connect a listener on the list that does update the model
				$("#list_repeat").change(function(e){
					var index = parseInt(e.target.value)-1;
					var datamodel = itemlistmodel.model[todoApp.selected_item];
					if(datamodel){
						datamodel.repeat = index;
					}
				});
			});
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			refreshData();
		},

		destroy: function(){
			// disconnect listener on the list
			$("#list_repeat").off("change");
		}
	};
});
