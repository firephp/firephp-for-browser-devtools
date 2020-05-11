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
  return function () {
    var master = function () {
      var T = domplate.tags;
      return {
        CONST_Normal: "tag",
        CONST_Short: "shortTag",
        CONST_Collapsed: "collapsedTag",
        tag: T.SPAN({
          "class": "dictionary"
        }, T.SPAN("$node|getLabel("), T.FOR("member", "$context,$node,$CONST_Normal|dictionaryIterator", T.DIV({
          "class": "member",
          "$expandable": "$member.expandable",
          "_memberObject": "$member",
          "_contextObject": "$context",
          "onclick": "$onClick"
        }, T.SPAN({
          "class": "name",
          "decorator": "$member|getMemberNameDecorator"
        }, "$member.name"), T.SPAN({
          "class": "delimiter"
        }, ":"), T.SPAN({
          "class": "value"
        }, T.TAG("$member.tag", {
          "context": "$context",
          "node": "$member.node",
          "member": "$member"
        })), T.IF("$member.more", T.SPAN({
          "class": "separator"
        }, ",")))), T.SPAN(")")),
        shortTag: T.SPAN({
          "class": "dictionary"
        }, T.SPAN("$node|getLabel("), T.FOR("member", "$context,$node,$CONST_Short|dictionaryIterator", T.SPAN({
          "class": "member"
        }, T.SPAN({
          "class": "name"
        }, "$member.name"), T.SPAN({
          "class": "delimiter"
        }, ":"), T.SPAN({
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
        }, T.SPAN("$node|getLabel("), T.SPAN({
          "class": "collapsed"
        }, "... $node|getMemberCount ..."), T.SPAN(")")),
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
          return "dictionary";
        },
        getMemberNameDecorator: function getMemberNameDecorator(member) {
          return "";
        },
        getMemberCount: function getMemberCount(node) {
          if (!node.value) return 0;
          var count = 0;

          for (var name in node.value) {
            count++;
          }

          return count;
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
              throw "no 'collapsedTag' property in rep: " + rep.toString();
            }

            return rep.collapsedTag;
          }
        },
        dictionaryIterator: function dictionaryIterator(context, node, type) {
          var members = [];
          if (!node.value || node.value.length == 0) return members;

          for (var name in node.value) {
            var member = {
              "name": name,
              "node": domplate.util.merge(node.value[name], {
                "wrapped": true
              }),
              "more": true,
              "expandable": this.isExpandable(node.value[name])
            };

            if (members.length > 1 && type == this.CONST_Short) {
              member["tag"] = this.moreTag;
            } else {
              member["tag"] = this.getTag(context, member, type);
            }

            members.push(member);

            if (members.length > 2 && type == this.CONST_Short) {
              break;
            }
          }

          if (members.length > 0) {
            members[members.length - 1]["more"] = false;
          }

          return members;
        },
        isExpandable: function isExpandable(node) {
          return node.type == "reference" || node.type == "dictionary" || node.type == "map" || node.type == "array";
        },
        onClick: function onClick(event) {
          if (!domplate.util.isLeftClick(event)) {
            return;
          }

          var row = domplate.util.getAncestorByClass(event.target, "member");

          if (domplate.util.hasClass(row, "expandable")) {
            if (this.toggleRow(row)) {
              event.stopPropagation();
            }
          }
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
    }();

    var sub = function () {
      return {
        getLabel: function getLabel(node) {
          return node.meta && node.meta["lang.class"] || "Object";
        },
        getMemberNameDecorator: function getMemberNameDecorator(member) {
          var decorator = [];

          if (member.node.meta) {
            if (member.node.meta["lang.visibility"]) {
              decorator.push(member.node.meta["lang.visibility"]);
            } else if (member.node.meta["lang.undeclared"]) {
              decorator.push("undeclared");
            }

            if (member.node.meta["lang.static"]) {
              decorator.push("static");
            }
          }

          return decorator.join("-");
        }
      };
    }();

    Object.keys(sub).forEach(function (name) {
      master[name] = sub[name];
    });
    return master;
  }();
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
return (function (root, context, o, d0) {  var l0 = 0;  var if_0 = 0;  var e0 = 0;  with (this) {      l0 = __loop__.apply(this, [d0, function(i0,l0,d0,d1,d2,d3,d4,d5) {        node = __path__(root, o,0+1+l0+0);node.addEventListener("click", __bind__(this, d0), false);node.memberObject = d1;node.contextObject = d2;        node = __path__(root, o,0+1+l0+0,0+1+1,0);        e0 = __link__(node, d3, d4);      if_0 = __if__.apply(this, [d5, function(if_0) {      }]);        return 0+1;      }]);  }  return 1;})
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
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","fc2f04314c99af4367ff734e927c773cb9b1251b", "\"", " __dtid=\"","php/object", "\"", " class=\"","dictionary", " ", "\"",">","<span",">",__escape__(getLabel(node)),"(","</span>");    __loop__.apply(this, [dictionaryIterator(context,node,CONST_Normal), __out__, function(member, __out__) {    __code__.push("","<div", " class=\"","member", " ", (member.expandable ? "expandable" + " " : ""), "\"",">","<span", " decorator=\"",__escape__(getMemberNameDecorator(member)), "\"", " class=\"","name", " ", "\"",">",__escape__(member.name),"</span>","<span", " class=\"","delimiter", " ", "\"",">",":","</span>","<span", " class=\"","value", " ", "\"",">");__out__.push(onClick,member,context);__link__(member.tag, __code__, __out__, {"context":context,"node":member.node,"member":member});    __code__.push("","</span>");__if__.apply(this, [member.more, __out__, function(__out__) {    __code__.push("","<span", " class=\"","separator", " ", "\"",">",",","</span>");}]);    __code__.push("","</div>");    }]);    __code__.push("","<span",">",")","</span>","</span>");  }}})
}
,
"shortTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","fc2f04314c99af4367ff734e927c773cb9b1251b", "\"", " __dtid=\"","php/object", "\"", " class=\"","dictionary", " ", "\"",">","<span",">",__escape__(getLabel(node)),"(","</span>");    __loop__.apply(this, [dictionaryIterator(context,node,CONST_Short), __out__, function(member, __out__) {    __code__.push("","<span", " class=\"","member", " ", "\"",">","<span", " class=\"","name", " ", "\"",">",__escape__(member.name),"</span>","<span", " class=\"","delimiter", " ", "\"",">",":","</span>","<span", " class=\"","value", " ", "\"",">");__link__(member.tag, __code__, __out__, {"context":context,"node":member.node,"member":member});    __code__.push("","</span>");__if__.apply(this, [member.more, __out__, function(__out__) {    __code__.push("","<span", " class=\"","separator", " ", "\"",">",",","</span>");}]);    __code__.push("","</span>");    }]);    __code__.push("","<span",">",")","</span>","</span>");  }}})
}
,
"collapsedTag":function (context) {
var DomplateDebug = context.DomplateDebug;
var __escape__ = context.__escape__;
var __if__ = context.__if__;
var __loop__ = context.__loop__;
var __link__ = context.__link__;
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","fc2f04314c99af4367ff734e927c773cb9b1251b", "\"", " __dtid=\"","php/object", "\"", " class=\"","dictionary", " ", "\"",">","<span",">",__escape__(getLabel(node)),"(","</span>","<span", " class=\"","collapsed", " ", "\"",">","... ",__escape__(getMemberCount(node))," ...","</span>","<span",">",")","</span>","</span>");  }}})
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
return (function (__code__, __context__, __in__, __out__) {  with (this) {  with (__in__) {    __code__.push("","<span", " __dbid=\"","fc2f04314c99af4367ff734e927c773cb9b1251b", "\"", " __dtid=\"","php/object", "\"", " class=\"","more", " ", "\"",">"," ... ","</span>");  }}})
}
};
  rep.__dbid = "fc2f04314c99af4367ff734e927c773cb9b1251b";
  rep.__dtid = "php/object";
  var res = domplate.domplate(rep);
  var injectedCss = false;

  rep.__ensureCssInjected = function () {
    if (injectedCss) return;
    injectedCss = true;
    domplate.loadStyle("php/object.rep.css", options.cssBaseUrl || undefined);
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