PINF.bundle("", function(require) {
	require.memoize("/main.js", function (require, exports, module) {
       var pmodule = module;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.main = function (JSONREP, node) {

    return JSONREP.makeRep({
        "config": {
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

                        riot.tag2('tag_71d8ccfd7f4532f1b4d88f8f00c527eb65b88ad2', '<div class="menu"> <button onclick="{triggerClear}">Clear</button> &nbsp; <button onclick="{triggerManage}">Manage</button> &nbsp; <input type="checkbox" name="settings.persist-on-navigate" onchange="{notifyPersistChange}">Persist </div>', 'tag_71d8ccfd7f4532f1b4d88f8f00c527eb65b88ad2 .menu,[data-is="tag_71d8ccfd7f4532f1b4d88f8f00c527eb65b88ad2"] .menu{ padding: 5px; padding-left: 10px; padding-right: 10px; white-space: nowrap; } tag_71d8ccfd7f4532f1b4d88f8f00c527eb65b88ad2 .menu > BUTTON,[data-is="tag_71d8ccfd7f4532f1b4d88f8f00c527eb65b88ad2"] .menu > BUTTON{ cursor: pointer; width: auto; }', '', function (opts) {

                            var tag = this;

                            tag.triggerClear = function (event) {

                                browser.runtime.sendMessage({
                                    to: "broadcast",
                                    event: "clear",
                                    context: {
                                        tabId: browser.devtools.inspectedWindow.tabId
                                    }
                                });
                            };

                            tag.triggerManage = function (event) {

                                browser.runtime.sendMessage({
                                    to: "broadcast",
                                    event: "manage",
                                    context: {
                                        tabId: browser.devtools.inspectedWindow.tabId
                                    }
                                });
                            };

                            tag.notifyPersistChange = function (event) {

                                browser.storage.local.set({
                                    "persist-on-navigate": event.target.checked
                                });
                            };

                            tag.on("mount", function () {

                                browser.storage.local.get("persist-on-navigate").then(function (value) {
                                    tag.root.querySelector('[name="settings.persist-on-navigate"]').checked = value["persist-on-navigate"] || false;
                                });
                            });
                        });

                        riot.mount(el, 'tag_71d8ccfd7f4532f1b4d88f8f00c527eb65b88ad2', context);
                    }
                }
            };
        }
    });
};
},{}]},{},[1])(1)
});
	});
});