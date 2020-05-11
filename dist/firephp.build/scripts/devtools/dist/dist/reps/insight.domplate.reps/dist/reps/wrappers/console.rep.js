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


function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function impl(domplate) {
  var _ref;

  var T = domplate.tags;
  return _ref = {
    CONST_Short: "shortTag",
    tag: T.DIV({
      "class": "$node|_getMessageClass",
      "_messageObject": "$node",
      "_contextObject": "$context",
      "onmouseover": "$onMouseOver",
      "onmousemove": "$onMouseMove",
      "onmouseout": "$onMouseOut",
      "onclick": "$onClick",
      "expandable": "$node|_isExpandable",
      "expanded": "false",
      "_templateObject": "$node|_getTemplateObject"
    }, T.DIV({
      "class": "$node|_getHeaderClass",
      "hideOnExpand": "$context,$node|_getHideShortTagOnExpand"
    }, T.DIV({
      "class": "expander"
    }), T.DIV({
      "class": "actions"
    }, T.DIV({
      "class": "inspect $context,$node|_getInspectActionClass",
      "onclick": "$onClick"
    }), T.DIV({
      "class": "file $node|_getFileActionClass",
      "onclick": "$onClick"
    })), T.SPAN({
      "class": "summary",
      "allowTagExpand": "false"
    }, T.SPAN({
      "class": "label"
    }, T.IF("$node|_hasLabel", T.SPAN("$node|_getLabel"))), T.TAG("$context,$node,$CONST_Short|_getTag", {
      "node": "$context,$node|_getValue",
      "context": "$context"
    })), T.SPAN({
      "class": "fileline"
    }, T.DIV("$node|_getFileLine"))), T.DIV({
      "class": "$node|_getBodyClass"
    })),
    shortTag: T.TAG("getTag", {
      "node": "$node",
      "context": "$context"
    }),
    groupNoMessagesTag: T.DIV({
      "class": "group-no-messages"
    }, "No Messages"),
    _getTag: function _getTag() {
      return this.tag;
    },
    _getTemplateObject: function _getTemplateObject() {
      return this;
    },
    _getMessageClass: function _getMessageClass(message) {
      message.postRender = {};

      if (typeof message.meta["group.start"] != "undefined") {
        return "console-message " + "console-message-group";
      } else {
        return "console-message";
      }
    },
    _getHeaderClass: function _getHeaderClass(message) {
      if (!message.meta || !message.meta["priority"]) {
        return "header";
      }

      return "header header-priority-" + message.meta["priority"];
    },
    _getBodyClass: function _getBodyClass(message) {
      if (!message.meta || !message.meta["priority"]) {
        return "body";
      }

      return "body body-priority-" + message.meta["priority"];
    },
    _getFileLine: function _getFileLine(message) {
      if (!message.meta) {
        return "";
      }

      var str = [];

      if (message.meta["file"]) {
        str.push(domplate.util.cropStringLeft(message.meta["file"], 75));
      }

      if (message.meta["line"]) {
        str.push("@");
        str.push(message.meta["line"]);
      }

      return str.join(" ");
    },
    _getHideShortTagOnExpand: function _getHideShortTagOnExpand(context, node) {
      if (typeof node.meta["group.start"] != "undefined") {
        return "false";
      }

      var rep = context.repForNode(node);

      if (rep.VAR_hideShortTagOnExpand === false) {
        return "false";
      }

      if (node.type == "reference") {
        if (node.meta["lang.type"] == "exception") {
          return "false";
        }
      }

      return "true";
    },
    _isExpandable: function _isExpandable(message) {
      return true;
    },
    _getFileActionClass: function _getFileActionClass(message) {
      if (message.meta["file"] && message.meta.console && typeof message.meta.console["enableFileInspect"] !== "undefined") {
        return message.meta.console["enableFileInspect"] ? "" : "hidden";
      }

      return "hidden";
    },
    _getInspectActionClass: function _getInspectActionClass(context, message) {
      if (message.meta.console && typeof message.meta.console["enableInspect"] !== "undefined") {
        return message.meta.console["enableInspect"] ? "" : "hidden";
      }

      var rep = context.repForNode(message);

      if (rep.meta && rep.meta.console && typeof rep.meta.console["enableInspect"] !== "undefined") {
        return rep.meta.console["enableInspect"] ? "" : "hidden";
      }

      return "";
    },
    _getTagDbid: function _getTagDbid(context, node) {
      var rep = context.repForNode(node);
      return rep.__dbid;
    }
  }, _defineProperty(_ref, "_getTag", function _getTag(context, node, type) {
    var rep = context.repForNode(node);

    if (type == this.CONST_Short) {
      if (rep.shortTag) {
        return rep.shortTag;
      }
    }

    return rep.tag;
  }), _defineProperty(_ref, "_getRep", function _getRep(message) {
    return message.template;
  }), _defineProperty(_ref, "_hasLabel", function _hasLabel(message) {
    if (message.meta && typeof message.meta["label"] != "undefined") {
      return true;
    } else {
      return false;
    }
  }), _defineProperty(_ref, "_getLabel", function _getLabel(message) {
    if (this._hasLabel(message)) {
      return message.meta["label"];
    } else {
      return "";
    }
  }), _defineProperty(_ref, "_getValue", function _getValue(context, node) {
    if (typeof node.meta["group.start"] != "undefined") {
      node.meta["string.trim.enabled"] = false;
    }

    return node;
  }), _defineProperty(_ref, "onMouseMove", function onMouseMove(event) {}), _defineProperty(_ref, "onMouseOver", function onMouseOver(event) {
    if (domplate.util.getChildByClass(this._getMasterRow(event.target), "__no_inspect")) {
      return;
    }
  }), _defineProperty(_ref, "onMouseOut", function onMouseOut(event) {}), _defineProperty(_ref, "onClick", function onClick(event) {
    var masterRow = this._getMasterRow(event.target),
        headerTag = domplate.util.getChildByClass(masterRow, "header"),
        actionsTag = domplate.util.getChildByClass(headerTag, "actions"),
        summaryTag = domplate.util.getChildByClass(headerTag, "summary"),
        bodyTag = domplate.util.getChildByClass(masterRow, "body");

    var pointer = {
      x: event.clientX,
      y: event.clientY
    };
    var masterRect = {
      "left": headerTag.getBoundingClientRect().left - 2,
      "top": headerTag.getBoundingClientRect().top - 2,
      "right": actionsTag.getBoundingClientRect().left || headerTag.getBoundingClientRect().right,
      "bottom": headerTag.getBoundingClientRect().bottom + 1
    };

    if (pointer.x >= masterRect.left && pointer.x <= masterRect.right && pointer.y >= masterRect.top && pointer.y <= masterRect.bottom) {
      event.stopPropagation();

      if (masterRow.getAttribute("expanded") == "true") {
        masterRow.setAttribute("expanded", "false");
        masterRow.contextObject.dispatchEvent('contract', [event, {
          "message": masterRow.messageObject,
          "masterTag": masterRow,
          "summaryTag": summaryTag,
          "bodyTag": bodyTag
        }]);
      } else {
        masterRow.setAttribute("expanded", "true");
        masterRow.contextObject.dispatchEvent('expand', [event, {
          "message": masterRow.messageObject,
          "masterTag": masterRow,
          "summaryTag": summaryTag,
          "bodyTag": bodyTag
        }]);

        if (!bodyTag.innerHTML) {
          if (typeof masterRow.messageObject.meta["group.start"] != "undefined") {
            this.groupNoMessagesTag.replace({}, bodyTag, this);
          } else {
            this.expandForMasterRow(masterRow, bodyTag);
          }

          this.postRender(bodyTag);
        }
      }
    } else if (domplate.util.hasClass(event.target, "inspect")) {
      event.stopPropagation();
      masterRow.contextObject.dispatchEvent('inspectMessage', [event, {
        "message": masterRow.messageObject,
        "masterTag": masterRow,
        "summaryTag": summaryTag,
        "bodyTag": bodyTag,
        "args": {
          "node": masterRow.messageObject
        }
      }]);
    } else if (domplate.util.hasClass(event.target, "file")) {
      event.stopPropagation();
      var args = {
        "file": masterRow.messageObject.meta.file,
        "line": masterRow.messageObject.meta.line
      };

      if (args["file"] && args["line"]) {
        masterRow.contextObject.dispatchEvent('inspectFile', [event, {
          "message": masterRow.messageObject,
          "masterTag": masterRow,
          "summaryTag": summaryTag,
          "bodyTag": bodyTag,
          "args": args
        }]);
      }
    } else {
      event.stopPropagation();
      masterRow.contextObject.dispatchEvent('click', [event, {
        "message": masterRow.messageObject,
        "masterTag": masterRow,
        "bodyTag": bodyTag
      }]);
    }
  }), _defineProperty(_ref, "setCount", function setCount(node, count) {
    try {
      var masterRow = this._getMasterRow(node),
          headerTag = domplate.util.getChildByClass(masterRow, "header"),
          summaryTag = domplate.util.getChildByClass(headerTag, "summary");

      summaryTag.children[1].innerHTML += ' <span class="count">(' + count + ')</span>';
    } catch (e) {
      helpers.logger.error("Error setting count for node!: " + e);
    }
  }), _defineProperty(_ref, "postRender", function postRender(node) {
    var masterRow = this._getMasterRow(node);

    if (typeof masterRow.messageObject.meta.keeptitle !== "undefined") {
      console.log("keeptitle via (1)");
      masterRow.setAttribute("keeptitle", masterRow.messageObject.meta.keeptitle ? "true" : "false");
    } else if (masterRow.messageObject && _typeof(masterRow.messageObject.postRender) == "object") {
      if (typeof masterRow.messageObject.postRender.keeptitle !== "undefined") {
        console.log("keeptitle via (2)");
        masterRow.setAttribute("keeptitle", masterRow.messageObject.postRender.keeptitle ? "true" : "false");
      }
    }
  }), _defineProperty(_ref, "expandForMasterRow", function expandForMasterRow(masterRow, bodyTag) {
    masterRow.setAttribute("expanded", "true");
    var rep = masterRow.contextObject.repForNode(masterRow.messageObject);
    rep.tag.replace({
      "node": masterRow.messageObject,
      "context": masterRow.contextObject
    }, bodyTag, rep);
  }), _defineProperty(_ref, "_getMasterRow", function _getMasterRow(row) {
    while (true) {
      if (!row.parentNode) {
        return null;
      }

      if (domplate.util.hasClass(row, "console-message")) {
        break;
      }

      row = row.parentNode;
    }

    return row;
  }), _ref;
}

exports.main = function (domplate, options) {
  options = options || {};
  var rep = impl(domplate);
  rep.__dom = {
"tag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o, d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11) {  var if_0 = 0;  var e0 = 0;  with (this) {        node = __path__(root, o);node.addEventListener("mouseover", __bind__(this, d0), false);node.addEventListener("mousemove", __bind__(this, d1), false);node.addEventListener("mouseout", __bind__(this, d2), false);node.addEventListener("click", __bind__(this, d3), false);node.messageObject = d4;node.contextObject = d5;node.templateObject = _getTemplateObject(d6);        node = __path__(root, o,0,0+1,0);node.addEventListener("click", __bind__(this, d7), false);        node = __path__(root, o,0,0+1,0+1);node.addEventListener("click", __bind__(this, d8), false);      if_0 = __if__.apply(this, [d9, function(if_0) {      }]);        node = __path__(root, o,0,0+1+1,0+1);        e0 = __link__(node, d10, d11);  }  return 1;})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o, d0, d1) {  var e0 = 0;  with (this) {        node = __path__(root, o);        e0 = __link__(node, d0, d1);  }  return e0;})
}
,
"groupNoMessagesTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o) {  with (this) {  }  return 1;})
}
};
  rep.__markup = {
"tag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<div", " expandable=\"",__escape__(_isExpandable(node)), "\"", " expanded=\"","false", "\"", " __dbid=\"","f19222d1afdcb813baf69909d376ee63829cda3c", "\"", " __dtid=\"","wrappers/console", "\"", " class=\"",__escape__(_getMessageClass(node)), " ", "\"",">","<div", " hideOnExpand=\"",__escape__(_getHideShortTagOnExpand(context,node)), "\"", " class=\"",__escape__(_getHeaderClass(node)), " ", "\"",">","<div", " class=\"","expander", " ", "\"",">","</div>","<div", " class=\"","actions", " ", "\"",">","<div", " class=\"","inspect ",__escape__(_getInspectActionClass(context,node)), " ", "\"",">","</div>","<div", " class=\"","file ",__escape__(_getFileActionClass(node)), " ", "\"",">","</div>","</div>","<span", " allowTagExpand=\"","false", "\"", " class=\"","summary", " ", "\"",">","<span", " class=\"","label", " ", "\"",">");__out__.push(onMouseOver,onMouseMove,onMouseOut,onClick,node,context,node,onClick,onClick);__if__.apply(this, [_hasLabel(node), __out__, function(__out__) {    __code__.push("","<span",">",__escape__(_getLabel(node)),"</span>");}]);    __code__.push("","</span>");__link__(_getTag(context,node,CONST_Short), __code__, __out__, {"node":_getValue(context,node),"context":context});    __code__.push("","</span>","<span", " class=\"","fileline", " ", "\"",">","<div",">",__escape__(_getFileLine(node)),"</div>","</span>","</div>","<div", " class=\"",__escape__(_getBodyClass(node)), " ", "\"",">","</div>","</div>");  }}})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {__link__("getTag", __code__, __out__, {"node":node,"context":context});  }}})
}
,
"groupNoMessagesTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<div", " __dbid=\"","f19222d1afdcb813baf69909d376ee63829cda3c", "\"", " __dtid=\"","wrappers/console", "\"", " class=\"","group-no-messages", " ", "\"",">","No Messages","</div>");  }}})
}
};
  rep.__dbid = "f19222d1afdcb813baf69909d376ee63829cda3c";
  rep.__dtid = "wrappers/console";
  var res = domplate.domplate(rep);
  var injectedCss = false;

  rep.__ensureCssInjected = function () {
    if (injectedCss) return;
    injectedCss = true;
    domplate.loadStyle("wrappers/console.rep.css", options.cssBaseUrl || undefined);
  };

  Object.keys(rep).forEach(function (tagName) {
    if (!rep[tagName].tag) return;
    var replace_orig = res[tagName].replace;

    res[tagName].replace = function () {
      var res = replace_orig.apply(this, arguments);
      if (!res) return;
      setTimeout(function () {
        rep.__ensureCssInjected();
      }, 0);
      return res;
    };
  });
  return res;
};
},{}]},{},[1])(1)
});

	});
});