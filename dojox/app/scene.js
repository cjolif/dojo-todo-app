define(["dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/_base/array",
	"dojo/_base/Deferred",
	"dojo/_base/lang",
	"dojo/_base/sniff",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/query",
	"dijit",
	"dojox",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojox/css3/transit",
	"./model", 
	"./view", 
	"./bind",
	"./layout/_layoutMixin",
	"./controller"],
	function(dojo,declare,connect, array,deferred,dlang,has,dstyle,dgeometry,cls,dconstruct,dattr,query,dijit,dojox,WidgetBase,Templated,WidgetsInTemplate,transit, model, baseView, bind,layoutMixin, controller){
	
	return declare("dojox.app.scene", [WidgetBase, Templated, WidgetsInTemplate, layoutMixin, controller], {
		isContainer: true,
		widgetsInTemplate: true,
		defaultView: "default",

		selectedChild: null,
		baseClass: "scene mblView",
		isFullScreen: false,
		defaultViewType: baseView,
		
		//Temporary work around for getting a null when calling getParent
		getParent: function(){return null;},


		constructor: function(params,node){
			this.children={};
			if(params.parent){
				this.parent=params.parent
			}
			if(params.app){
				this.app = params.app;
			}
		},

		buildRendering: function(){
			this.inherited(arguments);
			dstyle.set(this.domNode, {width: "100%", "height": "100%"});
		},

		splitChildRef: function(childId){
			var id = childId.split(",");
			if (id.length>0){
				var to = id.shift();
			}else{
				console.warn("invalid child id passed to splitChildRef(): ", childId);
			}

			return {
				id:to || this.defaultView,
				next: id.join(',') 
			}
		},

		loadChild: function(childId,subIds){
			// if no childId, load the default view
            if (!childId) {
                var parts = this.defaultView ? this.defaultView.split(",") : "default";
                childId = parts.shift();
                subIds = parts.join(',');
            }

			var cid = this.id+"_" + childId;
			if (this.children[cid]){
				return this.children[cid];
			}

			if (this.views&& this.views[childId]){
				var conf = this.views[childId];
				if (!conf.dependencies){conf.dependencies=[];}
				var deps = conf.template? conf.dependencies.concat(["dojo/text!app/"+conf.template]) :
						conf.dependencies.concat([]);
			
				var def = new deferred();
				if (deps.length>0) {
					require(deps,function(){
						def.resolve.call(def, arguments);			
					});
				}else{
					def.resolve(true);
				}
		
			   var loadChildDeferred = new deferred();
			   var self = this;
				deferred.when(def, function(){
					var ctor;
					if (conf.type){
						ctor=dojo.getObject(conf.type);
					}else if (self.defaultViewType){
						ctor=self.defaultViewType;
					}else{
						throw Error("Unable to find appropriate ctor for the base child class");
					}

					var params = dojo.mixin({}, conf, {
						id: self.id + "_" + childId,
						templateString: conf.template?arguments[0][arguments[0].length-1]:"<div></div>",
						parent: self,
						app: self.app
					}) 
					if (subIds){
						params.defaultView=subIds;
					}
                    var child = new ctor(params);
                    //load child's model if it is not loaded before
                    if(!child.loadedModels){
                        child.loadedModels = model(conf.models, self.loadedModels)
                        //TODO need to find out a better way to get all bindable controls in a view
                        bind([child], child.loadedModels);
                    }
					var addResult = self.addChild(child);
					//publish /app/loadchild event
					//application can subscript this event to do user define operation like select TabBarButton, add dynamic script text etc.
					connect.publish("/app/loadchild", [child]);

                 var promise;

                 subIds = subIds.split(',');
                 if ((subIds[0].length > 0) && (subIds.length > 1)) {//TODO join subIds
                     promise = child.loadChild(subIds[0], subIds[1]);
                 }
                 else 
                     if (subIds[0].length > 0) {
                         promise = child.loadChild(subIds[0], "");
                     }
                 
                 dojo.when(promise, function(){
                     loadChildDeferred.resolve(addResult)
                 });
				});
              return loadChildDeferred;
			}
	
			throw Error("Child '" + childId + "' not found.");
		},

		getChildren: function(){
			return this._supportingWidgets;
		},

		startup: function(){
			if(this._started){ return; }
			this._started=true;

			var parts = this.defaultView?this.defaultView.split(","):"default";
			var toId, subIds;
			toId= parts.shift();
			subIds = parts.join(',');

			if(this.views[this.defaultView] && this.views[this.defaultView]["defaultView"]){
				subIds =  this.views[this.defaultView]["defaultView"];
			}	
			
			if(this.models && !this.loadedModels){
				//if there is this.models config data and the models has not been loaded yet,
				//load models at here using the configuration data and load model logic in model.js
				this.loadedModels = model(this.models);
				bind(this.getChildren(), this.loadedModels);
			}
			
			//startup assumes all children are loaded into DOM before startup is called
			//startup will only start the current available children.

			var cid = this.id + "_" + toId;
            if (this.children[cid]) {
				// call _layoutMixin startup to layout children first
				this.inherited(arguments);
				
				// call view controller _init method
				this._init();
				// startup children
				array.forEach(this.getChildren(), function(child){
					child.startup();
				});

				// select the loaded child
				var next = this.children[cid];
				this.set("selectedChild", next);
				//transition to _startView
				if (this._startView && (this._startView != this.defaultView)) {
					this.transition(this._startView, {});
				}
			}
		},

		addChild: function(widget){
			cls.add(widget.domNode, this.baseClass + "_child");
			widget.region = "center";;
			dattr.set(widget.domNode,"region","center");
			this._supportingWidgets.push(widget);
			dconstruct.place(widget.domNode,this.domNode);
			this.children[widget.id] = widget;
			return widget;
		},

		removeChild: function(widget){
			// summary:
			//		Removes the passed widget instance from this widget but does
			//		not destroy it.  You can also pass in an integer indicating
			//		the index within the container to remove

			if(widget){
				var node = widget.domNode;
				if(node && node.parentNode){
					node.parentNode.removeChild(node); // detach but don't destroy
				}
				return widget;
			}
		},

		_setSelectedChildAttr: function(child,opts){
			if (child !== this.selectedChild) { 
					if (this.selectedChild){
						if (this.selectedChild.deactivate){
							this.selectedChild.deactivate(); 
						}

						dstyle.set(this.selectedChild.domNode,"zIndex",25);
					}
		
					//dojo.style(child.domNode, {
					//	"display": "",
					//	"zIndex": 50,
					//	"overflow": "auto"
					//});
					this.selectedChild = child;
					dstyle.set(child.domNode, "display", "");
					dstyle.set(child.domNode,"zIndex",50);
					this.selectedChild=child;
					if (this._started) {	
						if (child.startup && !child._started){
							child.startup();
						}else if (child.activate){
							child.activate();
		
					}
				}
				this.layout();
			}
		},


		transition: function(transitionTo,opts){
			//summary: 
			//  transitions from the currently visible scene to the defined scene.
			//  it should determine what would be the best transition unless
			//  an override in opts tells it to use a specific transitioning methodology
			//  the transitionTo is a string in the form of [view]@[scene].  If
			//  view is left of, the current scene will be transitioned to the default
			//  view of the specified scene (eg @scene2), if the scene is left off
			//  the app controller will instruct the active scene to the view (eg view1).  If both
			//  are supplied (view1@scene2), then the application should transition to the scene,
			//  and instruct the scene to navigate to the view.
			var toId,subIds,next, current = this.selectedChild;
//			console.log("scene", this.id, transitionTo);
			if (transitionTo){	
				var parts = transitionTo.split(",");
				toId= parts.shift();
				subIds = parts.join(',');

			}else{
				toId = this.defaultView;
				if(this.views[this.defaultView] && this.views[this.defaultView]["defaultView"]){
					subIds =  this.views[this.defaultView]["defaultView"];
				}	
			}
		
			next = this.loadChild(toId,subIds);

			if (!current){
				//assume this.set(...) will return a promise object if child is first loaded
				//return nothing if child is already in array of this.children
				return this.set("selectedChild",next);	
			}	

			var transitionDeferred  = new deferred();
			deferred.when(next, dlang.hitch(this, function(next){
			        var promise;
			    
				if (next!==current){
				    //When clicking fast, history module will cache the transition request que
                    //and prevent the transition conflicts.
                    //Originally when we conduct transition, selectedChild will not be the 
				    //view we want to start transition. For example, during transition 1 -> 2
				    //if user click button to transition to 3 and then transition to 1. After 
                    //1->2 completes, it will perform transition 2 -> 3 and 2 -> 1 because 
                    //selectedChild is always point to 2 during 1 -> 2 transition and transition
                    //will record 2->3 and 2->1 right after the button is clicked.
				    
					//assume next is already loaded so that this.set(...) will not return
					//a promise object. this.set(...) will handles the this.selectedChild,
					//activate or deactivate views and refresh layout.
					this.set("selectedChild", next);
					
					//publish /app/transition event
					//application can subscript this event to do user define operation like select TabBarButton, etc.
					connect.publish("/app/transition", [next, toId]);
					transit(current.domNode,next.domNode,dojo.mixin({},opts,{transition: this.defaultTransition || "none"})).then(dlang.hitch(this, function(){
						//dojo.style(current.domNode, "display", "none");
						if (subIds && next.transition){
							promise = next.transition(subIds,opts);
						}
						deferred.when(promise, function(){
		                                    transitionDeferred.resolve();
		                                });
				    }));
				    return;
				}
				else{
					// next == current, call next.activate method to active/refresh view
					next.activate();
				}

				//we didn't need to transition, but continue to propogate.
				if (subIds && next.transition){
					promise = next.transition(subIds,opts);
				}
				deferred.when(promise, function(){
				    transitionDeferred.resolve();
				});
			}));
			return transitionDeferred;
		},
		toString: function(){return this.id}

//		activate: function(){},
//		deactive: function(){}
	});
});
