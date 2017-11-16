PINF.bundle("", function(require) {
	require.memoize("/main.js", function (require, exports, module) {
       var pmodule = module;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var BROWSER = browser;
var WINDOW = window;

exports.main = function (JSONREP, node) {

    return JSONREP.markupNode(node).then(function (code) {

        return JSONREP.makeRep('<div class="console">' + code + '</div>', {
            css: {
                ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
                "_code": "\\n:scope.console {\\n    overflow-x: hidden;\\n    overflow-y: auto;\\n    border-right: 1px solid #dcdcdc;\\n    height: 100vh;\\n}                  \\n",
                "_format": "css",
                "_args": [],
                "_compiled": false
            },
            on: {
                mount: function mount(el) {

                    var consoles = {};
                    var lastRequestConsole = null;
                    var persistentConsole = null;

                    var persistLogs = false;
                    BROWSER.storage.onChanged.addListener(function (changes, area) {
                        if (changes["persist-on-navigate"]) {
                            persistLogs = changes["persist-on-navigate"].newValue;
                            if (persistLogs && !persistentConsole) {
                                persistentConsole = lastRequestConsole;
                            } else if (!persistLogs && persistentConsole) {
                                persistentConsole = null;
                            }
                        }
                    });
                    BROWSER.storage.local.get("persist-on-navigate").then(function (value) {
                        persistLogs = value["persist-on-navigate"];
                    });

                    function makeKeyForContext(context) {
                        //if (
                        //    typeof context.requestType === "undefined" ||
                        //    context.requestType === "main_frame"
                        //) {
                        //    return context.tabId + ":" + context.url;
                        //} else {
                        return context.tabId + ":" + (context.topUrl || context.url);
                        //}
                    }

                    function getConsoleForContext(context) {
                        if (persistentConsole) {
                            return persistentConsole;
                        }
                        var key = makeKeyForContext(context);
                        if (!consoles[key]) {
                            consoles[key] = WINDOW.FC.consoleForId(key);
                        }
                        return consoles[key];
                    }

                    var isScrolledToBottom = false;
                    function syncScrolledToBottom() {
                        if (el.scrollTop === el.scrollHeight - el.offsetHeight) {
                            isScrolledToBottom = true;
                        } else {
                            isScrolledToBottom = false;
                        }
                    }
                    el.onscroll = syncScrolledToBottom;
                    function scrollIfBottom() {
                        if (isScrolledToBottom) {
                            el.scrollTop = el.scrollHeight;
                        }
                        syncScrolledToBottom();
                    }

                    var lastConsoleId = null;

                    BROWSER.runtime.onMessage.addListener(function (message) {

                        if (message.context && message.context.tabId != BROWSER.devtools.inspectedWindow.tabId) {
                            return;
                        }

                        if (message.to === "message-listener") {

                            if (message.response) {

                                lastRequestConsole = getConsoleForContext(message.context);
                                if (persistLogs) {
                                    if (!persistentConsole) {
                                        persistentConsole = lastRequestConsole;
                                    }
                                } else {
                                    if (message.context.requestType === "main_frame") {
                                        lastRequestConsole.getAPI().clear();
                                    }
                                }

                                var panelEl = lastRequestConsole.getPanelEl();

                                var el = WINDOW.document.createElement('div');
                                el.setAttribute("class", "request");
                                el.setAttribute("style", ['padding: 3px', 'padding-left: 10px', 'padding-right: 10px', 'color: #FFFFFF', 'background-color: #0000FF', 'border: 1px solid black'].join(";"));
                                el.innerHTML = message.context.url;

                                panelEl.appendChild(el);
                                scrollIfBottom();
                            } else if (message.message) {
                                message.message.context = message.context;

                                getConsoleForContext(message.context).getAPI().log(message.message);
                                scrollIfBottom();
                            } else if (message.event === "clear") {

                                Object.keys(consoles).forEach(function (id) {

                                    if (consoles[id].isShowing()) {
                                        consoles[id].getAPI().clear();
                                    }
                                });
                                scrollIfBottom();
                            } else if (message.event === "currentContext" && message.context) {
                                if (persistentConsole) {
                                    return;
                                }
                                var key = makeKeyForContext(message.context);
                                Object.keys(consoles).forEach(function (id) {
                                    if (persistLogs && id.split(":")[0] == message.context.tabId || id === key) {
                                        lastConsoleId = id;
                                        consoles[id].show();
                                    } else {
                                        consoles[id].hide();
                                    }
                                });
                            } else if (message.event === "destroyContext") {

                                Object.keys(consoles).forEach(function (id) {
                                    if (id.split(":")[0] == message.context.tabId) {
                                        WINDOW.FC.destroyConsoleForId(id);
                                        delete consoles[id];
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });
};

},{}]},{},[1])(1)
});
	});
});