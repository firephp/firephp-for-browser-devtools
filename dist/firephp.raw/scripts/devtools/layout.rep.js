PINF.bundle("", function(require) {
	require.memoize("/main.js", function (require, exports, module) {
       var pmodule = module;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var WINDOW = window;

/*
// TODO: This should not be needed once `inspector` issue is fixed.
// @see https://github.com/firephp/firephp-for-firefox-devtools/issues/26

// Ensure UI shows up within first 2 seconds. If not reload the page.
setTimeout(function () {

    var el = WINDOW.document.querySelector(".layout-views");
    if (!el) {
        console.log("WARNING: Reloading UI as '.layout-views' not found after 2 seconds.");
        window.location.reload();
    }
}, 2000);
*/

exports.main = function (JSONREP, node) {

    var panels = {};

    return Promise.all(Object.keys(node).map(function (name) {

        if (typeof node[name] === "string") {
            panels[name] = node[name];
            return null;
        }

        return Promise.all(Object.keys(node[name]).map(function (key) {
            var panelNode = {};
            panelNode[key] = node[name][key];
            return JSONREP.markupNode(panelNode).then(function (code) {
                panels[name] = code;
                return null;
            });
        }));
    })).then(function () {

        return JSONREP.makeRep({
            variables: {
                panels: panels
            },
            html: { ".@": "github.com~0ink~codeblock/codeblock:Codeblock", "_code": "<div class=\"layout-views\">\\n    <div class=\"ui\" style=\"display: none;\">\\n        <table class=\"layout\" height=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\\n            <tr>\\n                <td class=\"console-panel\" width=\"100%\" height=\"100%\" rowspan=\"2\">\\n                    %%%variables.panels.console%%%\\n                </td>\\n            </tr>\\n            <tr>\\n                <td class=\"side-panel\">\\n                    <table class=\"layout\" height=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\\n                        <tr>\\n                            <td class=\"menu-panel\">\\n                                %%%variables.panels.menu%%%\\n                            </td>\\n                        </tr>\\n                        <tr>\\n                            <td class=\"settings-panel\">\\n                                %%%variables.panels.settings%%%\\n                            </td>\\n                        </tr>\\n                        <tr>\\n                            <td class=\"inspector-panel\" height=\"100%\">\\n                                %%%variables.panels.inspector%%%\\n                            </td>\\n                        </tr>\\n                    </table>\\n                </td>\\n            </tr>\\n        </table>\\n    </div>\\n    <div class=\"manage\">\\n        <button class=\"close-button\">Close</button>\\n        %%%variables.panels.manage%%%\\n    </div>\\n    <div class=\"uninitialized\">\\n        <p><button action=\"reload\">Reload</button> to initialize FirePHP</p>\\n    </div>\\n</div>", "_format": "html", "_args": ["variables"], "_compiled": false },
            css: { ".@": "github.com~0ink~codeblock/codeblock:Codeblock", "_code": "\\nBODY {\\n    background-color: #ffffff;\\n    overflow: hidden;\\n}\\n\\n:scope.layout-views {\\n    height: 100%;\\n}\\n\\n:scope.layout-views,\\n:scope.layout-views TABLE {\\n    font-family: Lucida Grande, Tahoma, sans-serif;\\n    font-size: 11px;\\n}\\n\\n:scope .layout TD {\\n    vertical-align: top;\\n}\\n\\n:scope .layout TD.menu-panel {\\n    border-bottom: 1px solid #dcdcdc;\\n}\\n\\n:scope .layout TD.settings-panel {\\n    border-bottom: 1px solid #dcdcdc;\\n}\\n\\n:scope .layout TD.inspector-panel {\\n    min-width: 200px;\\n    overflow: auto;\\n}\\n\\n:scope .manage {\\n    height: 100%;\\n    padding: 20px;\\n}\\n\\n:scope .manage > .close-button {\\n    display: none;\\n    cursor: pointer;\\n}\\n\\n:scope .uninitialized {\\n    text-align: center;\\n    padding-top: 50px;\\n    height: 100%;\\n}\\n:scope .uninitialized > P {\\n    font-weight: bold;\\n    font-size: 16px;\\n    color: #dcdcdc;\\n}\\n:scope .uninitialized BUTTON {\\n    font-size: 16px;\\n    color: #dcdcdc;\\n    cursor: pointer;\\n}\\n", "_format": "css", "_args": [], "_compiled": false },
            on: {
                mount: function mount(el) {

                    var currentContext = null;
                    var forceManage = false;

                    var persistLogs = false;
                    browser.storage.onChanged.addListener(function (changes, area) {
                        if (changes["persist-on-navigate"]) {
                            persistLogs = changes["persist-on-navigate"].newValue;
                        }
                    });
                    browser.storage.local.get("persist-on-navigate").then(function (value) {
                        persistLogs = value["persist-on-navigate"];
                    });

                    function getSettingForHostname(hostname, name) {
                        var key = "domain[" + hostname + "]." + name;
                        return browser.storage.local.get(key).then(function (value) {
                            return value[key] || false;
                        });
                    }

                    function isEnabledForHostname(hostname) {
                        return getSettingForHostname(hostname, "enableUserAgentHeader").then(function (enableUserAgentHeader) {
                            return getSettingForHostname(hostname, "enableFirePHPHeader").then(function (enableFirePHPHeader) {
                                return enableUserAgentHeader || enableFirePHPHeader;
                            });
                        });
                    }

                    function sync() {

                        if (currentContext) {

                            isEnabledForHostname(currentContext.hostname).then(function (enabled) {

                                if (forceManage) {
                                    el.querySelector("DIV.manage").style.display = "block";

                                    if (enabled) {
                                        el.querySelector("DIV.manage > BUTTON.close-button").style.display = "inline-block";
                                    } else {
                                        el.querySelector("DIV.manage > BUTTON.close-button").style.display = "none";
                                    }
                                    el.querySelector("DIV.uninitialized").style.display = "none";
                                    el.querySelector("DIV.ui").style.display = "none";
                                } else {
                                    el.querySelector("DIV.manage > BUTTON.close-button").style.display = "none";

                                    if (enabled || persistLogs) {
                                        el.querySelector("DIV.manage").style.display = "none";
                                        el.querySelector("DIV.uninitialized").style.display = "none";
                                        el.querySelector("DIV.ui").style.display = "block";
                                    } else {
                                        el.querySelector("DIV.manage").style.display = "block";
                                        el.querySelector("DIV.uninitialized").style.display = "none";
                                        el.querySelector("DIV.ui").style.display = "none";
                                    }
                                    return null;
                                }
                            }).catch(function (err) {
                                console.error(err);
                            });
                        } else {
                            el.querySelector("DIV.ui").style.display = "none";
                            el.querySelector("DIV.manage").style.display = "none";
                            el.querySelector("DIV.uninitialized").style.display = "block";
                        }
                    }

                    el.querySelector("DIV.manage > BUTTON.close-button").addEventListener("click", function () {
                        forceManage = false;
                        sync();
                    }, false);

                    el.querySelector('BUTTON[action="reload"]').addEventListener("click", function () {
                        browser.runtime.sendMessage({
                            to: "background",
                            event: "reload",
                            context: {
                                tabId: browser.devtools.inspectedWindow.tabId
                            }
                        });
                    }, false);

                    if (typeof browser !== "undefined") {

                        browser.runtime.onMessage.addListener(function (message) {

                            if (message.context && message.context.tabId != browser.devtools.inspectedWindow.tabId) {
                                return;
                            }

                            if (message.to === "message-listener") {
                                if (message.event === "currentContext") {
                                    currentContext = message.context;
                                    sync();
                                } else if (message.event === "manage") {
                                    forceManage = true;
                                    sync();
                                }
                            }
                        });

                        sync();
                    } else {
                        el.querySelector("DIV.uninitialized").style.display = "none";
                        el.querySelector("DIV.manage").style.display = "none";
                        el.querySelector("DIV.ui").style.display = "block";
                    }
                }
            }
        });
    });
};

},{}]},{},[1])(1)
});
	});
});