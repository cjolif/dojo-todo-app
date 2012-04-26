define(["dojo/dom", "dojo/dom-style", "dijit/registry", "dojox/mvc/Output"],
	function(dom, dstyle, registry){
	return {
		init: function(){
			console.log("in items.js init todoApp.isTablet="+todoApp.isTablet);
			if(todoApp.isTablet){
				dstyle.set(dom.byId("gotoConfigurationView"), "display", "none");
			}
		}
	}
});
