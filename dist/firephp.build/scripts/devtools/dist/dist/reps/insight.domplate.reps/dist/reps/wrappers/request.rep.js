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


function impl(domplate) {
  var T = domplate.tags;
  return {
    CONST_Short: "shortTag",
    tag: T.DIV({
      "class": "$node|_getMessageClass",
      "_messageObject": "$node",
      "_contextObject": "$context",
      "onclick": "$onClick",
      "expanded": "true",
      "_templateObject": "$node|_getTemplateObject"
    }, T.DIV({
      "class": "$node|_getHeaderClass"
    }, T.DIV({
      "class": "expander"
    }), T.DIV({
      "class": "labels"
    }, "$context,$node|_getTypeLabelValueString"), T.SPAN({
      "class": "summary"
    }, T.TAG("$context,$node,$CONST_Short|_getTitleTag", {
      "node": "$context,$node|_getTitleValue",
      "context": "$context"
    }))), T.DIV({
      "class": "body"
    })),
    _getTemplateObject: function _getTemplateObject() {
      return this;
    },
    _getMessageClass: function _getMessageClass(message) {
      return "console-request";
    },
    _getHeaderClass: function _getHeaderClass(message) {
      return "header";
    },
    _getTitleTag: function _getTitleTag(context, node, type) {
      var rep = context.repForNode(node.value.title);

      if (type == this.CONST_Short) {
        if (rep.shortTag) {
          return rep.shortTag;
        }
      }

      return rep.tag;
    },
    _getTitleValue: function _getTitleValue(context, node) {
      return node.value.title;
    },
    _getTypeLabelValueString: function _getTypeLabelValueString(context, node) {
      return node.value.typeLabel.value;
    },
    onClick: function onClick(event) {
      var masterRow = this._getMasterRow(event.target),
          headerTag = domplate.util.getChildByClass(masterRow, "header"),
          labelsTag = domplate.util.getChildByClass(headerTag, "labels"),
          summaryTag = domplate.util.getChildByClass(headerTag, "summary"),
          bodyTag = domplate.util.getChildByClass(masterRow, "body");

      var pointer = {
        x: event.clientX,
        y: event.clientY
      };
      var masterRect = {
        "left": headerTag.getBoundingClientRect().left - 2,
        "top": headerTag.getBoundingClientRect().top - 2,
        "right": labelsTag.getBoundingClientRect().left || headerTag.getBoundingClientRect().right,
        "bottom": headerTag.getBoundingClientRect().bottom + 1
      };

      if (pointer.x >= masterRect.left && pointer.x <= masterRect.right && pointer.y >= masterRect.top && pointer.y <= masterRect.bottom) {
        event.stopPropagation();

        if (masterRow.getAttribute("expanded") == "true") {
          masterRow.setAttribute("expanded", "false");
        } else {
          masterRow.setAttribute("expanded", "true");
        }
      } else {
        event.stopPropagation();
      }
    },
    _getMasterRow: function _getMasterRow(row) {
      while (true) {
        if (!row.parentNode) {
          return null;
        }

        if (domplate.util.hasClass(row, "console-request")) {
          break;
        }

        row = row.parentNode;
      }

      return row;
    }
  };
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
return (function (root, context, o, d0, d1, d2, d3, d4, d5) {  var e0 = 0;  with (this) {        node = __path__(root, o);node.addEventListener("click", __bind__(this, d0), false);node.messageObject = d1;node.contextObject = d2;node.templateObject = _getTemplateObject(d3);        node = __path__(root, o,0,0+1+1,0);        e0 = __link__(node, d4, d5);  }  return 1;})
}
};
  rep.__markup = {
"tag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<div", " expanded=\"","true", "\"", " __dbid=\"","42e45d15f38354db25f807078ed4de450a918dea", "\"", " __dtid=\"","wrappers/request", "\"", " class=\"",__escape__(_getMessageClass(node)), " ", "\"",">","<div", " class=\"",__escape__(_getHeaderClass(node)), " ", "\"",">","<div", " class=\"","expander", " ", "\"",">","</div>","<div", " class=\"","labels", " ", "\"",">",__escape__(_getTypeLabelValueString(context,node)),"</div>","<span", " class=\"","summary", " ", "\"",">");__out__.push(onClick,node,context,node);__link__(_getTitleTag(context,node,CONST_Short), __code__, __out__, {"node":_getTitleValue(context,node),"context":context});    __code__.push("","</span>","</div>","<div", " class=\"","body", " ", "\"",">","</div>","</div>");  }}})
}
};
  rep.__dbid = "42e45d15f38354db25f807078ed4de450a918dea";
  rep.__dtid = "wrappers/request";
  var res = domplate.domplate(rep);
  var injectedCss = false;

  rep.__ensureCssInjected = function () {
    if (injectedCss) return;
    injectedCss = true;
    domplate.loadStyle("wrappers/request.rep.css", options.cssBaseUrl || undefined);
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