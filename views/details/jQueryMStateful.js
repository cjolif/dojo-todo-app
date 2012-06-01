define(["dojo/_base/declare", "dojo/_base/lang"], function(declare, lang){
	return declare(null, {
		constructor: function(node, type){
			this._node = node;
			this._type = type;
			this._watches = {};
			var jQueryWidget = $(node).data(type);
			var jQueryFct = jQueryWidget.refresh;
			jQueryWidget.refresh = lang.hitch(this, function(){
				jQueryFct.apply(jQueryWidget);
				// notification
				for(var key in this._watches){
					var oldv = this._watches[key].value;
					var newv = this.get(key);
					if(oldv != newv){
						lang.hitch(this, this._watches[key].handle(key, oldv, newv));
						this._watches[key].value = newv;
					}
				}
			});
		},

		get: function(key){
			return $(this._node).prop(key);
		},

		set: function(key, value){
			$(this._node).prop(key, value)[this._type]("refresh");
		},

		watch: function(key, handle){
			this._watches[key] = {
				handle: handle,
				value: this.get(key)
			};
		}

	});
});