define(["dojo/dom", "dojo/dom-style", "dijit/registry"],
	function(dom, dstyle, registry){
	return {
		init: function(){
			if(window.isTablet){
				dstyle.set(dom.byId("gotoConfigurationView"), "display", "none");
			}
		}
	}
});
