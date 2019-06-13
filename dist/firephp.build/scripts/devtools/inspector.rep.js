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
  return JSONREP.makeRep('<div class="inspector">' + '<div class="close" style="display: none;">x</div>' + '<div class="viewer"></div>' + '</div>', {
    css: {
      ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
      "_code": "{\"_cssid\":\"177d174506dd0feeeb17fdd6e3d4d23ab97a8a36\",\"repUri\":\"inspector\"}",
      "_format": "json",
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
          if (!currentContext) {
            return;
          }

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
          el.querySelector(".close").style.display = "none";
        }

        window.FC.on("inspectMessage", function (info) {
          hidePanel();

          if (info.message.context) {
            currentContext = info.message.context;
          }

          var panel = getPanel();
          if (!panel) return;
          delete info.message.meta.wrapper;
          window.FC.renderMessageInto(panel, info.message);
          showPanel();
        });
        window.FC.on("inspectNode", function (info) {
          hidePanel();

          if (info.message.context) {
            currentContext = info.message.context;
          }

          currentContext = {
            tabId: browser.devtools.inspectedWindow.tabId
          };
          var panel = getPanel();
          if (!panel) return;
          window.FC.renderMessageInto(panel, info.message);
          showPanel();
        });
        window.FC.on("inspectFile", function (info) {
          var panel = getPanel();
          if (!panel) return;
          window.FC.renderMessageInto(panel, {
            type: "string",
            value: "Viewing of files is not yet implemented."
          });
        });
        el.querySelector(".close").addEventListener("click", destroyPanel, false);
        browser.runtime.onMessage.addListener(function (message) {
          if (message.context && message.context.tabId != browser.devtools.inspectedWindow.tabId) {
            return;
          }

          if (message.to === "message-listener") {
            if (message.event === "currentContext") {
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
  }, options);
};
},{}]},{},[1])(1)
});

	});
});