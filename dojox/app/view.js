define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin","./layout/_layoutMixin", "./controller"],
	function(declare,Widget,Container,Contained,TemplatedMixin,WidgetsInTemplateMixin, layoutMixin, controller){
	return declare("dojox.app.view", [Widget,TemplatedMixin,Container,Contained, WidgetsInTemplateMixin, layoutMixin, controller], {
		selected: false,
		keepScrollPosition: true,
		baseClass: "applicationView mblView",
		config:null,
		widgetsInTemplate: true,
		templateString: '<div></div>',
		toString: function(){return this.id},

		//Temporary work around for getting a null when calling getParent
		getParent: function(){return null;},
		startup: function(){
			if (this._started) {
				return;
			}
			this._started = true;

			// call _layoutMixin startup to layout children
			this.inherited(arguments);

			// call view controller _init method
			this._init();
		}
	});
});
