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
    VAR_label: "map",
    CONST_Normal: "tag",
    CONST_Short: "shortTag",
    tag: T.SPAN({
      "class": "map",
      "_nodeObject": "$node"
    }, T.SPAN("$VAR_label("), T.FOR("pair", "$context,$node,$CONST_Normal|mapIterator", T.DIV({
      "class": "pair"
    }, T.TAG("$pair.key.tag", {
      "node": "$pair.key.node",
      "context": "$context"
    }), T.SPAN({
      "class": "delimiter"
    }, "=>"), T.SPAN({
      "class": "value",
      "onclick": "$onClick",
      "_nodeObject": "$pair.value.node",
      "_contextObject": "$context",
      "_expandable": "$pair.value.expandable"
    }, T.TAG("$pair.value.tag", {
      "node": "$pair.value.node",
      "context": "$context"
    })), T.IF("$pair.more", T.SPAN({
      "class": "separator"
    }, ",")))), T.SPAN(")")),
    shortTag: T.SPAN({
      "class": "map",
      "_nodeObject": "$node"
    }, T.SPAN("$VAR_label("), T.FOR("pair", "$context,$node,$CONST_Short|mapIterator", T.SPAN({
      "class": "pair"
    }, T.TAG("$pair.key.tag", {
      "node": "$pair.key.node",
      "context": "$context"
    }), T.SPAN({
      "class": "delimiter"
    }, "=>"), T.SPAN({
      "class": "value",
      "onclick": "$onClick",
      "_nodeObject": "$pair.value.node",
      "_contextObject": "$context",
      "_expandable": "$pair.value.expandable"
    }, T.TAG("$pair.value.tag", {
      "node": "$pair.value.node",
      "context": "$context"
    })), T.IF("$pair.more", T.SPAN({
      "class": "separator"
    }, ",")))), T.SPAN(")")),
    collapsedTag: T.SPAN({
      "class": "map"
    }, T.SPAN("$VAR_label("), T.SPAN({
      "class": "collapsed"
    }, "... $node|getItemCount ..."), T.SPAN(")")),
    moreTag: T.SPAN(" ... "),
    getItemCount: function getItemCount(node) {
      if (!node.value) return 0;
      return node.value.length;
    },
    onClick: function onClick(event) {
      var row = domplate.util.getAncestorByClass(event.target, "value");

      if (row.expandable) {
        if (this.toggleRow(row)) {
          event.stopPropagation();
        }
      }
    },
    isCollapsible: function isCollapsible(node) {
      return node.type == "reference" || node.type == "dictionary" || node.type == "map" || node.type == "array";
    },
    getTag: function getTag(rep, type, node) {
      if (node.meta && node.meta.collapsed) {
        if (this.isCollapsible(node)) {
          type = "collapsedTag";
        } else {
          type = "shortTag";
        }
      }

      if (typeof rep[type] === "undefined") {
        if (type == "shortTag") {
          return rep.tag;
        }

        throw new Error("Rep does not have tag of type: " + type);
      }

      return rep[type];
    },
    _isTagExpandable: function _isTagExpandable(tag) {
      while (true) {
        if (!tag.parentNode) {
          return true;
        }

        if (tag.getAttribute("allowTagExpand") === "false") {
          return false;
        }

        tag = tag.parentNode;
      }
    },
    toggleRow: function toggleRow(row) {
      if (!this._isTagExpandable(row)) {
        return false;
      }

      var node = null;

      if (domplate.util.hasClass(row, "expanded")) {
        node = this.collapsedTag.replace({
          "node": row.nodeObject,
          "context": row.contextObject
        }, row);
        domplate.util.removeClass(row, "expanded");
      } else {
        var valueRep = row.contextObject.repForNode(row.nodeObject).tag;
        node = valueRep.replace({
          "node": row.nodeObject,
          "context": row.contextObject
        }, row);
        domplate.util.setClass(row, "expanded");
      }

      return true;
    },
    mapIterator: function mapIterator(context, node, type) {
      var pairs = [];
      if (!node.value) return pairs;

      for (var i = 0; i < node.value.length; i++) {
        var valueRep = this.getTag(context.repForNode(node.value[i][1]), type, node.value[i][1]);

        if (i > 2 && type == this.CONST_Short) {
          valueRep = this.moreTag;
        }

        var pair = {
          "key": {
            "tag": this.getTag(context.repForNode(node.value[i][0]), type, node.value[i][0]),
            "node": domplate.util.merge(node.value[i][0], {
              "wrapped": true
            })
          },
          "value": {
            "tag": valueRep,
            "node": domplate.util.merge(node.value[i][1], {
              "wrapped": true
            }),
            "expandable": this.isCollapsible(node.value[i][1])
          },
          "more": i < node.value.length - 1
        };
        pairs.push(pair);

        if (i > 2 && type == this.CONST_Short) {
          pairs[pairs.length - 1].more = false;
          break;
        }
      }

      return pairs;
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
return (function (root, context, o, d0, d1) {  var l0 = 0;  var if_0 = 0;  var e0 = 0;  var e1 = 0;  with (this) {        node = __path__(root, o);node.nodeObject = d0;      l0 = __loop__.apply(this, [d1, function(i0,l0,d0,d1,d2,d3,d4,d5,d6,d7,d8) {        node = __path__(root, o,0+1+l0+0,0);        e0 = __link__(node, d0, d1);        node = __path__(root, o,0+1+l0+0,0+e0+1);node.addEventListener("click", __bind__(this, d2), false);node.nodeObject = d3;node.contextObject = d4;node.expandable = d5;        node = __path__(root, o,0+1+l0+0,0+e0+1,0);        e1 = __link__(node, d6, d7);      if_0 = __if__.apply(this, [d8, function(if_0) {      }]);        return 0+1;      }]);  }  return 1;})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o, d0, d1) {  var l0 = 0;  var if_0 = 0;  var e0 = 0;  var e1 = 0;  with (this) {        node = __path__(root, o);node.nodeObject = d0;      l0 = __loop__.apply(this, [d1, function(i0,l0,d0,d1,d2,d3,d4,d5,d6,d7,d8) {        node = __path__(root, o,0+1+l0+0,0);        e0 = __link__(node, d0, d1);        node = __path__(root, o,0+1+l0+0,0+e0+1);node.addEventListener("click", __bind__(this, d2), false);node.nodeObject = d3;node.contextObject = d4;node.expandable = d5;        node = __path__(root, o,0+1+l0+0,0+e0+1,0);        e1 = __link__(node, d6, d7);      if_0 = __if__.apply(this, [d8, function(if_0) {      }]);        return 0+1;      }]);  }  return 1;})
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
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","3dd180ce224195ebd5ae4041dd5384730e8c6534", "\"", " __dtid=\"","default/map", "\"", " class=\"","map", " ", "\"",">","<span",">",__escape__(VAR_label),"(","</span>");__out__.push(node);    __loop__.apply(this, [mapIterator(context,node,CONST_Normal), __out__, function(pair, __out__) {    __code__.push("","<div", " class=\"","pair", " ", "\"",">");__link__(pair.key.tag, __code__, __out__, {"node":pair.key.node,"context":context});    __code__.push("","<span", " class=\"","delimiter", " ", "\"",">","=>","</span>","<span", " class=\"","value", " ", "\"",">");__out__.push(onClick,pair.value.node,context,pair.value.expandable);__link__(pair.value.tag, __code__, __out__, {"node":pair.value.node,"context":context});    __code__.push("","</span>");__if__.apply(this, [pair.more, __out__, function(__out__) {    __code__.push("","<span", " class=\"","separator", " ", "\"",">",",","</span>");}]);    __code__.push("","</div>");    }]);    __code__.push("","<span",">",")","</span>","</span>");  }}})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","3dd180ce224195ebd5ae4041dd5384730e8c6534", "\"", " __dtid=\"","default/map", "\"", " class=\"","map", " ", "\"",">","<span",">",__escape__(VAR_label),"(","</span>");__out__.push(node);    __loop__.apply(this, [mapIterator(context,node,CONST_Short), __out__, function(pair, __out__) {    __code__.push("","<span", " class=\"","pair", " ", "\"",">");__link__(pair.key.tag, __code__, __out__, {"node":pair.key.node,"context":context});    __code__.push("","<span", " class=\"","delimiter", " ", "\"",">","=>","</span>","<span", " class=\"","value", " ", "\"",">");__out__.push(onClick,pair.value.node,context,pair.value.expandable);__link__(pair.value.tag, __code__, __out__, {"node":pair.value.node,"context":context});    __code__.push("","</span>");__if__.apply(this, [pair.more, __out__, function(__out__) {    __code__.push("","<span", " class=\"","separator", " ", "\"",">",",","</span>");}]);    __code__.push("","</span>");    }]);    __code__.push("","<span",">",")","</span>","</span>");  }}})
}
,
"collapsedTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","3dd180ce224195ebd5ae4041dd5384730e8c6534", "\"", " __dtid=\"","default/map", "\"", " class=\"","map", " ", "\"",">","<span",">",__escape__(VAR_label),"(","</span>","<span", " class=\"","collapsed", " ", "\"",">","... ",__escape__(getItemCount(node))," ...","</span>","<span",">",")","</span>","</span>");  }}})
}
,
"moreTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","3dd180ce224195ebd5ae4041dd5384730e8c6534", "\"", " __dtid=\"","default/map", "\"",">"," ... ","</span>");  }}})
}
};
  rep.__dbid = "3dd180ce224195ebd5ae4041dd5384730e8c6534";
  rep.__dtid = "default/map";
  var res = domplate.domplate(rep);
  var injectedCss = false;

  rep.__ensureCssInjected = function () {
    if (injectedCss) return;
    injectedCss = true;
    domplate.loadStyle("default/map.rep.css", options.cssBaseUrl || undefined);
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