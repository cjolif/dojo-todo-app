define([ "dojo/_base/array",
         "dojo/_base/lang",
         "dojo/_base/declare",
         "dojo/sniff",
         "dojo/dom-construct",
         "dojo/dom-geometry",
         "dijit/registry",
         "./common",
         "./_ScrollableMixin" ],
		function(array, lang, declare, has, domConstruct, domGeometry, registry, dm, ScrollableMixin){

	// module:
	//		dojox/mobile/LazyScrollList
	// summary:
	//		A mixin that enhances performance of long lists contained in scrollable views.

	var getMarginBox = !has("mozilla") ? domGeometry.getMarginBox :
		function(node){
			// getMarginBox is wrong on FF, try getBoundingClientRect instead.
			var rect = node.getBoundingClientRect();
			var prect = node.parentNode.parentNode.getBoundingClientRect();
			return { l: rect.left-prect.left, t: rect.top-prect.top, w: rect.right-rect.left, h: rect.bottom-rect.top };
		};

	var cls = declare("dojox.mobile.LazyScrollList", null, {
		// summary:
		//		This mixin adds "lazy scrolling" functionality to a Dojo Mobile list.
		// description:
		//		LazyScrollList enhances a list contained in a ScrollableView
		//		so that only a minimum set of list items are actually contained in the DOM
		//		at any given time. It does so by watching the scrolling events of the
		//		view (i.e. the 'scrollTo' and 'slideTo' methods), and add/remove items
		//		in the DOM to keep only the visible list items.
		//		The parent must be a ScrollableView or another scrollable component
		//		that inherits from the dojox.mobile.scrollable mixin, otherwise the mixin has
		//		no effect. Also, editable lists are not yet supported, so lazy scrolling is
		//		disabled if the list's 'editable' attribute is true.
		//		If this mixin is used, list items must be added, removed or reordered exclusively
		//		using the addChild and removeChild methods of the list. If the DOM is modified
		//		directly (for example using list.containerNode.appendChild(...)), the list
		//		will not behave correctly.
		
		// keepEvenOdd:
		//		If true, preserve parity of the number of loaded items.
		//		Set this property if you have 'nth-child(even/odd)' rules in your CSS.
		keepEvenOdd: false,
		
		startup : function(){
			
			this.inherited(arguments);

			if(!this.editable){

				var p = this.getParent();

				if(p.isInstanceOf(ScrollableMixin)){

					//console.log("lazy scroll enabled for " + this);
					
					// listen to scrollTo and slideTo from the parent scrollable object

					this.connect(p, "scrollTo", dojo.hitch(this, this._loadItems), true);
					this.connect(p, "slideTo", dojo.hitch(this, this._loadItems), true);

					// The _topDiv and _bottomDiv elements are place holders for the items
					// that are not actually in the DOM at the top and bottom of the list.

					this._topDiv = domConstruct.create("div", null, this.domNode);
					this._bottomDiv = domConstruct.create("div", null, this.domNode);

					// We store all the items in the _items array.
					this._items = [];

					// Get all children already added (e.g. through markup) and add them to _items
					array.forEach(this._getItems(), lang.hitch(this, function(item){
						this._items.push(item);
					}));
				}
			}
		},
		
		_loadItems : function(toPos){
			// summary:	Adds and removes items to/from the DOM when the list is scrolled.
			// tags: private

			// This method works as follows:
			// - determine the minimum and maximum y of the visible area based on the current/new scroll position
			// - bootstrap: if no items loaded yet, add items until the max y is reached.
			// - look at y position of first and last loaded items:
			//     - if first item is < ymin, remove items at the beginning
			//     - if first item is > ymin, add items at the beginning
			//     - if last item is > ymax, remove items at the end
			//     - if last item is < ymax, add items at the end
			// - whenever items are added/removed at the beginning, adjust the height of the
			//   top place holder div to compensate exactly the items that were added/removed.
			// - also resize the bottom place holder div to match the height of the items that
			// 	 are not loaded at the end of the list.
			
			var i, start, item, box, h, hdiff;

			var sv = this.getParent(); // ScrollableView
			h = sv.getDim().d.h;
			if(h <= 0) return; 			// view is hidden
			
			var cury = -sv.getPos().y; // current y scroll position
			var posy = toPos ? -toPos.y : cury;

			// get minimum and maximum visible y positions:
			// we use the largest area including both the current and new position
			// so that all items will be visible during slideTo animations
			var ymin = Math.min(cury, posy), ymax = Math.max(cury, posy) + h;
			ymin -= h / 2;
			ymax += h / 2;

			var children = this._getItems();
			
			var added = 0, removed = 0;

			if(children.length == 0){
				// no items loaded yet, add as many items as fit
				this._topDiv.style.height = "0px";
				hdiff = 0;
				for (i = 0; i < this._items.length; i++){
					item = this._items[i];
					this._addItem(item);
					added++;
					box = getMarginBox(item.domNode);
					if(box.t + box.h - hdiff >= ymax)
						break;
					if(box.t + box.h - hdiff < ymin){
						this._removeItem(item);
						added--;
						hdiff -= box.h;
					}
				}
				if(hdiff){
					this._topDiv.style.height = Math.max(0, ((parseFloat(this._topDiv.style.height) || 0) - hdiff)) + "px";
				}
			}else{
				// some items loaded, where is the first item?
				item = children[0];
				box = getMarginBox(item.domNode);
				hdiff = 0;
				start = 0;
				if(box.t > ymin){
					// first item is below top of view, add items above/before it.
					// get our total height, we use that to measure added items
					h = getMarginBox(this.domNode).h;
					start = array.indexOf(this._items, item);
					for (i = start - 1; i >= 0; i--){
						item = this._items[i];
						this._addItem(item, true);
						added++;
						hdiff = getMarginBox(this.domNode).h - h;
						if(box.t - hdiff <= ymin){
							break;
						}
					}
				}else if(box.t + box.h < ymin){
					// first item is outside (above top), remove items from top
					h = getMarginBox(this.domNode).h;
					start = array.indexOf(this._items, item);
					// remove all items before first item, stop when item is no more in DOM
					for (i = start - 1; i >= 0; i--){
						item = this._items[i];
						if(!item.domNode.parentNode)
							break;
						this._removeItem(item);
						removed++;
					}
					hdiff = getMarginBox(this.domNode).h - h;
					// remove items after first item until we reach a visible item.
					for (i = start; i < this._items.length; i++){
						item = this._items[i];
						if(item.domNode.parentNode){
							box = getMarginBox(item.domNode);
							if(box.t + box.h - hdiff < ymin){
								this._removeItem(item);
								removed++;
								hdiff = getMarginBox(this.domNode).h - h;
								continue;
							}
						}
						break;
					}
				}
				
				if(this.keepEvenOdd && (added-removed)%2){
					// preserve even/odd number of items: if an odd number was added/removed,
					// add back one item.
					item = this._items[start - added + removed - 1];
					if(item){
						this._addItem(item, true);
						added++;
						hdiff = getMarginBox(this.domNode).h - h;
					}
				}
				
				// adjust top div
				if(hdiff){
					this._topDiv.style.height = Math.max(0, ((parseFloat(this._topDiv.style.height) || 0) - hdiff)) + "px";
				}
				// where is the last item?
				item = children[children.length - 1];
				box = getMarginBox(item.domNode);
				if(box.t + box.h < ymax){
					// last item is above bottom of view, add items below/after it
					start = array.indexOf(this._items, item);
					for (i = start + 1; i < this._items.length; i++){
						item = this._items[i];
						this._addItem(item);
						added++;
						box = getMarginBox(item.domNode);
						if(box.t + box.h >= ymax){
							break;
						}
					}
				}else if(box.t > ymax){
					// last item is outside (below bottom of view), remove items
					start = array.indexOf(this._items, item);
					// remove all items after last item, stop when item is no more in DOM
					for (i = start + 1; i < this._items.length; i++){
						item = this._items[i];
						if(!item.domNode.parentNode)
							break;
						this._removeItem(item);
						removed++;
					}
					// remove items before last item until we reach a visible item.
					for (i = start; i >= 0; i--){
						item = this._items[i];
						if(item.domNode.parentNode){
							box = getMarginBox(item.domNode);
							if(box.t > ymax){
								this._removeItem(item);
								removed++;
								continue;
							}
						}
						break;
					}
				}
			}

			// adjust bottom div if items were loaded/unloaded
			if(added || removed){
				children = this._getItems();
				//console.log(this.id + " : " + added + " items added, " + removed + " items removed, " + children.length + " items loaded in DOM");
				if(children.length > 0){
					// estimate padding by computing the average height of loaded items
					var itemh = (getMarginBox(this.domNode).h 
							- (parseFloat(this._topDiv.style.height) || 0) 
							- (parseFloat(this._bottomDiv.style.height) || 0))
								/ children.length;
					// padding for unloaded items after last loaded items
					h = (this._items.length - 1 - array.indexOf(this._items, children[children.length-1])) *
							itemh;
				}else{
					h = 0;
				}
				this._bottomDiv.style.height = h + "px";
			}
		},

		_addItem : function(item, atStart){
			// summary: Adds an item to the list's DOM node during loading/unloading.
			// tags: private
			if(atStart){
				domConstruct.place(item.domNode, this._topDiv, "after");
			}else{
				domConstruct.place(item.domNode, this._bottomDiv, "before");
			}
			if(!item._started){
				item.startup();
			}
		},

		_removeItem : function(item){
			// summary: Removes an item from the list's DOM node during loading/unloading.
			// tags: private
			var node = item.domNode;
			if(node.parentNode){
				node.parentNode.removeChild(node);
			}
		},
		
		_getItems: function(){
			// summary: Returns the currently loaded items.
			// tags: private
			return registry.findWidgets(this.containerNode);
		},
		
		_childrenChanged : function(){
			// summary: Called by addChild/removeChild, updates the loaded items.
			// tags: private
			
			// Whenever an item is added or removed, this may impact the loaded items,
			// so we have to clear all loaded items and recompute them. We cannot afford 
			// to do this on every add/remove, so we use a timer to batch these updates.
			// There would probably be a way to update the loaded items on the fly
			// in add/removeChild, but at the cost of much more code...
			if(!this._qs_timer){
				this._qs_timer = setTimeout(lang.hitch(this, function(){
					delete this._qs_timer;
					array.forEach(this._getItems(), dojo.hitch(this, function(item){
						this._removeItem(item);
					}));
					this._loadItems();
				}), 0);
			}
		},

		resize: function(){
			// summary: Loads/unloads items to fit the new size
			this.inherited(arguments);
			if(this._items){
				this._loadItems();
			}
		},
		
		// The rest of the methods are overrides of _Container and _WidgetBase.
		// We must override them because children are not all added to the DOM tree
		// under the list node, only a subset of them will really be in the DOM,
		// but we still want the list to look as if all children were there.

		addChild : function(/* dijit._Widget */widget, /* int? */insertIndex){
			// summary: Overrides dijit._Container
			if(this._items){
				if( typeof insertIndex == "number"){
					this._items.splice(insertIndex, 0, widget);
				}else{
					this._items.push(widget);
				}
				this._childrenChanged();
			}else{
				this.inherited(arguments);
			}
		},

		removeChild : function(/* Widget|int */widget){
			// summary: Overrides dijit._Container
			if(this._items){
				this._items.splice(typeof widget == "number" ? widget : this._items.indexOf(widget), 1);
				this._childrenChanged();
			}else{
				this.inherited(arguments);
			}
		},

		getChildren : function(){
			// summary: Overrides dijit._WidgetBase
			if(this._items){
				return this._items.slice(0);
			}else{
				return this.inherited(arguments);
			}
		},

		_getSiblingOfChild : function(/* dijit._Widget */child, /* int */dir){
			// summary: Overrides dijit._Container
			// tags: private
			if(this._items){
				var index = this._items.indexOf(child);
				if(index >= 0){
					index = dir > 0 ? index++ : index--;
				}
				return this._items[index];
			}else{
				return this.inherited(arguments);
			}
		}
	});

	return cls;
});
