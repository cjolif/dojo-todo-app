define(["dojo/dom", "dojo/_base/connect", "dijit/registry"], function(dom, connect, registry){
	return {
		init: function(){
			// used in the Generate View demo
			var genmodel;
			function updateView(){
				try {
					var modeldata = dojo.fromJson(dom.byId("modelArea").value);
					genmodel = dojox.mvc.newStatefulModel({
						data: modeldata
					});
					registry.byId("view").set("ref", genmodel);
					dom.byId("outerModelArea").style.display = "none";
					dom.byId("viewArea").style.display = "";
				} 
				catch (err) {
					console.error("Error parsing json from model: " + err);
				}
			};
			
			// used in the Generate View demo
			function updateModel(){
				dom.byId("modelArea").focus(); // hack: do this to force focus off of the textbox, bug on mobile?
				dom.byId("viewArea").style.display = "none";
				dom.byId("outerModelArea").style.display = "";
				registry.byId("modelArea").set("value", (dojo.toJson(genmodel.toPlainObject(), true)));
			};
			
			connect.connect(dom.byId('generate1'), "click", function(){
				updateView();
			});
			connect.connect(dom.byId('updateModel'), "click", function(){
				updateModel();
			});
			
			console.log("generate view init ok");
		}
	}
});
