dependencies = {
	layers: [
		{
			name: "../demos/todoMvcApp/src.js",
			resourceName: "demos.todoMvcApp.src",
			dependencies: [
				"dojox/mobile/_base",
				"dojox/mobile/_compat",
				"dojox/mobile/TabBar",
				"dojox/mobile/RoundRect",
				"dojox/mobile/TabBarButton",
				"dojox/mobile/TextBox",
				"dojox/mobile/TextArea",
				"dojox/mobile/CheckBox",
				"dojox/mobile/ExpandingTextArea",
				"dojox/mobile/Button",
				"dojox/mobile/RoundRect",
				"dojox/mobile/Heading",
				"dojox/mobile/ListItem",
				"dojox/mobile/RoundRectList",
				"dojox/mobile/RoundRectCategory",
				"dojox/mobile/Switch",
				"dojox/mobile/SimpleDialog",
				"dojox/mobile/DatePicker",
				"dojox/mobile/Opener",
				"dojox/mobile/SpinWheelDatePicker",
				"dojo/date/stamp",
				"dojox/app/widgets/Container",
				"dojo/store/Memory",
				"dojo/data/ItemFileWriteStore",
				"dojo/store/DataStore",
				"dojox/app/utils/mvcModel",
				"dojox/mvc/EditStoreRefListController",
				"dojox/mvc/Repeat",
				"dojox/mvc/Group",
				"dojox/mvc/WidgetList",
				"dojox/mvc/Output",
				"dojox/mvc/at",
				"dojox/app/main",
				"demos.todoMvcApp.src"
			]
		}
	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ],
		[ "demos", "../demos" ]
	]
}
