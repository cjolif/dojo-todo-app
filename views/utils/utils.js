define(["dijit/registry"], function (registry){
	return {
		getListItemByIndex: function(widget, index){
			var children = widget.domNode.children;
			var list = [];
			//get all list items
			for(var i = 0; i < children.length; i++){
				var child = children[i];
				if(child.nodeName == "LI" || children.nodeName == "li"){
					list.push(child);
				}
			}

			if(index >= 0 && index < list.length){
				return registry.byNode(list[index]);
			}
			return null;
		},
		getIndexByListItem: function(widget, item){
			var children = widget.domNode.children;
			var list = [];
			var i;
			//get all list items
			for(i=0; i < children.length; i++){
				var child = children[i];
				if(child.nodeName == "LI" || children.nodeName == "li"){
					list.push(child);
				}
			}

			for(i=0; i < list.length; i++){
				if(list[i] == item.domNode){
					return i;
				}
			}
			return 0;
		}
	};
});
