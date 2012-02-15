var listsmodel; 
var itemsmodel = [];
var showItemsForList, handleCheckBoxChange, insertNewList, deleteList, handleRadioChange;
var deleteItem, insertNewItem, getNewItem;
var selectedList, selectedItem;
var radioChanging = false;
var itemsToLoadCount = 1;
var loadedItemListCount = 0;

require([
	"dojo/ready",
	"dojo/parser",
	"dojox/mvc",
	"dojo/data/ItemFileWriteStore",
	"dojo/store/DataStore",	
	"dojox/mvc/Group",
	"dojox/mvc/Repeat",
	"dojox/mvc/Output",
	"dijit/form/TextBox",
	"dijit/form/Button",
	"dijit/form/CheckBox",
	"dijit/form/RadioButton",
	"dijit/form/NumberSpinner",
	"dijit/InlineEditBox"
	], function(ready, parser, mvc, itemfilewritestore, datastore){

		/**
	 	* baseUrl, nextId, nextListId are used to have the file system simulate a backend service.
	 	*/
		var baseUrl = "./resources/data/";
		var nextId = 222;
		var nextListId = 2;

		/**
	 	* getListsUrl returns the url to use for the list of lists
		*
	 	* @returns a string with the url
	 	*/		
		var getListsUrl = function(){
			return baseUrl+"lists.json";
		};

		/**
	 	* getItemsUrl returns the url to use for the list of items for the list with the id passed 
		*
		* @param id
	 	* 			id should have id of the list 
	 	* 
	 	* @returns a string with the url
	 	*/		
		var getItemsUrl = function(id){
			return baseUrl+"items-for-"+id+".json";
		};

		/**
	 	* getNextListsId returns the id to use for a new list 
		*
	 	* @returns a string with the id
	 	*/		
		var getNextListsId = function(){
			return nextListId++;
		};

		/**
	 	* getNextItemId returns the id to use for a new item 
		*
	 	* @returns a string with the id
	 	*/		
		var getNextItemId = function(){
			return nextId++;
		};

		/**
	 	* selectedList, and selectedItem are used to keep track of the currently selected list and 
	 	* the item whose details are being displayed. 
	 	*/
		selectedList = 0;
		selectedItem = 0;

		/**
	 	* selectRadio is called to set the selected list 
		*
		* @param index
	 	* 			index is the index of the list to select 
	 	*/		
		var selectRadio = function(index) {
				console.log('selectRadio called with index = '+index);
				selectedList = index;
				var rad = dijit.byId("g1rb"+index);
				if(rad){
					rad.set("checked", true);
				}
		};

		/**
	 	* writeStore and modelPromise are used to create the mvc.StatefulModel which holds the 
	 	* array of lists. 
	 	*/		
		var writeStore = new itemfilewritestore({url: getListsUrl()});
		var modelPromise = mvc.newStatefulModel({store: new datastore({store: writeStore})});  
		modelPromise.then(function(results){ 
			listsmodel = results;
			nextIndexToAdd = listsmodel.data.length;
			
			itemsToLoadCount = listsmodel.length;
			initAllItems(); // call init for all items, when all items are loaded parse will be called.
		});


		/**
	 	* initAllItems is called to read in all of the items for all lists
		*
	 	*/		
		initAllItems = function() {
			console.log("initAllItems called");
			for(var i = 0;i < itemsToLoadCount;i++){
				var listId = i;
				var modelPromise2;  
				var u = getItemsUrl(listId);			
				var writeStore2 = new itemfilewritestore({url: u});
				modelPromise2 = mvc.newStatefulModel({store: new datastore({store: writeStore2})});  
				modelPromise2.then(function(results2){ 
					var listId = results2[0].parentId;	
					itemsmodel[listId] = results2;
					if(readyToParse(listId)){  // are all items ready?
						console.log("in modlePromise before call to parser.parse");
						parser.parse();
						console.log("in modlePromise after call to selectRadio");
						selectRadio(0);
					}
				})
			}
		};
		
		
		/**
	 	* showItemsForList is called when the selected list changes to display the items for that list.
	 	* 			If we already have the list in our itemsmodel we will use it,
	 	* 			otherwise we will try to load it from the server.  
	 	* 			We set an empty item in the list before trying to load from the server to handle the
	 	* 			case where the request to the server fails. 
		*
		* @param listId
	 	* 			listId should have id of the list, 
	 	*/		
		showItemsForList = function(listId) {
				console.log("showItemsForList called with listId = "+listId);
				console.log("in showItemsForList itemsmodel is");
				console.log(itemsmodel);
				
				var rep = dijit.byId("tasksrepeatId");
				if(!itemsmodel[listId]){  // if we don't have the items for this list get them from the store
					console.log("showItemsForList called no itemsModle yet for listId = "+listId);
					// first setup for an empty item in case the server request fails
					itemsmodel[listId]=getNewItem(listId, true);
					rep.set("ref",itemsmodel[listId]);

					var modelPromise2;  
					var u = getItemsUrl(listId);			
					var writeStore2 = new itemfilewritestore({url: u});
					modelPromise2 = mvc.newStatefulModel({store: new datastore({store: writeStore2})});  
					modelPromise2.then(function(results2){ 
						listId = results2[0].parentId;	
						itemsmodel[listId] = results2;
						itemsmodel[listId] = results2;
						rep.set("ref",results2);
					})
				}else{  // if we have the items use them
					rep.set("ref",itemsmodel[listId]);
				}
				radioChanging = false;
		};

		/**
	 	* handleCheckBoxChange is called when an item's checkbox is changed.
	 	* 			We should ignore the change if it was caused by a lists radio button selection.
	 	* 			If an item is checked, we add the checkedTodo class to have the item displayed with strikethru  
		*
		* @param current
	 	* 			current is true if the checkbox is checked, otherwise it is false
	 	*/		
		handleCheckBoxChange = function(current) {
				//console.log('handleCheckBoxChange value changed current ='+current+"  this.index="+this.index);
				this.binding.set("value",current);
				var ident = "todoItem"+this.index;
				if(!radioChanging){
					if(this.checked){
						dojo.addClass(ident, 'checkedTodo');
					}else if(dojo.hasClass(ident, 'checkedTodo')){
						dojo.removeClass(ident, 'checkedTodo');
					}
				}
				// hide details when a selection is made for a diff checkbox.  
				// commented out because it caused a problem when adding a new item
				//if(this.index !== selectedItem){
				//	dojo.addClass("details", 'hiddenDetails');
				//}
		}

		/**
	 	* setDetailsContext is called when an item's Details button is clicked.
	 	* 			We will set the ref to the item in the itemsmodel and 
	 	* 			remove the class hiddenDetails so the details section will be displayed 
		*
		* @param index
	 	* 			index is the index of the item in the itemsmodel for the selectedList.
	 	*/		
		setDetailsContext = function(index) {
				selectedItem = index;
				//console.log("setDetailsContext called with index = "+index);
				var detailsWid = dijit.byId("detailsGroup");
				detailsWid.set("ref", itemsmodel[selectedList][index]);
				if(dojo.hasClass("details", 'hiddenDetails')){
						dojo.removeClass("details", 'hiddenDetails');
				}
				var titleWid = dijit.byId("title");
				titleWid.focus(true);
		};
			
 
		/**
	 	* deleteItem is called when an item's "-" button is clicked.
	 	* 			We will call remove on the StatefulModel to remove the item from the model and
	 	* 			add the class hiddenDetails so the details section will not be displayed 
		*
		* @param index
	 	* 			index is the index of the item in the itemsmodel for the selectedList.
	 	*/		
		deleteItem = function(index) {
				itemsmodel[selectedList].remove(index);
				dojo.addClass("details", 'hiddenDetails');
		}

		/**
	 	* insertNewItem is called when the "+" button is clicked for an item.
	 	* 			We will call getNewItem to setup the new item to add to the itemsmodel for the selectedList.
	 	* 			and add the class hiddenDetails so the details section will not be displayed. 
	 	*/		
 		insertNewItem = function() {
				var index = itemsmodel[selectedList].length || 0;
				var newItem = getNewItem(selectedList);
				itemsmodel[selectedList].add(index, newItem);
				setDetailsContext(index);
				//dojo.addClass("details", 'hiddenDetails');
		}
 
		/**
	 	* getNewItem is called by insertNewItem when the "+" button is clicked for an item or by
	 	* 			showItemsForList to setup an empty item in case the requests for the items fails. 
	 	* 
		* @param listid, firstItem
	 	* 			listid is the id of the selectedList.
	 	* 			firstItem is a boolean, if true this item will have to be setup as the first item in the list.
		*
	 	* @returns a StatefulModel with the new item
	 	*/		
 		getNewItem = function(listid, firstItem) {
				var data = {
							id: getNextItemId(),
							parentId: listid,
							title: "",
							notes: "",
							due: null,
							completionDate: null, // readonly
							// reminder can be a  day or location.
							reminder: null,  
							//repeat 0 - None, 1 - Every Day, 2- Every Week,
							//3- Every 2 Weeks, 4 - Every Month, 5 - Yearly
							repeat: 0,
							//priority 0 - None, 1- Low, 2- Medium, 3 - High
							priority: 0,
							hidden: false,
							completed: false,
							deleted: false
						};		
				if(firstItem){
					var xdata = [data];
 					var insert = mvc.newStatefulModel({ "data" : xdata})				
					return insert;
				}
				
 				var insert = mvc.newStatefulModel({ "data" : data})				
					return insert;
 		}
			
		/**
	 	* handleRadioChange is called when the selected list is changed
	 	* 			We should only process the change for the selected radio button.
	 	* 			We will set selectedList with the id of the selected list and call showItemsForList, 
	 	* 			and add the class hiddenDetails so the details section will not be displayed. 
	 	*/		
		handleRadioChange = function() {
				console.log('handleRadioChange value changed this.checked ='+this.checked+"  this.value="+this.value);
				if(this.checked){
				    radioChanging = true;
				    // set selected list to the id of the selected list.
				    selectedList = parseInt(listsmodel[parseInt(this.value)].id);
					showItemsForList(selectedList);
					dojo.addClass("details", 'hiddenDetails');
				}
		};

		/**
	 	* insertNewList is called when the "+" button is clicked for a list.
	 	* 			We will get a new list id for the list, create the StatefulModel for the list, 
	 	* 			and add it to the listsmodel.  Then we will set the selectedList and make the 
	 	* 			new list the selected one.
	 	* 			And add the class hiddenDetails so the details section will not be displayed. 
	 	*/		
		insertNewList = function() {
				    radioChanging = true;
					var	index = listsmodel.length;
					var newid = getNextListsId();
					var insert = mvc.newStatefulModel({ "data" : {
						title:"",
						id : newid,
						"itemsurl":	getItemsUrl(newid)					
					}});				
					listsmodel.add(index, insert);
					selectedList = index;
					//console.log('insertNewList selectedList set to ='+selectedList);
					var rad = dijit.byId("g1rb"+index);
					rad.set("checked", true);
				    radioChanging = false;
					dojo.addClass("details", 'hiddenDetails');
		};

		/**
	 	* deleteList is called when a lists's "-" button is clicked.
	 	* 			We will call remove on the StatefulModel to remove the list from the model and
	 	* 			adjust the selected radio button if necessary and 
	 	* 			add the class hiddenDetails so the details section will not be displayed 
		*
		* @param index
	 	* 			index is the index of the item in the itemsmodel for the selectedList.
	 	*/		
		deleteList = function(index) {
				//console.log('deleteList called with index ='+index);
				listsmodel.remove(index);
				if(index == selectedList){					
					selectRadio(0);
				}else if(index < selectedList){
				    selectRadio(selectedList-1);
				}else{
				    selectRadio(selectedList);
				}
				dojo.addClass("details", 'hiddenDetails');
		};			
 
		/**
	 	* readyToParse is called when an each initial item is loaded to see if all items are loaded
		*
	 	*/		
		readyToParse = function(index) {
			loadedItemListCount++;
			console.log("in readyToParse loadedItemListCount="+loadedItemListCount+" itemsToLoadCount="+itemsToLoadCount+" index = "+index);
			console.log(itemsToLoadCount == loadedItemListCount);
			if(itemsToLoadCount == loadedItemListCount){
				console.log("in readyToParse returning TRUE");
				return true;
			}
			return false;
		}

});
