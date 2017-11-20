PINF.bundle("", function(require) {
	require.memoize("/main.js", function (require, exports, module) {
       var pmodule = module;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.main = function (JSONREP, node) {

    var api = {
        currentContext: null
    };

    browser.runtime.onMessage.addListener(function (message) {

        if (message.to === "message-listener") {
            if (message.event === "currentContext") {
                api.currentContext = message.context;
            }
        }

        if (api.onMessage) {
            api.onMessage(message);
        }
    });

    return JSONREP.makeRep({
        "config": {
            "node": node,
            "api": api
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

                        riot.tag2('tag_1fb635e14ec312df82c1e65631870cdad906f7db', '<div> <ul class="settings"> <li><input type="checkbox" name="enableUserAgentHeader" onchange="{syncCheckbox}"> Enable UserAgent Header</li> <li><input type="checkbox" name="enableFirePHPHeader" onchange="{syncCheckbox}"> Enable FirePHP Header</li> </ul> </div>', 'tag_1fb635e14ec312df82c1e65631870cdad906f7db DIV > H2,[data-is="tag_1fb635e14ec312df82c1e65631870cdad906f7db"] DIV > H2{ padding-left: 10px; padding-right: 10px; } tag_1fb635e14ec312df82c1e65631870cdad906f7db DIV > UL.settings,[data-is="tag_1fb635e14ec312df82c1e65631870cdad906f7db"] DIV > UL.settings{ padding-left: 10px; padding-right: 10px; list-style-type: none; } tag_1fb635e14ec312df82c1e65631870cdad906f7db DIV > UL.settings > LI,[data-is="tag_1fb635e14ec312df82c1e65631870cdad906f7db"] DIV > UL.settings > LI{ white-space: nowrap; }', '', function (opts) {

                            var tag = this;

                            tag.hostname = opts.config.api.currentContext && opts.config.api.currentContext.hostname || "";

                            function getSettingForHostname(hostname, name) {
                                var key = "domain[" + hostname + "]." + name;
                                return browser.storage.local.get(key).then(function (value) {
                                    return value[key] || false;
                                });
                            }
                            function setSettingForHostname(hostname, name, value) {
                                var obj = {};
                                obj["domain[" + hostname + "]." + name] = value;
                                return browser.storage.local.set(obj).then(function () {
                                    browser.runtime.sendMessage({
                                        to: "broadcast",
                                        event: "currentContext"
                                    });
                                    return null;
                                });
                            }

                            opts.config.api.onMessage = function (message) {

                                if (message.context && message.context.tabId != browser.devtools.inspectedWindow.tabId) {
                                    return;
                                }

                                if (message.to === "message-listener") {
                                    if (message.event === "currentContext" && message.context) {
                                        tag.hostname = message.context.hostname;
                                        tag.update();
                                    }
                                }
                            };

                            tag.on("mount", tag.update);
                            tag.on("updated", function () {

                                $('INPUT[type="checkbox"]', tag.root).each(function () {
                                    var el = $(this);
                                    var name = el.attr("name");
                                    getSettingForHostname(tag.hostname, name).then(function (enabled) {
                                        el.get(0).checked = enabled;
                                        return null;
                                    }).catch(function (err) {
                                        console.error(err);
                                    });
                                });
                            });

                            tag.syncCheckbox = function (event) {

                                var name = event.target.getAttribute("name");
                                return setSettingForHostname(tag.hostname, name, event.target.checked).then(function () {
                                    tag.update();
                                    return null;
                                }).catch(function (err) {
                                    throw err;
                                });
                            };
                        });

                        riot.mount(el, 'tag_1fb635e14ec312df82c1e65631870cdad906f7db', context);
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