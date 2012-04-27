define(["dojo/dom", "dojo/_base/connect", "dojox/mobile/TransitionEvent", "dojox/mvc/getStateful"],
function(dom, connect, TransitionEvent, getStateful){
	var _connectResults = []; // events connect result
	var listsmodel = null;

	var add = function(){
		listsmodel.model.push(new getStateful({
			"id": (new Date().getTime()),
			"title": dom.byId("titleInput").value,
			"description": dom.byId("desInput").value,
			"itemsurl": dom.byId('urlInput').value
		}));
	};

	return {
		init: function(){
			listsmodel = this.loadedModels.listsmodel;
			
			var connectResult;
			connectResult = connect.connect(dom.byId('editItem_done'), "click", dojo.hitch(this, function(e){
				add();
				var transOpts = {
					title:"Edit",
					target:"configuration,edit",
					url: "#configuration,edit"
				};
				new TransitionEvent(e.srcElement,transOpts,e).dispatch();
			}));
			_connectResults.push(connectResult);
		},

		beforeActivate: function(){
			dom.byId('titleInput').value = '';
			dom.byId('urlInput').value = '';
			dom.byId('desInput').value = '';
		},

		destroy: function(){
			var connectResult = _connectResults.pop();
			while (connectResult) {
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	}
});
