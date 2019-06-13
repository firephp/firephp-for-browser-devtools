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
    VAR_label: "array",
    CONST_Normal: "tag",
    CONST_Short: "shortTag",
    CONST_Collapsed: "collapsedTag",
    tag: T.SPAN({
      "class": "array"
    }, T.SPAN("$VAR_label("), T.FOR("element", "$context,$node,$CONST_Normal|elementIterator", T.DIV({
      "class": "element",
      "$expandable": "$element.expandable",
      "_contextObject": "$context",
      "_elementObject": "$element",
      "onclick": "$onClick"
    }, T.SPAN({
      "class": "value"
    }, T.TAG("$element.tag", {
      "element": "$element",
      "node": "$element.node",
      "context": "$context"
    })), T.IF("$element.more", T.SPAN({
      "class": "separator"
    }, ",")))), T.SPAN(")")),
    collapsedTag: T.SPAN({
      "class": "array"
    }, T.SPAN("$VAR_label("), T.SPAN({
      "class": "collapsed"
    }, "... $node|getElementCount ..."), T.SPAN(")")),
    shortTag: T.SPAN({
      "class": "array"
    }, T.SPAN("$VAR_label("), T.FOR("element", "$context,$node,$CONST_Short|elementIterator", T.SPAN({
      "class": "element"
    }, T.SPAN({
      "class": "value"
    }, T.TAG("$element.tag", {
      "element": "$element",
      "node": "$element.node",
      "context": "$context"
    })), T.IF("$element.more", T.SPAN({
      "class": "separator"
    }, ",")))), T.SPAN(")")),
    expandableStub: T.TAG("$context,$element,$CONST_Collapsed|getTag", {
      "node": "$element.node",
      "context": "$context"
    }),
    expandedStub: T.TAG("$tag", {
      "node": "$node",
      "context": "$context",
      "element": "$element"
    }),
    moreTag: T.SPAN(" ... "),
    getElementCount: function getElementCount(node) {
      if (!node.value) return 0;
      return node.value.length || 0;
    },
    getTag: function getTag(context, element, type) {
      if (type === this.CONST_Short) {
        return context.repForNode(element.node).shortTag;
      } else if (type === this.CONST_Normal) {
        if (element.expandable) {
          return this.expandableStub;
        } else {
          return context.repForNode(element.node).tag;
        }
      } else if (type === this.CONST_Collapsed) {
        var rep = context.repForNode(element.node);

        if (typeof rep.collapsedTag === "undefined") {
          throw "no 'collapsedTag' property in rep: " + rep.toString();
        }

        return rep.collapsedTag;
      }
    },
    elementIterator: function elementIterator(context, node, type) {
      var elements = [];
      if (!node.value) return elements;

      for (var i = 0; i < node.value.length; i++) {
        var element = {
          "node": domplate.util.merge(node.value[i], {
            "wrapped": true
          }),
          "more": i < node.value.length - 1,
          "expandable": this.isExpandable(node.value[i])
        };

        if (i > 2 && type == this.CONST_Short) {
          element["tag"] = this.moreTag;
        } else {
          element["tag"] = this.getTag(context, element, type);
        }

        elements.push(element);

        if (i > 2 && type == this.CONST_Short) {
          elements[elements.length - 1].more = false;
          break;
        }
      }

      return elements;
    },
    isExpandable: function isExpandable(node) {
      return node.type == "reference" || node.type == "dictionary" || node.type == "map" || node.type == "array";
    },
    onClick: function onClick(event) {
      if (!domplate.util.isLeftClick(event)) {
        return;
      }

      var row = domplate.util.getAncestorByClass(event.target, "element");

      if (domplate.util.hasClass(row, "expandable")) {
        this.toggleRow(row);
      }

      event.stopPropagation();
    },
    toggleRow: function toggleRow(row) {
      var valueElement = domplate.util.getElementByClass(row, "value");

      if (domplate.util.hasClass(row, "expanded")) {
        domplate.util.removeClass(row, "expanded");
        this.expandedStub.replace({
          "tag": this.expandableStub,
          "element": row.elementObject,
          "context": row.contextObject,
          "node": row.elementObject.node
        }, valueElement);
      } else {
        domplate.util.setClass(row, "expanded");
        var rep = row.contextObject.repForNode(row.elementObject.node);
        this.expandedStub.replace({
          "tag": rep.tag,
          "element": row.elementObject,
          "context": row.contextObject,
          "node": row.elementObject.node
        }, valueElement);
      }
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
return (function (root, context, o, d0) {  var l0 = 0;  var if_0 = 0;  var e0 = 0;  with (this) {      l0 = __loop__.apply(this, [d0, function(i0,l0,d0,d1,d2,d3,d4,d5) {        node = __path__(root, o,0+1+l0+0);node.addEventListener("click", __bind__(this, d0), false);node.contextObject = d1;node.elementObject = d2;        node = __path__(root, o,0+1+l0+0,0,0);        e0 = __link__(node, d3, d4);      if_0 = __if__.apply(this, [d5, function(if_0) {      }]);        return 0+1;      }]);  }  return 1;})
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
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o, d0) {  var l0 = 0;  var if_0 = 0;  var e0 = 0;  with (this) {      l0 = __loop__.apply(this, [d0, function(i0,l0,d0,d1,d2) {        node = __path__(root, o,0+1+l0+0,0,0);        e0 = __link__(node, d0, d1);      if_0 = __if__.apply(this, [d2, function(if_0) {      }]);        return 0+1;      }]);  }  return 1;})
}
,
"expandableStub":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o, d0, d1) {  var e0 = 0;  with (this) {        node = __path__(root, o);        e0 = __link__(node, d0, d1);  }  return e0;})
}
,
"expandedStub":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o, d0, d1) {  var e0 = 0;  with (this) {        node = __path__(root, o);        e0 = __link__(node, d0, d1);  }  return e0;})
}
,
"moreTag":function (context) {
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
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","c8e051a0d8ba6235ed889e184aae731c7e813f48", "\"", " __dtid=\"","insight.domplate.reps/default/array", "\"", " class=\"","array", " ", "\"",">","<span",">",__escape__(VAR_label),"(","</span>");    __loop__.apply(this, [elementIterator(context,node,CONST_Normal), __out__, function(element, __out__) {    __code__.push("","<div", " class=\"","element", " ", (element.expandable ? "expandable" + " " : ""), "\"",">","<span", " class=\"","value", " ", "\"",">");__out__.push(onClick,context,element);__link__(element.tag, __code__, __out__, {"element":element,"node":element.node,"context":context});    __code__.push("","</span>");__if__.apply(this, [element.more, __out__, function(__out__) {    __code__.push("","<span", " class=\"","separator", " ", "\"",">",",","</span>");}]);    __code__.push("","</div>");    }]);    __code__.push("","<span",">",")","</span>","</span>");  }}})
}
,
"collapsedTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","c8e051a0d8ba6235ed889e184aae731c7e813f48", "\"", " __dtid=\"","insight.domplate.reps/default/array", "\"", " class=\"","array", " ", "\"",">","<span",">",__escape__(VAR_label),"(","</span>","<span", " class=\"","collapsed", " ", "\"",">","... ",__escape__(getElementCount(node))," ...","</span>","<span",">",")","</span>","</span>");  }}})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","c8e051a0d8ba6235ed889e184aae731c7e813f48", "\"", " __dtid=\"","insight.domplate.reps/default/array", "\"", " class=\"","array", " ", "\"",">","<span",">",__escape__(VAR_label),"(","</span>");    __loop__.apply(this, [elementIterator(context,node,CONST_Short), __out__, function(element, __out__) {    __code__.push("","<span", " class=\"","element", " ", "\"",">","<span", " class=\"","value", " ", "\"",">");__link__(element.tag, __code__, __out__, {"element":element,"node":element.node,"context":context});    __code__.push("","</span>");__if__.apply(this, [element.more, __out__, function(__out__) {    __code__.push("","<span", " class=\"","separator", " ", "\"",">",",","</span>");}]);    __code__.push("","</span>");    }]);    __code__.push("","<span",">",")","</span>","</span>");  }}})
}
,
"expandableStub":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {__link__(getTag(context,element,CONST_Collapsed), __code__, __out__, {"node":element.node,"context":context});  }}})
}
,
"expandedStub":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {__link__(tag, __code__, __out__, {"node":node,"context":context,"element":element});  }}})
}
,
"moreTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","c8e051a0d8ba6235ed889e184aae731c7e813f48", "\"", " __dtid=\"","insight.domplate.reps/default/array", "\"",">"," ... ","</span>");  }}})
}
};
  rep.__dbid = "c8e051a0d8ba6235ed889e184aae731c7e813f48";
  rep.__dtid = "insight.domplate.reps/default/array";
  var res = domplate.domplate(rep);
  var injectedCss = false;

  rep.__ensureCssInjected = function () {
    if (injectedCss) return;
    injectedCss = true;
    domplate.loadStyle("default/array.rep.css", options.cssBaseUrl || undefined);
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