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
    tag: T.SPAN({
      "class": "string"
    }, T.FOR("line", "$node.value|lineIterator", "$line.value", T.IF("$line.more", T.BR()))),
    shortTag: T.SPAN({
      "class": "string"
    }, "$node|getValue"),
    collapsedTag: T.SPAN({
      "class": "string"
    }, "$node|cropNode"),
    getValue: function getValue(node) {
      if (!node.parentNode || node.meta && typeof node.meta["string.trim.enabled"] !== "undefined" && node.meta["string.trim.enabled"] === false) return node.value;else return this.cropString(node.value);
    },
    cropNode: function cropNode(node) {
      return this.cropString(node.value);
    },
    cropString: function cropString(text, limit) {
      text = text + "";
      limit = limit || 50;
      var halfLimit = limit / 2;

      if (text.length > limit) {
        return this.escapeNewLines(text.substr(0, halfLimit) + "..." + text.substr(text.length - halfLimit));
      } else {
        return this.escapeNewLines(text);
      }
    },
    escapeNewLines: function escapeNewLines(value) {
      return value.replace(/\r/g, "\\r").replace(/\\n/g, "\\\n");
    },
    lineIterator: function lineIterator(value) {
      var parts = ("" + value).replace(/\r/g, "\\r").split("\\n");
      var lines = [];

      for (var i = 0; i < parts.length; i++) {
        lines.push({
          "value": parts[i],
          "more": i < parts.length - 1
        });
      }

      return lines;
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
return (function (root, context, o, d0) {  var l0 = 0;  var if_0 = 0;  with (this) {      l0 = __loop__.apply(this, [d0, function(i0,l0,d0) {      if_0 = __if__.apply(this, [d0, function(if_0) {      }]);        return 0+1+d0;      }]);  }  return 1;})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o) {  with (this) {  }  return 1;})
}
,
"collapsedTag":function (context) {
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
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","62e0cc04c396104049de2fe8bd98aa71d8459ae5", "\"", " __dtid=\"","default/string", "\"", " class=\"","string", " ", "\"",">");    __loop__.apply(this, [lineIterator(node.value), __out__, function(line, __out__) {    __code__.push("",__escape__(line.value));__if__.apply(this, [line.more, __out__, function(__out__) {    __code__.push("","<br","/>");}]);    }]);    __code__.push("","</span>");  }}})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","62e0cc04c396104049de2fe8bd98aa71d8459ae5", "\"", " __dtid=\"","default/string", "\"", " class=\"","string", " ", "\"",">",__escape__(getValue(node)),"</span>");  }}})
}
,
"collapsedTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","62e0cc04c396104049de2fe8bd98aa71d8459ae5", "\"", " __dtid=\"","default/string", "\"", " class=\"","string", " ", "\"",">",__escape__(cropNode(node)),"</span>");  }}})
}
};
  rep.__dbid = "62e0cc04c396104049de2fe8bd98aa71d8459ae5";
  rep.__dtid = "default/string";
  var res = domplate.domplate(rep);
  var injectedCss = false;

  rep.__ensureCssInjected = function () {
    if (injectedCss) return;
    injectedCss = true;
    domplate.loadStyle("default/string.rep.css", options.cssBaseUrl || undefined);
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