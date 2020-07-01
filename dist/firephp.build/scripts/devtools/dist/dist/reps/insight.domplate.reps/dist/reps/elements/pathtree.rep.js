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
      "class": "dictionary"
    }, T.FOR("member", "$context,$node,$CONST_Normal|dictionaryIterator", T.DIV({
      "class": "member",
      "$expandable": "$member.expandable",
      "_memberObject": "$member",
      "_contextObject": "$context",
      "onclick": "$onToggle"
    }, T.SPAN({
      "class": "name",
      "decorator": "$member|getMemberNameDecorator",
      "onclick": "$onSelect"
    }, "$member.name"), T.SPAN({
      "class": "delimiter"
    }, ""), T.SPAN({
      "class": "value"
    }, T.TAG("$member.tag", {
      "context": "$context",
      "node": "$member.node",
      "member": "$member"
    })), T.IF("$member.more", T.SPAN({
      "class": "separator"
    }, ","))))),
    shortTag: T.SPAN({
      "class": "dictionary"
    }, T.SPAN("$node|getLabel("), T.FOR("member", "$context,$node,$CONST_Short|dictionaryIterator", T.SPAN({
      "class": "member"
    }, T.SPAN({
      "class": "name"
    }, "$member.name"), T.SPAN({
      "class": "delimiter"
    }, ""), T.SPAN({
      "class": "value"
    }, T.TAG("$member.tag", {
      "context": "$context",
      "node": "$member.node",
      "member": "$member"
    })), T.IF("$member.more", T.SPAN({
      "class": "separator"
    }, ",")))), T.SPAN(")")),
    collapsedTag: T.SPAN({
      "class": "dictionary"
    }, T.SPAN("("), T.SPAN({
      "class": "collapsed"
    }, "$node|getMemberCount"), T.SPAN(")")),
    expandableStub: T.TAG("$context,$member,$CONST_Collapsed|getTag", {
      "context": "$context",
      "node": "$member.node",
      "member": "$member"
    }),
    expandedStub: T.TAG("$tag", {
      "context": "$context",
      "node": "$node",
      "member": "$member"
    }),
    moreTag: T.SPAN({
      "class": "more"
    }, " ... "),
    getLabel: function getLabel(node) {
      return "pathtree";
    },
    getMemberNameDecorator: function getMemberNameDecorator(member) {
      return "";
    },
    getMemberCount: function getMemberCount(node) {
      if (!node.value.children) return 0;
      return node.value.children.length;
    },
    getTag: function getTag(context, member, type) {
      if (type === this.CONST_Short) {
        return context.repForNode(member.node).shortTag;
      } else if (type === this.CONST_Normal) {
        if (member.expandable) {
          return this.expandableStub;
        } else {
          return context.repForNode(member.node).tag;
        }
      } else if (type === this.CONST_Collapsed) {
        var rep = context.repForNode(member.node);

        if (typeof rep.collapsedTag === "undefined") {
          console.error("rep", rep);
          throw "no 'collapsedTag' property in rep: " + rep.toString();
        }

        return rep.collapsedTag;
      }
    },
    _objectListToTree: function _objectListToTree(list) {
      var map = {},
          node,
          roots = [],
          i,
          parentIdParts,
          j,
          id;

      for (i = 0; i < list.length; i += 1) {
        id = list[i];
        list[i] = {
          id: id,
          label: id.replace(/^.*(\/[^\/]+)$/, "$1"),
          parentId: id.replace(/\/[^\/]+$/, "")
        };

        if (list[i].parentId && !map[list[i].parentId]) {
          list.push(list[i].parentId);
          map[list[i].parentId] = list.length - 1;
        }

        map[list[i].id] = i;
        list[i].children = [];
      }

      for (i = 0; i < list.length; i += 1) {
        node = list[i];

        if (node.parentId !== "") {
          list[map[node.parentId]].children.push(node);
        } else {
          roots.push(node);
        }
      }

      return roots;
    },
    dictionaryIterator: function dictionaryIterator(context, node, type) {
      var self = this;
      var value = node.value;
      var members = [];
      if (!value || value.length == 0) return members;

      if (Array.isArray(value)) {
        value = {
          children: self._objectListToTree(value)
        };

        while (value.children.length === 1 && value.children[0].children && value.children[0].children.length === 1) {
          value.children = value.children[0].children;
        }
      }

      if (value.children && value.children.length) {
        var stop = false;
        value.children.forEach(function (child, i) {
          if (stop) {
            return;
          }

          var member = {
            "name": child.label,
            "node": domplate.util.merge({
              meta: node.meta,
              value: child
            }, {
              "wrapped": true
            }),
            "more": i < value.children - 1,
            "expandable": child.children && child.children.length
          };

          if (members.length > 1 && type == self.CONST_Short) {
            member["tag"] = self.moreTag;
          } else {
            member["tag"] = self.getTag(context, member, type);
          }

          members.push(member);

          if (members.length > 2 && type == self.CONST_Short) {
            stop = true;
          }
        });
      }

      if (members.length > 0) {
        members[members.length - 1]["more"] = false;
      }

      return members;
    },
    onToggle: function onToggle(event) {
      if (!domplate.util.isLeftClick(event)) {
        return;
      }

      var memberTag = domplate.util.getAncestorByClass(event.target, "member");
      var nameTag = domplate.util.getElementByClass(memberTag, "name");
      var nameTagRect = nameTag.getBoundingClientRect();
      var pointer = {
        x: event.clientX,
        y: event.clientY
      };

      if (pointer.x < nameTagRect.left || pointer.x > nameTagRect.right || pointer.y < nameTagRect.top || pointer.y > nameTagRect.bottom) {
        if (domplate.util.hasClass(memberTag, "expandable")) {
          if (this.toggleRow(memberTag)) {
            event.stopPropagation();
          }
        }
      }
    },
    onSelect: function onSelect(event) {
      if (!domplate.util.isLeftClick(event)) {
        return;
      }

      event.stopPropagation();
      var memberTag = domplate.util.getAncestorByClass(event.target, "member");
      memberTag.contextObject.dispatchEvent('click', [event, {
        "rep": "insight.domplate.reps/elements/pathtree",
        "node": memberTag.memberObject.node
      }]);
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

      var valueElement = domplate.util.getElementByClass(row, "value");

      if (domplate.util.hasClass(row, "expanded")) {
        domplate.util.removeClass(row, "expanded");
        this.expandedStub.replace({
          "tag": this.expandableStub,
          "member": row.memberObject,
          "node": row.memberObject.node,
          "context": row.contextObject
        }, valueElement);
      } else {
        domplate.util.setClass(row, "expanded");
        this.expandedStub.replace({
          "tag": row.contextObject.repForNode(row.memberObject.node).tag,
          "member": row.memberObject,
          "node": row.memberObject.node,
          "context": row.contextObject
        }, valueElement);
      }

      return true;
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
return (function (root, context, o, d0) {  var l0 = 0;  var if_0 = 0;  var e0 = 0;  with (this) {      l0 = __loop__.apply(this, [d0, function(i0,l0,d0,d1,d2,d3,d4,d5,d6) {        node = __path__(root, o,0+l0+0);node.addEventListener("click", __bind__(this, d0), false);node.memberObject = d1;node.contextObject = d2;        node = __path__(root, o,0+l0+0,0);node.addEventListener("click", __bind__(this, d3), false);        node = __path__(root, o,0+l0+0,0+1+1,0);        e0 = __link__(node, d4, d5);      if_0 = __if__.apply(this, [d6, function(if_0) {      }]);        return 0+1;      }]);  }  return 1;})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __path__ = context.__path__;
var __bind__ = context.__bind__;
var __if__ = context.__if__;
var __link__ = context.__link__;
var __loop__ = context.__loop__;
return (function (root, context, o, d0) {  var l0 = 0;  var if_0 = 0;  var e0 = 0;  with (this) {      l0 = __loop__.apply(this, [d0, function(i0,l0,d0,d1,d2) {        node = __path__(root, o,0+1+l0+0,0+1+1,0);        e0 = __link__(node, d0, d1);      if_0 = __if__.apply(this, [d2, function(if_0) {      }]);        return 0+1;      }]);  }  return 1;})
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
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","0f0401809dc6d33090f1a3cecfeca8f3955b1486", "\"", " __dtid=\"","elements/pathtree", "\"", " class=\"","dictionary", " ", "\"",">");    __loop__.apply(this, [dictionaryIterator(context,node,CONST_Normal), __out__, function(member, __out__) {    __code__.push("","<div", " class=\"","member", " ", (member.expandable ? "expandable" + " " : ""), "\"",">","<span", " decorator=\"",__escape__(getMemberNameDecorator(member)), "\"", " class=\"","name", " ", "\"",">",__escape__(member.name),"</span>","<span", " class=\"","delimiter", " ", "\"",">","","</span>","<span", " class=\"","value", " ", "\"",">");__out__.push(onToggle,member,context,onSelect);__link__(member.tag, __code__, __out__, {"context":context,"node":member.node,"member":member});    __code__.push("","</span>");__if__.apply(this, [member.more, __out__, function(__out__) {    __code__.push("","<span", " class=\"","separator", " ", "\"",">",",","</span>");}]);    __code__.push("","</div>");    }]);    __code__.push("","</span>");  }}})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","0f0401809dc6d33090f1a3cecfeca8f3955b1486", "\"", " __dtid=\"","elements/pathtree", "\"", " class=\"","dictionary", " ", "\"",">","<span",">",__escape__(getLabel(node)),"(","</span>");    __loop__.apply(this, [dictionaryIterator(context,node,CONST_Short), __out__, function(member, __out__) {    __code__.push("","<span", " class=\"","member", " ", "\"",">","<span", " class=\"","name", " ", "\"",">",__escape__(member.name),"</span>","<span", " class=\"","delimiter", " ", "\"",">","","</span>","<span", " class=\"","value", " ", "\"",">");__link__(member.tag, __code__, __out__, {"context":context,"node":member.node,"member":member});    __code__.push("","</span>");__if__.apply(this, [member.more, __out__, function(__out__) {    __code__.push("","<span", " class=\"","separator", " ", "\"",">",",","</span>");}]);    __code__.push("","</span>");    }]);    __code__.push("","<span",">",")","</span>","</span>");  }}})
}
,
"collapsedTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","0f0401809dc6d33090f1a3cecfeca8f3955b1486", "\"", " __dtid=\"","elements/pathtree", "\"", " class=\"","dictionary", " ", "\"",">","<span",">","(","</span>","<span", " class=\"","collapsed", " ", "\"",">",__escape__(getMemberCount(node)),"</span>","<span",">",")","</span>","</span>");  }}})
}
,
"expandableStub":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {__link__(getTag(context,member,CONST_Collapsed), __code__, __out__, {"context":context,"node":member.node,"member":member});  }}})
}
,
"expandedStub":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {__link__(tag, __code__, __out__, {"context":context,"node":node,"member":member});  }}})
}
,
"moreTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","0f0401809dc6d33090f1a3cecfeca8f3955b1486", "\"", " __dtid=\"","elements/pathtree", "\"", " class=\"","more", " ", "\"",">"," ... ","</span>");  }}})
}
};
  rep.__dbid = "0f0401809dc6d33090f1a3cecfeca8f3955b1486";
  rep.__dtid = "elements/pathtree";
  var res = domplate.domplate(rep);
  var injectedCss = false;

  rep.__ensureCssInjected = function () {
    if (injectedCss) return;
    injectedCss = true;
    domplate.loadStyle("elements/pathtree.rep.css", options.cssBaseUrl || undefined);
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