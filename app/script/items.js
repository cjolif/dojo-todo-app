define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc","dojo/data/ItemFileWriteStore", "dojo/store/DataStore", "dojox/mobile/TransitionEvent"], 
	function(dom, connect, registry, mvc, itemfilewritestore, datastore, TransitionEvent){
	return {
		init: function(){
			console.log("items scene init ok.");
		},

		activate: function(){
			console.log("items scene activate");
		},

		deactivate: function(){
			console.log("items scene deactivate");
		}
	}
});
