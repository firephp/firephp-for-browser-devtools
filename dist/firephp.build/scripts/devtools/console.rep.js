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

var BROWSER = typeof browser !== "undefined" && browser || null;
var WINDOW = window;

exports.main = function (JSONREP, node, options) {
  return JSONREP.markupNode(node).then(function (code) {
    return JSONREP.makeRep('<div class="console">' + code + '</div>', {
      css: {
        ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
        "_code": "{\"_cssid\":\"e5171781037a60512c4733a9fb53edce2af9480d\",\"repUri\":\"console\"}",
        "_format": "json",
        "_args": [],
        "_compiled": false
      },
      on: {
        mount: function mount(el) {
          var consoles = {};
          var lastRequestConsole = null;
          var persistentConsole = null;
          var persistLogs = false;

          if (BROWSER) {
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
          }

          function makeKeyForContext(context) {
            return context.tabId + ":combined";
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

          if (BROWSER) {
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
      }
    }, options);
  });
};
},{}]},{},[1])(1)
});

	});
});