PINF.bundle("", function(require) {
	require.memoize("/main.js", function (require, exports, module) {
       var pmodule = module;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.main = function (JSONREP, node) {

    return JSONREP.makeRep('<div class="inspector">' + '<div class="close" style="display: none;">x</div>' + '<div class="viewer"></div>' + '</div>', {
        css: {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\n:scope.inspector {\\n    padding: 10px;\\n}\\n\\n:scope.inspector > .close {\\n    border: 1px solid #dcdcdc;\\n    font-weight: bold;\\n    float: right;\\n    cursor: pointer;\\n    padding: 2px;\\n    line-height: 10px;\\n}\\n\\n:scope.inspector > .viewer {\\n    height: 100%;\\n}                    \\n",
            "_format": "css",
            "_args": [],
            "_compiled": false
        },
        on: {
            mount: function mount(el) {

                var currentContext = null;

                function makeKeyForContext(context) {
                    return context.tabId + ":" + (context.url || "");
                }

                function getPanel() {
                    var key = makeKeyForContext(currentContext);
                    var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');
                    if (!panelEl) {
                        panelEl = window.document.createElement('div');
                        panelEl.setAttribute("context", key);
                        panelEl.style.display = "none";
                        el.querySelector('.viewer').appendChild(panelEl);
                    }
                    return panelEl;
                }

                function hidePanel() {
                    if (!currentContext) {
                        return;
                    }
                    var key = makeKeyForContext(currentContext);
                    var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');
                    if (!panelEl) {
                        return;
                    }
                    panelEl.style.display = "none";
                    el.querySelector(".close").style.display = "none";
                }

                function showPanel() {
                    if (!currentContext) {
                        return;
                    }
                    var key = makeKeyForContext(currentContext);
                    var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');
                    if (!panelEl) {
                        return;
                    }
                    panelEl.style.display = "";
                    el.querySelector(".close").style.display = "inline-block";
                }

                function destroyPanel() {
                    if (!currentContext) {
                        return;
                    }
                    var key = makeKeyForContext(currentContext);
                    var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');
                    if (!panelEl) {
                        return;
                    }
                    panelEl.parentNode.removeChild(panelEl);
                    currentContext = null;
                    el.querySelector(".close").style.display = "none";
                }

                window.FC.on("inspectMessage", function (info) {

                    hidePanel();

                    currentContext = info.message.context;

                    //console.log("INSPECT MESSAGE!!", info.message);

                    window.FC.renderMessageInto(getPanel(), info.message);

                    showPanel();
                });

                window.FC.on("inspectNode", function (info) {

                    hidePanel();

                    currentContext = info.message.context;

                    currentContext = {
                        tabId: browser.devtools.inspectedWindow.tabId
                    };

                    window.FC.renderMessageInto(getPanel(), info.message);

                    showPanel();
                });

                window.FC.on("inspectFile", function (info) {

                    console.log("EVENT:inspectFile", info);
                });

                el.querySelector(".close").addEventListener("click", destroyPanel, false);

                browser.runtime.onMessage.addListener(function (message) {

                    if (message.context && message.context.tabId != browser.devtools.inspectedWindow.tabId) {
                        return;
                    }

                    if (message.to === "message-listener") {

                        if (message.event === "currentContext") {

                            //console.log("CONTEXT IN INSPECTOR", message.context, currentContext);

                            hidePanel();
                            currentContext = message.context;
                            showPanel();
                        } else if (message.event === "destroyContext") {

                            if (currentContext && currentContext.tabId == message.context.tabId) {
                                destroyPanel();
                            }
                        } else if (message.event === "clear") {
                            destroyPanel();
                        }
                    }
                });
            }
        }
    });
};
},{}]},{},[1])(1)
});
	});
});