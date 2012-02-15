define(["dojo/_base/Deferred", "dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/connect", "dojo/hash"], function(deferred, lang, declare, listen, connect){
    // module:
    //		dojox/app/module/history
    // summary:
    //		Do history management of dojox.app applicatoin.
    //		Include history back, forward, go in an application life cycle.
	  //
    //		_historyStack: the application history stack, use to maintain application life cycle history list.
    //		_historyLen: the current history length, if window.history.length > _historyLen, we need add the current url to the history stack.
    //		_histroyDiff: the diff of application history list and window.history list.
    //		_current: current hash.
    //		_next: the next hash of the current hash, use to check 'forward' operation
    //		_previous: the pervious hash of the current hash, use to check 'back' operation
    //		_index: the index of current hash in history stack, use to check 'go' operation
	  //		_addToHistoryStack: indicate current hash add to history stack or not

    return declare(null, {
        _historyStack: [],
        _historyLen: 0,
        _histroyDiff: 0,
        _current: null,
        _next: null,
        _previous: null,
        _index: 0,
        _oldHistoryLen: 0,
        _newHistoryLen: 0,
        _addToHistoryStack: false,

        postCreate: function(params, node){
            this._historyLen = window.history.length;
            this.inherited(arguments);
            var currentHash = window.location.hash;
            this._startView = ((currentHash && currentHash.charAt(0) == "#") ? currentHash.substr(1) : currentHash) || this.defaultView;

            listen(this.domNode, "startTransition", lang.hitch(this, "onStartTransition"));

            connect.subscribe("/dojo/hashchange", lang.hitch(this, function(newhash){
                this._onHashChange(newhash);
            }));
        },

		    _addHistory: function(hash){
			      //	summary:
            //		Add hash to application history stack, update history management flags.
			      //
            //	hash:
            //		new hash should be added to _historyStack.
			      this._historyStack.push({
                'hash': hash,
                'url': window.location.href,
                'detail': null
            });

            this._historyLen = window.history.length;
            this._index = this._historyStack.length - 1;

            this._previous = this._current;
            this._current = hash;
            this._next = null;

            this._historyDiff = window.history.length - this._historyStack.length;

			      // In order to make sure _addToHistoryStack flag invalid after add hash to history stack,
			      // we set this flag to false in every addHistory operation even if it's already false.
            this._addToHistoryStack = false;
		    },

        _onHashChange: function(currentHash){
            //	summary:
            //		subscribe /dojo/hashchange and do add history, back, forward and go operation.
            //
            //	currentHash:
            //		the new url hash when /dojo/hashchange is triggered.

            if(this._index<0 || this._index>(window.history.length-1)){
              throw Error("Application history out of management.");
            }

            this._newHistoryLen = window.history.length;

            // Application history stack asynchronized with window.history, refresh application history stack.
            if (this._oldHistoryLen > this._newHistoryLen) {
                //console.log("need to refresh _historyStack, oldLen:"+this._oldHistoryLen+", newLen: "+this._newHistoryLen+", diff:"+this._historyDiff);
                this._historyStack.splice((this._newHistoryLen - this._historyDiff - 1), (this._historyStack.length - 1));

				        // Reset _historyLen to make sure this._historyLen<window.history.length, so it will push this hash to history stack.
                this._historyLen = this._historyStack.length;

				       // Reset this._oldHistoryLen, so it can avoid refresh history stack again in some stituation,
				       // because by doing this, this._oldHistoryLen !== this._newHistoryLen
				       this._oldHistoryLen = 0;
            }

			      // this._oldHistoryLen === this._newHistoryLen, it maybe need to refresh history stack or do history go, back and forward,
            // so we use _addToHistoryStack to indentify the refresh operation.
            if (this._addToHistoryStack && (this._oldHistoryLen === this._newHistoryLen)) {
				        this._historyStack.splice((this._newHistoryLen - this._historyDiff - 1), (this._historyStack.length - 1));

                this._addHistory(currentHash);

                this.transition(currentHash, null);

                // It's a refresh operation, so that's no need to check history go, back or forward, just return.
                return;
            }

            //window.history.length increase, add hash to application history stack.
            if (this._historyLen < window.history.length) {
                this._addHistory(currentHash);
                this.transition(currentHash, null);
            }
            else {
                if (currentHash == this._current) {
                    console.log("do nothing.");
                }
                else if (currentHash === this._previous) { // back
                    this._back(currentHash, this._historyStack[this._index]['detail']);
                }
                else if (currentHash === this._next) { //forward
                    this._forward(currentHash, this._historyStack[this._index]['detail']);
                }
                else { // go
                    //search in 'back' first, then 'forward'
                    var index = -1;
                    for (var i = this._index; i > 0; i--) {
                        if (currentHash === this._historyStack[i]['hash']) {
                            index = i;
                            break;
                        }
                    }

                    //search in 'forward'
                    if (-1 === index) {
                      for (var i = this._index; i < this._historyStack.length; i++) {
                        if (currentHash === this._historyStack[i]['hash']) {
                          index = i;
                          break;
                        }
                      }
                    }

                    if (0 < index < this._historyStack.length) {
                        this._go(index, (index - this._index));
                    }
                    else {
                        console.log("go error. index out of history stack.");
                    }
                }
            }
        },

        _back: function(currentHash, detail){
            console.log("back");
            this._next = this._historyStack[this._index]['hash'];
            this._index--;
            if (this._index > 0) {
                this._previous = this._historyStack[this._index - 1]['hash'];
            }
            else {
                this._previous = null;
            }
            this._current = currentHash;

            // TODO: publish back event, separate histroy event and transition
            // connect.publish("app/history/back", [{'target':currentHash, 'detail':detail}]);
            this.transition(currentHash, lang.mixin({
                reverse: true
            }, detail));
        },

        _forward: function(currentHash, detail){
            console.log("forward");
            this._previous = this._historyStack[this._index]['hash'];
            this._index++;
            if (this._index < this._historyStack.length - 1) {
                this._next = this._historyStack[this._index + 1]['hash'];
            }
            else {
                this._next = null;
            }
            this._current = currentHash;

            // TODO: publish forward event, separate histroy event and transition
            // connect.publish("app/history/forward", [{'target':currentHash, 'detail':detail}]);
            this.transition(currentHash, lang.mixin({
                reverse: false
            }, detail));
        },

        _go: function(index, step){
			      if(index<0 || (index>window.history.length-1)){
				      throw Error("Application history.go steps out of management.");
			      }

            this._index = index;
            this._current = this._historyStack[index]['hash'];
            this._previous = this._historyStack[index - 1] ? this._historyStack[index - 1]['hash'] : null;
            this._next = this._historyStack[index + 1] ? this._historyStack[index + 1]['hash'] : null;

            // TODO: publish go event, separate histroy event and transition
            // connect.publish("app/history/go", [{'target':this._current, 'step':step, 'detail':this._historyStack[index]['detail']}]);

            var param;
            if (step > 0) {
                param = lang.mixin({
                    reverse: true
                }, this._historyStack[index]['detail']);
            }
            else {
                param = lang.mixin({
                    reverse: false
                }, this._historyStack[index]['detail']);
            }
            this.transition(this._current, param);
        },

        startup: function(){
            this.inherited(arguments);
            // push the default page to the history stack
            var currentHash = window.location.hash;
            if (currentHash && (currentHash.length > 1)) {
                currentHash = currentHash.substr(1);
            }
            this._historyStack.push({
                'hash': currentHash,
                'url': window.location.href,
                'detail': null
            });
            this._historyLen = window.history.length;
            this._index = this._historyStack.length - 1;
            this._current = currentHash;

            // get the diff of window.history and application history
            this._historyDiff = window.history.length - this._historyStack.length;
        },

        onStartTransition: function(evt){
            if (evt.preventDefault) {
                evt.preventDefault();
            }

            //fix href bug
            var target = evt.detail.target;
            var regex = /#(.+)/;
            if (!target && regex.test(evt.detail.href)) {
                target = evt.detail.href.match(regex)[1];
            }

            //prevent event from bubbling to window and being
            //processed by dojox/mobile/ViewController
            evt.cancelBubble = true;
            if (evt.stopPropagation) {
                evt.stopPropagation();
            }

            var currentHash = evt.detail.url || '#' + target;

            this._oldHistoryLen = window.history.length;
            // pushState on iOS will not change location bar hash because of security.
            // window.history.pushState(evt.detail, title, currentHash);

            // history.length will be changed by set location hash
            // change url hash, to workaround iOS pushState not change address bar issue.
            window.location.hash = currentHash;

            // The operation above will trigger hashchange.
			      // Use _addToHistoryStack flag to indicate the _onHashChange method should add this hash to history stack.
			      // When add hash to history stack, this flag should be set to false, we do this in _addHistory.
            this._addToHistoryStack = true;
        }
    });
});
