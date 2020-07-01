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
    CONST_Normal: "tag",
    CONST_Short: "shortTag",
    CONST_Collapsed: "collapsedTag",
    tag: T.SPAN({
      "class": "reference"
    }, T.TAG("$context,$node,$CONST_Normal|getTag", {
      "context": "$context",
      "node": "$context,$node|getInstanceNode"
    })),
    shortTag: T.SPAN({
      "class": "reference"
    }, T.TAG("$context,$node,$CONST_Collapsed|getTag", {
      "context": "$context",
      "node": "$context,$node|getInstanceNode"
    })),
    collapsedTag: T.SPAN({
      "class": "reference"
    }, T.TAG("$context,$node,$CONST_Collapsed|getTag", {
      "context": "$context",
      "node": "$context,$node|getInstanceNode"
    })),
    getTagDbid: function getTagDbid(context, node, type) {
      return context.repForNode(this.getInstanceNode(context, node)).__dbid;
    },
    getTag: function getTag(context, node, type) {
      return context.repForNode(this.getInstanceNode(context, node))[type];
    },
    getInstanceNode: function getInstanceNode(context, node) {
      if (node.value.instance) {
        return node.value.instance;
      } else if (node.instances && typeof node.value === "number") {
        return node.instances[node.value];
      } else if (typeof node.value.getInstanceNode === "function") {
        return node.value.getInstanceNode(node);
      } else if (typeof node.getInstance === "function") {
        return node.getInstance();
      }

      return context.getInstanceNode(node);
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
return (function (root, context, o, d0, d1) {  var e0 = 0;  with (this) {        node = __path__(root, o,0);        e0 = __link__(node, d0, d1);  }  return 1;})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o, d0, d1) {  var e0 = 0;  with (this) {        node = __path__(root, o,0);        e0 = __link__(node, d0, d1);  }  return 1;})
}
,
"collapsedTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o, d0, d1) {  var e0 = 0;  with (this) {        node = __path__(root, o,0);        e0 = __link__(node, d0, d1);  }  return 1;})
}
};
  rep.__markup = {
"tag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","485215d9752c351011a71bdfb2f63d02f1ffbc0b", "\"", " __dtid=\"","default/reference", "\"", " class=\"","reference", " ", "\"",">");__link__(getTag(context,node,CONST_Normal), __code__, __out__, {"context":context,"node":getInstanceNode(context,node)});    __code__.push("","</span>");  }}})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","485215d9752c351011a71bdfb2f63d02f1ffbc0b", "\"", " __dtid=\"","default/reference", "\"", " class=\"","reference", " ", "\"",">");__link__(getTag(context,node,CONST_Collapsed), __code__, __out__, {"context":context,"node":getInstanceNode(context,node)});    __code__.push("","</span>");  }}})
}
,
"collapsedTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","485215d9752c351011a71bdfb2f63d02f1ffbc0b", "\"", " __dtid=\"","default/reference", "\"", " class=\"","reference", " ", "\"",">");__link__(getTag(context,node,CONST_Collapsed), __code__, __out__, {"context":context,"node":getInstanceNode(context,node)});    __code__.push("","</span>");  }}})
}
};
  rep.__dbid = "485215d9752c351011a71bdfb2f63d02f1ffbc0b";
  rep.__dtid = "default/reference";
  var res = domplate.domplate(rep);
  var injectedCss = false;

  rep.__ensureCssInjected = function () {
    if (injectedCss) return;
    injectedCss = true;
    domplate.loadStyle("default/reference.rep.css", options.cssBaseUrl || undefined);
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