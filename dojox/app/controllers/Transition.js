define(["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/Deferred", "dojo/when", "dojox/css3/transit", "../Controller"],
function(lang, declare, on, Deferred, when, transit, Controller){
	// module:
	//		dojox/app/controllers/transition
	// summary:
	//		Bind "transition" event on dojox.app application's domNode.
	//		Do transition from one view to another view.
	return declare("dojox.app.controllers.Transition", Controller, {

		proceeding: false,

		waitingQueue:[],

		constructor: function(app, events){
			// summary:
			//		bind "transition" event on application's domNode.
			//
			// app:
			//		dojox.app application instance.
			// events:
			//		{event : handler}
			this.events = {
				"transition": this.transition,
				"startTransition": this.onStartTransition
			};
			this.inherited(arguments);
		},

		transition: function(event){
			// summary:
			//		Response to dojox.app "transition" event.
			//
			// example:
			//		Use trigger() to trigger "transition" event, and this function will response to the event. For example:
			//		|	this.trigger("transition", {"viewId":viewId, "opts":opts});
			//
			// event: Object
			//		"transition" event parameter. It should be like this: {"viewId":viewId, "opts":opts}

			this.proceedTransition(event);
		},

		onStartTransition: function(evt){
			// summary:
			//		Response to dojox.app "startTransition" event.
			//
			// example:
			//		Use "dojox/mobile/TransitionEvent" to trigger "startTransition" event, and this function will response the event. For example:
			//		|	var transOpts = {
			//		|		title:"List",
			//		|		target:"items,list",
			//		|		url: "#items,list"
			//		|	};
			//		|	new TransitionEvent(domNode, transOpts, e).dispatch();
			//
			// evt: Object
			//		transition options parameter

			// prevent event from bubbling to window and being
			// processed by dojox/mobile/ViewController
			if(evt.preventDefault){
				evt.preventDefault();
			}
			evt.cancelBubble = true;
			if(evt.stopPropagation){
				evt.stopPropagation();
			}

			var target = evt.detail.target;
			var regex = /#(.+)/;
			if(!target && regex.test(evt.detail.href)){
				target = evt.detail.href.match(regex)[1];
			}

			// transition to the target view
			this.transition({"viewId":target, opts: lang.mixin({reverse: false},evt.detail)});
		},

		proceedTransition: function(transitionEvt){
			// summary:
			//		Proceed transition queue by FIFO by default.
			//		If transition is in proceeding, add the next transition to waiting queue.
			//
			// transitionEvt: Object
			//		"transition" event parameter. It should be like this: {"viewId":viewId, "opts":opts}

			if(this.proceeding){
				console.log("push event", transitionEvt);
				this.waitingQueue.push(transitionEvt);
				return;
			}
			this.proceeding = true;

			this.app.trigger("load", {
				"viewId": transitionEvt.viewId,
				"callback": lang.hitch(this, function(){
					var transitionDef = this._doTransition(transitionEvt.viewId, transitionEvt.opts, this.app);
					when(transitionDef, lang.hitch(this, function(){
						this.proceeding = false;
						var nextEvt = this.waitingQueue.shift();
						if(nextEvt){
							this.proceedTransition(nextEvt);
						}
					}));
				})
			});
		},

		_doTransition: function(transitionTo, opts, parent){
			// summary:
			//		Transitions from the currently visible scene to the defined scene.
			//		It should determine what would be the best transition unless
			//		an override in opts tells it to use a specific transitioning methodology
			//		the transitionTo is a string in the form of [view]@[scene].  If
			//		view is left of, the current scene will be transitioned to the default
			//		view of the specified scene (eg @scene2), if the scene is left off
			//		the app controller will instruct the active scene to the view (eg view1).  If both
			//		are supplied (view1@scene2), then the application should transition to the scene,
			//		and instruct the scene to navigate to the view.
			//
			// transitionTo: Object
			//		transition to view id. It looks like #tabScene,tab1
			// opts: Object
			//		transition options
			// parent: Object
			//		view's parent
			//
			// returns:
			//		transit dojo.DeferredList object.

			if(!parent){
				throw Error("view parent not found in transition.");
			}
			var toId, subIds, next, current = parent.selectedChild;
			if(transitionTo){
				var parts = transitionTo.split(",");
				toId = parts.shift();
				subIds = parts.join(',');
			}else{
				toId = parent.defaultView;
				if(parent.views[parent.defaultView] && parent.views[parent.defaultView]["defaultView"]){
					subIds = parent.views[parent.defaultView]["defaultView"];
				}
			}

			// next = this.loadChild(toId,subIds);
			// next is loaded and ready for transition
			next = parent.children[parent.id + '_' + toId];
			if(!next){
				throw Error("child view must be loaded before transition.");
			}

			// if no subIds and next has default view, 
			// set the subIds to the default view and transition to default view.
			if(!subIds && next.defaultView){
				subIds = next.defaultView;
			}

			if(!current){
				// current view is null, set current view equals next view.
				next.beforeActivate();
				next.afterActivate();
				this.app.trigger("select", {"parent":parent, "view":next});
				return;
			}
			// next is not a Deferred object, so Deferred.when is no needed.
			if(next !== current){
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

				// deactivate sub child of current view, then deactivate current view
				var subChild = current.selectedChild;
				while(subChild){
					subChild.beforeDeactivate();
					subChild = subChild.selectedChild;
				}
				current.beforeDeactivate();
				next.beforeActivate();

				this.app.trigger("select", {"parent":parent, "view":next});
				var result = transit(current.domNode, next.domNode, lang.mixin({}, opts, {
					transition: parent.defaultTransition || "none"
				}));
				result.then(lang.hitch(this, function(){
					// deactivate sub child of current view, then deactivate current view
					var subChild = current.selectedChild;
					while(subChild){
						subChild.afterDeactivate();
						subChild = subChild.selectedChild;
					}
					current.afterDeactivate();
					next.afterActivate();

					if(subIds){
						this._doTransition(subIds, opts, next);
					}
				}));
				return result; //dojo.DeferredList
			}else{
				// next view == current view, refresh current view
				// deactivate next view
				next.beforeDeactivate();
				next.afterDeactivate();
				// activate next view
				next.beforeActivate();
				next.afterActivate();
				// layout current view
				this.app.trigger("select", {"parent":parent, "view":next});
			}

			// do sub transition like transition from "tabScene,tab1" to "tabScene,tab2"
			if(subIds){
				return this._doTransition(subIds, opts, next); //dojo.DeferredList
			}
		}
	});
});
