PINF.bundle("", function(require) {
	require.memoize("/main.js", function (require, exports, module) {
       var pmodule = module;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.main = function (JSONREP, node) {

    return JSONREP.markupNode(node.settings || "Settings").then(function (settingsCode) {

        return JSONREP.makeRep({
            "config": {
                "settingsCode": settingsCode,
                "node": node
            },
            "code": function code(context) {
                return {
                    html: "<div></div>",
                    "on": {
                        "mount": function mount(el) {

                            //                        debugger;
                            riot.util.styleManager.add = function (cssText, name) {
                                //console.log("ADD", cssText, name);

                                if (window.document.createStyleSheet) {
                                    var sheet = window.document.createStyleSheet();
                                    sheet.cssText = cssText;
                                } else {
                                    var style = window.document.createElementNS ? window.document.createElementNS("http://www.w3.org/1999/xhtml", "style") : window.document.createElement("style");
                                    style.appendChild(window.document.createTextNode(cssText));
                                    var head = window.document.getElementsByTagName("head")[0] || window.document.documentElement;
                                    head.appendChild(style);
                                }
                            };
                            riot.util.styleManager.inject = function () {
                                //console.log("INJECT");
                            };

                            riot.tag('raw', '<div></div>', function (opts) {
                                this.set = function () {
                                    this.root.childNodes[0].innerHTML = opts.html;
                                };
                                this.on('update', this.set);
                                this.on('mount', this.set);
                            });

                            riot.tag2('tag_6a87135459b165291624b5f5a659a1fe32fc29fa', '<div class="manage-panel"> <h2>Settings for: {hostname}</h2> <raw html="{settingsCode}"></raw> <h2>FirePHP</h2> <p><i>FirePHP is <a target="_blank" href="https://github.com/firephp/firephp-for-firefox-devtools">Open Source with code on Github</a></i></p> <ul> <li><a target="_blank" href="https://github.com/firephp/firephp-for-firefox-devtools/issues">Report an Issue or Suggest a Feature</a></li> <li>Server Libraries: <ul> <li><b>FirePHPCore</b> - <a target="_blank" href="https://github.com/firephp/firephp-core">github.com/firephp/firephp-core</a></li> </ul> </li> </ul> </div>', 'tag_6a87135459b165291624b5f5a659a1fe32fc29fa DIV.manage-panel,[data-is="tag_6a87135459b165291624b5f5a659a1fe32fc29fa"] DIV.manage-panel{ padding: 10px; } tag_6a87135459b165291624b5f5a659a1fe32fc29fa DIV.manage-panel > P,[data-is="tag_6a87135459b165291624b5f5a659a1fe32fc29fa"] DIV.manage-panel > P{ padding-left: 10px; padding-right: 10px; } tag_6a87135459b165291624b5f5a659a1fe32fc29fa LI,[data-is="tag_6a87135459b165291624b5f5a659a1fe32fc29fa"] LI{ margin-top: 5px; }', '', function (opts) {

                                var tag = this;
                                var currentContext = null;

                                tag.hostname = "";
                                tag.settingsCode = opts.config.settingsCode;

                                tag.on("mount", tag.update);

                                tag.on("updated", function () {
                                    setTimeout(function () {
                                        JSONREP.mountElement(tag.root);
                                    }, 0);
                                });

                                if (typeof browser !== "undefined") {
                                    browser.runtime.onMessage.addListener(function (message) {

                                        if (message.context && message.context.tabId != browser.devtools.inspectedWindow.tabId) {
                                            return;
                                        }

                                        if (message.to === "message-listener") {
                                            if (message.event === "currentContext") {

                                                currentContext = message.context;
                                                if (currentContext) {
                                                    tag.hostname = currentContext.hostname;
                                                } else {
                                                    tag.hostname = "";
                                                }
                                                tag.update();
                                            }
                                        }
                                    });
                                }
                            });

                            riot.mount(el, 'tag_6a87135459b165291624b5f5a659a1fe32fc29fa', context);
                        }
                    }
                };
            }
        });
    });
};

},{}]},{},[1])(1)
});
	});
});