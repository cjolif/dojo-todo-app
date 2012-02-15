define(["dojo/dom", "dojo/_base/connect", "dijit/registry"], function(dom, connect, registry){
	return {
		init: function(){
			var selectedIndex = 0;
			var repeatmodel = registry.byId('repeatWidget').ref;

			function setDetailsContext(index){
				var widget = registry.byId("detailsGroup");
				widget.set("ref", index);
				selectedIndex = index;
				window.selectedIndex = selectedIndex;
			}

			// used in the Repeat Data binding demo
			function insertResult(index){
				if (repeatmodel[index].First.value !== "") {
					var insert = dojox.mvc.newStatefulModel({
						"data": {
							"First": "",
							"Last": "",
							"Location": "CA",
							"Office": "",
							"Email": "",
							"Tel": "",
							"Fax": ""
						}
					});
					repeatmodel.add(index, insert);
					setDetailsContext(parseInt(index) + 1);
				}
			};

			function deleteResult(index){
				repeatmodel.remove(index);
			};

			window.repeatmodel = repeatmodel;
			window.setDetailsContext = setDetailsContext;
			window.insertResult = insertResult;
			window.deleteResult = deleteResult;

			console.log("repeat view init ok");
		}
	}
});
