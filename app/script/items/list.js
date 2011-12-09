define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc","dojo/data/ItemFileWriteStore", "dojo/store/DataStore"], 
	function(dom, connect, registry, mvc, itemfilewritestore, datastore){
	return {
		init: function(){
			// console.log("list view init, bind data to list view.");
		},

		activate: function(){
			// console.log("list view activate, bind data to list view");
		},

		deactivate: function(){
			// console.log("list view deactivate, unbind data to list view");
		}
	}
});
