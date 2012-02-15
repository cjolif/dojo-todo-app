define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dijit/registry",
	"./scrollable"],
	function(dojo, declare, lang, win, dom, domClass, domConstruct, registry, Scrollable){
	// module:
	//		dojox/mobile/_ScrollableMixin
	// summary:
	//		Mixin for widgets to have a touch scrolling capability.

	var cls = declare("dojox.app.widget._ScrollableMixin", null, {
		// summary:
		//		Mixin for widgets to have a touch scrolling capability.
		// description:
		//		Actual implementation is in scrollable.js.
		//		scrollable.js is not a dojo class, but just a collection
		//		of functions. This module makes scrollable.js a dojo class.

		// scrollableParams: Object
		//		Parameters for dojox.mobile.scrollable.init().
		scrollableParams: null,

		// allowNestedScrolls: Boolean
		//		e.g. Allow ScrollableView in a SwapView.
		allowNestedScrolls: true,

		constructor: function(){
			this.scrollableParams = {};
		},

		destroy: function(){
			this.cleanup();
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){ return; }
			var node;
			var params = this.scrollableParams;
			this.init(params);
			this.inherited(arguments);
		},

		buildRendering: function(){
			this.inherited(arguments);
			domClass.add(this.domNode, "mblScrollableView");
			this.domNode.style.overflow = "hidden";
			this.domNode.style.top = "0px";
			this.containerNode = domConstruct.create("DIV",
				{className:"mblScrollableViewContainer"}, this.domNode);
			this.containerNode.style.position = "absolute";
			this.containerNode.style.top = "0px"; // view bar is relative
			if(this.scrollDir === "v"){
				this.containerNode.style.width = "100%";
			}
			this.reparent();
		},

		reparent: function(){
			// summary:
			//		Moves all the children, except header and footer, to
			//		containerNode.
			var i, idx, len, c;
			for(i = 0, idx = 0, len = this.domNode.childNodes.length; i < len; i++){
				c = this.domNode.childNodes[idx];

				if(c === this.containerNode){
					idx++;
					continue;
				}
				this.containerNode.appendChild(this.domNode.removeChild(c));
			}
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			this.inherited(arguments); // scrollable#resize() will be called
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		}
	});
	lang.extend(cls, new Scrollable(dojo, dojox));
	return cls;
});
