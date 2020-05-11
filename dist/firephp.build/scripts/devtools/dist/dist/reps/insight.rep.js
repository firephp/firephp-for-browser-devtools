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
(function (global){

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_require_,module,exports){

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var RT = _require_("./rt");

var Renderer = exports.Renderer = _require_("./renderer").Renderer;

function Domplate(exports) {
  exports.util = _require_("./util");

  exports.loadStyle = function (uri, baseUrl) {
    var WINDOW = window;

    if (typeof baseUrl === 'undefined' && WINDOW && typeof WINDOW.pmodule !== "undefined" && !/^\//.test(uri)) {
      uri = [WINDOW.pmodule.filename.replace(/\/([^\/]*)$/, ""), uri].join("/").replace(/\/\.?\//g, "/");
    } else if (typeof baseUrl !== 'undefined') {
      uri = [baseUrl, uri].join("/").replace(/\/\.?\//g, "/");
    }

    return new Promise(function (resolve, reject) {
      var link = window.document.createElementNS ? window.document.createElementNS("http://www.w3.org/1999/xhtml", "link") : window.document.createElement("link");
      link.rel = "stylesheet";
      link.href = uri;

      link.onload = function () {
        resolve();
      };

      var head = window.document.getElementsByTagName("head")[0] || window.document.documentElement;
      head.appendChild(link);
    });
  };

  exports.EVAL = {
    compileMarkup: function compileMarkup(code, context) {
      return context.compiled(context);
    },
    compileDOM: function compileDOM(code, context) {
      return context.compiled(context);
    }
  };
  exports.tags = {};
  exports.tags._domplate_ = exports;

  var DomplateTag = exports.DomplateTag = function DomplateTag(tagName) {
    this.tagName = tagName;
  };

  function DomplateEmbed() {}

  function DomplateLoop() {}

  function DomplateIf() {}

  function copyArray(oldArray) {
    var ary = [];
    if (oldArray) for (var i = 0; i < oldArray.length; ++i) {
      ary.push(oldArray[i]);
    }
    return ary;
  }

  function copyObject(l, r) {
    var m = {};
    extend(m, l);
    extend(m, r);
    return m;
  }

  function extend(l, r) {
    for (var n in r) {
      l[n] = r[n];
    }
  }

  var womb = null;

  var domplate = exports.domplate = function () {
    var lastSubject;

    for (var i = 0; i < arguments.length; ++i) {
      lastSubject = lastSubject ? copyObject(lastSubject, arguments[i]) : arguments[i];
    }

    for (var name in lastSubject) {
      var val = lastSubject[name];
      if (isTag(val)) val.tag.subject = lastSubject;
    }

    return lastSubject;
  };

  domplate.context = function (context, fn) {
    var lastContext = domplate.lastContext;
    domplate.topContext = context;
    fn.apply(context);
    domplate.topContext = lastContext;
  };

  exports.tags.TAG = function () {
    var embed = new DomplateEmbed();
    return embed.merge(arguments);
  };

  exports.tags.FOR = domplate.FOR = function () {
    var loop = new DomplateLoop();
    return loop.merge(arguments);
  };

  exports.tags.IF = domplate.IF = function () {
    var loop = new DomplateIf();
    return loop.merge(arguments);
  };

  DomplateTag.prototype = {
    merge: function merge(args, oldTag) {
      if (oldTag) this.tagName = oldTag.tagName;
      this.context = oldTag ? oldTag.context : null;
      this.subject = oldTag ? oldTag.subject : null;
      this.attrs = oldTag ? copyObject(oldTag.attrs) : {};
      this.classes = oldTag ? copyObject(oldTag.classes) : {};
      this.props = oldTag ? copyObject(oldTag.props) : null;
      this.listeners = oldTag ? copyArray(oldTag.listeners) : null;
      this.children = oldTag ? copyArray(oldTag.children) : [];
      this.vars = oldTag ? copyArray(oldTag.vars) : [];
      var attrs = args.length ? args[0] : null;
      var hasAttrs = _typeof(attrs) == "object" && !isTag(attrs);
      this.resources = {};
      this.children = [];
      if (domplate.topContext) this.context = domplate.topContext;
      if (args.length) parseChildren(args, hasAttrs ? 1 : 0, this.vars, this.children);
      if (hasAttrs) this.parseAttrs(attrs);
      return creator(this, DomplateTag);
    },
    parseAttrs: function parseAttrs(args) {
      for (var name in args) {
        var val = parseValue(args[name]);
        readPartNames(val, this.vars);

        if (name.indexOf("on") === 0) {
          var eventName = name.substr(2);
          if (!this.listeners) this.listeners = [];
          this.listeners.push(eventName, val);
        } else if (name[0] === "_" && name[1] !== "_") {
          var propName = name.substr(1);
          if (!this.props) this.props = {};
          this.props[propName] = val;
        } else if (name[0] === "$") {
          var className = name.substr(1);
          if (!this.classes) this.classes = {};
          this.classes[className] = val;
        } else {
          if (name === "class" && this.attrs.hasOwnProperty(name)) this.attrs[name] += " " + val;else this.attrs[name] = val;
        }
      }
    },
    compile: function compile() {
      if (this.renderMarkup) {
        return;
      }

      if (this.subject._resources) {
        this.resources = this.subject._resources();
      }

      this.compileMarkup();
      this.compileDOM();
    },
    compileMarkup: function compileMarkup() {
      this.markupArgs = [];
      var topBlock = [],
          topOuts = [],
          blocks = [],
          info = {
        args: this.markupArgs,
        argIndex: 0
      };
      this.generateMarkup(topBlock, topOuts, blocks, info, true);
      this.addCode(topBlock, topOuts, blocks);
      var fnBlock = ['(function (__code__, __context__, __in__, __out__'];

      for (var i = 0; i < info.argIndex; ++i) {
        fnBlock.push(', s', i);
      }

      fnBlock.push(') {');
      if (this.subject) fnBlock.push('  with (this) {');
      if (this.context) fnBlock.push('  with (__context__) {');
      fnBlock.push('  with (__in__) {');
      fnBlock.push.apply(fnBlock, blocks);
      if (this.subject) fnBlock.push('  }');
      if (this.context) fnBlock.push('  }');
      fnBlock.push('}})');
      var self = this;
      var js = fnBlock.join("");
      js = js.replace('__SELF__JS__', js.replace(/\'/g, '\\\''));
      this.renderMarkup = exports.EVAL.compileMarkup(js, RT.makeMarkupRuntime(exports.EVAL, {
        self: self,
        compiled: this.subject.__markup
      }));
    },
    getVarNames: function getVarNames(args) {
      if (this.vars) args.push.apply(args, this.vars);

      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i];
        if (isTag(child)) child.tag.getVarNames(args);else if (child instanceof Parts) {
          for (var i = 0; i < child.parts.length; ++i) {
            if (child.parts[i] instanceof Variables) {
              var name = child.parts[i].names[0];
              var names = name.split(".");
              args.push(names[0]);
            }
          }
        }
      }
    },
    generateMarkup: function generateMarkup(topBlock, topOuts, blocks, info, topNode) {
      topBlock.push(',"<', this.tagName, '"');

      if (topNode) {
        if (this.subject.__dbid) this.attrs['__dbid'] = this.subject.__dbid;
        if (this.subject.__dtid) this.attrs['__dtid'] = this.subject.__dtid;
      }

      for (var name in this.attrs) {
        if (name != "class") {
          var val = this.attrs[name];
          topBlock.push(', " ', name, '=\\""');
          addParts(val, ',', topBlock, info, true);
          topBlock.push(', "\\""');
        }
      }

      if (this.listeners) {
        for (var i = 0; i < this.listeners.length; i += 2) {
          readPartNames(this.listeners[i + 1], topOuts);
        }
      }

      if (this.props) {
        for (var name in this.props) {
          readPartNames(this.props[name], topOuts);
        }
      }

      if (this.attrs.class || this.classes && Object.keys(this.classes).length > 0) {
        topBlock.push(', " class=\\""');
        if (this.attrs.hasOwnProperty("class")) addParts(this.attrs["class"], ',', topBlock, info, true);
        topBlock.push(', " "');

        for (var name in this.classes) {
          topBlock.push(', (');
          addParts(this.classes[name], '', topBlock, info);
          topBlock.push(' ? "', name, '" + " " : "")');
        }

        topBlock.push(', "\\""');
      }

      if (this.tagName == "br") {
        topBlock.push(',"/>"');
      } else {
        topBlock.push(',">"');
        this.generateChildMarkup(topBlock, topOuts, blocks, info);
        topBlock.push(',"</', this.tagName, '>"');
      }
    },
    generateChildMarkup: function generateChildMarkup(topBlock, topOuts, blocks, info) {
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i];
        if (isTag(child)) child.tag.generateMarkup(topBlock, topOuts, blocks, info);else addParts(child, ',', topBlock, info, true);
      }
    },
    addCode: function addCode(topBlock, topOuts, blocks) {
      if (topBlock.length) blocks.push('    __code__.push(""', topBlock.join(""), ');');
      if (topOuts.length) blocks.push('__out__.push(', topOuts.join(","), ');');
      topBlock.splice(0, topBlock.length);
      topOuts.splice(0, topOuts.length);
    },
    addLocals: function addLocals(blocks) {
      var varNames = [];
      this.getVarNames(varNames);
      var map = {};

      for (var i = 0; i < varNames.length; ++i) {
        var name = varNames[i];
        if (map.hasOwnProperty(name)) continue;
        map[name] = 1;
        var names = name.split(".");
        blocks.push('var ', names[0] + ' = ' + '__in__.' + names[0] + ';');
      }
    },
    compileDOM: function compileDOM() {
      var path = [];
      var blocks = [];
      this.domArgs = [];
      path.embedIndex = 0;
      path.loopIndex = 0;
      path.ifIndex = 0;
      path.staticIndex = 0;
      path.renderIndex = 0;
      var nodeCount = this.generateDOM(path, blocks, this.domArgs);
      var fnBlock = ['(function (root, context, o'];

      for (var i = 0; i < path.staticIndex; ++i) {
        fnBlock.push(', ', 's' + i);
      }

      for (var i = 0; i < path.renderIndex; ++i) {
        fnBlock.push(', ', 'd' + i);
      }

      fnBlock.push(') {');

      for (var i = 0; i < path.loopIndex; ++i) {
        fnBlock.push('  var l', i, ' = 0;');
      }

      for (var i = 0; i < path.ifIndex; ++i) {
        fnBlock.push('  var if_', i, ' = 0;');
      }

      for (var i = 0; i < path.embedIndex; ++i) {
        fnBlock.push('  var e', i, ' = 0;');
      }

      if (this.subject) {
        fnBlock.push('  with (this) {');
      }

      if (this.context) {
        fnBlock.push('    with (context) {');
      }

      fnBlock.push(blocks.join(""));
      if (this.context) fnBlock.push('    }');
      if (this.subject) fnBlock.push('  }');
      fnBlock.push('  return ', nodeCount, ';');
      fnBlock.push('})');
      var self = this;
      var js = fnBlock.join("");
      js = js.replace('__SELF__JS__', js.replace(/\'/g, '\\\''));
      this.renderDOM = exports.EVAL.compileDOM(js, RT.makeDOMRuntime(exports.EVAL, {
        self: self,
        compiled: this.subject.__dom
      }));
    },
    generateDOM: function generateDOM(path, blocks, args) {
      if (this.listeners || this.props) this.generateNodePath(path, blocks);

      if (this.listeners) {
        for (var i = 0; i < this.listeners.length; i += 2) {
          var val = this.listeners[i + 1];
          var arg = generateArg(val, path, args);
          blocks.push('node.addEventListener("', this.listeners[i], '", __bind__(this, ', arg, '), false);');
        }
      }

      if (this.props) {
        for (var name in this.props) {
          var val = this.props[name];
          var arg = generateArg(val, path, args);
          blocks.push('node.', name, ' = ', arg, ';');
        }
      }

      this.generateChildDOM(path, blocks, args);
      return 1;
    },
    generateNodePath: function generateNodePath(path, blocks) {
      blocks.push("        node = __path__(root, o");

      for (var i = 0; i < path.length; ++i) {
        blocks.push(",", path[i]);
      }

      blocks.push(");");
    },
    generateChildDOM: function generateChildDOM(path, blocks, args) {
      path.push(0);

      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i];
        if (isTag(child)) path[path.length - 1] += '+' + child.tag.generateDOM(path, blocks, args);else path[path.length - 1] += '+1';
      }

      path.pop();
    }
  };
  DomplateEmbed.prototype = copyObject(DomplateTag.prototype, {
    merge: function merge(args, oldTag) {
      this.value = oldTag ? oldTag.value : parseValue(args[0]);
      this.attrs = oldTag ? oldTag.attrs : {};
      this.vars = oldTag ? copyArray(oldTag.vars) : [];
      var attrs = args[1];

      for (var name in attrs) {
        var val = parseValue(attrs[name]);
        this.attrs[name] = val;
        readPartNames(val, this.vars);
      }

      var retval = creator(this, DomplateEmbed);
      return retval;
    },
    getVarNames: function getVarNames(names) {
      if (this.value instanceof Parts) names.push(this.value.parts[0].name);
      if (this.vars) names.push.apply(names, this.vars);
    },
    generateMarkup: function generateMarkup(topBlock, topOuts, blocks, info) {
      this.addCode(topBlock, topOuts, blocks);
      blocks.push('__link__(');
      addParts(this.value, '', blocks, info);
      blocks.push(', __code__, __out__, {');
      var lastName = null;

      for (var name in this.attrs) {
        if (lastName) blocks.push(',');
        lastName = name;
        var val = this.attrs[name];
        blocks.push('"', name, '":');
        addParts(val, '', blocks, info);
      }

      blocks.push('});');
    },
    generateDOM: function generateDOM(path, blocks, args) {
      var embedName = 'e' + path.embedIndex++;
      this.generateNodePath(path, blocks);
      var valueName = 'd' + path.renderIndex++;
      var argsName = 'd' + path.renderIndex++;
      blocks.push('        ', embedName + ' = __link__(node, ', valueName, ', ', argsName, ');');
      return embedName;
    }
  });
  DomplateLoop.prototype = copyObject(DomplateTag.prototype, {
    merge: function merge(args, oldTag) {
      this.varName = oldTag ? oldTag.varName : args[0];
      this.iter = oldTag ? oldTag.iter : parseValue(args[1]);
      this.vars = [];
      this.children = oldTag ? copyArray(oldTag.children) : [];
      var offset = Math.min(args.length, 2);
      parseChildren(args, offset, this.vars, this.children);
      var retval = creator(this, DomplateLoop);
      return retval;
    },
    getVarNames: function getVarNames(names) {
      if (this.iter instanceof Parts) names.push(this.iter.parts[0].name);
      DomplateTag.prototype.getVarNames.apply(this, [names]);
    },
    generateMarkup: function generateMarkup(topBlock, topOuts, blocks, info) {
      this.addCode(topBlock, topOuts, blocks);
      var iterName;

      if (this.iter instanceof Parts) {
        var part = this.iter.parts[0];
        iterName = part.names.join(',');

        if (part.format) {
          for (var i = 0; i < part.format.length; ++i) {
            iterName = part.format[i] + "(" + iterName + ")";
          }
        }
      } else {
        iterName = this.iter;
      }

      blocks.push('    __loop__.apply(this, [', iterName, ', __out__, function(', this.varName, ', __out__) {');
      this.generateChildMarkup(topBlock, topOuts, blocks, info);
      this.addCode(topBlock, topOuts, blocks);
      blocks.push('    }]);');
    },
    generateDOM: function generateDOM(path, blocks, args) {
      var iterName = 'd' + path.renderIndex++;
      var counterName = 'i' + path.loopIndex;
      var loopName = 'l' + path.loopIndex++;
      if (!path.length) path.push(-1, 0);
      var preIndex = path.renderIndex;
      path.renderIndex = 0;
      var nodeCount = 0;
      var subBlocks = [];
      var basePath = path[path.length - 1];

      for (var i = 0; i < this.children.length; ++i) {
        path[path.length - 1] = basePath + '+' + loopName + '+' + nodeCount;
        var child = this.children[i];
        if (isTag(child)) nodeCount += '+' + child.tag.generateDOM(path, subBlocks, args);else nodeCount += '+1';
      }

      path[path.length - 1] = basePath + '+' + loopName;
      blocks.push('      ', loopName, ' = __loop__.apply(this, [', iterName, ', function(', counterName, ',', loopName);

      for (var i = 0; i < path.renderIndex; ++i) {
        blocks.push(',d' + i);
      }

      blocks.push(') {');
      blocks.push(subBlocks.join(""));
      blocks.push('        return ', nodeCount, ';');
      blocks.push('      }]);');
      path.renderIndex = preIndex;
      return loopName;
    }
  });
  DomplateIf.prototype = copyObject(DomplateTag.prototype, {
    merge: function merge(args, oldTag) {
      this.booleanVar = oldTag ? oldTag.booleanVar : parseValue(args[0]);
      this.vars = [];
      this.children = oldTag ? copyArray(oldTag.children) : [];
      var offset = Math.min(args.length, 1);
      parseChildren(args, offset, this.vars, this.children);
      var retval = creator(this, DomplateIf);
      return retval;
    },
    getVarNames: function getVarNames(names) {
      if (this.booleanVar instanceof Parts) names.push(this.booleanVar.parts[0].name);
      DomplateTag.prototype.getVarNames.apply(this, [names]);
    },
    generateMarkup: function generateMarkup(topBlock, topOuts, blocks, info) {
      this.addCode(topBlock, topOuts, blocks);
      var expr;

      if (this.booleanVar instanceof Parts) {
        var part = this.booleanVar.parts[0];
        expr = part.names.join(',');

        if (part.format) {
          for (var i = 0; i < part.format.length; ++i) {
            expr = part.format[i] + "(" + expr + ")";
          }
        }
      } else {
        expr = this.booleanVar;
      }

      blocks.push('__if__.apply(this, [', expr, ', __out__, function(__out__) {');
      this.generateChildMarkup(topBlock, topOuts, blocks, info);
      this.addCode(topBlock, topOuts, blocks);
      blocks.push('}]);');
    },
    generateDOM: function generateDOM(path, blocks, args) {
      var controlName = 'd' + path.renderIndex++;
      var ifName = 'if_' + path.ifIndex++;
      if (!path.length) path.push(-1, 0);
      var preIndex = path.renderIndex;
      path.renderIndex = 0;
      var nodeCount = 0;
      var subBlocks = [];

      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i];
        if (isTag(child)) nodeCount += '+' + child.tag.generateDOM(path, subBlocks, args);else nodeCount += '+1';
      }

      blocks.push('      ', ifName, ' = __if__.apply(this, [', controlName, ', function(', ifName);

      for (var i = 0; i < path.renderIndex; ++i) {
        blocks.push(',d' + i);
      }

      blocks.push(') {');
      blocks.push(subBlocks.join(""));
      blocks.push('      }]);');
      path.renderIndex = preIndex;
      return controlName;
    }
  });

  function Variables(names, format) {
    this.names = names;
    this.format = format;
  }

  function Parts(parts) {
    this.parts = parts;
  }

  function parseParts(str) {
    var index = 0;
    var parts = [];
    var m;
    var re = /\$([_A-Za-z][$_A-Za-z0-9.,|]*)/g;

    while (m = re.exec(str)) {
      var pre = str.substr(index, re.lastIndex - m[0].length - index);
      if (pre) parts.push(pre);
      var segs = m[1].split("|");
      var vars = segs[0].split(",$");
      parts.push(new Variables(vars, segs.splice(1)));
      index = re.lastIndex;
    }

    if (!index) {
      return str;
    }

    var post = str.substr(index);
    if (post) parts.push(post);
    var retval = new Parts(parts);
    return retval;
  }

  function parseValue(val) {
    return typeof val == 'string' ? parseParts(val) : val;
  }

  function parseChildren(args, offset, vars, children) {
    for (var i = offset; i < args.length; ++i) {
      var val = parseValue(args[i]);
      children.push(val);
      readPartNames(val, vars);
    }
  }

  function readPartNames(val, vars) {
    if (val instanceof Parts) {
      for (var i = 0; i < val.parts.length; ++i) {
        var part = val.parts[i];
        if (part instanceof Variables) vars.push(part.names[0]);
      }
    }
  }

  function generateArg(val, path, args) {
    if (val instanceof Parts) {
      var vals = [];

      for (var i = 0; i < val.parts.length; ++i) {
        var part = val.parts[i];

        if (part instanceof Variables) {
          var varName = 'd' + path.renderIndex++;

          if (part.format) {
            for (var j = 0; j < part.format.length; ++j) {
              varName = part.format[j] + '(' + varName + ')';
            }
          }

          vals.push(varName);
        } else vals.push('"' + part.replace(/"/g, '\\"') + '"');
      }

      return vals.join('+');
    } else {
      args.push(val);
      return 's' + path.staticIndex++;
    }
  }

  function addParts(val, delim, block, info, escapeIt) {
    var vals = [];

    if (val instanceof Parts) {
      for (var i = 0; i < val.parts.length; ++i) {
        var part = val.parts[i];

        if (part instanceof Variables) {
          var partName = part.names.join(",");

          if (part.format) {
            for (var j = 0; j < part.format.length; ++j) {
              partName = part.format[j] + "(" + partName + ")";
            }
          }

          if (escapeIt) vals.push("__escape__(" + partName + ")");else vals.push(partName);
        } else vals.push('"' + part + '"');
      }
    } else if (isTag(val)) {
      info.args.push(val);
      vals.push('s' + info.argIndex++);
    } else vals.push('"' + val + '"');

    var parts = vals.join(delim);
    if (parts) block.push(delim, parts);
  }

  function isTag(obj) {
    return (typeof obj == "function" || obj instanceof Function) && !!obj.tag;
  }

  function creator(tag, cons) {
    var fn = function fn() {
      var tag = arguments.callee.tag;
      var cons = arguments.callee.cons;
      var newTag = new cons();
      return newTag.merge(arguments, tag);
    };

    fn.tag = tag;
    fn.cons = cons;
    extend(fn, Renderer);
    return fn;
  }

  function defineTags() {
    Array.from(arguments).forEach(function (tagName) {
      var fnName = tagName.toUpperCase();

      exports.tags[fnName] = function () {
        var newTag = new this._domplate_.DomplateTag(tagName);
        return newTag.merge(arguments);
      };
    });
  }

  defineTags("a", "button", "br", "canvas", "col", "colgroup", "div", "fieldset", "form", "h1", "h2", "h3", "hr", "img", "input", "label", "legend", "li", "ol", "optgroup", "option", "p", "pre", "select", "span", "strong", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "tr", "tt", "ul");
}

exports.domplate = {};
Domplate(exports.domplate);

exports.domplate.ensureLoader = function () {
  if (typeof window !== "undefined" && window.PINF) {
    return window.PINF;
  }

  var PINF = _require_("pinf-loader-js/loader.browser");

  return window.PINF;
};

exports.domplate.loadRep = function (url, options, successCallback, errorCallback) {
  if (typeof options === "function") {
    errorCallback = successCallback;
    successCallback = options;
    options = {};
  }

  var PINF = exports.domplate.ensureLoader();
  return PINF.sandbox(url + ".rep", function (sandbox) {
    var rep = sandbox.main(exports.domplate, options);
    successCallback(rep);
  }, errorCallback);
};
},{"./renderer":2,"./rt":3,"./util":4,"pinf-loader-js/loader.browser":6}],2:[function(_require_,module,exports){

var Renderer = exports.Renderer = {
  checkDebug: function checkDebug() {},
  renderHTML: function renderHTML(args, outputs, self) {
    var code = [];
    var markupArgs = [code, this.tag.context ? this.tag.context : null, args, outputs];
    markupArgs.push.apply(markupArgs, this.tag.markupArgs);
    this.tag.renderMarkup.apply(self ? self : this.tag.subject, markupArgs);

    if (this.tag.resources && this.tag.subject._resourceListener) {
      this.tag.subject._resourceListener.register(this.tag.resources);
    }

    return code.join("");
  },
  insertRows: function insertRows(args, before, self) {
    this.tag.compile();
    var outputs = [];
    var html = this.renderHTML(args, outputs, self);
    var doc = before.ownerDocument;
    var table = doc.createElement("table");
    table.innerHTML = html;
    var tbody = table.firstChild;
    var parent = before.localName == "TR" ? before.parentNode : before;
    var after = before.localName == "TR" ? before.nextSibling : null;
    var firstRow = tbody.firstChild,
        lastRow;

    while (tbody.firstChild) {
      lastRow = tbody.firstChild;
      if (after) parent.insertBefore(lastRow, after);else parent.appendChild(lastRow);
    }

    var offset = 0;

    if (before.localName == "TR") {
      var node = firstRow.parentNode.firstChild;

      for (; node && node != firstRow; node = node.nextSibling) {
        ++offset;
      }
    }

    var domArgs = [firstRow, this.tag.context, offset];
    domArgs.push.apply(domArgs, this.tag.domArgs);
    domArgs.push.apply(domArgs, outputs);
    this.tag.renderDOM.apply(self ? self : this.tag.subject, domArgs);
    return [firstRow, lastRow];
  },
  insertAfter: function insertAfter(args, before, self) {
    this.tag.compile();
    var outputs = [];
    var html = this.renderHTML(args, outputs, self);
    var doc = before.ownerDocument;
    var range = doc.createRange();
    range.selectNode(doc.body);
    var frag = range.createContextualFragment(html);
    var root = frag.firstChild;
    if (before.nextSibling) before.parentNode.insertBefore(frag, before.nextSibling);else before.parentNode.appendChild(frag);
    var domArgs = [root, this.tag.context, 0];
    domArgs.push.apply(domArgs, this.tag.domArgs);
    domArgs.push.apply(domArgs, outputs);
    this.tag.renderDOM.apply(self ? self : this.tag.subject ? this.tag.subject : null, domArgs);
    return root;
  },
  replace: function replace(args, parent, self) {
    this.tag.compile();
    var outputs = [];
    var html = this.renderHTML(args, outputs, self);
    var root;

    if (parent.nodeType == 1) {
      parent.innerHTML = html;
      root = parent.firstChild;
    } else {
      if (!parent || parent.nodeType != 9) parent = document;
      if (!womb || womb.ownerDocument != parent) womb = parent.createElement("div");
      womb.innerHTML = html;
      root = womb.firstChild;
    }

    var domArgs = [root, this.tag.context ? this.tag.context : null, 0];
    domArgs.push.apply(domArgs, this.tag.domArgs);
    domArgs.push.apply(domArgs, outputs);
    this.tag.renderDOM.apply(self ? self : this.tag.subject, domArgs);
    return root;
  },
  append: function append(args, parent, self) {
    this.tag.compile();
    var outputs = [];
    var html = this.renderHTML(args, outputs, self);
    if (!womb || womb.ownerDocument != parent.ownerDocument) womb = parent.ownerDocument.createElement("div");
    womb.innerHTML = html;
    root = womb.firstChild;

    while (womb.firstChild) {
      parent.appendChild(womb.firstChild);
    }

    var domArgs = [root, this.tag.context, 0];
    domArgs.push.apply(domArgs, this.tag.domArgs);
    domArgs.push.apply(domArgs, outputs);
    this.tag.renderDOM.apply(self ? self : this.tag.subject, domArgs);
    return root;
  },
  render: function render(args, self) {
    this.tag.compile();
    var outputs = [];
    var html = this.renderHTML(args, outputs, self);
    return html;
  }
};
},{}],3:[function(_require_,module,exports){

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ArrayIterator(array) {
  var index = -1;

  this.next = function () {
    if (++index >= array.length) throw StopIteration;
    return array[index];
  };
}

function StopIteration() {}

exports.makeMarkupRuntime = function (EVAL, context) {
  var self = context.self;
  var tagName = null;
  Object.keys(self.subject).forEach(function (name) {
    if (self.subject[name].tag === self) {
      tagName = name;
    }
  });

  if (!tagName) {
    throw new Error("Unable to determine 'tagName'!");
  }

  var exports = {};
  exports.compiled = context.compiled && context.compiled[tagName] || null;

  exports.__link__ = function (tag, code, outputs, args) {
    if (!tag) {
      return;
    }

    if (!tag.tag) {
      return;
    }

    if (!exports.compiled && EVAL.onMarkupCode) {
      return;
    }

    tag.tag.compile();

    if (self.resources && tag.tag.resources && tag.tag.resources !== self.resources) {
      for (var key in tag.tag.resources) {
        self.resources[key] = tag.tag.resources[key];
      }
    }

    var tagOutputs = [];
    var markupArgs = [code, tag.tag.context ? tag.tag.context : null, args, tagOutputs];
    markupArgs.push.apply(markupArgs, tag.tag.markupArgs);
    tag.tag.renderMarkup.apply(tag.tag.subject, markupArgs);
    outputs.push(tag);
    outputs.push(tagOutputs);
  };

  exports.__escape__ = function (value) {
    function replaceChars(ch) {
      switch (ch) {
        case "<":
          return "&lt;";

        case ">":
          return "&gt;";

        case "&":
          return "&amp;";

        case "'":
          return "&#39;";

        case '"':
          return "&quot;";
      }

      return "?";
    }

    ;
    return String(value).replace(/[<>&"']/g, replaceChars);
  };

  exports.__loop__ = function (iter, outputs, fn) {
    var iterOuts = [];
    outputs.push(iterOuts);

    if (iter instanceof Array || typeof iter === "array" || Array.isArray(iter)) {
      iter = new ArrayIterator(iter);
    }

    try {
      if (!iter || !iter.next) {
        console.error("Cannot iterate loop", iter, _typeof(iter), outputs, fn);
        throw new Error("Cannot iterate loop as iter.next() method is not defined");
      }

      while (1) {
        var value = iter.next();
        var itemOuts = [0, 0];
        iterOuts.push(itemOuts);
        fn.apply(this, [value, itemOuts]);
      }
    } catch (exc) {
      if (exc != StopIteration) throw exc;
    }
  };

  exports.__if__ = function (booleanVar, outputs, fn) {
    var ifControl = [];
    outputs.push(ifControl);

    if (booleanVar) {
      ifControl.push(1);
      fn.apply(this, [ifControl]);
    } else {
      ifControl.push(0);
    }
  };

  return exports;
};

exports.makeDOMRuntime = function (EVAL, context) {
  var self = context.self;
  var tagName = null;
  Object.keys(self.subject).forEach(function (name) {
    if (self.subject[name].tag === self) {
      tagName = name;
    }
  });

  if (!tagName) {
    throw new Error("Unable to determine 'tagName'!");
  }

  var exports = {};
  exports.compiled = context.compiled && context.compiled[tagName] || null;

  exports.__bind__ = function (object, fn) {
    return function (event) {
      return fn.apply(object, [event]);
    };
  };

  exports.__link__ = function (node, tag, args) {
    if (!tag) {
      return 0;
    }

    if (!tag.tag) {
      return 0;
    }

    if (!exports.compiled && EVAL.onMarkupCode) {
      return 0;
    }

    tag.tag.compile();
    var domArgs = [node, tag.tag.context ? tag.tag.context : null, 0];
    domArgs.push.apply(domArgs, tag.tag.domArgs);
    domArgs.push.apply(domArgs, args);
    var oo = tag.tag.renderDOM.apply(tag.tag.subject, domArgs);
    return oo;
  };

  exports.__loop__ = function (iter, fn) {
    if (!Array.isArray(iter)) {
      return 0;
    }

    var nodeCount = 0;

    for (var i = 0; i < iter.length; ++i) {
      iter[i][0] = i;
      iter[i][1] = nodeCount;
      nodeCount += fn.apply(this, iter[i]);
    }

    return nodeCount;
  };

  exports.__if__ = function (control, fn) {
    if (control && control[0]) {
      fn.apply(this, [0, control[1]]);
    } else {}
  };

  exports.__path__ = function (parent, offset) {
    var root = parent;

    for (var i = 2; i < arguments.length; ++i) {
      var index = arguments[i];
      if (i == 3) index += offset;

      if (index == -1) {
        parent = parent.parentNode;
      } else {
        parent = parent.childNodes[index];
      }
    }

    return parent;
  };

  return exports;
};
},{}],4:[function(_require_,module,exports){

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var FBTrace = {};
exports.merge = _require_("deepmerge");

exports.escapeNewLines = function (value) {
  return value.replace(/\r/gm, "\\r").replace(/\n/gm, "\\n");
};

exports.stripNewLines = function (value) {
  return typeof value == "string" ? value.replace(/[\r\n]/gm, " ") : value;
};

exports.escapeJS = function (value) {
  return value.replace(/\r/gm, "\\r").replace(/\n/gm, "\\n").replace('"', '\\"', "g");
};

exports.cropString = function (text, limit, alterText) {
  if (!alterText) alterText = "...";
  text = text + "";
  if (!limit) limit = 50;
  var halfLimit = limit / 2;
  halfLimit -= 2;
  if (text.length > limit) return text.substr(0, halfLimit) + alterText + text.substr(text.length - halfLimit);else return text;
};

exports.cropStringLeft = function (text, limit, alterText) {
  if (!alterText) alterText = "...";
  text = text + "";
  if (!limit) limit = 50;
  limit -= alterText.length;
  if (text.length > limit) return alterText + text.substr(text.length - limit);else return text;
};

exports.hasClass = function (node, name) {
  if (!node || node.nodeType != 1) return false;else {
    for (var i = 1; i < arguments.length; ++i) {
      var name = arguments[i];
      var re = new RegExp("(^|\\s)" + name + "($|\\s)");
      if (!re.exec(node.getAttribute("class"))) return false;
    }

    return true;
  }
};

exports.setClass = function (node, name) {
  if (node && !exports.hasClass(node, name)) node.className += " " + name;
};

exports.getClassValue = function (node, name) {
  var re = new RegExp(name + "-([^ ]+)");
  var m = re.exec(node.className);
  return m ? m[1] : "";
};

exports.removeClass = function (node, name) {
  if (node && node.className) {
    var index = node.className.indexOf(name);

    if (index >= 0) {
      var size = name.length;
      node.className = node.className.substr(0, index - 1) + node.className.substr(index + size);
    }
  }
};

exports.toggleClass = function (elt, name) {
  if (exports.hasClass(elt, name)) exports.removeClass(elt, name);else exports.setClass(elt, name);
};

exports.setClassTimed = function (elt, name, context, timeout) {
  if (!timeout) timeout = 1300;
  if (elt.__setClassTimeout) context.clearTimeout(elt.__setClassTimeout);else exports.setClass(elt, name);

  if (!exports.isVisible(elt)) {
    if (elt.__invisibleAtSetPoint) elt.__invisibleAtSetPoint--;else elt.__invisibleAtSetPoint = 5;
  } else {
    delete elt.__invisibleAtSetPoint;
  }

  elt.__setClassTimeout = context.setTimeout(function () {
    delete elt.__setClassTimeout;
    if (elt.__invisibleAtSetPoint) exports.setClassTimed(elt, name, context, timeout);else {
      delete elt.__invisibleAtSetPoint;
      exports.removeClass(elt, name);
    }
  }, timeout);
};

exports.cancelClassTimed = function (elt, name, context) {
  if (elt.__setClassTimeout) {
    exports.removeClass(elt, name);
    context.clearTimeout(elt.__setClassTimeout);
    delete elt.__setClassTimeout;
  }
};

exports.$ = function (id, doc) {
  if (doc) return doc.getElementById(id);else return document.getElementById(id);
};

exports.getChildByClass = function (node) {
  for (var i = 1; i < arguments.length; ++i) {
    var className = arguments[i];
    var child = node.firstChild;
    node = null;

    for (; child; child = child.nextSibling) {
      if (exports.hasClass(child, className)) {
        node = child;
        break;
      }
    }
  }

  return node;
};

exports.getAncestorByClass = function (node, className) {
  for (var parent = node; parent; parent = parent.parentNode) {
    if (exports.hasClass(parent, className)) return parent;
  }

  return null;
};

exports.getElementByClass = function (node, className) {
  var args = cloneArray(arguments);
  args.splice(0, 1);
  var className = args.join(" ");
  var elements = node.getElementsByClassName(className);
  return elements[0];
};

exports.getElementsByClass = function (node, className) {
  var args = cloneArray(arguments);
  args.splice(0, 1);
  var className = args.join(" ");
  return node.getElementsByClassName(className);
};

exports.getElementsByAttribute = function (node, attrName, attrValue) {
  function iteratorHelper(node, attrName, attrValue, result) {
    for (var child = node.firstChild; child; child = child.nextSibling) {
      if (child.getAttribute(attrName) == attrValue) result.push(child);
      iteratorHelper(child, attrName, attrValue, result);
    }
  }

  var result = [];
  iteratorHelper(node, attrName, attrValue, result);
  return result;
};

exports.isAncestor = function (node, potentialAncestor) {
  for (var parent = node; parent; parent = parent.parentNode) {
    if (parent == potentialAncestor) return true;
  }

  return false;
};

exports.getNextElement = function (node) {
  while (node && node.nodeType != 1) {
    node = node.nextSibling;
  }

  return node;
};

exports.getPreviousElement = function (node) {
  while (node && node.nodeType != 1) {
    node = node.previousSibling;
  }

  return node;
};

exports.getBody = function (doc) {
  if (doc.body) return doc.body;
  var body = doc.getElementsByTagName("body")[0];
  if (body) return body;
  return doc.documentElement;
};

exports.findNextDown = function (node, criteria) {
  if (!node) return null;

  for (var child = node.firstChild; child; child = child.nextSibling) {
    if (criteria(child)) return child;
    var next = exports.findNextDown(child, criteria);
    if (next) return next;
  }
};

exports.findPreviousUp = function (node, criteria) {
  if (!node) return null;

  for (var child = node.lastChild; child; child = child.previousSibling) {
    var next = exports.findPreviousUp(child, criteria);
    if (next) return next;
    if (criteria(child)) return child;
  }
};

exports.findNext = function (node, criteria, upOnly, maxRoot) {
  if (!node) return null;

  if (!upOnly) {
    var next = exports.findNextDown(node, criteria);
    if (next) return next;
  }

  for (var sib = node.nextSibling; sib; sib = sib.nextSibling) {
    if (criteria(sib)) return sib;
    var next = exports.findNextDown(sib, criteria);
    if (next) return next;
  }

  if (node.parentNode && node.parentNode != maxRoot) return exports.findNext(node.parentNode, criteria, true);
};

exports.findPrevious = function (node, criteria, downOnly, maxRoot) {
  if (!node) return null;

  for (var sib = node.previousSibling; sib; sib = sib.previousSibling) {
    var prev = exports.findPreviousUp(sib, criteria);
    if (prev) return prev;
    if (criteria(sib)) return sib;
  }

  if (!downOnly) {
    var next = exports.findPreviousUp(node, criteria);
    if (next) return next;
  }

  if (node.parentNode && node.parentNode != maxRoot) {
    if (criteria(node.parentNode)) return node.parentNode;
    return exports.findPrevious(node.parentNode, criteria, true);
  }
};

exports.getNextByClass = function (root, state) {
  function iter(node) {
    return node.nodeType == 1 && exports.hasClass(node, state);
  }

  return exports.findNext(root, iter);
};

exports.getPreviousByClass = function (root, state) {
  function iter(node) {
    return node.nodeType == 1 && exports.hasClass(node, state);
  }

  return exports.findPrevious(root, iter);
};

exports.hasChildElements = function (node) {
  if (node.contentDocument) return true;

  for (var child = node.firstChild; child; child = child.nextSibling) {
    if (child.nodeType == 1) return true;
  }

  return false;
};

exports.isElement = function (o) {
  try {
    return o && o instanceof Element;
  } catch (ex) {
    return false;
  }
};

exports.isNode = function (o) {
  try {
    return o && o instanceof Node;
  } catch (ex) {
    return false;
  }
};

exports.cancelEvent = function (event) {
  event.stopPropagation();
  event.preventDefault();
};

exports.isLeftClick = function (event) {
  return event.button == 0 && exports.noKeyModifiers(event);
};

exports.isMiddleClick = function (event) {
  return event.button == 1 && exports.noKeyModifiers(event);
};

exports.isRightClick = function (event) {
  return event.button == 2 && exports.noKeyModifiers(event);
};

exports.noKeyModifiers = function (event) {
  return !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;
};

exports.isControlClick = function (event) {
  return event.button == 0 && exports.isControl(event);
};

exports.isShiftClick = function (event) {
  return event.button == 0 && exports.isShift(event);
};

exports.isControl = function (event) {
  return (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey;
};

exports.isControlShift = function (event) {
  return (event.metaKey || event.ctrlKey) && event.shiftKey && !event.altKey;
};

exports.isShift = function (event) {
  return event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey;
};

exports.bind = function () {
  var args = cloneArray(arguments),
      fn = args.shift(),
      object = args.shift();
  return function () {
    return fn.apply(object, arrayInsert(cloneArray(args), 0, arguments));
  };
};

exports.bindFixed = function () {
  var args = cloneArray(arguments),
      fn = args.shift(),
      object = args.shift();
  return function () {
    return fn.apply(object, args);
  };
};

exports.extend = function (l, r) {
  var newOb = {};

  for (var n in l) {
    newOb[n] = l[n];
  }

  for (var n in r) {
    newOb[n] = r[n];
  }

  return newOb;
};

exports.keys = function (map) {
  var keys = [];

  try {
    for (var name in map) {
      keys.push(name);
    }
  } catch (exc) {}

  return keys;
};

exports.values = function (map) {
  var values = [];

  try {
    for (var name in map) {
      try {
        values.push(map[name]);
      } catch (exc) {
        if (FBTrace.DBG_ERRORS) FBTrace.dumpPropreties("lib.values FAILED ", exc);
      }
    }
  } catch (exc) {
    if (FBTrace.DBG_ERRORS) FBTrace.dumpPropreties("lib.values FAILED ", exc);
  }

  return values;
};

exports.remove = function (list, item) {
  for (var i = 0; i < list.length; ++i) {
    if (list[i] == item) {
      list.splice(i, 1);
      break;
    }
  }
};

exports.sliceArray = function (array, index) {
  var slice = [];

  for (var i = index; i < array.length; ++i) {
    slice.push(array[i]);
  }

  return slice;
};

function cloneArray(array, fn) {
  var newArray = [];
  if (fn) for (var i = 0; i < array.length; ++i) {
    newArray.push(fn(array[i]));
  } else for (var i = 0; i < array.length; ++i) {
    newArray.push(array[i]);
  }
  return newArray;
}

function extendArray(array, array2) {
  var newArray = [];
  newArray.push.apply(newArray, array);
  newArray.push.apply(newArray, array2);
  return newArray;
}

exports.extendArray = extendArray;
exports.cloneArray = cloneArray;

function arrayInsert(array, index, other) {
  for (var i = 0; i < other.length; ++i) {
    array.splice(i + index, 0, other[i]);
  }

  return array;
}

exports.arrayInsert = arrayInsert;

exports.isArrayLike = function (object) {
  return Object.prototype.toString.call(object) == "[object Array]" || exports.isArguments(object);
};

exports.isArguments = function (object) {
  if (Object.prototype.toString.call(object) == "[object Arguments]") return true;
  if (!_typeof(object) == "object" || !Object.prototype.hasOwnProperty.call(object, 'callee') || !object.callee || Object.prototype.toString.call(object.callee) !== '[object Function]' || typeof object.length != 'number') return false;

  for (var name in object) {
    if (name === 'callee' || name === 'length') return false;
  }

  return true;
};
},{"deepmerge":5}],5:[function(_require_,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.deepmerge = factory());
}(this, (function () { 'use strict';

var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		Object.keys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	Object.keys(source).forEach(function(key) {
		if (!options.isMergeableObject(source[key]) || !target[key]) {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		} else {
			destination[key] = deepmerge(target[key], source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

return deepmerge_1;

})));

},{}],6:[function(_require_,module,exports){
/**
 * Author: Christoph Dorn <christoph@christophdorn.com>
 * License: Zero-Clause BSD - https://opensource.org/licenses/0BSD
**/

exports.PINF = (function (global) {

	if (!global || typeof global !== "object") {
		throw new Error("No root object scope provided!");
	}

	// If `PINF` gloabl already exists, don't do anything to change it.
	if (typeof global.PINF !== "undefined") {
		return global.PINF;
	}

	const LOADER = _require_('./loader');

	const PINF = LOADER.Loader({
		document: global.document
	});

	global.PINF = PINF;

	// Attach postMessage handler to listen for sandbox load triggers.
	// This is useful in Web Workers where only the loader must be loaded and
	// sandboxes can then be loaded like this:
	//    worker.postMessage(URIJS("notify://pinf-loader-js/sandbox/load").addSearch("uri", uri).toString())
	if (typeof global.addEventListener === "function") {
		global.addEventListener("message", function (event) {
			var m = null;
			if (
				typeof event.data === "string" &&
				(m = event.data.match(/^notify:\/\/pinf-loader-js\/sandbox\/load\?uri=(.+)$/)) &&
				(m = decodeURIComponent(m[1])) &&
				// SECURITY: Only allow URIs that begin with `/` so that scripts may NOT
				//           be loaded cross-domain this way. If this was allowed one could
				//           load malicious code simply by posting a message to this window.
				/^\/[^\/]/.test(m)
			) {
				return PINF.sandbox(m, function (sandbox) {
		            sandbox.main();
					if (typeof global.postMessage === "function") {
						global.postMessage(event.data.replace("/load?", "/loaded?"));
					}
		        }, function (err) {
		        	// TODO: Post error back to main frame instead of throwing?
		        	throw err;
		        });
			}
		}, false);
	}

	return global.PINF;
}(
	typeof window !== "undefined" ?
		// Used in the browser
		window :
		typeof self !== "undefined" ?
			// Used in web worker
			self :
			// No root scope variable found
			null
));

},{"./loader":7}],7:[function(_require_,module,exports){
/**
 * Author: Christoph Dorn <christoph@christophdorn.com>
 * License: Zero-Clause BSD - https://opensource.org/licenses/0BSD
**/

(function (exports) {

// The global `require` for the 'external' (to the loader) environment.
var Loader = function (global) {

	var loadedBundles = [],
		// @see https://github.com/unscriptable/curl/blob/62caf808a8fd358ec782693399670be6806f1845/src/curl.js#L69
		readyStates = { 'loaded': 1, 'interactive': 1, 'complete': 1 },
		lastModule = null,
		headTag = null;

	// For older browsers that don't have `Object.keys()` (Firefox 3.6)
	function keys(obj) {
		var keys = [];
		for (var key in obj) {
			keys.push(key);
		}
		return keys;
	}

	// TODO: Use 'Object.create()` in modern browsers
	function create (proto) {
		function F() {}
		F.prototype = proto;
		return new F();
	};

	function normalizeSandboxArguments (implementation) {
		return function (programIdentifier, options, loadedCallback, errorCallback) {
			/*DEBUG*/ if (typeof options === "function" && typeof loadedCallback === "object") {
			/*DEBUG*/     throw new Error("Callback before options for `require.sandbox(programIdentifier, options, loadedCallback)`");
			/*DEBUG*/ }
			if (typeof options === "function" && !loadedCallback && !errorCallback) {
				loadedCallback = options;
				options = {};
			} else
			if (typeof options === "function" && typeof loadedCallback === "function" && !errorCallback) {
				errorCallback = loadedCallback;
				loadedCallback = options;
				options = {};
			} else {
				options = options || {};
			}
			implementation(programIdentifier, options, loadedCallback, errorCallback);
		};
	}

	// @credit https://github.com/unscriptable/curl/blob/62caf808a8fd358ec782693399670be6806f1845/src/curl.js#L319-360
	function loadInBrowser (uri, loadedCallback, sandboxOptions) {
		try {
			// See if we are in a web worker.
			if (typeof importScripts !== "undefined") {
				importScripts(uri.replace(/^\/?\{host\}/, ""));
				return loadedCallback(null);
			}
			var document = global.document;
			/*DEBUG*/ if (!document) {
			/*DEBUG*/ 	throw new Error("Unable to get reference to 'document'!");
			/*DEBUG*/ }
			var location = document.location;
			if (/^\/?\{host\}\//.test(uri)) {
				uri = location.protocol + "//" + location.host + uri.replace(/^\/?\{host\}/, "");
			} else
			if (/^\/\//.test(uri)) {
				uri = location.protocol + uri;
			}
			if (!headTag) {
				headTag = document.getElementsByTagName("head")[0];
			}
			var element = document.createElement("script");
			element.type = "text/javascript";
			element.onload = element.onreadystatechange = function (ev) {
				ev = ev || global.event;
				if (ev.type === "load" || readyStates[this.readyState]) {
					this.onload = this.onreadystatechange = this.onerror = null;
					loadedCallback(null, function () {
						if (!sandboxOptions || sandboxOptions.keepScriptTags !== true) {
							element.parentNode.removeChild(element);
						}
					});
				}
			}
			element.onerror = function (err) {
				/*DEBUG*/ console.error(err);
				return loadedCallback(new Error("Error loading '" + uri + "'"));
			}
			element.charset = "utf-8";
			element.async = true;
			element.src = uri;
			element = headTag.insertBefore(element, headTag.firstChild);
		} catch(err) {
			loadedCallback(err);
		}
	}

	// A set of modules working together.
	var Sandbox = function (sandboxIdentifier, sandboxOptions, loadedCallback) {

		var moduleInitializers = {},
			initializedModules = {},
			/*DEBUG*/ bundleIdentifiers = {},
			packages = {},
			loadingBundles = {};

		var sandbox = {
				id: sandboxIdentifier
			};

		/*DEBUG*/ function logDebug() {
		/*DEBUG*/ 	if (sandboxOptions.debug !== true) return;
		/*DEBUG*/ 	// NOTRE: This does not work in google chrome.
		/*DEBUG*/ 	//console.log.apply(null, arguments);
		/*DEBUG*/ 	if (arguments.length === 1) {
		/*DEBUG*/ 		console.log(arguments[0]);
		/*DEBUG*/ 	} else
		/*DEBUG*/ 	if (arguments.length === 2) {
		/*DEBUG*/ 		console.log(arguments[0], arguments[1]);
		/*DEBUG*/ 	} else
		/*DEBUG*/ 	if (arguments.length === 3) {
		/*DEBUG*/ 		console.log(arguments[0], arguments[1], arguments[2]);
		/*DEBUG*/ 	} else
		/*DEBUG*/ 	if (arguments.length === 4) {
		/*DEBUG*/ 		console.log(arguments[0], arguments[1], arguments[2], arguments[3]);
		/*DEBUG*/ 	}
		/*DEBUG*/ }

		function rebaseUri (uri) {
			if (!sandboxOptions.baseUrl) {
				return uri;
			}
			return sandboxOptions.baseUrl + "/" + uri;
		}

		function load (bundleIdentifier, packageIdentifier, bundleSubPath, loadedCallback) {

			var loadSandboxIdentifier = sandboxIdentifier;
			var finalBundleIdentifier = null;
			var moduleIdentifierPrefix = "";
			var finalPackageIdentifier = "";

			try {
				if (packageIdentifier !== "") {

					if (/^@bundle:/.test(packageIdentifier)) {
						var absPackageIdentifier = packageIdentifier;
						if (/^@bundle:\./.test(absPackageIdentifier)) {
							absPackageIdentifier = absPackageIdentifier.replace(/^(@bundle:)\./, "$1" + sandboxIdentifier + "/.");
						}
						moduleIdentifierPrefix = packageIdentifier;
						finalPackageIdentifier = packageIdentifier;
						bundleIdentifier = absPackageIdentifier.replace(/^@bundle:/, "") + ".js";
						loadSandboxIdentifier = "";
						finalBundleIdentifier = "@bundle:" + packageIdentifier.replace(/^@bundle:/, "") + ".js";
					} else {
						bundleIdentifier = ("/" + packageIdentifier + "/" + bundleIdentifier).replace(/\/+/g, "/");
					}
				}

				if (initializedModules[bundleIdentifier]) {
					// Module is already loaded and initialized.
					loadedCallback(null, sandbox);
				} else {
					// Module is not initialized.
					if (loadingBundles[bundleIdentifier]) {
						// Module is already loading.
						loadingBundles[bundleIdentifier].push(loadedCallback);
					} else {
						// Module is not already loading.
						loadingBundles[bundleIdentifier] = [];

						bundleIdentifier = (loadSandboxIdentifier + bundleSubPath + bundleIdentifier).replace(/\/$/, ".js");

						bundleIdentifier = bundleIdentifier.replace(/\.php\.js$/, ".php");

						if (!finalBundleIdentifier) {
							finalBundleIdentifier = bundleIdentifier;
						}

						// Default to our script-injection browser loader.
						(sandboxOptions.rootBundleLoader || sandboxOptions.load || loadInBrowser)(
							rebaseUri(bundleIdentifier),
							function (err, cleanupCallback) {
								if (err) return loadedCallback(err);
								// The rootBundleLoader is only applicable for the first load.
								delete sandboxOptions.rootBundleLoader;
								finalizeLoad(moduleIdentifierPrefix, finalBundleIdentifier, finalPackageIdentifier, function () {
									loadedCallback(null, sandbox);
									if (cleanupCallback) {
										cleanupCallback();
									}
								});
							},
							sandboxOptions
						);
					}
				}
			} catch(err) {
				loadedCallback(err);
			}
		}

		// Called after a bundle has been loaded. Takes the top bundle off the *loading* stack
		// and makes the new modules available to the sandbox.
		function finalizeLoad (moduleIdentifierPrefix, bundleIdentifier, packageIdentifier, loadFinalized) {
			var pending = 0;
			function finalize () {
				if (pending !== 0) {
					return;
				}
				if (loadFinalized) loadFinalized();
			}

			pending += 1;

			// Assume a consistent statically linked set of modules has been memoized.
			/*DEBUG*/ if (!loadedBundles[0]) {
			/*DEBUG*/     throw new Error("No bundle memoized for '" + bundleIdentifier + "'! Check the file to ensure it contains JavaScript and that a bundle is memoized against the correct loader instance.");
			/*DEBUG*/ }
			/*DEBUG*/ bundleIdentifiers[bundleIdentifier] = loadedBundles[0][0];
			var loadedModuleInitializers = loadedBundles[0][1]({
				id: sandboxIdentifier
			});
			var key;
			for (key in loadedModuleInitializers) {

				var memoizeKey = moduleIdentifierPrefix + key;

				// If we have a package descriptor add it or merge it on top.
				if (/^[^\/]*\/package.json$/.test(key)) {

					if (sandboxOptions.rewritePackageDescriptor) {
						loadedModuleInitializers[key][0] = sandboxOptions.rewritePackageDescriptor(loadedModuleInitializers[key][0], memoizeKey);
					}

					// Load all dependent resources
					if (loadedModuleInitializers[key][0].mappings) {
						for (var alias in loadedModuleInitializers[key][0].mappings) {
							if (/^@script:\/\//.test(loadedModuleInitializers[key][0].mappings[alias])) {
								pending += 1;
								loadInBrowser(
									rebaseUri(loadedModuleInitializers[key][0].mappings[alias].replace(/^@script:/, "")),
									function () {
										pending -= 1;
										finalize();
									},
									sandboxOptions
								);
							}
						}
					}

					// NOTE: Not quite sure if we should allow agumenting package descriptors.
					//       When doing nested requires using same package we can either add all
					//		 mappings (included mappings not needed until further down the tree) to
					//       the first encounter of the package descriptor or add more mappings as
					//       needed down the road. We currently support both.

					if (moduleInitializers[memoizeKey]) {
						// TODO: Keep array of bundle identifiers instead of overwriting existing one?
						//		 Overwriting may change subsequent bundeling behaviour?
						moduleInitializers[memoizeKey][0] = bundleIdentifier;
						// Only augment (instead of replace existing values).
						if (typeof moduleInitializers[memoizeKey][1].main === "undefined") {
							moduleInitializers[memoizeKey][1].main = loadedModuleInitializers[key][0].main;
						}
						if (loadedModuleInitializers[key][0].mappings) {
							if (!moduleInitializers[memoizeKey][1].mappings) {
								moduleInitializers[memoizeKey][1].mappings = {};
							}
							for (var alias in loadedModuleInitializers[key][0].mappings) {
								if (typeof moduleInitializers[memoizeKey][1].mappings[alias] === "undefined") {
									moduleInitializers[memoizeKey][1].mappings[alias] = loadedModuleInitializers[key][0].mappings[alias];
								}
							}
						}
					} else {
						moduleInitializers[memoizeKey] = [bundleIdentifier, loadedModuleInitializers[key][0], loadedModuleInitializers[key][1]];
					}
					// Now that we have a [updated] package descriptor, re-initialize it if we have it already in cache.
					var packageIdentifier = packageIdentifier || key.split("/").shift();
					if (packages[packageIdentifier]) {
						packages[packageIdentifier].init();
					}
				}
				// Only add modules that don't already exist!
				// TODO: Log warning in debug mode if module already exists.
				if (typeof moduleInitializers[memoizeKey] === "undefined") {
					moduleInitializers[memoizeKey] = [bundleIdentifier, loadedModuleInitializers[key][0], loadedModuleInitializers[key][1]];
				}				
			}
			loadedBundles.shift();

			pending -= 1;
			finalize();

			return;
		}

		var Package = function (packageIdentifier) {
			if (packages[packageIdentifier]) {
				return packages[packageIdentifier];
			}

			var pkg = {
				id: packageIdentifier,
				descriptor: {},
				main: "/main.js",
				mappings: {},
				directories: {},
				libPath: ""
			};

			var parentModule = lastModule;

			pkg.init = function () {
				var descriptor = (moduleInitializers[packageIdentifier + "/package.json"] && moduleInitializers[packageIdentifier + "/package.json"][1]) || {};
				if (descriptor) {
					pkg.descriptor = descriptor;
					if (typeof descriptor.main === "string") {
						pkg.main = descriptor.main;
					}
					pkg.mappings = descriptor.mappings || pkg.mappings;
					pkg.directories = descriptor.directories || pkg.directories;
					// NOTE: We need `lib` directory support so that the source directory structure can be mapped
					//       into the bundle structure without modification. If this is not done, a module doing a relative _require_
					//       for a resource outside of the lib directory will not find the file.
					pkg.libPath = (typeof pkg.directories.lib !== "undefined" && pkg.directories.lib != "") ? pkg.directories.lib + "/" : pkg.libPath;
				}
			}
			pkg.init();

			function normalizeIdentifier (identifier) {
				// If we have a period (".") in the basename we want an absolute path from
				// the root of the package. Otherwise a relative path to the "lib" directory.
				if (identifier.split("/").pop().indexOf(".") === -1) {
					// We have a module relative to the "lib" directory of the package.
					identifier = identifier + ".js";
				} else
				if (!/^\//.test(identifier)) {
					// We want an absolute path for the module from the root of the package.
					identifier = "/" + identifier;
				}
				return identifier;
			}

			var Module = function (moduleIdentifier, parentModule) {

				var moduleIdentifierSegment = null;
				if (/^@bundle:/.test(moduleIdentifier)) {
					moduleIdentifierSegment = moduleIdentifier.replace(packageIdentifier, "").replace(/\/[^\/]*$/, "").split("/");
				} else {
					moduleIdentifierSegment = moduleIdentifier.replace(/\/[^\/]*$/, "").split("/");
				}

				var module = {
						id: moduleIdentifier,
						exports: {},
						parentModule: parentModule,
						bundle: null,
						pkg: packageIdentifier
					};

				function resolveIdentifier (identifier) {
					if (/\/$/.test(identifier)) {
						identifier += "index";
					}
					lastModule = module;
					// Check for plugin prefix.
					var plugin = null;
					if (/^[^!]*!/.test(identifier)) {
						var m = identifier.match(/^([^!]*)!(.+)$/);
						identifier = m[2];
						plugin = m[1];
					}
					function pluginify (id) {
						if (!plugin) return id;
						id = new String(id);
						id.plugin = plugin;
						return id;
					}
					// Check for relative module path to module within same package.
					if (/^\./.test(identifier)) {
						var segments = identifier.replace(/^\.\//, "").split("../");
						identifier = "/" + moduleIdentifierSegment.slice(1, moduleIdentifierSegment.length-segments.length+1).concat(segments[segments.length-1]).join("/");
						if (identifier === "/.") {
							return [pkg, pluginify("")];
						}
						return [pkg, pluginify(normalizeIdentifier(identifier.replace(/\/\.$/, "/")))];
					}
					var splitIdentifier = identifier.split("/");
					// Check for mapped module path to module within mapped package.
					if (typeof pkg.mappings[splitIdentifier[0]] !== "undefined") {
						return [Package(pkg.mappings[splitIdentifier[0]]), pluginify((splitIdentifier.length > 1)?normalizeIdentifier(splitIdentifier.slice(1).join("/")):"")];
					}
					/*DEBUG*/ if (!moduleInitializers["/" + normalizeIdentifier(identifier)]) {
					/*DEBUG*/     throw new Error("Descriptor for package '" + pkg.id + "' in sandbox '" + sandbox.id + "' does not declare 'mappings[\"" + splitIdentifier[0] + "\"]' property nor does sandbox have module memoized at '" + "/" + normalizeIdentifier(identifier) + "' needed to satisfy module path '" + identifier + "' in module '" + moduleIdentifier + "'!");
					/*DEBUG*/ }
					return [Package(""), pluginify("/" + normalizeIdentifier(identifier))];
				}

				// Statically link a module and its dependencies
				module.require = function (identifier) {
					identifier = resolveIdentifier(identifier);
					return identifier[0].require(identifier[1]).exports;
				};

				module.require.supports = [
					"ucjs-pinf-0"
				];

				module.require.id = function (identifier) {
					identifier = resolveIdentifier(identifier);
					return identifier[0].require.id(identifier[1]);
				};

				module.require.async = function (identifier, loadedCallback, errorCallback) {
					identifier = resolveIdentifier(identifier);					
					var mi = moduleIdentifier;
					if (/^\//.test(identifier[0].id)) {
						mi = "/main.js";
					}
					identifier[0].load(identifier[1], module.bundle, function (err, moduleAPI) {
						if (err) {
							if (errorCallback) return errorCallback(err);
							throw err;
						}
						loadedCallback(moduleAPI);
					});
				};

				module.require.sandbox = normalizeSandboxArguments (function (programIdentifier, options, loadedCallback, errorCallback) {
					options.load = options.load || sandboxOptions.load;
					// If the `programIdentifier` is relative it is resolved against the URI of the owning sandbox (not the owning page).
					if (/^\./.test(programIdentifier))
					{
						programIdentifier = sandboxIdentifier + "/" + programIdentifier;
						// HACK: Temporary hack as zombie (https://github.com/assaf/zombie) does not normalize path before sending to server.
						programIdentifier = programIdentifier.replace(/\/\.\//g, "/");
					}
					return PINF.sandbox(programIdentifier, options, loadedCallback, errorCallback);
				});
				module.require.sandbox.id = sandboxIdentifier;

				module.load = function () {
					module.bundle = moduleInitializers[moduleIdentifier][0];
					if (typeof moduleInitializers[moduleIdentifier][1] === "function") {

						var moduleInterface = {
							id: module.id,
							filename:
								// The `filename` from the meta info attached to the module.
								// This is typically where the module was originally found on the filesystem.
								moduleInitializers[moduleIdentifier][2].filename ||
								// Fall back to the virtual path of the module in the bundle.
								// TODO: Insert a delimiter between bundle and module id.
								(module.bundle.replace(/\.js$/, "") + "/" + module.id).replace(/\/+/g, "/"),
							exports: {}
						}

						if (packageIdentifier === "" && pkg.main === moduleIdentifier) {
							module.require.main = moduleInterface;
						}

						if (sandboxOptions.onInitModule) {
							sandboxOptions.onInitModule(moduleInterface, module, pkg, sandbox, {
								normalizeIdentifier: normalizeIdentifier,
								resolveIdentifier: resolveIdentifier,
								finalizeLoad: finalizeLoad,
								moduleInitializers: moduleInitializers,
								initializedModules: initializedModules
							});
						}

						var exports = moduleInitializers[moduleIdentifier][1].call(exports, module.require, module.exports, moduleInterface);
						if (
							typeof moduleInterface.exports !== "undefined" &&
							(
								typeof moduleInterface.exports !== "object" ||
								keys(moduleInterface.exports).length !== 0
							)
						) {
							module.exports = moduleInterface.exports;
						} else
						if (typeof exports !== "undefined") {
							module.exports = exports;
						}
					} else
					if (typeof moduleInitializers[moduleIdentifier][1] === "string") {
						// TODO: Use more optimal string encoding algorythm to reduce payload size?
						module.exports = decodeURIComponent(moduleInitializers[moduleIdentifier][1]);
					} else {
						module.exports = moduleInitializers[moduleIdentifier][1];
					}
				};

				/*DEBUG*/ module.getReport = function () {
				/*DEBUG*/ 	var exportsCount = 0,
				/*DEBUG*/ 		key;
				/*DEBUG*/ 	for (key in module.exports) {
				/*DEBUG*/ 		exportsCount++;
				/*DEBUG*/ 	}
				/*DEBUG*/ 	return {
				/*DEBUG*/ 		exports: exportsCount
				/*DEBUG*/ 	};
				/*DEBUG*/ };

				return module;
			};

			pkg.load = function (moduleIdentifier, bundleIdentifier, loadedCallback) {

				// If module/bundle to be loaded asynchronously is already memoized we skip the load.
				if (moduleInitializers[packageIdentifier + (moduleIdentifier || pkg.main)]) {
					return loadedCallback(null, pkg.require(moduleIdentifier).exports);
				}
				var bundleSubPath = bundleIdentifier.substring(sandboxIdentifier.length);
				load(
					((!/^\//.test(moduleIdentifier))?"/"+pkg.libPath:"") + moduleIdentifier,
					packageIdentifier,
					bundleSubPath.replace(/\.js$/g, ""),
					function (err) {
						if (err) return loadedCallback(err);
						loadedCallback(null, pkg.require(moduleIdentifier).exports);
					}
				);
			}

			pkg.require = function (moduleIdentifier) {

				var plugin = moduleIdentifier.plugin;

				if (moduleIdentifier) {
					if (!/^\//.test(moduleIdentifier)) {
						moduleIdentifier = ("/" + ((moduleIdentifier.substring(0, pkg.libPath.length)===pkg.libPath)?"":pkg.libPath)).replace(/\/\.\//, "/") + moduleIdentifier;
					}
					moduleIdentifier = packageIdentifier + moduleIdentifier;
				} else {
					moduleIdentifier = packageIdentifier + pkg.main;
				}

				if (
					!moduleInitializers[moduleIdentifier] &&
					moduleInitializers[moduleIdentifier.replace(/\.js$/, "/index.js")]
				) {
					moduleIdentifier = moduleIdentifier.replace(/\.js$/, "/index.js");
				}

				// Use a specifically formatted module for requested plugin if available
				if (
					plugin &&
					moduleInitializers[moduleIdentifier + ":" + plugin]
				) {
					moduleIdentifier += ":" + plugin;
				}

				if (!initializedModules[moduleIdentifier]) {
					/*DEBUG*/ if (!moduleInitializers[moduleIdentifier]) {
					/*DEBUG*/ 	console.error("[pinf-loader-js]", "moduleInitializers", moduleInitializers);
					/*DEBUG*/ 	throw new Error("Module '" + moduleIdentifier + "' " + (plugin?"for format '" + plugin + "' ":"") + "not found in sandbox '" + sandbox.id + "'!");
					/*DEBUG*/ }
					(initializedModules[moduleIdentifier] = Module(moduleIdentifier, lastModule)).load();
				}

				var loadingBundlesCallbacks;
				if (loadingBundles[moduleIdentifier]) {
					loadingBundlesCallbacks = loadingBundles[moduleIdentifier];
					delete loadingBundles[moduleIdentifier];
					for (var i=0 ; i<loadingBundlesCallbacks.length ; i++) {
						loadingBundlesCallbacks[i](null, sandbox);
					}
				}

				// TODO: Do this via plugins registered using sandbox options.
				// TODO: Cache response so we only process files once.

				var moduleInfo = create(initializedModules[moduleIdentifier]);
				// RequireJS/AMD international strings plugin using root by default.
				if (plugin === "i18n") {
					moduleInfo.exports = moduleInfo.exports.root;
				}

				return moduleInfo;
			}

			pkg.require.id = function (moduleIdentifier) {
				if (!/^\//.test(moduleIdentifier)) {
					moduleIdentifier = "/" + pkg.libPath + moduleIdentifier;
				}
				return (((packageIdentifier !== "")?"/"+packageIdentifier+"/":"") + moduleIdentifier).replace(/\/+/g, "/");
			}

			/*DEBUG*/ pkg.getReport = function () {
			/*DEBUG*/ 	return {
			/*DEBUG*/ 		main: pkg.main,
			/*DEBUG*/ 		mappings: pkg.mappings,
			/*DEBUG*/ 		directories: pkg.directories,
			/*DEBUG*/ 		libPath: pkg.libPath
			/*DEBUG*/ 	};
			/*DEBUG*/ }

			if (sandboxOptions.onInitPackage) {
				sandboxOptions.onInitPackage(pkg, sandbox, {
					normalizeIdentifier: normalizeIdentifier,
					finalizeLoad: finalizeLoad,
					moduleInitializers: moduleInitializers,
					initializedModules: initializedModules
				});
			}

			packages[packageIdentifier] = pkg;

			return pkg;
		}

		// Get a module and initialize it (statically link its dependencies) if it is not already so
		sandbox.require = function (moduleIdentifier) {
			return Package("").require(moduleIdentifier).exports;
		}

		// Call the 'main' module of the program
		sandbox.boot = function () {
			/*DEBUG*/ if (typeof Package("").main !== "string") {
			/*DEBUG*/ 	throw new Error("No 'main' property declared in '/package.json' in sandbox '" + sandbox.id + "'!");
			/*DEBUG*/ }
			return sandbox.require(Package("").main);
		};

		// Call the 'main' exported function of the main' module of the program
		sandbox.main = function () {
			var exports = sandbox.boot();
			return ((exports.main)?exports.main.apply(null, arguments):exports);
		};

		/*DEBUG*/ sandbox.getReport = function () {
		/*DEBUG*/ 	var report = {
		/*DEBUG*/ 			bundles: {},
		/*DEBUG*/ 			packages: {},
		/*DEBUG*/ 			modules: {}
		/*DEBUG*/ 		},
		/*DEBUG*/ 		key;
		/*DEBUG*/ 	for (key in bundleIdentifiers) {
		/*DEBUG*/ 		report.bundles[key] = bundleIdentifiers[key];
		/*DEBUG*/ 	}
		/*DEBUG*/ 	for (key in packages) {
		/*DEBUG*/ 		report.packages[key] = packages[key].getReport();
		/*DEBUG*/ 	}
		/*DEBUG*/ 	for (key in moduleInitializers) {
		/*DEBUG*/ 		if (initializedModules[key]) {
		/*DEBUG*/ 			report.modules[key] = initializedModules[key].getReport();
		/*DEBUG*/ 		} else {
		/*DEBUG*/ 			report.modules[key] = {};
		/*DEBUG*/ 		}
		/*DEBUG*/ 	}
		/*DEBUG*/ 	return report;
		/*DEBUG*/ }
		/*DEBUG*/ sandbox.reset = function () {
		/*DEBUG*/   moduleInitializers = {};
		/*DEBUG*/   initializedModules = {};
		/*DEBUG*/   bundleIdentifiers = {};
		/*DEBUG*/   packages = {};
		/*DEBUG*/   loadingBundles = {};
		/*DEBUG*/ }

		load((sandboxIdentifier.indexOf("?") === -1) ? ".js" : "", "", "", loadedCallback);

		return sandbox;
	};

	var
		/*DEBUG*/ bundleIdentifiers = {},
		sandboxes = {};

	var Require = function (bundle) {
		var self = this;

		// Address a specific sandbox or currently loading sandbox if initial load.
		var bundleHandler = function (uid, callback) {
			/*DEBUG*/ if (uid && bundleIdentifiers[uid]) {
			/*DEBUG*/ 	throw new Error("You cannot split require.bundle(UID) calls where UID is constant!");
			/*DEBUG*/ }
			/*DEBUG*/ bundleIdentifiers[uid] = true;
			loadedBundles.push([uid, function (sandbox) {
				var moduleInitializers = {},
					req = new Require(uid);
				delete req.bundle;
				req.sandbox = sandbox;
				// Store raw module in loading bundle
				req.memoize = function (moduleIdentifier, moduleInitializer, moduleMeta) {
					moduleInitializers[
						moduleIdentifier +
						// NOTE: This feature may be elevated to a new function argument to 'memoize' if it proves to be prevalent.
						(
							(
								moduleMeta &&
								moduleMeta.variation
							) ? ":" + moduleMeta.variation : ""
						)
					] = [moduleInitializer, moduleMeta || {}];
				}
				callback(req, global || null);
				return moduleInitializers;
			}]);
		}
		var activeBundleHandler = bundleHandler;
		this.bundle = function () {
			return activeBundleHandler.apply(null, arguments);
		}
		this.setActiveBundleHandler = function (handler) {
			var oldHandler = activeBundleHandler;
			activeBundleHandler = handler;
			return oldHandler;
		}
	}

	var PINF = new Require();

	// TODO: @see URL_TO_SPEC
	PINF.supports = [
		"ucjs-pinf-0"
	];

	// Create a new environment to memoize modules to.
	// If relative, the `programIdentifier` is resolved against the URI of the owning page (this is only for the global _require_).
	PINF.sandbox = normalizeSandboxArguments(function (programIdentifier, options, loadedCallback, errorCallback) {
		if (typeof programIdentifier === "function") {
			options = options || {};
			var bundle = programIdentifier;
			var fallbackLoad = options.load || loadInBrowser;
			options.load = function (uri, loadedCallback) {
				if (uri === (programIdentifier + ".js")) {
					PINF.bundle("", bundle);
					loadedCallback(null);
					return;
				}
				return fallbackLoad(uri, loadedCallback, options);
			}
			programIdentifier = bundle.uri || "#pinf:" + Math.random().toString(36).substr(2, 9);
		}
		var sandboxIdentifier = programIdentifier.replace(/\.js$/, "");
		return sandboxes[sandboxIdentifier] = Sandbox(sandboxIdentifier, options, function (err, sandbox) {
			if (err) {
				if (errorCallback) return errorCallback(err);
				throw err;
			}
			loadedCallback(sandbox);
		});
	});

	PINF.Loader = Loader;

	/*DEBUG*/ PINF.getReport = function () {
	/*DEBUG*/ 	var report = {
	/*DEBUG*/ 			sandboxes: {}
	/*DEBUG*/ 		};
	/*DEBUG*/ 	for (var key in sandboxes) {
	/*DEBUG*/ 		report.sandboxes[key] = sandboxes[key].getReport();
	/*DEBUG*/ 	}
	/*DEBUG*/ 	return report;
	/*DEBUG*/ }
	/*DEBUG*/ PINF.reset = function () {
	/*DEBUG*/ 	for (var key in sandboxes) {
	/*DEBUG*/ 		sandboxes[key].reset();
	/*DEBUG*/ 	}
	/*DEBUG*/ 	sandboxes = {};
	/*DEBUG*/ 	bundleIdentifiers = {};
	/*DEBUG*/ 	loadedBundles = [];
	/*DEBUG*/ }

	return PINF;
}

if (exports) exports.Loader = Loader;

})(typeof exports !== "undefined" ? exports : null);

},{}]},{},[1])(1)
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){

var UTIL = require("fp-modules-for-nodejs/lib/util"),
    JSON = require("fp-modules-for-nodejs/lib/json"),
    ENCODER = require("../encoder/default");

exports.EXTENDED = "EXTENDED";
exports.SIMPLE = "SIMPLE";


exports.generateFromMessage = function(message, format)
{
    format = format || exports.EXTENDED;

    var og = new ObjectGraph();

    var meta = {},
        data;

    if (typeof message.getMeta == "function")
    {
        meta = JSON.decode(message.getMeta() || "{}");
    }
    else
    if (typeof message.meta == "string")
    {
        meta = JSON.decode(message.meta);
    }
    else
    if (typeof message.meta == "object")
    {
        meta = message.meta;
    }

    if (typeof message.getData == "function")
    {
        data = message.getData();
    }
    else
    if (typeof message.data != "undefined")
    {
        data = message.data;
    }
    else
        throw new Error("NYI");

    if(meta["msg.preprocessor"] && meta["msg.preprocessor"]=="FirePHPCoreCompatibility") {
        var parts = convertFirePHPCoreData(meta, data);
        if (typeof message.setMeta == "function")
            message.setMeta(JSON.encode(parts[0]));
        else
            message.meta = JSON.encode(parts[0]);
        data = parts[1];

    } else
    if(typeof data !== "undefined" && data != "") {
        try {

            data = JSON.decode(data);

        } catch(e) {
            console.error("Error decoding JSON data: " + data);
            throw e;
        }
    } else {
        data = {};
    }

    // assign group title to value if applicable
    if(typeof meta["group.title"] != "undefined") {
        data = {
            "origin": {
                "type": "string",
                "string": meta["group.title"]
            }
        };
    }

    if(data.instances) {
        for( var i=0 ; i<data.instances.length ; i++ ) {
            data.instances[i] = generateNodesFromData(og, data.instances[i]);
        }
        og.setInstances(data.instances);
    }

    if(meta["lang.id"]) {
        og.setLanguageId(meta["lang.id"]);
    }

    og.setMeta(meta);

    if(UTIL.has(data, "origin")) {
        if(format==exports.EXTENDED) {
            og.setOrigin(generateNodesFromData(og, data.origin));
        } else
        if(format==exports.SIMPLE) {
            og.setOrigin(generateObjectsFromData(og, data.origin));
        } else {
            throw new Error("unsupported format: " + format);
        }
    }

    return og;
}

function generateObjectsFromData(objectGraph, data) {

    var node;

    if(data.type=="array") {
        node = [];
        for( var i=0 ; i<data[data.type].length ; i++ ) {
            node.push(generateObjectsFromData(objectGraph, data[data.type][i]));
        }
    } else
    if(data.type=="map") {
        node = [];
        for( var i=0 ; i<data[data.type].length ; i++ ) {
            node.push([
                generateObjectsFromData(objectGraph, data[data.type][i][0]),
                generateObjectsFromData(objectGraph, data[data.type][i][1])
            ]);
        }
    } else
    if(data.type=="dictionary") {
        node = {};
        for( var name in data[data.type] ) {
            node[name] = generateObjectsFromData(objectGraph, data[data.type][name]);
        }
    } else {
        node = data[data.type];
    }

    return node;
}


function generateNodesFromData(objectGraph, data, parentNode) {
    
    parentNode = parentNode || null;
    
    var node = new Node(objectGraph, data, parentNode);
    
    if(node.value!==null && typeof node.value != "undefined") {
        // some types need nested nodes decoded
        if(node.type=="array") {
            for( var i=0 ; i<node.value.length ; i++ ) {
                node.value[i] = generateNodesFromData(objectGraph, node.value[i], node);
            }
        } else
        if(node.type=="map") {
            for( var i=0 ; i<node.value.length ; i++ ) {
                node.value[i][0] = generateNodesFromData(objectGraph, node.value[i][0], node);
                node.value[i][1] = generateNodesFromData(objectGraph, node.value[i][1], node);
            }
        } else
        if(node.type=="dictionary") {
            for( var name in node.value ) {
                node.value[name] = generateNodesFromData(objectGraph, node.value[name], node);
            }
        }
    } else {
        node.value = null;
    }

    return node;
}



var Node = function(objectGraph, data, parentNode) {
    var self = this;
//    self.parentNode = parentNode || null;
    self.type = data.type;
    self.value = (typeof data.value !== "undefined" && data.value) || date[data.type];
    self.meta = objectGraph.meta || {};
    UTIL.every(data, function(item) {
        if(item[0]!="type" && item[0]!=self.type) {
            self.meta[item[0]] = item[1];
        }
    });
    if(self.type=="reference") {
        self.getInstance = function() {
            return objectGraph.getInstance(self.value);
        }
    }
//    self.getObjectGraph = function() {
//        return objectGraph;
//    }
}

Node.prototype.getTemplateId = function() {
    if(UTIL.has(this.meta, "tpl.id")) {
        return this.meta["tpl.id"];
    }
    return false;
}

Node.prototype.compact = function() {
    if(!this.compacted) {
        if(this.type=="map") {
            this.compacted = {};
            for( var i=0 ; i<this.value.length ; i++ ) {
                this.compacted[this.value[i][0].value] = this.value[i][1];
            }
        }
    }
    return this.compacted;
}
/*
Node.prototype.getPath = function(locateChild) {
    var path = [];
    if (this.parentNode)
        path = path.concat(this.parentNode.getPath(this));
    else
        path = path.concat(this.getObjectGraph().getPath(this));
    if (locateChild)
    {
        if(this.type=="map") {
            for( var i=0 ; i<this.value.length ; i++ ) {
                if (this.value[i][1] === locateChild)
                {
                    path.push("value[" + i + "][1]");
                    break;
                }
            }
        } else
        if(this.type=="dictionary") {
            for (var key in this.value)
            {
                if (this.value[key] === locateChild)
                {
                    path.push("value['" + key + "']");
                    break;
                }
            }
        } else
        if(this.type=="array") {
            for( var i=0 ; i<this.value.length ; i++ ) {
                if (this.value[i] === locateChild)
                {
                    path.push("value[" + i + "]");
                    break;
                }
            }
        } else {
console.error("NYI - getPath() for this.type = '" + this.type + "'", this);            
        }
    }
    return path;
}
*/
Node.prototype.forPath = function(path) {
    if (!path || path.length === 0)
        return this;
    if(this.type=="map") {
        var m = path[0].match(/^value\[(\d*)\]\[1\]$/);
        return this.value[parseInt(m[1])][1].forPath(path.slice(1));
    } else
    if(this.type=="dictionary") {
        var m = path[0].match(/^value\['(.*?)'\]$/);
        return this.value[m[1]].forPath(path.slice(1));
    } else
    if(this.type=="array") {
        var m = path[0].match(/^value\[(\d*)\]$/);
        return this.value[parseInt(m[1])].forPath(path.slice(1));
    } else {
//console.error("NYI - forPath('" + path + "') for this.type = '" + this.type + "'", this);            
    }
    return null;
}

//Node.prototype.renderIntoViewer = function(viewerDocument, options) {
//    throw new Error("NYI - Node.prototype.renderIntoViewer in " + module.id);
//    return RENDERER.renderIntoViewer(this, viewerDocument, options);
//}


var ObjectGraph = function() {
//    this.message = message;
}
//ObjectGraph.prototype = Object.create(new Node());

ObjectGraph.prototype.setOrigin = function(node) {
    this.origin = node;
}

ObjectGraph.prototype.getOrigin = function() {
    return this.origin;
}

ObjectGraph.prototype.setInstances = function(instances) {
    this.instances = instances;
}

ObjectGraph.prototype.getInstance = function(index) {
    return this.instances[index];
}

ObjectGraph.prototype.setLanguageId = function(id) {
    this.languageId = id;
}

ObjectGraph.prototype.getLanguageId = function() {
    return this.languageId;
}

ObjectGraph.prototype.setMeta = function(meta) {
    this.meta = meta;
}

ObjectGraph.prototype.getMeta = function() {
    return this.meta;
}
/*
ObjectGraph.prototype.getPath = function(locateChild) {
    if (this.origin === locateChild)
    {
        return ["origin"];
    }
    for( var i=0 ; i<this.instances.length ; i++ ) {
        if (this.instances[i] === locateChild)
        {
            return ["instances[" + i + "]"];
        }
    }
    throw new Error("Child node not found. We should never reach this!");
}
*/
ObjectGraph.prototype.nodeForPath = function(path) {
    var m = path[0].match(/^instances\[(\d*)\]$/);
    if (m) {
        return this.instances[parseInt(m[1])].forPath(path.slice(1));
    } else {
        // assume path[0] == 'origin'
        return this.origin.forPath(path.slice(1));
    }
    return node;
}


var encoder = ENCODER.Encoder();
encoder.setOption("maxObjectDepth", 1000);
encoder.setOption("maxArrayDepth", 1000);
encoder.setOption("maxOverallDepth", 1000);
function convertFirePHPCoreData(meta, data) {
    data = encoder.encode(JSON.decode(data), null, {
        "jsonEncode": false
    });
    return [meta, data]; 
}

},{"../encoder/default":3,"fp-modules-for-nodejs/lib/json":4,"fp-modules-for-nodejs/lib/util":5}],3:[function(require,module,exports){

var UTIL = require("fp-modules-for-nodejs/lib/util");
var JSON = require("fp-modules-for-nodejs/lib/json");

var Encoder = exports.Encoder = function() {
    if (!(this instanceof exports.Encoder))
        return new exports.Encoder();
    this.options = {
        "maxObjectDepth": 4,
        "maxArrayDepth": 4,
        "maxOverallDepth": 6,
        "includeLanguageMeta": true
    };
}

Encoder.prototype.setOption = function(name, value) {
    this.options[name] = value;
}

Encoder.prototype.setOrigin = function(variable) {
    this.origin = variable;
    // reset some variables
    this.instances = [];
    return true;
}

Encoder.prototype.encode = function(data, meta, options) {

    options = options || {};

    if(typeof data != "undefined") {
        this.setOrigin(data);
    }

    // TODO: Use meta["fc.encoder.options"] to control encoding

    var graph = {};
    
    try {
        if(typeof this.origin != "undefined") {
            graph["origin"] = this.encodeVariable(meta, this.origin);
        }
    } catch(err) {
        console.warn("Error encoding variable", err.stack);
        throw err;
    }

    if(UTIL.len(this.instances)>0) {
        graph["instances"] = [];
        this.instances.forEach(function(instance) {
            graph["instances"].push(instance[1]);
        });
    }

    if(UTIL.has(options, "jsonEncode") && !options.jsonEncode) {
        return graph;
    }

    try {
        return JSON.encode(graph);
    } catch(e) {
        console.warn("Error jsonifying object graph" + e);
        throw e;
    }
    return null;
}

function setMeta (node, name, value) {
    node.meta = node.meta || {};
    node.meta[name] = value;
}

function completeWithMeta (meta, node) {
    node.meta = node.meta || {};
    Object.keys(meta).forEach(function (name) {
        if (typeof node.meta[name] === 'undefined') {
            node.meta[name] = meta[name];
        }
    });
    return node;
}

Encoder.prototype.encodeVariable = function(meta, variable, objectDepth, arrayDepth, overallDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    overallDepth = overallDepth || 1;
    
    if(variable===null) {
        var ret = {"type": "constant", "value": "null"};
        if(this.options["includeLanguageMeta"]) {
            setMeta(ret, "lang.type", "null");
        }
        ret = completeWithMeta(meta, ret);
        return ret;
    } else
    if(variable===true || variable===false) {
        var ret = {"type": "constant", "value": (variable===true)?"true":"false"};
        if(this.options["includeLanguageMeta"]) {
            setMeta(ret, "lang.type", "boolean");
        }
        ret = completeWithMeta(meta, ret);
        return ret;
    }

    var type = typeof variable;
    if(type=="undefined") {
        var ret = {"type": "constant", "value": "undefined"};
        if(this.options["includeLanguageMeta"]) {
            setMeta(ret, "lang.type", "undefined");
        }
        completeWithMeta(meta, ret);
        return ret;
    } else
    if(type=="number") {
        if(Math.round(variable)==variable) {
            var ret = {"type": "string", "value": ""+variable};
            if(this.options["includeLanguageMeta"]) {
                setMeta(ret, "lang.type", "integer");
            }
            completeWithMeta(meta, ret);
            return ret;
        } else {
            var ret = {"type": "string", "value": ""+variable};
            if(this.options["includeLanguageMeta"]) {
                setMeta(ret, "lang.type", "float");
            }
            completeWithMeta(meta, ret);
            return ret;
        }
    } else
    if(type=="string") {
        // HACK: This should be done via an option
        // FirePHPCore compatibility: Detect resource string
        if(variable=="** Excluded by Filter **") {
            var ret = {"type": "string", "value": variable};
            setMeta(ret, "encoder.notice", "Excluded by Filter");
            setMeta(ret, "encoder.trimmed", true);
            if(this.options["includeLanguageMeta"]) {
                setMeta(ret, "lang.type", "string");
            }
            completeWithMeta(meta, ret);
            return ret;
        } else
        if(variable.match(/^\*\*\sRecursion\s\([^\(]*\)\s\*\*$/)) {
            var ret = {"type": "string", "value": variable};
            setMeta(ret, "encoder.notice", "Recursion");
            setMeta(ret, "encoder.trimmed", true);
            if(this.options["includeLanguageMeta"]) {
                setMeta(ret, "lang.type", "string");
            }
            completeWithMeta(meta, ret);
            return ret;
        } else
        if(variable.match(/^\*\*\sResource\sid\s#\d*\s\*\*$/)) {
            var ret = {"type": "string", "value": variable.substring(3, variable.length-3)};
            if(this.options["includeLanguageMeta"]) {
                setMeta(ret, "lang.type", "resource");
            }
            completeWithMeta(meta, ret);
            return ret;
        } else {
            var ret = {"type": "string", "value": variable};
            if(this.options["includeLanguageMeta"]) {
                setMeta(ret, "lang.type", "string");
            }
            completeWithMeta(meta, ret);
            return ret;
        }
    }

    if (variable && variable.__no_serialize === true) {
        var ret = {"type": "string", "value": "Object"};
        setMeta(ret, "encoder.notice", "Excluded by __no_serialize");
        setMeta(ret, "encoder.trimmed", true);
        completeWithMeta(meta, ret);
        return ret;
    }

    if(type=="function") {
        var ret = {"type": "string", "string": ""+variable};
        if(this.options["includeLanguageMeta"]) {
            setMeta(ret, "lang.type", "function");
        }
        completeWithMeta(meta, ret);
        return ret;
    } else
    if(type=="object") {

        try {
            if(UTIL.isArrayLike(variable)) {
                var ret = {
                    "type": "array",
                    "value": this.encodeArray(meta, variable, objectDepth, arrayDepth, overallDepth)
                };
                if(this.options["includeLanguageMeta"]) {
                    setMeta(ret, "lang.type", "array");
                }
                ret = completeWithMeta(meta, ret);
                return ret;
            }
        } catch (err) {
// TODO: Find a better way to encode variables that cause security exceptions when accessed etc...
            var ret = {"type": "string", "string": "Cannot serialize"};
            setMeta(ret, "encoder.notice", "Cannot serialize");
            setMeta(ret, "encoder.trimmed", true);
            completeWithMeta(meta, ret);
            return ret;
        }
        // HACK: This should be done via an option
        // FirePHPCore compatibility: we only have an object if a class name is present

        if(typeof variable["__className"] != "undefined"  ) {
            var ret = {
                "type": "reference",
                "value": this.encodeInstance(meta, variable, objectDepth, arrayDepth, overallDepth)
            };
            completeWithMeta(meta, ret);
            return ret;
        } else {
            var ret;
            if (/^\[Exception\.\.\.\s/.test(variable)) {
                ret = {
                    "type": "map",
                    "value": this.encodeException(meta, variable, objectDepth, arrayDepth, overallDepth)
                };
            } else {
                ret = {
                    "type": "map",
                    "value": this.encodeAssociativeArray(meta, variable, objectDepth, arrayDepth, overallDepth)
                };
            }
            if(this.options["includeLanguageMeta"]) {
                setMeta(ret, "lang.type", "map");
            }
            completeWithMeta(meta, ret);
            return ret;
        }
    }

    var ret = {"type": "string", "value": "Variable with type '" + type + "' unknown: "+variable};
    if(this.options["includeLanguageMeta"]) {
        setMeta(ret, "lang.type", "unknown");
    }
    completeWithMeta(meta, ret);
    return ret;
//    return "["+(typeof variable)+"]["+variable+"]";    
}

Encoder.prototype.encodeArray = function(meta, variable, objectDepth, arrayDepth, overallDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    overallDepth = overallDepth || 1;
    if(arrayDepth > this.options["maxArrayDepth"]) {
        return {"notice": "Max Array Depth (" + this.options["maxArrayDepth"] + ")"};
    } else
    if(overallDepth > this.options["maxOverallDepth"]) {
        return {"notice": "Max Overall Depth (" + this.options["maxOverallDepth"] + ")"};
    }
    var self = this,
        items = [];
    UTIL.forEach(variable, function(item) {
        items.push(self.encodeVariable(meta, item, 1, arrayDepth + 1, overallDepth + 1));
    });
    return items;
}


Encoder.prototype.encodeAssociativeArray = function(meta, variable, objectDepth, arrayDepth, overallDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    overallDepth = overallDepth || 1;
    if(arrayDepth > this.options["maxArrayDepth"]) {
        return {"notice": "Max Array Depth (" + this.options["maxArrayDepth"] + ")"};
    } else
    if(overallDepth > this.options["maxOverallDepth"]) {
        return {"notice": "Max Overall Depth (" + this.options["maxOverallDepth"] + ")"};
    }
    var self = this,
        items = [];
    for (var key in variable) {

        // HACK: This should be done via an option
        // FirePHPCore compatibility: numeric (integer) strings as keys in associative arrays get converted to integers
        // http://www.php.net/manual/en/language.types.array.php
        if(isNumber(key) && Math.round(key)==key) {
            key = parseInt(key);
        }
        
        items.push([
            self.encodeVariable(meta, key, 1, arrayDepth + 1, overallDepth + 1),
            self.encodeVariable(meta, variable[key], 1, arrayDepth + 1, overallDepth + 1)
        ]);
    }
    return items;
}


Encoder.prototype.encodeException = function(meta, variable, objectDepth, arrayDepth, overallDepth) {
    var self = this,
        items = [];
    items.push([
        self.encodeVariable(meta, "message", 1, arrayDepth + 1, overallDepth + 1),
        self.encodeVariable(meta, (""+variable), 1, arrayDepth + 1, overallDepth + 1)
    ]);
    return items;
}

// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}



Encoder.prototype.getInstanceId = function(object) {
    for( var i=0 ; i<this.instances.length ; i++ ) {
        if(this.instances[i][0]===object) {
            return i;
        }
    }
    return null;
}

Encoder.prototype.encodeInstance = function(meta, object, objectDepth, arrayDepth, overallDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    overallDepth = overallDepth || 1;
    var id = this.getInstanceId(object);
    if(id!=null) {
        return id;
    }
    this.instances.push([
        object,
        this.encodeObject(meta, object, objectDepth, arrayDepth, overallDepth)
    ]);
    return UTIL.len(this.instances)-1;
}

Encoder.prototype.encodeObject = function(meta, object, objectDepth, arrayDepth, overallDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    overallDepth = overallDepth || 1;

    if(arrayDepth > this.options["maxObjectDepth"]) {
        return {"notice": "Max Object Depth (" + this.options["maxObjectDepth"] + ")"};
    } else
    if(overallDepth > this.options["maxOverallDepth"]) {
        return {"notice": "Max Overall Depth (" + this.options["maxOverallDepth"] + ")"};
    }
    
    var self = this,
        ret = {"type": "dictionary", "value": {}};

    // HACK: This should be done via an option
    // FirePHPCore compatibility: we have an object if a class name is present
    var isPHPClass = false;
    if(typeof object["__className"] != "undefined") {
        isPHPClass = true;
        setMeta(ret, "lang.class", object["__className"]);
        delete(object["__className"]);
        if(this.options["includeLanguageMeta"]) {
            setMeta(ret, "lang.type", "object");
        }
    }

    // HACK: This should be done via an option
    // FirePHPCore compatibility: we have an exception if a class name is present
    if(typeof object["__isException"] != "undefined" && object["__isException"]) {
        setMeta(ret, "lang.type", "exception");
    }

    UTIL.forEach(object, function(item) {
        try {
            if(item[0]=="__fc_tpl_id") {
                ret['fc.tpl.id'] = item[1];
                return;
            }
            if(isPHPClass) {
                var val = self.encodeVariable(meta, item[1], objectDepth + 1, 1, overallDepth + 1),
                    parts = item[0].split(":"),
                    name = parts[parts.length-1];
                if(parts[0]=="public") {
                    val["lang.visibility"] = "public";
                } else
                if(parts[0]=="protected") {
                    val["lang.visibility"] = "protected";
                } else
                if(parts[0]=="private") {
                    val["lang.visibility"] = "private";
                } else
                if(parts[0]=="undeclared") {
                    val["lang.undeclared"] = 1;
                }
                if(parts.length==2 && parts[1]=="static") {
                    val["lang.static"] = 1;
                }
                ret["value"][name] = val;
            } else {
                ret["value"][item[0]] = self.encodeVariable(meta, item[1], objectDepth + 1, 1, overallDepth + 1);
            }
        } catch(e) {
            console.warn(e);
            ret["value"]["__oops__"] = {"notice": "Error encoding member (" + e + ")"};
        }
    });

    completeWithMeta(meta, ret);

    return ret;
}
},{"fp-modules-for-nodejs/lib/json":4,"fp-modules-for-nodejs/lib/util":5}],4:[function(require,module,exports){

exports.encode = JSON.stringify;
exports.decode = JSON.parse;

},{}],5:[function(require,module,exports){

// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- isaacs Isaac Schlueter
// -- nrstott Nathan Stott
// -- fitzgen Nick Fitzgerald
// -- nevilleburnell Neville Burnell
// -- cadorn Christoph Dorn

// a decorator for functions that curry "polymorphically",
// that is, that return a function that can be tested
// against various objects if they're only "partially
// completed", or fewer arguments than needed are used.
// 
// this enables the idioms:
//      [1, 2, 3].every(lt(4)) eq true
//      [1, 2, 3].map(add(1)) eq [2, 3, 4]
//      [{}, {}, {}].forEach(set('a', 10))
//
exports.operator = function (name, length, block) {
    var operator = function () {
        var args = exports.array(arguments);
        var completion = function (object) {
            if (
                typeof object == "object" &&
                object !== null && // seriously?  typeof null == "object"
                name in object && // would throw if object === null
                // not interested in literal objects:
                !Object.prototype.hasOwnProperty.call(object, name)
            )
                return object[name].apply(object, args);
            return block.apply(
                this,
                [object].concat(args)
            );
        };
        if (arguments.length < length) {
            // polymoprhic curry, delayed completion
            return completion;
        } else {
            // immediate completion
            return completion.call(this, args.shift());
        }
    };
    operator.name = name;
    operator.displayName = name;
    operator.length = length;
    operator.operator = block;
    return operator;
};

exports.no = function (value) {
    return value === null || value === undefined;
};

// object

exports.object = exports.operator('toObject', 1, function (object) {
    var items = object;
    if (!items.length)
        items = exports.items(object);
    var copy = {};
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var key = item[0];
        var value = item[1];
        copy[key] = value;
    }
    return copy;
});

exports.object.copy = function (object) {
    var copy = {};
    exports.object.keys(object).forEach(function (key) {
        copy[key] = object[key];
    });
    return copy;
};

exports.object.deepCopy = function (object) {
    var copy = {};
    exports.object.keys(object).forEach(function (key) {
        copy[key] = exports.deepCopy(object[key]);
    });
    return copy;
};

exports.object.eq = function (a, b, stack) {
    return (
        !exports.no(a) && !exports.no(b) &&
        exports.array.eq(
            exports.sort(exports.object.keys(a)),
            exports.sort(exports.object.keys(b))
        ) &&
        exports.object.keys(a).every(function (key) {
            return exports.eq(a[key], b[key], stack);
        })
    );
};

exports.object.len = function (object) {
    return exports.object.keys(object).length;
};

exports.object.has = function (object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
};

exports.object.keys = function (object) {
    var keys = [];
    for (var key in object) {
        if (exports.object.has(object, key))
            keys.push(key);
    }
    return keys;
};

exports.object.values = function (object) {
    var values = [];
    exports.object.keys(object).forEach(function (key) {
        values.push(object[key]);
    });
    return values;
};

exports.object.items = function (object) {
    var items = [];
    exports.object.keys(object).forEach(function (key) {
        items.push([key, object[key]]);
    });
    return items;
};

/**
 * Updates an object with the properties from another object.
 * This function is variadic requiring a minimum of two arguments.
 * The first argument is the object to update.  Remaining arguments
 * are considered the sources for the update.  If multiple sources
 * contain values for the same property, the last one with that
 * property in the arguments list wins.
 *
 * example usage:
 * util.update({}, { hello: "world" });  // -> { hello: "world" }
 * util.update({}, { hello: "world" }, { hello: "le monde" }); // -> { hello: "le monde" }
 *
 * @returns Updated object
 * @type Object
 *
 */
exports.object.update = function () {
    return variadicHelper(arguments, function(target, source) {
        var key;
        for (key in source) {
            if (exports.object.has(source, key)) {
                target[key] = source[key];
            }
        }
    });
};

exports.object.deepUpdate = function (target, source) {
    var key;
	for (key in source) {
        if(exports.object.has(source, key)) {
            if(typeof source[key] == "object" && exports.object.has(target, key)) {
                exports.object.deepUpdate(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
};

/**
 * Updates an object with the properties of another object(s) if those
 * properties are not already defined for the target object. First argument is
 * the object to complete, the remaining arguments are considered sources to
 * complete from. If multiple sources contain the same property, the value of
 * the first source with that property will be the one inserted in to the
 * target.
 *
 * example usage:
 * util.complete({}, { hello: "world" });  // -> { hello: "world" }
 * util.complete({ hello: "narwhal" }, { hello: "world" }); // -> { hello: "narwhal" }
 * util.complete({}, { hello: "world" }, { hello: "le monde" }); // -> { hello: "world" }
 *
 * @returns Completed object
 * @type Object
 *
 */
exports.object.complete = function () {
    return variadicHelper(arguments, function(target, source) {
        var key;
        for (key in source) {
            if (
                exports.object.has(source, key) &&
                !exports.object.has(target, key)
            ) {
                target[key] = source[key];
            }
        }
    });
};

exports.object.deepComplete = function () {
    return variadicHelper(arguments, function (target, source) {
        var key;
        for (key in source) {
            if (
                exports.object.has(source, key) &&
                !exports.object.has(target, key)
            ) {
                target[key] = exports.deepCopy(source[key]);
            }
        }
    });
};

exports.object.deepDiff = function () {
    var sources = Array.prototype.slice.call(arguments);
    var diff = exports.deepCopy(sources.shift());
    return variadicHelper([diff].concat(sources), function (diff, source) {
        var key;
        for (key in source) {
            if(exports.object.has(source, key)) {
                if(exports.object.has(diff, key)) {
                    if(exports.deepEqual(diff[key], source[key])) {
                        delete diff[key];
                    } else {
                        if(!exports.isArrayLike(diff[key])) {
                            diff[key] = exports.deepDiff(diff[key], source[key]);
                        }
                    }
                }
            }
        }
    });
};

exports.object.repr = function (object) {
    return "{" +
        exports.object.keys(object)
        .map(function (key) {
            return exports.enquote(key) + ": " +
                exports.repr(object[key]);
        }).join(", ") +
    "}";
};

/**
 * @param args Arguments list of the calling function
 * First argument should be a callback that takes target and source parameters.
 * Second argument should be target.
 * Remaining arguments are treated a sources.
 *
 * @returns Target
 * @type Object
 */
var variadicHelper = function (args, callback) {
    var sources = Array.prototype.slice.call(args);
    var target = sources.shift();

    sources.forEach(function(source) {
        callback(target, source);
    });

    return target;
};

// array

exports.array = function (array) {
    if (exports.no(array))
        return [];
    if (!exports.isArrayLike(array)) {
        if (
            array.toArray &&
            !Object.prototype.hasOwnProperty.call(array, 'toArray')
        ) {
            return array.toArray();
        } else if (
            array.forEach &&
            !Object.prototype.hasOwnProperty.call(array, 'forEach')
        ) {
            var results = [];
            array.forEach(function (value) {
                results.push(value);
            });
            return results;
        } else if (typeof array === "string") {
            return Array.prototype.slice.call(array);
        } else {
            return exports.items(array);
        }
    }
    return Array.prototype.slice.call(array);
};

exports.array.coerce = function (array) {
    if (!Array.isArray(array))
        return exports.array(array);
    return array;
};

exports.isArrayLike = function(object) {
    return Array.isArray(object) || exports.isArguments(object);
};

// from http://code.google.com/p/google-caja/wiki/NiceNeighbor
// by "kangax"
//
// Mark Miller posted a solution that will work in ES5 compliant
// implementations, that may provide future insight:
// (http://groups.google.com/group/narwhaljs/msg/116097568bae41c6)
exports.isArguments = function (object) {
    // ES5 reliable positive
    if (Object.prototype.toString.call(object) == "[object Arguments]")
        return true;
    // for ES5, we will still need a way to distinguish false negatives
    //  from the following code (in ES5, it is possible to create
    //  an object that satisfies all of these constraints but is
    //  not an Arguments object).
    // callee should exist
    if (
        !typeof object == "object" ||
        !Object.prototype.hasOwnProperty.call(object, 'callee') ||
        !object.callee || 
        // It should be a Function object ([[Class]] === 'Function')
        Object.prototype.toString.call(object.callee) !== '[object Function]' ||
        typeof object.length != 'number'
    )
        return false;
    for (var name in object) {
        // both "callee" and "length" should be { DontEnum }
        if (name === 'callee' || name === 'length') return false;
    }
    return true;
};

exports.array.copy = exports.array;

exports.array.deepCopy = function (array) {
    return array.map(exports.deepCopy);
};

exports.array.len = function (array) {
    return array.length;
};

exports.array.has = function (array, value) {
    return Array.prototype.indexOf.call(array, value) >= 0;
};

exports.array.put = function (array, key, value) {
    array.splice(key, 0, value);
    return array;
};

exports.array.del = function (array, begin, end) {
    array.splice(begin, end === undefined ? 1 : (end - begin));
    return array;
};

exports.array.eq = function (a, b, stack) {
    return exports.isArrayLike(b) &&
        a.length == b.length &&
        exports.zip(a, b).every(exports.apply(function (a, b) {
            return exports.eq(a, b, stack);
        }));
};

exports.array.lt = function (a, b) {
    var length = Math.max(a.length, b.length);
    for (var i = 0; i < length; i++)
        if (!exports.eq(a[i], b[i]))
            return exports.lt(a[i], b[i]);
    return false;
};

exports.array.repr = function (array) {
    return "[" + exports.map(array, exports.repr).join(', ') + "]";
};

exports.array.first = function (array) {
    return array[0];
};

exports.array.last = function (array) {
    return array[array.length - 1];
};

exports.apply = exports.operator('apply', 2, function (args, block) {
    return block.apply(this, args);
});

exports.copy = exports.operator('copy', 1, function (object) {
    if (exports.no(object))
        return object;
    if (exports.isArrayLike(object))
        return exports.array.copy(object);
    if (object instanceof Date)
        return object;
    if (typeof object == 'object')
        return exports.object.copy(object);
    return object;
});

exports.deepCopy = exports.operator('deepCopy', 1, function (object) {
    if (exports.no(object))
        return object;
    if (exports.isArrayLike(object))
        return exports.array.deepCopy(object);
    if (typeof object == 'object')
        return exports.object.deepCopy(object);
    return object;
});

exports.repr = exports.operator('repr', 1, function (object) {
    if (exports.no(object))
        return String(object);
    if (exports.isArrayLike(object))
        return exports.array.repr(object);
    if (typeof object == 'object' && !(object instanceof Date))
        return exports.object.repr(object);
    if (typeof object == 'string')
        return exports.enquote(object);
    return object.toString();
});

exports.keys = exports.operator('keys', 1, function (object) {
    if (exports.isArrayLike(object))
        return exports.range(object.length);
    else if (typeof object == 'object')
        return exports.object.keys(object);
    return [];
});

exports.values = exports.operator('values', 1, function (object) {
    if (exports.isArrayLike(object))
        return exports.array(object);
    else if (typeof object == 'object')
        return exports.object.values(object);
    return [];
});

exports.items = exports.operator('items', 1, function (object) {
    if (exports.isArrayLike(object) || typeof object == "string")
        return exports.enumerate(object);
    else if (typeof object == 'object')
        return exports.object.items(object);
    return [];
});

exports.len = exports.operator('len', 1, function (object) {
    if (exports.isArrayLike(object))
        return exports.array.len(object);
    else if (typeof object == 'object')
        return exports.object.len(object);
});

exports.has = exports.operator('has', 2, function (object, value) {
    if (exports.isArrayLike(object))
        return exports.array.has(object, value);
    else if (typeof object == 'object')
        return exports.object.has(object, value);
    return false;
});

exports.get = exports.operator('get', 2, function (object, key, value) {
    if (typeof object == "string") {
        if (!typeof key == "number")
            throw new Error("TypeError: String keys must be numbers");
        if (!exports.has(exports.range(object.length), key)) {
            if (arguments.length == 3)
                return value;
            throw new Error("KeyError: " + exports.repr(key));
        }
        return object.charAt(key);
    }
    if (typeof object == "object") {
        if (!exports.object.has(object, key)) {
            if (arguments.length == 3)
                return value;
            throw new Error("KeyError: " + exports.repr(key));
        }
        return object[key];
    } 
    throw new Error("Object does not have keys: " + exports.repr(object));
});

exports.set = exports.operator('set', 3, function (object, key, value) {
    object[key] = value;
    return object;
});

exports.getset = exports.operator('getset', 3, function (object, key, value) {
    if (!exports.has(object, key))
        exports.set(object, key, value);
    return exports.get(object, key);
});

exports.del = exports.operator('del', 2, function (object, begin, end) {
    if (exports.isArrayLike(object))
        return exports.array.del(object, begin, end);
    delete object[begin];
    return object;
});

exports.cut = exports.operator('cut', 2, function (object, key) {
    var result = exports.get(object, key);
    exports.del(object, key);
    return result;
});

exports.put = exports.operator('put', 2, function (object, key, value) {
    if (exports.isArrayLike(object))
        return exports.array.put(object, key, value);
    return exports.set(object, key, value);
});

exports.first = exports.operator('first', 1, function (object) {
    return object[0];
});

exports.last = exports.operator('last', 1, function (object) {
    return object[object.length - 1];
});

exports.update = exports.operator('update', 2, function () {
    var args = Array.prototype.slice.call(arguments);
    return exports.object.update.apply(this, args);
});

exports.deepUpdate = exports.operator('deepUpdate', 2, function (target, source) {
    exports.object.deepUpdate(target, source);
});

exports.complete = exports.operator('complete', 2, function (target, source) {
    var args = Array.prototype.slice.call(arguments);
    return exports.object.complete.apply(this, args);
});

exports.deepComplete = exports.operator('deepComplete', 2, function (target, source) {
    var args = Array.prototype.slice.call(arguments);
    return exports.object.deepComplete.apply(this, args);
});

exports.deepDiff = exports.operator('deepDiff', 2, function (target, source) {
    var args = Array.prototype.slice.call(arguments);
    return exports.object.deepDiff.apply(this, args);
});

exports.deepEqual = function(actual, expected) {
    
    // 7.1. All identical values are equivalent, as determined by ===.
    if (actual === expected) {
        return true;

    // 7.2. If the expected value is a Date object, the actual value is
    // equivalent if it is also a Date object that refers to the same time.
    } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();

    // 7.3. Other pairs that do not both pass typeof value == "object",
    // equivalence is determined by ==.
    } else if (typeof actual != 'object' && typeof expected != 'object') {
        return actual == expected;

    // XXX specification bug: this should be specified
    } else if (typeof expected == "string" || typeof actual == "string") {
        return expected == actual;

    // 7.4. For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical "prototype" property. Note: this
    // accounts for both named and indexed properties on Arrays.
    } else {
        return actual.prototype === expected.prototype && exports.object.eq(actual, expected);
    }
}

exports.remove = exports.operator('remove', 2, function (list, value) {
    var index;
    if ((index = list.indexOf(value))>-1)
        list.splice(index,1);
    return list;
});

// TODO insert
// TODO discard

exports.range = function () {
    var start = 0, stop = 0, step = 1;
    if (arguments.length == 1) {
        stop = arguments[0];
    } else {
        start = arguments[0];
        stop = arguments[1];
        step = arguments[2] || 1;
    }
    var range = [];
    for (var i = start; i < stop; i += step)
        range.push(i);
    return range;
};

exports.forEach = function (array, block) {
    Array.prototype.forEach.call(
        exports.array.coerce(array),
        block
    );
};

exports.forEachApply = function (array, block) {
    Array.prototype.forEach.call(
        exports.array.coerce(array),
        exports.apply(block)
    );
};

exports.map = function (array, block, context) {
    return Array.prototype.map.call(
        exports.array.coerce(array),
        block,
        context
    );
};

exports.mapApply = function (array, block) {
    return Array.prototype.map.call(
        exports.array.coerce(array),
        exports.apply(block)
    );
};

exports.every = exports.operator('every', 2, function (array, block, context) {
    return exports.all(exports.map(array, block, context));
});

exports.some = exports.operator('some', 2, function (array, block, context) {
    return exports.any(exports.map(array, block, context));
});

exports.all = exports.operator('all', 1, function (array) {
    array = exports.array.coerce(array);
    for (var i = 0; i < array.length; i++)
        if (!array[i])
            return false;
    return true;
});

exports.any = exports.operator('all', 1, function (array) {
    array = exports.array.coerce(array);
    for (var i = 0; i < array.length; i++)
        if (array[i])
            return true;
    return false;
});

exports.reduce = exports.operator('reduce', 2, function (array, block, basis) {
    array = exports.array.coerce(array);
    return array.reduce.apply(array, arguments);
});

exports.reduceRight = exports.operator('reduceRight', 2, function (array, block, basis) {
    array = exports.array.coerce(array);
    return array.reduceRight.apply(array, arguments);
});

exports.zip = function () {
    return exports.transpose(arguments);
};

exports.transpose = function (array) {
    array = exports.array.coerce(array);
    var transpose = [];
    var length = Math.min.apply(this, exports.map(array, function (row) {
        return row.length;
    }));
    for (var i = 0; i < array.length; i++) {
        var row = array[i];
        for (var j = 0; j < length; j++) {
            var cell = row[j];
            if (!transpose[j])
                transpose[j] = [];
            transpose[j][i] = cell;
        }
    }
    return transpose;
};

exports.enumerate = function (array, start) {
    array = exports.array.coerce(array);
    if (exports.no(start))
        start = 0;
    return exports.zip(
        exports.range(start, start + array.length),
        array
    );
};

// arithmetic, transitive, and logical operators

exports.is = function (a, b) {
    // <Mark Miller>
    if (a === b)
        // 0 === -0, but they are not identical
        return a !== 0 || 1/a === 1/b;
    // NaN !== NaN, but they are identical.
    // NaNs are the only non-reflexive value, i.e., if a !== a,
    // then a is a NaN.
    return a !== a && b !== b;
    // </Mark Miller>
};

exports.eq = exports.operator('eq', 2, function (a, b, stack) {
    if (!stack)
        stack = [];
    if (a === b)
        return true;
    if (typeof a !== typeof b)
        return false;
    if (exports.no(a))
        return exports.no(b);
    if (a instanceof Date)
        return a.valueOf() === b.valueOf();
    if (a instanceof RegExp)
        return a.source === b.source &&
            a.global === b.global &&
            a.ignoreCase === b.ignoreCase &&
            a.multiline === b.multiline;
    if (typeof a === "function") { 
        var caller = stack[stack.length - 1];
        // XXX what is this for?  can it be axed?
        // it comes from the "equiv" project code
        return caller !== Object &&
            typeof caller !== "undefined";
    }
    if (exports.isArrayLike(a))
        return exports.array.eq(
            a, b,
            stack.concat([a.constructor])
        );
    if (typeof a === 'object')
        return exports.object.eq(
            a, b,
            stack.concat([a.constructor])
        );
    return false;
});

exports.ne = exports.operator('ne', 2, function (a, b) {
    return !exports.eq(a, b);
});

exports.lt = exports.operator('lt', 2, function (a, b) {
    if (exports.no(a) != exports.no(b))
        return exports.no(a) > exports.no(b);
    if (exports.isArrayLike(a) && exports.isArrayLike(b))
        return exports.array.lt(a, b);
    return a < b;
});

exports.gt = exports.operator('gt', 2, function (a, b) {
    return !(exports.lt(a, b) || exports.eq(a, b));
});

exports.le = exports.operator(2, 'le', function (a, b) {
    return exports.lt(a, b) || exports.eq(a, b);
});

exports.ge = exports.operator(2, 'ge', function (a, b) {
    return !exports.lt(a, b);
});

exports.mul = exports.operator(2, 'mul', function (a, b) {
    if (typeof a == "string")
        return exports.string.mul(a, b);
    return a * b;
});

/*** by
    returns a `comparator` that compares
    values based on the values resultant from
    a given `relation`.
    accepts a `relation` and an optional comparator.

    To sort a list of objects based on their
    "a" key::

        objects.sort(by(get("a")))

    To get those in descending order::

        objects.sort(by(get("a")), desc)

    `by` returns a comparison function that also tracks
    the arguments you used to construct it.  This permits
    `sort` and `sorted` to perform a Schwartzian transform
    which can increase the performance of the sort
    by a factor of 2.
*/
exports.by = function (relation) {
    var compare = arguments[1];
    if (exports.no(compare))
        compare = exports.compare;
    var comparator = function (a, b) {
        a = relation(a);
        b = relation(b);
        return compare(a, b);
    };
    comparator.by = relation;
    comparator.compare = compare;
    return comparator;
};

exports.compare = exports.operator(2, 'compare', function (a, b) {
    if (exports.no(a) !== exports.no(b))
        return exports.no(b) - exports.no(a);
    if (typeof a === "number" && typeof b === "number")
        return a - b;
    return exports.eq(a, b) ? 0 : exports.lt(a, b) ? -1 : 1;
});

/*** sort
    an in-place array sorter that uses a deep comparison
    function by default (compare), and improves performance if
    you provide a comparator returned by "by", using a
    Schwartzian transform.
*/
exports.sort = function (array, compare) {
    if (exports.no(compare))
        compare = exports.compare;
    if (compare.by) {
        /* schwartzian transform */
        array.splice.apply(
            array,
            [0, array.length].concat(
                array.map(function (value) {
                    return [compare.by(value), value];
                }).sort(function (a, b) {
                    return compare.compare(a[0], b[0]);
                }).map(function (pair) {
                    return pair[1];
                })
            )
        );
    } else {
        array.sort(compare);
    }
    return array;
};

/*** sorted
    returns a sorted copy of an array using a deep
    comparison function by default (compare), and
    improves performance if you provide a comparator
    returned by "by", using a Schwartzian transform.
*/
exports.sorted = function (array, compare) {
    return exports.sort(exports.array.copy(array), compare);
};

exports.reverse = function (array) {
    return Array.prototype.reverse.call(array);
};

exports.reversed = function (array) {
    return exports.reverse(exports.array.copy(array));
};

exports.hash = exports.operator(1, 'hash', function (object) {
    return '' + object;
});

exports.unique = exports.operator(1, 'unique', function (array, eq, hash) {
    var visited = {};
    if (!eq) eq = exports.eq;
    if (!hash) hash = exports.hash;
    return array.filter(function (value) {
        var bucket = exports.getset(visited, hash(value), []);
        var finds = bucket.filter(function (other) {
            return eq(value, other);
        });
        if (!finds.length)
            bucket.push(value);
        return !finds.length;
    });
});

// string

exports.string = exports.operator(1, 'toString', function (object) {
    return '' + object;
});

exports.string.mul = function (string, n) {
    return exports.range(n).map(function () {
        return string;
    }).join('');
};

/*** escape
    escapes all characters of a string that are
    special to JavaScript and many other languages.
    Recognizes all of the relevant
    control characters and formats all other
    non-printable characters as Hex byte escape
    sequences or Unicode escape sequences depending
    on their size.

    Pass ``true`` as an optional second argument and
    ``escape`` produces valid contents for escaped
    JSON strings, wherein non-printable-characters are
    all escaped with the Unicode ``\u`` notation.
*/
/* more Steve Levithan flagrence */
var escapeExpression = /[^ !#-[\]-~]/g;
/* from Doug Crockford's JSON library */
var escapePatterns = {
    '\b': '\\b',    '\t': '\\t',
    '\n': '\\n',    '\f': '\\f',    '\r': '\\r',
    '"' : '\\"',    '\\': '\\\\'
};
exports.escape = function (value, strictJson) {
    if (typeof value != "string")
        throw new Error(
            module.path +
            "#escape: requires a string.  got " +
            exports.repr(value)
        );
    return value.replace(
        escapeExpression, 
        function (match) {
            if (escapePatterns[match])
                return escapePatterns[match];
            match = match.charCodeAt();
            if (!strictJson && match < 256)
                return "\\x" + exports.padBegin(match.toString(16), 2);
            return '\\u' + exports.padBegin(match.toString(16), 4);
        }
    );
};

/*** enquote
    transforms a string into a string literal, escaping
    all characters of a string that are special to
    JavaScript and and some other languages.

    ``enquote`` uses double quotes to be JSON compatible.

    Pass ``true`` as an optional second argument to
    be strictly JSON compliant, wherein all
    non-printable-characters are represented with
    Unicode escape sequences.
*/
exports.enquote = function (value, strictJson) {
    return '"' + exports.escape(value, strictJson) + '"';
};

/*** expand
    transforms tabs to an equivalent number of spaces.
*/
// TODO special case for \r if it ever matters
exports.expand = function (str, tabLength) {
    str = String(str);
    tabLength = tabLength || 4;
    var output = [],
        tabLf = /[\t\n]/g,
        lastLastIndex = 0,
        lastLfIndex = 0,
        charsAddedThisLine = 0,
        tabOffset, match;
    while (match = tabLf.exec(str)) {
        if (match[0] == "\t") {
            tabOffset = (
                tabLength - 1 -
                (
                    (match.index - lastLfIndex) +
                    charsAddedThisLine
                ) % tabLength
            );
            charsAddedThisLine += tabOffset;
            output.push(
                str.slice(lastLastIndex, match.index) +
                exports.mul(" ", tabOffset + 1)
            );
        } else if (match[0] === "\n") {
            output.push(str.slice(lastLastIndex, tabLf.lastIndex));
            lastLfIndex = tabLf.lastIndex;
            charsAddedThisLine = 0;
        }
        lastLastIndex = tabLf.lastIndex;
    }
    return output.join("") + str.slice(lastLastIndex);
};

var trimBeginExpression = /^\s\s*/g;
exports.trimBegin = function (value) {
    return String(value).replace(trimBeginExpression, "");  
};

var trimEndExpression = /\s\s*$/g;
exports.trimEnd = function (value) {
    return String(value).replace(trimEndExpression, "");    
};

exports.trim = function (value) {
    return String(value).replace(trimBeginExpression, "").replace(trimEndExpression, "");
};

/* generates padBegin and padEnd */
var augmentor = function (augment) {
    return function (value, length, pad) {
        if (exports.no(pad)) pad = '0';
        if (exports.no(length)) length = 2;
        value = String(value);
        while (value.length < length) {
            value = augment(value, pad);
        }
        return value;
    };
};

/*** padBegin

    accepts:
     - a `String` or `Number` value
     - a minimum length of the resultant `String`:
       by default, 2
     - a pad string: by default, ``'0'``.

    returns a `String` of the value padded up to at least
    the minimum length.  adds the padding to the begining
    side of the `String`.

*/
exports.padBegin = augmentor(function (value, pad) {
    return pad + value;
});

/*** padEnd

    accepts:
     - a `String` or `Number` value
     - a minimum length of the resultant `String`:
       by default, 2
     - a pad string: by default, ``'0'``.

    returns a `String` of the value padded up to at least
    the minimum length.  adds the padding to the end
    side of the `String`.

*/
exports.padEnd = augmentor(function (value, pad) {
    return value + pad;
});

/*** splitName
    splits a string into an array of words from an original
    string.
*/
// thanks go to Steve Levithan for this regular expression
// that, in addition to splitting any normal-form identifier
// in any case convention, splits XMLHttpRequest into
// "XML", "Http", and "Request"
var splitNameExpression = /[a-z]+|[A-Z](?:[a-z]+|[A-Z]*(?![a-z]))|[.\d]+/g;
exports.splitName = function (value) {
    var result = String(value).match(splitNameExpression);
    if (result)
        return result;
    return [value];
};

/*** joinName
    joins a list of words with a given delimiter
    between alphanumeric words.
*/
exports.joinName = function (delimiter, parts) {
    if (exports.no(delimiter)) delimiter = '_';
    parts.unshift([]);
    return parts.reduce(function (parts, part) {
        if (
            part.match(/\d/) &&
            exports.len(parts) && parts[parts.length-1].match(/\d/)
        ) {
            return parts.concat([delimiter + part]);
        } else {
            return parts.concat([part]);
        }
    }).join('');
};

/*** upper
    converts a name to ``UPPER CASE`` using
    a given delimiter between numeric words.

    see:
     - `lower`
     - `camel`
     - `title`

*/
exports.upper = function (value, delimiter) {
    if (exports.no(delimiter))
        return value.toUpperCase();
    return exports.splitName(value).map(function (part) {
        return part.toUpperCase();
    }).join(delimiter);
};

/*** lower
    converts a name to a ``lower case`` using
    a given delimiter between numeric words.

    see:
     - `upper`
     - `camel`
     - `title`

*/
exports.lower = function (value, delimiter) {
    if (exports.no(delimiter))
        return String(value).toLowerCase();
    return exports.splitName(value).map(function (part) {
        return part.toLowerCase();
    }).join(delimiter);
};

/*** camel
    converts a name to ``camel Case`` using
    a given delimiter between numeric words.

    see:
     - `lower`
     - `upper`
     - `title`

*/
exports.camel = function (value, delimiter) {
    return exports.joinName(
        delimiter,
        exports.mapApply(
            exports.enumerate(exports.splitName(value)),
            function (n, part) {
                if (n) {
                    return (
                        part.substring(0, 1).toUpperCase() +
                        part.substring(1).toLowerCase()
                    );
                } else {
                    return part.toLowerCase();
                }
            }
        )
    );
};

/*** title
    converts a name to ``Title Case`` using
    a given delimiter between numeric words.

    see:
     - `lower`
     - `upper`
     - `camel`

*/
exports.title = function (value, delimiter) {
    return exports.joinName(
        delimiter,
        exports.splitName(value).map(function (part) {
            return (
                part.substring(0, 1).toUpperCase() +
                part.substring(1).toLowerCase()
            );
        })
    );
};


},{}],6:[function(require,module,exports){

const WINDOW = window;

const DOMPLATE = require("domplate/dist/domplate.js").domplate;


function Renderer (options) {
    var self = this;

    var loader = options.loader || new exports.Loader(options);

    self.domplate = DOMPLATE;

    function InsightDomplateContext () {
        var self = this;

        self.repForNode = loader.repForNode.bind(loader);
        self.wrapperRepForNode = loader.wrapperRepForNode.bind(loader);

        self.dispatchEvent = function (name, args) {
            if (options.onEvent) {
                try {
                    options.onEvent(name, args);
                } catch (err) {
                    err.message += "(while dispatching event with name '" + name + "')";
                    err.stack[0] += "(while dispatching event with name '" + name + "')";
                    throw err;
                }
            }
        }

        self.forNode = function (rootNode) {
            const context = Object.create(self);

            context.getInstanceNode = function (node) {
                if (
                    !rootNode.instances ||
                    !rootNode.instances[node.value]
                ) {
                    console.error("node", node);
                    throw new Error("Object instance for reference '" + node.value + "' not found in 'instances'!");
                }
                return rootNode.instances[node.value];
            }
            return context;
        }
    }

    var context = new InsightDomplateContext();

    function ensureRepsForNodeLoaded (node) {
        try {
            // TODO: Optionally pre-fill with already loaded reps.
            // TODO: Move node traversal into helper module.
            var loadTypes = {
    //            "default/unknown": true
            };
            function traverse (node) {

                if (node.type) {
                    loadTypes["default/" + node.type] = true;
                }

                if (node.meta) {
                    if (node.meta["encoder.trimmed"]) {
                        loadTypes["default/trimmed"] = true;
                    } else
                    // DEPRECATED
                    if (node.meta.renderer === "structures/table") {
                        loadTypes["default/table"] = true;
                        loadTypes["default/string"] = true;
                        node.type = "table";
                    } else
                    // DEPRECATED
                    if (node.meta.renderer === "structures/trace") {
                        loadTypes["default/trace"] = true;
                        loadTypes["default/string"] = true;
                        node.type = "trace";
                    } else
                    if (
                        node.meta["lang"] &&
                        node.meta["lang.type"]
                    ) {
                        // TODO: Lookup 'node.meta["lang"]/node.meta["lang.type"]' and see
                        // what it extends to determine what sub-structures to parse.
                        if (node.meta["lang"] === "php") {
                            if (node.meta["lang.type"] === "array") {
                                if (node.value[0] && Array.isArray(node.value[0])) {
                                    loadTypes["php/array-associative"] = true;
                                    node.value.forEach(function (pair) {
                                        traverse(pair[0]);
                                        traverse(pair[1]);
                                    });
                                } else {
                                    loadTypes["php/array-indexed"] = true;
                                    node.value.forEach(function (node) {
                                        traverse(node);
                                    });
                                }
                            } else
                            if (node.meta["lang.type"] === "map") {
                                loadTypes["php/array-associative"] = true;
                                node.value.forEach(function (pair) {
                                    traverse(pair[0]);
                                    traverse(pair[1]);
                                });
                            } else
                            if (node.meta["lang.type"] === "exception") {
                                loadTypes["php/exception"] = true;
                                loadTypes["default/string"] = true;
                                if (node.value.title) {
                                    traverse(node.value.title);
                                }
                                if (node.value.stack) {
                                    node.value.stack.forEach(function (frame) {
                                        frame.args.forEach(function (arg) {
                                            traverse(arg);
                                        });
                                    });
                                }
                            } else {
                                loadTypes[node.meta["lang"] + "/" + node.meta["lang.type"]] = true;

                                if (node.meta["lang.type"] === "table") {
                                    loadTypes["default/string"] = true;
                                } else
                                if (node.meta["lang.type"] === "trace") {
                                    loadTypes["default/string"] = true;
                                }    
                            }
                        } else {
                            loadTypes[node.meta["lang"] + "/" + node.meta["lang.type"]] = true;

                            if (node.meta["lang.type"] === "table") {
                                loadTypes["default/string"] = true;
                            } else
                            if (node.meta["lang.type"] === "trace") {
                                loadTypes["default/string"] = true;
                            } else
                            if (node.meta["lang.type"] === "pathtree") {
                                loadTypes["default/string"] = true;
                            } else
                            if (node.meta["lang.type"] === "optiontree") {
                                loadTypes["default/string"] = true;
                            }
                        }
    /*                    
                    } else
                    if (node.meta["lang.id"] === "registry.pinf.org/cadorn.org/github/renderers/packages/php/master") {
                        if (node.meta["renderer"] === "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table") {
                            loadTypes["default/table"] = true;
                            loadTypes["default/string"] = true;
                            node.type = "table";
                        }
    */
                    }
                    if (node.meta.wrapper) {
                        loadTypes[node.meta.wrapper] = true;

                        if (node.meta.wrapper === "wrappers/request") {
                            if (node.value.title) {
                                traverse(node.value.title);
                            }
                        }
                    }
                }

                if (
                    node.value !== null &&
                    typeof node.value !== 'undefined'
                ) {

                    let type = node.type || node.meta["lang.type"];

                    if (type === "array") {
                        node.value.forEach(function (node) {
                            traverse(node);
                        });
                    } else
                    if (type === "dictionary") {
                        Object.keys(node.value).forEach(function (key) {
                            traverse(node.value[key]);
                        });
                    } else
                    if (type === "map") {
                        node.value.forEach(function (pair) {
                            traverse(pair[0]);
                            traverse(pair[1]);
                        });
                    } else
                    if (type === "reference") {
                        if (node.value.instance) {
                            traverse(node.value.instance);
                        } else
                        if (
                            node.instances &&
                            typeof node.value === "number"
                        ) {
                            traverse(node.instances[node.value]);
                        } else
                        if (typeof node.getInstance === 'function') {
                            traverse(node.getInstance());
                        }
                    } else
                    if (type === "table") {
                        if (node.value.title) {
                            traverse(node.value.title);
                        }
                        if (node.value.header) {
                            node.value.header.forEach(function (node) {
                                traverse(node);
                            });
                        }
                        if (node.value.body) {
                            node.value.body.forEach(function (row) {
                                row.forEach(function (cell) {
                                    traverse(cell);
                                });
                            });
                        }
                    } else
                    if (type === "trace") {
                        if (node.value.title) {
                            traverse(node.value.title);
                        }
                        if (node.value.stack) {
                            node.value.stack.forEach(function (frame) {
                                frame.args.forEach(function (arg) {
                                    traverse(arg);
                                });
                            });
                        }
                    }
                }
            }
            traverse(node);

            return Promise.all(Object.keys(loadTypes).map(function (type) {

                type = type.split("/");

                var repUri = loader.repUriForType(type[0], type[1]);

                return loader.ensureRepForUri(repUri).then(function () {
                    return null;
                });
            }));
        } catch (err) {
            console.error('Error checking node:', node);
            throw err;
        }
    }

    self.renderNodeInto = function (node, selectorOrElement, options) {
        options = options || {};

        var el = (
            typeof selectorOrElement === 'string' && document.querySelector(selectorOrElement)
        ) || selectorOrElement;
        if (!el) {
            throw new Error("Could not find element for selector '" + selectorOrElement + "'!");
        }

        // TODO: Optionally skip this.
        // TODO: Once reps can be loaded async this can be optionally skipped.
        return ensureRepsForNodeLoaded(node).then(function () {

            var wrapperRep = context.wrapperRepForNode(node);

            if (wrapperRep) {

                if (!wrapperRep[options.tagName || 'tag']) {
                    console.error("node", node);
                    console.error("wrapperRep", wrapperRep);
                    throw new Error(`Could not get tag '${options.tagName || 'tag'}' from wrapper!`);
                }

                wrapperRep[options.tagName || 'tag'].replace({
                    context: context.forNode(node),
                    node: node
                }, el);

                return;
            }

            var rep = context.repForNode(node);

            rep[options.tagName || 'tag'].replace({
                context: context.forNode(node),
                node: node
            }, el);
        });
    }
}

exports.Renderer = Renderer;


function Loader (options) {
    let self = this;

    if (!options.repsBaseUrl) {
        throw new Error("'options.repsBaseUrl' not set!");
    }

    var loadingReps = {};
    var loadedReps = {};

    self.domplate = DOMPLATE;

    self.ensureRepForUri = function (repUri) {

        if (!loadingReps[repUri]) {

            loadingReps[repUri] = new WINDOW.Promise(function (resolve, reject) {

                // TODO: Optionally check against PINF sandbox directly to see if rep is loaded
                //       instead of letting domplate load them.
                var url = options.repsBaseUrl + "/" + repUri;
            
                //DOMPLATE.loadRep(url, { cssBaseUrl: options.repsBaseUrl.replace(/\/?$/, "/") + repUri.replace(/^([^\/]+\/).+$/, "$1") }, function (rep) {
                DOMPLATE.loadRep(url, { cssBaseUrl: options.repsBaseUrl.replace(/\/?$/, "/") }, function (rep) {

                    setTimeout(function () {
                        rep.__ensureCssInjected();
                    }, 0);

                    loadedReps[repUri] = rep;

                    resolve(rep);
                }, function (err) {
                    var error = new Error("Error loading rep for uri '" + repUri + "' from '" + url + "'!");
                    error.previous = err;
                    reject(error);
                });                        
            });
        }

        return loadingReps[repUri];
    }

    self.repUriForType = function (lang, type) {
        type = type || "unknown";
        return lang + "/" + type;
    }

    function repUriForNode (node) {

        var lang = "default";
        var type = node.type;

        if (node.meta) {
            if (node.meta["encoder.trimmed"]) {
                type = "trimmed";
            } else
            // DEPRECATED
            if (node.meta.renderer === "structures/table") {
                type = "table";
            } else
            // DEPRECATED
            if (node.meta.renderer === "structures/trace") {
                type = "trace";
            } else
            if (
                node.meta["lang"] &&
                node.meta["lang.type"]
            ) {
                lang = node.meta["lang"];
                type = node.meta["lang.type"];

                if (lang === "php") {
                    if (type === "array") {
                        if (node.value[0] && Array.isArray(node.value[0])) {
                            type = "array-associative";
                        } else {
                            type = "array-indexed";
                        }
                    } else
                    if (type === "map") {
                        type = "array-associative";
                    }
                }
            } else
            if (node.meta["lang.id"] === "registry.pinf.org/cadorn.org/github/renderers/packages/php/master") {
                lang = "php";
                type = node.meta["lang.type"];
                if (node.meta["renderer"] === "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table") {
                    lang = "default";
                    type = "table";
                }
            }
        }

        if (!type) {
            console.error("node", node);
            console.error("lang", lang);
            throw new Error('Could not determine type for node!');
        }

//        console.log("repUriForNode() lang, type:", lang, type);

        return self.repUriForType(lang, type);
    }

    self.repForNode = function (node) {

        var repUri = repUriForNode(node);

        if (!loadedReps[repUri]) {
            throw new Error("Rep for uri '" + repUri + "' not loaded!");
        }

        return loadedReps[repUri];
    }
    self.wrapperRepForNode = function (node) {
        if (
            node.meta &&
            node.meta.wrapper
        ) {
            if (!loadedReps[node.meta.wrapper]) {
                throw new Error("Wrapper Rep for uri '" + node.meta.wrapper + "' not loaded!");
            }
            return loadedReps[node.meta.wrapper];
        }
        return null;
    }
}

exports.Loader = Loader;

},{"domplate/dist/domplate.js":1}],7:[function(require,module,exports){
"use strict";

var REPS = require("insight.domplate.reps");

var ENCODER = require("insight-for-js/lib/encoder/default");

var DECODER = require("insight-for-js/lib/decoder/default");

var repsBaseUrl = "/reps";

if (typeof bundle !== "undefined") {
  repsBaseUrl = bundle.module.filename.replace(/\/[^\/]+\/[^\/]+$/, '/insight.domplate.reps/dist/reps');
}

var repLoader = new REPS.Loader({
  repsBaseUrl: repsBaseUrl
});
var encoder = ENCODER.Encoder();
encoder.setOption("maxObjectDepth", 1000);
encoder.setOption("maxArrayDepth", 1000);
encoder.setOption("maxOverallDepth", 1000);

exports.main = function (JSONREP, node) {
  var og = DECODER.generateFromMessage({
    meta: {},
    data: encoder.encode(node, {}, {})
  }, DECODER.EXTENDED);
  var repRenderer = new REPS.Renderer({
    loader: repLoader,
    onEvent: function onEvent(name, args) {
      console.log('onEvent()', name, args);
    }
  });
  var rootNode = og.getOrigin();
  rootNode.meta = rootNode.meta || {};
  rootNode.meta.wrapper = 'wrappers/viewer';
  return JSONREP.makeRep('<div></div>', {
    on: {
      mount: function mount(el) {
        repRenderer.renderNodeInto(rootNode, el);
      }
    }
  });
};
},{"insight-for-js/lib/decoder/default":2,"insight-for-js/lib/encoder/default":3,"insight.domplate.reps":6}]},{},[7])(7)
});

	});
});