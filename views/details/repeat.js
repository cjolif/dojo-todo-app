define.amd.jQuery = true;
define(["jquery", "./jQueryMStateful", "dojox/mvc/sync"], function($, jQueryStateful, sync){
	// we need to do it like that to workaround jQuery mobile #4364
	$.mobile = {
		// need to disable jQuery Mobile hash support that it clashes with dojox/app own support
		hashListeningEnabled: false,
		// need to disable jQuery Mobile pushState support
		pushStateEnabled: false
	};
	var radios = [];
	var init = false;

	return {
		init: function(){
			require(["jquerym"], function(){
				// we need to load jQuery Mobile at init to parse the page
			});
		},

		beforeActivate: function(){
			this.loadedModels.itemlistmodel = todoApp.currentItemListModel;
			var itemlistmodel = this.loadedModels.itemlistmodel;
			var datamodel = itemlistmodel.model[todoApp.selected_item];
			if(datamodel){
				require(["jquerym"], function(){
					// make sure jQuery Mobile has finished loading and perform binding
					if(!init){
						$("input[type='radio']").each(function(index){
							radios.push(new jQueryStateful($(this), "checkboxradio"));
						});
						init = true;
					}
					radios.forEach(function(item, index){
						sync(datamodel, "repeat", item, "checked", {
							converter: {
								parse: function(value){
									if(!value){
										throw new Error();
									}else{
										return index;
									}
								},
								format :function(value){
									return (value == index);
								}
							}
						});
					});
				});
			}
		},

		destroy: function(){
			// should probably release jQueryMobileStateful
		}
	};
});
