define(["dojo/_base/kernel", "dojo/_base/Deferred", "dojo/store/DataStore", "dojox/mvc/StatefulModel"],
function(dojo, deferred, dataStore){
	return function(config, parent){
                //load models here. create dojox.newStatefulModel 
                //using the configuration data for models
	        var loadedModels = {};
	        if(parent){
	            dojo.mixin(loadedModels, parent);
	        }
	        if(config){
                    for(var item in config){
                        if(item.charAt(0)!=="_"){
                            var params = config[item].params ? config[item].params:{};
					var options;
					if (params.store.params.data) {
						options = {
							"store": params.store.store,
							"query": params.store.query ? params.store.query : {}
						};
					}
					else if (params.store.params.url) {
						options = {
							"store": new dataStore({
								store: params.store.store
							}),
							"query": params.store.query ? params.store.query : {}
						};
					}

					loadedModels[item] = deferred.when(dojox.mvc.newStatefulModel(options), function(model){
						return model;
					});
				}
                    }
	        }
                return loadedModels;
	}
});
