define.amd.jQuery = true;
define(["http://code.jquery.com/jquery-1.7.2.js", "http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.js"],
	function(){

	// need to disable jQuery Mobile hash support that it clashes with dojox/app own support
	$.mobile.hashListeningEnabled = false;

		// $.mobile.autoInitializePage = false
		// data-role="none"
	var itemlistmodel = null;

	var refreshData = function(){
		var datamodel = itemlistmodel.model[todoApp.selected_item];
		if(datamodel){
			// select repeat type
			$("#radio-choice-"+(datamodel.repeat+1)).attr("checked", true);
		}
	};

	return {
		init: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;

			// connect a listener on the list that does update the model
			$("#list_repeat").change(function(e){
			    // stuff
				var index = parseInt(e.target.value)-1;
				var datamodel = itemlistmodel.model[todoApp.selected_item];
				if(datamodel){
					datamodel.repeat = index;
				}
			});
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			itemlistmodel = this.loadedModels.itemlistmodel;
			refreshData();
		},

		destroy: function(){
			// disconnect listener on the list
		}
	}
});
