define(["dojo/dom", "dojo/_base/connect", "dijit/registry"], function(dom, connect, registry){
	var _getListItemByIndex = function(widget, index){
		var children = widget.domNode.children;
		var list = [];
		//get all list items
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.nodeName == "LI" || children.nodeName == "li") {
				list.push(child);
			}
		}

		if (index >= 0 && index < list.length) {
			return registry.byNode(list[index]);
		}
		return null;
	};

	var _getIndexByListItem = function(widget, item){
		var children = widget.domNode.children;
		var list = [];
		//get all list items
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.nodeName == "LI" || children.nodeName == "li") {
				list.push(child);
			}
		}

		for (var i = 0; i < list.length; i++) {
			if (list[i] == item.domNode) {
				return i;
			}
		}
		return 0;
	};

	return {
		getListItemByIndex: _getListItemByIndex,
		getIndexByListItem: _getIndexByListItem
	}
});
