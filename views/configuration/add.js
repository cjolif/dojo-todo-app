define(["dojo/dom", "dojo/on", "dojox/mobile/TransitionEvent", "dojox/mvc/getStateful"],
function(dom, on, TransitionEvent, getStateful){
	var signals = []; // events connect result
	var listsmodel = null;

	var add = function(){
		listsmodel.model.push(new getStateful({
			"id": (new Date().getTime()),
			"title": dom.byId("titleInput").value,
			"description": dom.byId("desInput").value
		}));
	};

	return {
		init: function(){
			listsmodel = this.loadedModels.listsmodel;

			var signal = on(dom.byId('addList_add'), "click", dojo.hitch(this, function(e){
				var title = dom.byId("titleInput").value;
				if(title){
					add();
				}
				history.back();
			}));
			signals.push(signal);
		},

		beforeActivate: function(){
			dom.byId('titleInput').value = '';
			dom.byId('desInput').value = '';
		},

		destroy: function(){
			var signal = signals.pop();
			while(signal){
				signal.remove();
				signal = signals.pop();
			}
		}
	}
});
