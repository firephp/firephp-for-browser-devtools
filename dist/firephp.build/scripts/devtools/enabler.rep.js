PINF.bundle("", function(__require) {
	__require.memoize("/main.js", function (_require, _exports, _module) {
var bundle = { require: _require, exports: _exports, module: _module };
var exports = undefined;
var module = undefined;
var define = function (deps, init) {
_module.exports = init();
}; define.amd = true;
       var pmodule = bundle.module;

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

exports.main = function (JSONREP, node, options) {
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
  return JSONREP.makeRep2({
    "config": {
      "node": node,
      "api": api
    },
    "code": function code(context, options) {
      var JSONREP = this;
      return {
        html: "<div></div>",
        "on": {
          "mount": function mount(el) {
            riot.util.styleManager.add = function (cssText, name) {
              if (!cssText) {
                return;
              }

              console.log("[jsonrep][riot] Inject cssText:", cssText);

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
              if (!options) return;
              JSONREP.loadStyle(options.renderer.uri + '.css');
            };

            riot.tag('raw', '<div></div>', function (opts) {
              this.set = function () {
                this.root.childNodes[0].innerHTML = opts.html;
              };

              this.on('update', this.set);
              this.on('mount', this.set);
            });
            riot.tag2('tag_02a6a2136deba9898635896f9848626246464820', '<div> <button if="{!enabled}" onclick="{triggerEnable}" class="enable">Enable</button> <button if="{enabled}" onclick="{triggerDisable}" class="disable">Disable</button> </div>', '', '', function (opts) {
              var tag = this;
              tag.enabled = false;

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
                    getSettingForHostname(opts.config.api.currentContext.hostname, "enabled").then(function (enabled) {
                      tag.enabled = enabled;
                      tag.update();
                      return null;
                    }).catch(function (err) {
                      console.error(err);
                    });
                  }
                }
              };

              tag.on("mount", tag.update);

              tag.triggerEnable = function (event) {
                return setSettingForHostname(opts.config.api.currentContext.hostname, "enabled", true).then(function () {
                  tag.update();
                  browser.runtime.sendMessage({
                    to: "background",
                    event: "reload",
                    context: {
                      tabId: browser.devtools.inspectedWindow.tabId
                    }
                  });
                  return null;
                }).catch(function (err) {
                  console.error(err);
                });
              };

              tag.triggerDisable = function (event) {
                return setSettingForHostname(opts.config.api.currentContext.hostname, "enabled", false).then(function () {
                  tag.update();
                  return null;
                }).catch(function (err) {
                  console.error(err);
                });
              };
            });
            riot.mount(el, 'tag_02a6a2136deba9898635896f9848626246464820', context);
          }
        }
      };
    }
  }, options);
};
},{}]},{},[1])(1)
});

	});
});