define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/_base/connect"],
	function(lang, declare, connect){
	return declare("dojox.app.controller", [], {
		// Load user define javascipt code
		// Use configuration file to configure js module.
		// Example:
		// "simple":{
		//	"type": "dojox.app.view",
		//	"template": "./views/simple.html",
		//	"dependencies":["dojox/mobile/TextBox"],
		//	"jsmodule": "./script/simple.js"
		// }
		_init: function(){
			var params = this.params;
			var jsmodule = params.jsmodule;
			if(!jsmodule){
				return;
			}

			// Use absolute path to load this module, remove .js first
			var index = jsmodule.indexOf('.js');
			if(index != -1){
				jsmodule = jsmodule.substring(0, index);
			}
			var _this = this;
			// Fix load user define module issue by use absolute path here.
			require(["app/"+jsmodule], function(module){
				lang.mixin(_this, module);
				_this.init();
			});
		},

		// init callback. Override in user default js module
		init: function(){
		},

		// view activate callback. Override in user default js module
		activate:function(){
		},

		// view deactivate callback. Override in user default js module
		deactivate: function(){
		},
    });
});
