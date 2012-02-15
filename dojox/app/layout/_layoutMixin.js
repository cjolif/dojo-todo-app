define([
	"dojo/_base/lang", // lang.mixin
	"dijit/Viewport",
	"dijit/registry",
	"dojo/_base/declare", // declare
	"dojo/dom-class", // domClass.add domClass.remove
	"dojo/dom-geometry", // domGeometry.marginBox
	"dojo/dom-style", // domStyle.getComputedStyle
	"dojo/_base/array",
	"dojo/query",
	"./utils"
], function(lang, Viewport,	registry, declare, domClass, domGeometry, domStyle, array, query, layoutUtils){
	// module:
	//		dojox/app/layout/_layoutMixin
	// summary:
	//		_LayoutWidget Base class for a _Container widget which is responsible for laying out its children.
	//		Widgets which mixin this code must define layout() to manage placement and sizing of the children.


	return declare("dojox.app.layout._layoutMixin", [], {
		// summary:
		//		Base class for a _Container widget which is responsible for laying out its children.
		//		Widgets which mixin this code must define layout() to manage placement and sizing of the children.

		// baseClass: [protected extension] String
		//		This class name is applied to the widget's domNode
		//		and also may be used to generate names for sub nodes,
		//		for example dijitTabContainer-content.
		// baseClass: "dijitLayoutContainer",

		// isLayoutContainer: [protected] Boolean
		//		Indicates that this widget is going to call resize() on its
		//		children widgets, setting their size, when they become visible.
		// isLayoutContainer: true,

		buildRendering: function(){
			this.inherited(arguments);
			domClass.add(this.domNode, "dijitContainer");

			//fix slide transition issue on tablet
			domStyle.set(this.domNode, "overflow-x", "hidden");
			domStyle.set(this.domNode, "overflow-y", "auto");
		},

		startup: function(){
			// summary:
			//		Called after all the widgets have been instantiated and their
			//		dom nodes have been inserted somewhere under win.doc.body.
			//
			//		Widgets should override this method to do any initialization
			//		dependent on other widgets existing, and then call
			//		this superclass method to finish things off.
			//
			//		startup() in subclasses shouldn't do anything
			//		size related because the size of the widget hasn't been set yet.

			//	if(this._started){ return; }

			// Need to call inherited first - so that child widgets get started
			// up correctly
			this.inherited(arguments);

			// If I am a not being controlled by a parent layout widget...
			var parent = this.getParent && this.getParent();
			if(!(parent && parent.isLayoutContainer)){
				// Do recursive sizing and layout of all my descendants
				// (passing in no argument to resize means that it has to glean the size itself)
				this.resize();

				// Since my parent isn't a layout container, and my style *may be* width=height=100%
				// or something similar (either set directly or via a CSS class),
				// monitor when viewport size changes so that I can re-layout.
				this._connects.push(Viewport.on("resize", lang.hitch(this, "resize")));
			}
		},

		resize: function(changeSize, resultSize){
			// summary:
			//		Call this to resize a widget, or after its size has changed.
			// description:
			//		Change size mode:
			//			When changeSize is specified, changes the marginBox of this widget
			//			and forces it to re-layout its contents accordingly.
			//			changeSize may specify height, width, or both.
			//
			//			If resultSize is specified it indicates the size the widget will
			//			become after changeSize has been applied.
			//
			//		Notification mode:
			//			When changeSize is null, indicates that the caller has already changed
			//			the size of the widget, or perhaps it changed because the browser
			//			window was resized.  Tells widget to re-layout its contents accordingly.
			//
			//			If resultSize is also specified it indicates the size the widget has
			//			become.
			//
			//		In either mode, this method also:
			//			1. Sets this._borderBox and this._contentBox to the new size of
			//				the widget.  Queries the current domNode size if necessary.
			//			2. Calls layout() to resize contents (and maybe adjust child widgets).
			//
			// changeSize: Object?
			//		Sets the widget to this margin-box size and position.
			//		May include any/all of the following properties:
			//	|	{w: int, h: int, l: int, t: int}
			//
			// resultSize: Object?
			//		The margin-box size of this widget after applying changeSize (if
			//		changeSize is specified).  If caller knows this size and
			//		passes it in, we don't need to query the browser to get the size.
			//	|	{w: int, h: int}

			var node = this.domNode;

			// set margin box size, unless it wasn't specified, in which case use current size
			if(changeSize){
				domGeometry.setMarginBox(node, changeSize);
			}

			// If either height or width wasn't specified by the user, then query node for it.
			// But note that setting the margin box and then immediately querying dimensions may return
			// inaccurate results, so try not to depend on it.
			var mb = resultSize || {};
			lang.mixin(mb, changeSize || {});	// changeSize overrides resultSize
			if( !("h" in mb) || !("w" in mb) ){
				mb = lang.mixin(domGeometry.getMarginBox(node), mb);	// just use domGeometry.marginBox() to fill in missing values
			}

			// Compute and save the size of my border box and content box
			// (w/out calling domGeometry.getContentBox() since that may fail if size was recently set)
			var cs = domStyle.getComputedStyle(node);
			var me = domGeometry.getMarginExtents(node, cs);
			var be = domGeometry.getBorderExtents(node, cs);
			var bb = (this._borderBox = {
				w: mb.w - (me.w + be.w),
				h: mb.h - (me.h + be.h)
			});
			var pe = domGeometry.getPadExtents(node, cs);
			this._contentBox = {
				l: domStyle.toPixelValue(node, cs.paddingLeft),
				t: domStyle.toPixelValue(node, cs.paddingTop),
				w: bb.w - pe.w,
				h: bb.h - pe.h
			};

			// Callback for widget to adjust size of its children
			this.layout();
		},

		layout: function(){
			// summary:
			//		Widgets override this method to size and position their contents/children.
			//		When this is called this._contentBox is guaranteed to be set (see resize()).
			//
			//		This is called after startup(), and also when the widget's size has been
			//		changed.
			// tags:
			//		protected extension

			var fullScreenScene,children,hasCenter;
			//console.log("fullscreen: ", this.selectedChild && this.selectedChild.isFullScreen);
			if (this.selectedChild && this.selectedChild.isFullScreen) {
				console.warn("fullscreen sceen layout");
				/*
				fullScreenScene=true;
				children=[{domNode: this.selectedChild.domNode,region: "center"}];
				dojo.query("> [region]",this.domNode).forEach(function(c){
					if(this.selectedChild.domNode!==c.domNode){
						dojo.style(c.domNode,"display","none");
					}
				})
				*/
			}else{
				children = query("> [region]", this.domNode).map(function(node){
					var w = registry.getEnclosingWidget(node);
					if (w){return w;}

					return {
						domNode: node,
						region: dattr.get(node,"region")
					}
				});
				if (this.selectedChild){
					children = array.filter(children, function(c){
						if (c.region=="center" && this.selectedChild && this.selectedChild.domNode!==c.domNode){
							domStyle.set(c.domNode,"zIndex",25);
							domStyle.set(c.domNode,'display','none');
							return false;
						}else if (c.region!="center"){
							domStyle.set(c.domNode,"display","");
							domStyle.set(c.domNode,"zIndex",100);
						}

						return c.domNode && c.region;
					},this);

				//	this.selectedChild.region="center";
				//	dojo.attr(this.selectedChild.domNode,"region","center");
				//	dojo.style(this.selectedChild.domNode, "display","");
				//	dojo.style(this.selectedChild.domNode,"zIndex",50);

				//	children.push({domNode: this.selectedChild.domNode, region: "center"});	
				//	children.push(this.selectedChild);
				//	console.log("children: ", children);
				}else{
					array.forEach(children, function(c){
						if (c && c.domNode && c.region=="center"){
							domStyle.set(c.domNode,"zIndex",25);
							domStyle.set(c.domNode,'display','');
						}
					});
				}
			}
			// We don't need to layout children if this._contentBox is null for the operation will do nothing.
			if (this._contentBox) {
				layoutUtils.layoutChildren(this.domNode, this._contentBox, children);
			}
			array.forEach(this.getChildren(), function(child){
				if (!child._started && child.startup){
					child.startup();
				}
			});
		}
	});
});
