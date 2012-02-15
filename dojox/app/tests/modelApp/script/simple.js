define(["dojo/dom", "dojo/_base/connect", "dijit/registry"], function(dom, connect, registry){
	return {
		init: function(){
			function setRef(id, addrRef){
				var widget = registry.byId("infoGroup");
				var target = registry.byId(id);
				var model = widget.get("ref");
				target.set("ref", model[addrRef]);
				console.log("setRef done. "+addrRef);
			};
			connect.connect(dom.byId('shipto'), "click", function(){
				setRef('addrGroup', 'ShipTo');
			});
			connect.connect(dom.byId('billto'), "click", function(){
				setRef('addrGroup', 'BillTo');
			});

			console.log("simple view init ok");
		}
	}
});
