define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc", "dojox/mobile/TransitionEvent"],
function(dom, dstyle, connect, registry, mvc, TransitionEvent){
	return {
		init: function(){
			// override ListItem onClick event
			function setSelectItem(node, index){
				if(window.selected_configuration_item == index){
					return;
				}
				dom.byId('selected_configuration_item'+window.selected_configuration_item).innerHTML =
					'<div class="mblDomButtonSilverCircleGrayButton mblDomButton"><div><div></div></div></div>';

				window.selected_configuration_item = index;
				registry.byNode(node).select();
				dom.byId('selected_configuration_item'+window.selected_configuration_item).innerHTML =
					'<div class="mblDomButtonSilverCircleGreenButton mblDomButton"><div><div></div></div></div>';
			};

			window.setSelectItem = setSelectItem;

			// select the configure item, by default select item 0.
			// TODO: read the selected configuration item from data model
			window.selected_configuration_item = 0;
			dom.byId('selected_configuration_item'+window.selected_configuration_item).innerHTML =
					'<div class="mblDomButtonSilverCircleGreenButton mblDomButton"><div><div></div></div></div>';
		},

		activate: function(){
			var datamodel = app.loadedModels.listsmodel;
			var widget = registry.byId('configure_repeat');
			widget.ref = null;
			widget.set("ref", datamodel);

			if(window.selected_configuration_item >= datamodel.length){
				window.selected_configuration_item = 0; // we delete some items, so set the default select item to 0.
			}
			dom.byId('selected_configuration_item'+window.selected_configuration_item).innerHTML =
					'<div class="mblDomButtonSilverCircleGreenButton mblDomButton"><div><div></div></div></div>';
		},

		deactivate: function(){
		}
	}
});
