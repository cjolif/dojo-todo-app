dependencies = {
	layers: [
		{
			name: "../demos/todoMvcApp/src.js",
			resourceName: "demos.todoMvcApp.src",
			dependencies: [
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
