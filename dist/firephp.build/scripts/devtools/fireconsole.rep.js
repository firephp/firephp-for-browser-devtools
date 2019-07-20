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
	function loadInBrowser (uri, loadedCallback) {
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
						element.parentNode.removeChild(element);
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
							}
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
									}
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
				return fallbackLoad(uri, loadedCallback);
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
(function (process){
/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {
      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      this._maxListeners = conf.maxListeners !== undefined ? conf.maxListeners : defaultMaxListeners;

      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);
      conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    } else {
      this._maxListeners = defaultMaxListeners;
    }
  }

  function logPossibleMemoryLeak(count, eventName) {
    var errorMsg = '(node) warning: possible EventEmitter memory ' +
        'leak detected. ' + count + ' listeners added. ' +
        'Use emitter.setMaxListeners() to increase limit.';

    if(this.verboseMemoryLeak){
      errorMsg += ' Event name: ' + eventName + '.';
    }

    if(typeof process !== 'undefined' && process.emitWarning){
      var e = new Error(errorMsg);
      e.name = 'MaxListenersExceededWarning';
      e.emitter = this;
      e.count = count;
      process.emitWarning(e);
    } else {
      console.error(errorMsg);

      if (console.trace){
        console.trace();
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    this.verboseMemoryLeak = false;
    configure.call(this, conf);
  }
  EventEmitter.EventEmitter2 = EventEmitter; // backwards compatibility for exporting EventEmitter property

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name !== undefined) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else {
          if (typeof tree._listeners === 'function') {
            tree._listeners = [tree._listeners];
          }

          tree._listeners.push(listener);

          if (
            !tree._listeners.warned &&
            this._maxListeners > 0 &&
            tree._listeners.length > this._maxListeners
          ) {
            tree._listeners.warned = true;
            logPossibleMemoryLeak.call(this, tree._listeners.length, name);
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    if (n !== undefined) {
      this._maxListeners = n;
      if (!this._conf) this._conf = {};
      this._conf.maxListeners = n;
    }
  };

  EventEmitter.prototype.event = '';


  EventEmitter.prototype.once = function(event, fn) {
    return this._once(event, fn, false);
  };

  EventEmitter.prototype.prependOnceListener = function(event, fn) {
    return this._once(event, fn, true);
  };

  EventEmitter.prototype._once = function(event, fn, prepend) {
    this._many(event, 1, fn, prepend);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    return this._many(event, ttl, fn, false);
  }

  EventEmitter.prototype.prependMany = function(event, ttl, fn) {
    return this._many(event, ttl, fn, true);
  }

  EventEmitter.prototype._many = function(event, ttl, fn, prepend) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      return fn.apply(this, arguments);
    }

    listener._origin = fn;

    this._on(event, listener, prepend);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all && this._all.length) {
      handler = this._all.slice();
      if (al > 3) {
        args = new Array(al);
        for (j = 0; j < al; j++) args[j] = arguments[j];
      }

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this, type);
          break;
        case 2:
          handler[i].call(this, type, arguments[1]);
          break;
        case 3:
          handler[i].call(this, type, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
      if (typeof handler === 'function') {
        this.event = type;
        switch (al) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          args = new Array(al - 1);
          for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          handler.apply(this, args);
        }
        return true;
      } else if (handler) {
        // need to make copy of handlers because list can change in the middle
        // of emit call
        handler = handler.slice();
      }
    }

    if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this);
          break;
        case 2:
          handler[i].call(this, arguments[1]);
          break;
        case 3:
          handler[i].call(this, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
      return true;
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }

    return !!this._all;
  };

  EventEmitter.prototype.emitAsync = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
        if (!this._events.newListener) { return Promise.resolve([false]); }
    }

    var promises= [];

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all) {
      if (al > 3) {
        args = new Array(al);
        for (j = 1; j < al; j++) args[j] = arguments[j];
      }
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(this._all[i].call(this, type));
          break;
        case 2:
          promises.push(this._all[i].call(this, type, arguments[1]));
          break;
        case 3:
          promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
          break;
        default:
          promises.push(this._all[i].apply(this, args));
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      switch (al) {
      case 1:
        promises.push(handler.call(this));
        break;
      case 2:
        promises.push(handler.call(this, arguments[1]));
        break;
      case 3:
        promises.push(handler.call(this, arguments[1], arguments[2]));
        break;
      default:
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
        promises.push(handler.apply(this, args));
      }
    } else if (handler && handler.length) {
      handler = handler.slice();
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(handler[i].call(this));
          break;
        case 2:
          promises.push(handler[i].call(this, arguments[1]));
          break;
        case 3:
          promises.push(handler[i].call(this, arguments[1], arguments[2]));
          break;
        default:
          promises.push(handler[i].apply(this, args));
        }
      }
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        return Promise.reject(arguments[1]); // Unhandled 'error' event
      } else {
        return Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }

    return Promise.all(promises);
  };

  EventEmitter.prototype.on = function(type, listener) {
    return this._on(type, listener, false);
  };

  EventEmitter.prototype.prependListener = function(type, listener) {
    return this._on(type, listener, true);
  };

  EventEmitter.prototype.onAny = function(fn) {
    return this._onAny(fn, false);
  };

  EventEmitter.prototype.prependAny = function(fn) {
    return this._onAny(fn, true);
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype._onAny = function(fn, prepend){
    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    if(prepend){
      this._all.unshift(fn);
    }else{
      this._all.push(fn);
    }

    return this;
  }

  EventEmitter.prototype._on = function(type, listener, prepend) {
    if (typeof type === 'function') {
      this._onAny(type, listener);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if (this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else {
      if (typeof this._events[type] === 'function') {
        // Change to array.
        this._events[type] = [this._events[type]];
      }

      // If we've already got an array, just add
      if(prepend){
        this._events[type].unshift(listener);
      }else{
        this._events[type].push(listener);
      }

      // Check for listener leak
      if (
        !this._events[type].warned &&
        this._maxListeners > 0 &&
        this._events[type].length > this._maxListeners
      ) {
        this._events[type].warned = true;
        logPossibleMemoryLeak.call(this, this._events[type].length, type);
      }
    }

    return this;
  }

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }

        this.emit("removeListener", type, listener);

        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }

        this.emit("removeListener", type, listener);
      }
    }

    function recursivelyGarbageCollect(root) {
      if (root === undefined) {
        return;
      }
      var keys = Object.keys(root);
      for (var i in keys) {
        var key = keys[i];
        var obj = root[key];
        if ((obj instanceof Function) || (typeof obj !== "object") || (obj === null))
          continue;
        if (Object.keys(obj).length > 0) {
          recursivelyGarbageCollect(root[key]);
        }
        if (Object.keys(obj).length === 0) {
          delete root[key];
        }
      }
    }
    recursivelyGarbageCollect(this.listenerTree);

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          this.emit("removeListenerAny", fn);
          return this;
        }
      }
    } else {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++)
        this.emit("removeListenerAny", fns[i]);
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else if (this._events) {
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.eventNames = function(){
    return Object.keys(this._events);
  }

  EventEmitter.prototype.listenerCount = function(type) {
    return this.listeners(type).length;
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (typeof define === 'function' && define.amd) {
     // AMD. Register as an anonymous module.
    define(function() {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

}).call(this,require('_process'))
},{"_process":130}],3:[function(require,module,exports){
var hashClear = require('./_hashClear'),
    hashDelete = require('./_hashDelete'),
    hashGet = require('./_hashGet'),
    hashHas = require('./_hashHas'),
    hashSet = require('./_hashSet');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;

},{"./_hashClear":44,"./_hashDelete":45,"./_hashGet":46,"./_hashHas":47,"./_hashSet":48}],4:[function(require,module,exports){
var listCacheClear = require('./_listCacheClear'),
    listCacheDelete = require('./_listCacheDelete'),
    listCacheGet = require('./_listCacheGet'),
    listCacheHas = require('./_listCacheHas'),
    listCacheSet = require('./_listCacheSet');

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;

},{"./_listCacheClear":55,"./_listCacheDelete":56,"./_listCacheGet":57,"./_listCacheHas":58,"./_listCacheSet":59}],5:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;

},{"./_getNative":40,"./_root":71}],6:[function(require,module,exports){
var mapCacheClear = require('./_mapCacheClear'),
    mapCacheDelete = require('./_mapCacheDelete'),
    mapCacheGet = require('./_mapCacheGet'),
    mapCacheHas = require('./_mapCacheHas'),
    mapCacheSet = require('./_mapCacheSet');

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;

},{"./_mapCacheClear":60,"./_mapCacheDelete":61,"./_mapCacheGet":62,"./_mapCacheHas":63,"./_mapCacheSet":64}],7:[function(require,module,exports){
var ListCache = require('./_ListCache'),
    stackClear = require('./_stackClear'),
    stackDelete = require('./_stackDelete'),
    stackGet = require('./_stackGet'),
    stackHas = require('./_stackHas'),
    stackSet = require('./_stackSet');

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;

},{"./_ListCache":4,"./_stackClear":75,"./_stackDelete":76,"./_stackGet":77,"./_stackHas":78,"./_stackSet":79}],8:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":71}],9:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;

},{"./_root":71}],10:[function(require,module,exports){
/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;

},{}],11:[function(require,module,exports){
var baseTimes = require('./_baseTimes'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isBuffer = require('./isBuffer'),
    isIndex = require('./_isIndex'),
    isTypedArray = require('./isTypedArray');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;

},{"./_baseTimes":27,"./_isIndex":50,"./isArguments":84,"./isArray":85,"./isBuffer":88,"./isTypedArray":94}],12:[function(require,module,exports){
var baseAssignValue = require('./_baseAssignValue'),
    eq = require('./eq');

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignMergeValue;

},{"./_baseAssignValue":15,"./eq":82}],13:[function(require,module,exports){
var baseAssignValue = require('./_baseAssignValue'),
    eq = require('./eq');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;

},{"./_baseAssignValue":15,"./eq":82}],14:[function(require,module,exports){
var eq = require('./eq');

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;

},{"./eq":82}],15:[function(require,module,exports){
var defineProperty = require('./_defineProperty');

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;

},{"./_defineProperty":37}],16:[function(require,module,exports){
var isObject = require('./isObject');

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

module.exports = baseCreate;

},{"./isObject":91}],17:[function(require,module,exports){
var createBaseFor = require('./_createBaseFor');

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;

},{"./_createBaseFor":36}],18:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":8,"./_getRawTag":42,"./_objectToString":68}],19:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;

},{"./_baseGetTag":18,"./isObjectLike":92}],20:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isMasked = require('./_isMasked'),
    isObject = require('./isObject'),
    toSource = require('./_toSource');

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;

},{"./_isMasked":53,"./_toSource":80,"./isFunction":89,"./isObject":91}],21:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isLength = require('./isLength'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;

},{"./_baseGetTag":18,"./isLength":90,"./isObjectLike":92}],22:[function(require,module,exports){
var isObject = require('./isObject'),
    isPrototype = require('./_isPrototype'),
    nativeKeysIn = require('./_nativeKeysIn');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;

},{"./_isPrototype":54,"./_nativeKeysIn":66,"./isObject":91}],23:[function(require,module,exports){
var Stack = require('./_Stack'),
    assignMergeValue = require('./_assignMergeValue'),
    baseFor = require('./_baseFor'),
    baseMergeDeep = require('./_baseMergeDeep'),
    isObject = require('./isObject'),
    keysIn = require('./keysIn'),
    safeGet = require('./_safeGet');

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    if (isObject(srcValue)) {
      stack || (stack = new Stack);
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

module.exports = baseMerge;

},{"./_Stack":7,"./_assignMergeValue":12,"./_baseFor":17,"./_baseMergeDeep":24,"./_safeGet":72,"./isObject":91,"./keysIn":95}],24:[function(require,module,exports){
var assignMergeValue = require('./_assignMergeValue'),
    cloneBuffer = require('./_cloneBuffer'),
    cloneTypedArray = require('./_cloneTypedArray'),
    copyArray = require('./_copyArray'),
    initCloneObject = require('./_initCloneObject'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isArrayLikeObject = require('./isArrayLikeObject'),
    isBuffer = require('./isBuffer'),
    isFunction = require('./isFunction'),
    isObject = require('./isObject'),
    isPlainObject = require('./isPlainObject'),
    isTypedArray = require('./isTypedArray'),
    safeGet = require('./_safeGet'),
    toPlainObject = require('./toPlainObject');

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

module.exports = baseMergeDeep;

},{"./_assignMergeValue":12,"./_cloneBuffer":30,"./_cloneTypedArray":31,"./_copyArray":32,"./_initCloneObject":49,"./_safeGet":72,"./isArguments":84,"./isArray":85,"./isArrayLikeObject":87,"./isBuffer":88,"./isFunction":89,"./isObject":91,"./isPlainObject":93,"./isTypedArray":94,"./toPlainObject":98}],25:[function(require,module,exports){
var identity = require('./identity'),
    overRest = require('./_overRest'),
    setToString = require('./_setToString');

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;

},{"./_overRest":70,"./_setToString":73,"./identity":83}],26:[function(require,module,exports){
var constant = require('./constant'),
    defineProperty = require('./_defineProperty'),
    identity = require('./identity');

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;

},{"./_defineProperty":37,"./constant":81,"./identity":83}],27:[function(require,module,exports){
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;

},{}],28:[function(require,module,exports){
/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;

},{}],29:[function(require,module,exports){
var Uint8Array = require('./_Uint8Array');

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;

},{"./_Uint8Array":9}],30:[function(require,module,exports){
var root = require('./_root');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;

},{"./_root":71}],31:[function(require,module,exports){
var cloneArrayBuffer = require('./_cloneArrayBuffer');

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;

},{"./_cloneArrayBuffer":29}],32:[function(require,module,exports){
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;

},{}],33:[function(require,module,exports){
var assignValue = require('./_assignValue'),
    baseAssignValue = require('./_baseAssignValue');

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;

},{"./_assignValue":13,"./_baseAssignValue":15}],34:[function(require,module,exports){
var root = require('./_root');

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;

},{"./_root":71}],35:[function(require,module,exports){
var baseRest = require('./_baseRest'),
    isIterateeCall = require('./_isIterateeCall');

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

},{"./_baseRest":25,"./_isIterateeCall":51}],36:[function(require,module,exports){
/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;

},{}],37:[function(require,module,exports){
var getNative = require('./_getNative');

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;

},{"./_getNative":40}],38:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],39:[function(require,module,exports){
var isKeyable = require('./_isKeyable');

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;

},{"./_isKeyable":52}],40:[function(require,module,exports){
var baseIsNative = require('./_baseIsNative'),
    getValue = require('./_getValue');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;

},{"./_baseIsNative":20,"./_getValue":43}],41:[function(require,module,exports){
var overArg = require('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":69}],42:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":8}],43:[function(require,module,exports){
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;

},{}],44:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;

},{"./_nativeCreate":65}],45:[function(require,module,exports){
/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;

},{}],46:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;

},{"./_nativeCreate":65}],47:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;

},{"./_nativeCreate":65}],48:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;

},{"./_nativeCreate":65}],49:[function(require,module,exports){
var baseCreate = require('./_baseCreate'),
    getPrototype = require('./_getPrototype'),
    isPrototype = require('./_isPrototype');

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

module.exports = initCloneObject;

},{"./_baseCreate":16,"./_getPrototype":41,"./_isPrototype":54}],50:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;

},{}],51:[function(require,module,exports){
var eq = require('./eq'),
    isArrayLike = require('./isArrayLike'),
    isIndex = require('./_isIndex'),
    isObject = require('./isObject');

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;

},{"./_isIndex":50,"./eq":82,"./isArrayLike":86,"./isObject":91}],52:[function(require,module,exports){
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;

},{}],53:[function(require,module,exports){
var coreJsData = require('./_coreJsData');

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;

},{"./_coreJsData":34}],54:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;

},{}],55:[function(require,module,exports){
/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;

},{}],56:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;

},{"./_assocIndexOf":14}],57:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;

},{"./_assocIndexOf":14}],58:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;

},{"./_assocIndexOf":14}],59:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;

},{"./_assocIndexOf":14}],60:[function(require,module,exports){
var Hash = require('./_Hash'),
    ListCache = require('./_ListCache'),
    Map = require('./_Map');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;

},{"./_Hash":3,"./_ListCache":4,"./_Map":5}],61:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;

},{"./_getMapData":39}],62:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;

},{"./_getMapData":39}],63:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;

},{"./_getMapData":39}],64:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;

},{"./_getMapData":39}],65:[function(require,module,exports){
var getNative = require('./_getNative');

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;

},{"./_getNative":40}],66:[function(require,module,exports){
/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;

},{}],67:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

},{"./_freeGlobal":38}],68:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],69:[function(require,module,exports){
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

},{}],70:[function(require,module,exports){
var apply = require('./_apply');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;

},{"./_apply":10}],71:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":38}],72:[function(require,module,exports){
/**
 * Gets the value at `key`, unless `key` is "__proto__".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  if (key == '__proto__') {
    return;
  }

  return object[key];
}

module.exports = safeGet;

},{}],73:[function(require,module,exports){
var baseSetToString = require('./_baseSetToString'),
    shortOut = require('./_shortOut');

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;

},{"./_baseSetToString":26,"./_shortOut":74}],74:[function(require,module,exports){
/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;

},{}],75:[function(require,module,exports){
var ListCache = require('./_ListCache');

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

module.exports = stackClear;

},{"./_ListCache":4}],76:[function(require,module,exports){
/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

module.exports = stackDelete;

},{}],77:[function(require,module,exports){
/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;

},{}],78:[function(require,module,exports){
/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;

},{}],79:[function(require,module,exports){
var ListCache = require('./_ListCache'),
    Map = require('./_Map'),
    MapCache = require('./_MapCache');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;

},{"./_ListCache":4,"./_Map":5,"./_MapCache":6}],80:[function(require,module,exports){
/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;

},{}],81:[function(require,module,exports){
/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;

},{}],82:[function(require,module,exports){
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;

},{}],83:[function(require,module,exports){
/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],84:[function(require,module,exports){
var baseIsArguments = require('./_baseIsArguments'),
    isObjectLike = require('./isObjectLike');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;

},{"./_baseIsArguments":19,"./isObjectLike":92}],85:[function(require,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],86:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;

},{"./isFunction":89,"./isLength":90}],87:[function(require,module,exports){
var isArrayLike = require('./isArrayLike'),
    isObjectLike = require('./isObjectLike');

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;

},{"./isArrayLike":86,"./isObjectLike":92}],88:[function(require,module,exports){
var root = require('./_root'),
    stubFalse = require('./stubFalse');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

},{"./_root":71,"./stubFalse":97}],89:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObject = require('./isObject');

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;

},{"./_baseGetTag":18,"./isObject":91}],90:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],91:[function(require,module,exports){
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],92:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],93:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    getPrototype = require('./_getPrototype'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;

},{"./_baseGetTag":18,"./_getPrototype":41,"./isObjectLike":92}],94:[function(require,module,exports){
var baseIsTypedArray = require('./_baseIsTypedArray'),
    baseUnary = require('./_baseUnary'),
    nodeUtil = require('./_nodeUtil');

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;

},{"./_baseIsTypedArray":21,"./_baseUnary":28,"./_nodeUtil":67}],95:[function(require,module,exports){
var arrayLikeKeys = require('./_arrayLikeKeys'),
    baseKeysIn = require('./_baseKeysIn'),
    isArrayLike = require('./isArrayLike');

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;

},{"./_arrayLikeKeys":11,"./_baseKeysIn":22,"./isArrayLike":86}],96:[function(require,module,exports){
var baseMerge = require('./_baseMerge'),
    createAssigner = require('./_createAssigner');

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = createAssigner(function(object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

module.exports = merge;

},{"./_baseMerge":23,"./_createAssigner":35}],97:[function(require,module,exports){
/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;

},{}],98:[function(require,module,exports){
var copyObject = require('./_copyObject'),
    keysIn = require('./keysIn');

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

module.exports = toPlainObject;

},{"./_copyObject":33,"./keysIn":95}],99:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var WINDOW = window;

var LODASH_MERGE = require("lodash/merge");

var EVENT_EMITTER = require("eventemitter2").EventEmitter2;

var REPS = require("insight.domplate.reps");

var repsBaseUrl = "/reps";

if (typeof bundle !== "undefined") {
  repsBaseUrl = bundle.module.filename.replace(/(^|\/)[^\/]+\/[^\/]+$/, '$1dist/insight.domplate.reps');
}

var repLoader = new REPS.Loader({
  repsBaseUrl: repsBaseUrl
});

var WILDFIRE = require("wildfire-for-js/lib/wildfire");

var BROWSER_API_ENCODER = require("./encoders/BrowserApi-0.1");

var FIREBUG_CONSOLE_DECODER = require("./decoders/FirebugConsole-0.1");

var encoder = new BROWSER_API_ENCODER.Encoder();
var decoder = new FIREBUG_CONSOLE_DECODER.Decoder();
var receiver = WILDFIRE.Receiver();
receiver.setId("http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1");
receiver.addListener({
  onMessageReceived: function onMessageReceived(request, message) {
    exports.fireconsole.appendMessage(decoder.formatMessage(message));
  }
});
var receiverDump = WILDFIRE.Receiver();
receiverDump.setId("http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1");
receiverDump.addListener({
  onMessageReceived: function onMessageReceived(request, message) {
    exports.fireconsole.appendMessage(decoder.formatMessage(message));
  }
});
var receiverChannel = WILDFIRE.PostMessageChannel();
receiverChannel.addReceiver(receiver);
receiverChannel.addReceiver(receiverDump);

function FireConsole() {
  var self = this;

  self.parseReceivedPostMessage = function () {
    return receiverChannel.parseReceivedPostMessage.apply(receiverChannel, arguments);
  };

  var panelEl = null;

  self.setPanelElement = function (el) {
    panelEl = el;
    flushBuffer();
  };

  var Supervisor = exports.Supervisor = function () {
    this.groupStack = [];
    this._appendMessageToNode__queue = false;
    this.on = {};
  };

  Supervisor.prototype.ensureCssForDocument = function (document) {
    console.error("Supervisor.prototype.ensureCssForDocument", document);
  };

  Supervisor.prototype.resetGroupStack = function () {
    this.groupStack = [];
  };

  Supervisor.prototype.appendMessageToNode = function (domNode, message) {
    if (this._appendMessageToNode__queue === false) {
      this._appendMessageToNode__queue = [];
      doSynchronizedappendMessageToNode(this, domNode, message);
    } else if (this._appendMessageToNode__queue !== false) this._appendMessageToNode__queue.push([domNode, message]);
  };

  function doSynchronizedappendMessageToNode(supervisor, panelEl, message) {
    if (supervisor.groupStack.length > 0) {
      panelEl = supervisor.groupStack[supervisor.groupStack.length - 1];

      if (!panelEl) {
        throw new Error("panelEl is null!");
      }
    }

    var options = message.options;
    var meta = message.meta;
    var domNode = null;

    if (typeof meta["group.end"] === "undefined") {
      domNode = WINDOW.document.createElement("div");
      domNode.setAttribute("class", "message");
      panelEl.appendChild(domNode);
    }

    new Promise(function (resolve, reject) {
      if (domNode) {
        var nodeTree = message.node;
        nodeTree.meta = nodeTree.meta || {};
        nodeTree.meta.wrapper = 'wrappers/console';
        repRenderer.renderNodeInto(nodeTree, domNode).then(resolve, reject);
      } else {
        resolve();
      }
    }).then(function () {
      if (typeof meta["group.start"] !== "undefined") {
        var node = repLoader.domplate.util.getElementByClass(domNode, "body");
        supervisor.groupStack.push(node);

        if (_typeof(meta["group.expand"]) && meta["group.expand"] === meta["group"] && node.parentNode) {
          node.parentNode.setAttribute("expanded", "true");
        }
      }

      if (typeof meta["group.end"] !== "undefined") {
        var count = meta["group.end"];

        if (count === true) {
          count = 1;
        }

        for (var i = 0; i < count; i++) {
          var groupStartNode = supervisor.groupStack.pop();

          if (groupStartNode.parentNode.templateObject) {
            groupStartNode.parentNode.templateObject.setCount(groupStartNode.parentNode, groupStartNode.children.length);
          }
        }
      }

      if (meta["expand"]) {
        var node = repLoader.domplate.util.getElementByClass(domNode, "body");

        if (node.parentNode && node.parentNode.templateObject) {
          node.parentNode.templateObject.expandForMasterRow(node.parentNode, node);
        } else {
          console.error("NYI - expand for message - in " + module.id);
        }
      }

      if (meta["actions"] === false) {
        var node = repLoader.domplate.util.getElementByClass(domNode, "actions");

        if (node) {
          node.style.display = "none";
        }
      }

      try {
        if (domNode && domNode.children[0] && domNode.children[0].templateObject && domNode.children[0].templateObject.postRender) {
          domNode.children[0].templateObject.postRender(domNode.children[0]);
        }
      } catch (e) {
        console.warn("Error during template postRender", e, e.stack);
      }

      if (supervisor._appendMessageToNode__queue.length > 0) {
        doSynchronizedappendMessageToNode.apply(null, [supervisor].concat(supervisor._appendMessageToNode__queue.shift()));
      } else {
        supervisor._appendMessageToNode__queue = false;
      }
    }).catch(function (err) {
      throw err;
    });
  }

  self.getPanelEl = function () {
    return panelEl;
  };

  self.clear = function (options) {
    options = options || {};
    var panelEl = options.panelEl || self.getPanelEl();
    panelEl.innerHTML = "";
  };

  self.hide = function () {
    self.getPanelEl().style.display = "none";
  };

  self.show = function () {
    self.getPanelEl().style.display = "";
  };

  self.isShowing = function () {
    return self.getPanelEl().style.display === "";
  };

  self.destroy = function () {};

  var buffer = [];

  function flushBuffer() {
    if (!buffer.length || !panelEl) return;
    buffer.map(function (message) {
      self.appendMessage(message);
    });
    buffer = [];
  }

  var renderSupervisor = new Supervisor();
  var repRenderer = self.repRenderer = new REPS.Renderer({
    loader: repLoader,
    onEvent: function onEvent(name, args) {
      console.log('repRenderer.onEvent()', name, args);

      if (name === "click") {} else if (name === "expand") {} else if (name === "contract") {} else if (name === "inspectMessage") {
        self.emit(name, {
          node: args[1].args.node
        });
      } else if (name === "inspectFile") {
        console.log("INSPECT FILE", args);
      } else if (name === "inspectNode") {
        args[1].args.node['#'] = "InsightTree";
        self.emit(name, {
          node: args[1].args.node
        });
      } else {
        console.error("No handler for: repRenderer.onEvent()", name, args);
        throw new Error("NYI");
      }
    }
  });

  self.appendMessage = function (message, options) {
    options = options || {};

    if (options.clear) {
      self.clear(options);
    }

    var panelEl = options.panelEl || self.getPanelEl();

    if (!panelEl) {
      buffer.push(message);
      return;
    }

    if (options.view === "detail") {
      repRenderer.renderNodeInto(message, panelEl);
    } else {
      if (message["#"] !== "InsightTree") {
        message = encoder.formatMessage(message, options);
      }

      var msg = {
        render: function render(el, view, messageObject) {
          throw new Error("Render!!");

          if (typeof meta["group.start"] !== "undefined" && meta["group.start"]) {
            return;
          }

          var options = {};

          if (view) {
            options.view = view;
          }

          if (typeof options.view !== "array") {
            options.view = [options.view];
          }

          if (node.type === "reference" || node.meta.renderer === "structures/table" || node.meta.renderer === "structures/trace") {
            var tpl = null;

            if (node.type === "reference") {
              throw new Error("Get REFERENCE");
              tpl = commonHelpers.getTemplateModuleForNode(node.instances[0]);
            } else if (node.meta.renderer === "structures/table" || node.meta.renderer === "structures/trace") {
              tpl = commonHelpers.getTemplateModuleForNode(_og.origin);
            }

            var tplDec = tpl.getTemplateDeclaration();

            if (tplDec.VAR_hideShortTagOnExpand === false) {
              messageObject.postRender.keeptitle = true;
            }
          }
        },
        meta: message.meta,
        node: message,
        options: {},
        context: message.context || undefined
      };
      renderSupervisor.appendMessageToNode(panelEl, msg);
    }
  };

  var consoles = {};

  self.consoleForId = function (id) {
    var el = panelEl.querySelector('DIV[fireconsoleid="' + id + '"]');

    if (!el) {
      el = WINDOW.document.createElement('div');
      el.setAttribute("fireconsoleid", id);
      panelEl.appendChild(el);
    }

    if (!consoles[id]) {
      consoles[id] = new FireConsole();
      consoles[id].setPanelElement(el);
      consoles[id].onAny(function () {
        self.emit.apply(self, arguments);
      });
    }

    return consoles[id];
  };

  self.destroyConsoleForId = function (id) {
    if (!consoles[id]) {
      return;
    }

    consoles[id].destroy();
    delete consoles[id];
    var el = panelEl.querySelector('DIV[fireconsoleid="' + id + '"]');

    if (el) {
      el.parentNode.removeChild(el);
    }
  };

  var publicAPI = new PublicAPI(self);

  self.getAPI = function () {
    return publicAPI;
  };
}

FireConsole.prototype = Object.create(EVENT_EMITTER.prototype);

var PublicAPI = function () {
  function PublicAPI(fireconsole, options) {
    _classCallCheck(this, PublicAPI);

    this.fireconsole = fireconsole;
    this.options = options || {};
    this.FireConsole = FireConsole;
  }

  _createClass(PublicAPI, [{
    key: "clear",
    value: function clear() {
      return this.fireconsole.clear.apply(this.fireconsole, arguments);
    }
  }, {
    key: "on",
    value: function on() {
      return this.fireconsole.on.apply(this.fireconsole, arguments);
    }
  }, {
    key: "off",
    value: function off() {
      return this.fireconsole.off.apply(this.fireconsole, arguments);
    }
  }, {
    key: "_logObjectWithPriority",
    value: function _logObjectWithPriority(priority, message) {
      this.fireconsole.appendMessage(message, LODASH_MERGE({}, this.options, {
        priority: priority
      }));
    }
  }, {
    key: "renderMessageInto",
    value: function renderMessageInto(panelEl, message) {
      this.fireconsole.appendMessage(message, {
        panelEl: panelEl,
        clear: true,
        view: "detail"
      });
    }
  }, {
    key: "label",
    value: function label(_label) {
      return new PublicAPI(this.fireconsole, {
        label: _label
      });
    }
  }, {
    key: "log",
    value: function log(message) {
      this._logObjectWithPriority("log", message);
    }
  }, {
    key: "info",
    value: function info(message) {
      this._logObjectWithPriority("info", message);
    }
  }, {
    key: "warn",
    value: function warn(message) {
      this._logObjectWithPriority("warn", message);
    }
  }, {
    key: "error",
    value: function error(message) {
      this._logObjectWithPriority("error", message);
    }
  }, {
    key: "send",
    value: function send(message) {
      if (message.sender && message.receiver) {
        if (message.receiver === "http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1") {
          this.fireconsole.appendMessage(decoder.formatMessage(message));
        } else if (message.receiver === "http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1") {
          this.fireconsole.appendMessage(decoder.formatMessage(message));
        } else {
          throw new Error("Receiver for ID '".concat(message.receiver, "' not implemented!"));
        }

        return;
      }

      if (!Array.isArray(message)) {
        message = [message];
      }

      this.fireconsole.parseReceivedPostMessage(message);
    }
  }]);

  return PublicAPI;
}();

;
exports.fireconsole = new FireConsole();

if (typeof WINDOW.FC === "undefined") {
  WINDOW.FC = exports.fireconsole.getAPI();
}

exports.main = function (JSONREP, node) {
  return Promise.all(Object.keys(node.plugins || []).map(function (key) {
    var panelNode = {};
    panelNode[key] = node[key];
    return JSONREP.markupNode(panelNode).then(function () {
      return null;
    });
  })).then(function () {
    if (node.messages) {
      node.messages.map(function (message) {
        exports.fireconsole.appendMessage(message);
      });
    }

    if (node.load) {
      node.load.map(function (uri) {
        var script = WINDOW.document.createElement('script');
        script.type = 'text/javascript';
        script.src = uri;
        WINDOW.document.getElementsByTagName('head')[0].appendChild(script);
      });
    }

    return JSONREP.makeRep('<div></div>', {
      css: {
        ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
        "_code": "{\"_cssid\":\"03b5aa4bff54967226c7471f1dec899141d57197\",\"repUri\":\"fireconsole\"}",
        "_format": "json",
        "_args": [],
        "_compiled": false
      },
      on: {
        mount: function mount(el) {
          exports.fireconsole.setPanelElement(el);
        }
      }
    });
  });
};
},{"./decoders/FirebugConsole-0.1":100,"./encoders/BrowserApi-0.1":101,"eventemitter2":2,"insight.domplate.reps":126,"lodash/merge":96,"wildfire-for-js/lib/wildfire":113}],100:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var VERBOSE = false;

var ENCODER = require("insight-for-js/lib/encoder/default");

var encoder = ENCODER.Encoder();
encoder.setOption("maxObjectDepth", 1000);
encoder.setOption("maxArrayDepth", 1000);
encoder.setOption("maxOverallDepth", 1000);

var Decoder = function () {
  function Decoder() {
    _classCallCheck(this, Decoder);
  }

  _createClass(Decoder, [{
    key: "formatMessage",
    value: function formatMessage(message) {
      var node = {
        "#": "InsightTree",
        "meta": {}
      };

      try {
        if (VERBOSE) console.log("Decoder.formatMessage():", message);
        var dataNode = null;
        var meta = JSON.parse(message.meta);
        var data = JSON.parse(message.data);
        if (VERBOSE) console.log("Decoder.formatMessage() meta:", JSON.stringify(meta, null, 4));
        if (VERBOSE) console.log("Decoder.formatMessage() data:", JSON.stringify(data, null, 4));

        if (meta["lang.id"] === "registry.pinf.org/cadorn.org/github/renderers/packages/php/master" && meta["msg.preprocessor"] === "FirePHPCoreCompatibility") {
          if (meta["renderer"] === "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table") {
            node.meta = {
              "lang": "default",
              "lang.type": "table"
            };
            node.value = {
              title: {
                type: "string",
                value: data.title
              },
              header: data.header.map(function (value) {
                return {
                  type: "string",
                  value: value
                };
              })
            };
            dataNode = encoder.encode(data.data, {
              "lang": "php"
            }, {
              "jsonEncode": false
            });
            node.value.body = dataNode.origin.value.map(function (row) {
              return row.value;
            });
          } else if (meta["renderer"] === "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/trace") {
              node.meta = {
                "lang": "default",
                "lang.type": "trace"
              };
              node.value = {
                title: {
                  type: "string",
                  value: data.title
                }
              };
              node.value.stack = data.trace.map(function (frame) {
                dataNode = encoder.encode(frame.args || [], {
                  "lang": "php"
                }, {
                  "jsonEncode": false
                });
                return {
                  file: frame.file,
                  line: frame.line,
                  class: frame.class,
                  function: frame.function,
                  args: dataNode.origin.value.map(function (arg) {
                    return arg;
                  })
                };
              });
            } else if (data && data.__isException === true) {
                node.meta = {
                  "lang": "default",
                  "lang.type": "trace"
                };
                node.value = {
                  title: {
                    type: "string",
                    value: data['protected:message']
                  }
                };
                node.value.stack = data["private:trace"].map(function (frame) {
                  dataNode = encoder.encode(frame.args || [], {
                    "lang": "php"
                  }, {
                    "jsonEncode": false
                  });
                  return {
                    file: frame.file,
                    line: frame.line,
                    class: frame.class,
                    function: frame.function,
                    args: dataNode.origin.value.map(function (arg) {
                      return arg;
                    })
                  };
                });
              } else {
                dataNode = encoder.encode(data, {
                  "lang": "php"
                }, {
                  "jsonEncode": false
                });
                node.meta = dataNode.origin.meta;
                node.value = dataNode.origin.value;
              }
        }

        ['priority', 'label', 'file', 'line', 'target', 'group', 'group.start', 'group.end', 'group.title', 'group.expand'].forEach(function (name) {
          if (typeof meta[name] !== 'undefined') node.meta[name] = meta[name];
        });

        if (typeof node.meta["group.start"] != "undefined") {
          node.value = node.meta["group.title"] || '?';
          node.type = 'string';
        }

        if (VERBOSE) console.log("Decoder.formatMessage() RETURN:", node);
        return node;
      } catch (err) {
        console.error("message", message);
        console.error("node", node);
        throw err;
      }
    }
  }]);

  return Decoder;
}();

exports.Decoder = Decoder;
},{"insight-for-js/lib/encoder/default":123}],101:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var VERBOSE = false;

var ENCODER = require("insight-for-js/lib/encoder/default");

var encoder = ENCODER.Encoder();
encoder.setOption("maxObjectDepth", 1000);
encoder.setOption("maxArrayDepth", 1000);
encoder.setOption("maxOverallDepth", 1000);

var Encoder = function () {
  function Encoder() {
    _classCallCheck(this, Encoder);
  }

  _createClass(Encoder, [{
    key: "formatMessage",
    value: function formatMessage(message, options) {
      var node = {
        "#": "InsightTree",
        "meta": {}
      };

      try {
        if (VERBOSE) console.log("Encoder.formatMessage():", message);
        var dataNode = encoder.encode(message, {}, {
          "jsonEncode": false
        });
        node.meta = dataNode.origin.meta;
        node.type = dataNode.origin.type || undefined;
        node.value = dataNode.origin.value;

        if (options.priority) {
          node.meta.priority = options.priority;
        }

        if (options.label) {
          node.meta.label = options.label;
        }

        if (VERBOSE) console.log("Encoder.formatMessage() RETURN:", node);
        return node;
      } catch (err) {
        console.error("message", message);
        console.error("node", node);
        throw err;
      }
    }
  }]);

  return Encoder;
}();

exports.Encoder = Encoder;
},{"insight-for-js/lib/encoder/default":123}],102:[function(require,module,exports){


var CHANNEL = require("./channel");

const HEADER_PREFIX = 'x-wf-';

var requestIndex = 0;


var HttpHeaderChannel = exports.HttpHeaderChannel = function(options) {
    if (!(this instanceof exports.HttpHeaderChannel))
        return new exports.HttpHeaderChannel(options);

    this.__construct(options);

    this.HEADER_PREFIX = HEADER_PREFIX;
}

HttpHeaderChannel.prototype = CHANNEL.Channel();

HttpHeaderChannel.prototype.getFirebugNetMonitorListener = function() {
    if(!this.firebugNetMonitorListener) {
        var self = this;
        this.firebugNetMonitorListener = {
            onResponseBody: function(context, file)
            {
                if(file) {
                    try {
                        
                        var requestId = false;
                        for( var i=file.requestHeaders.length-1 ; i>=0 ; i-- ) {
                            if(file.requestHeaders[i].name=="x-request-id") {
                                requestId = file.requestHeaders[i].value;
                                break;
                            }
                        }

                        self.parseReceived(file.responseHeaders, {
                            "FirebugNetMonitorListener": {
                                "context": context,
                                "file": file
                            },
                            "id": requestId || "id:" + file.href + ":" + requestIndex++,
                            "url": file.href,
                            // TODO: add "hostname" (file.request.URI.host?)
                            // TODO: add "port" (file.request.URI.port?)
                            "method": file.method,
                            "requestHeaders": file.requestHeaders
                        });
                    } catch(e) {
                        console.error(e);
                    }
                }
            }
        }
    }
    return this.firebugNetMonitorListener;
}

HttpHeaderChannel.prototype.getMozillaRequestObserverListener = function(globals) {
    if(!this.mozillaRequestObserverListener) {
        var self = this;
        this.mozillaRequestObserverListener = {
            observe: function(subject, topic, data)
            {
                if (topic == "http-on-examine-response") {

                    var httpChannel = subject.QueryInterface(globals.Ci.nsIHttpChannel);

                    try {
                        var requestHeaders = [];
                        var requestId;
                        httpChannel.visitRequestHeaders({
                            visitHeader: function(name, value)
                            {
                                requestHeaders.push({name: name, value: value});
                                if(name.toLowerCase()=="x-request-id") {
                                    requestId = value;
                                }
                            }
                        });
                        var responseHeaders = [],
                            contentType = false;
                        httpChannel.visitResponseHeaders({
                            visitHeader: function(name, value)
                            {
                                responseHeaders.push({name: name, value: value});
                                if (name.toLowerCase() == "content-type")
                                    contentType = value;
                            }
                        });
                        self.parseReceived(responseHeaders, {
                            "MozillaRequestObserverListener": {
                                "httpChannel": httpChannel
                            },
                            "id": requestId || "id:" + httpChannel.URI.spec + ":" + requestIndex++,
                            "url": httpChannel.URI.spec,
                            "hostname": httpChannel.URI.host,
                            "port": httpChannel.URI.port,
                            "method": httpChannel.requestMethod,
                            "status": httpChannel.responseStatus,
                            "contentType": contentType,
                            "requestHeaders": requestHeaders
                        });
                    } catch(e) {
                        console.error(e);
                    }
                }
            }                
        }
    }
    return this.mozillaRequestObserverListener;
}

},{"./channel":105}],103:[function(require,module,exports){

var CHANNEL = require("./channel"),
    UTIL = require("fp-modules-for-nodejs/lib/util");

const HEADER_PREFIX = 'x-wf-';

var PostMessageChannel = exports.PostMessageChannel = function () {
    if (!(this instanceof exports.PostMessageChannel))
        return new exports.PostMessageChannel();
    
    this.__construct();

    this.HEADER_PREFIX = HEADER_PREFIX;
    
    this.postMessageSender = null;
}

PostMessageChannel.prototype = CHANNEL.Channel();

PostMessageChannel.prototype.enqueueOutgoing = function(message, bypassReceivers)
{
    var ret = this._enqueueOutgoing(message, bypassReceivers);

    var parts = {};
    this.flush({
        setMessagePart: function(key, value) {
            parts[key] = value;
        },
        getMessagePart: function(key) {
            if (typeof parts[key] == "undefined")
                return null;
            return parts[key];
        }
    });

    var self = this;

    var payload = [];
    UTIL.forEach(parts, function(part)
    {
        payload.push(part[0] + ": " + part[1]);
    });
    self.postMessageSender(payload.join("\n"));
    
    return ret;
}

PostMessageChannel.prototype.setPostMessageSender = function(postMessage)
{
    this.postMessageSender = postMessage;
}

PostMessageChannel.prototype.parseReceivedPostMessage = function(msg)
{
    if (this.status != "open")
        this.open();
    this.parseReceived(msg, null, {
        skipChannelOpen: true,
        skipChannelClose: true,
        enableContinuousParsing: true
    });
}

},{"./channel":105,"fp-modules-for-nodejs/lib/util":122}],104:[function(require,module,exports){

var CHANNEL = require("./channel");

const HEADER_PREFIX = '#x-wf-';

var ShellCommandChannel = exports.ShellCommandChannel = function () {
    if (!(this instanceof exports.ShellCommandChannel))
        return new exports.ShellCommandChannel();
    
    this.__construct();
    
    this.HEADER_PREFIX = HEADER_PREFIX;
}

ShellCommandChannel.prototype = CHANNEL.Channel();

},{"./channel":105}],105:[function(require,module,exports){

var UTIL = require("fp-modules-for-nodejs/lib/util");
var PROTOCOL = require("./protocol");
var TRANSPORT = require("./transport");

var Channel = exports.Channel = function () {
    if (!(this instanceof exports.Channel))
        return new exports.Channel();
}

Channel.prototype.__construct = function(options) {
    options = options || {};
    this.status = "closed";
    this.receivers = [];
    this.listeners = [];
    this.options = {
        "messagePartMaxLength": 5000
    }
    this.outgoingQueue = [];

    this.onError = options.onError || null;

    if(typeof options.enableTransport != "undefined" && options.enableTransport===false) {
        // do not add transport
    } else {
        this.addReceiver(TRANSPORT.newReceiver(this));
    }
}

Channel.prototype.enqueueOutgoing = function(message, bypassReceivers) {
    return this._enqueueOutgoing(message, bypassReceivers);
}

Channel.prototype._enqueueOutgoing = function(message, bypassReceivers) {
    if(!bypassReceivers) {
        // If a receiver with a matching ID is present on the channel we don't
        // enqueue the message if receiver.onMessageReceived returns FALSE.
        var enqueue = true;
        for( var i=0 ; i<this.receivers.length ; i++ ) {
            if(this.receivers[i].hasId(message.getReceiver())) {
                if(!this.receivers[i].onMessageReceived(null, message)) enqueue = false;
            }
        }
        if(!enqueue) return true;
    }
    this.outgoingQueue.push(this.encode(message));
    return true;
}

Channel.prototype.getOutgoing = function() {
    return this.outgoingQueue;
}

Channel.prototype.clearOutgoing = function() {
    this.outgoingQueue = [];
}

Channel.prototype.setMessagePartMaxLength = function(length) {
    this.options.messagePartMaxLength = length;
}

Channel.prototype.flush = function(applicator, bypassTransport) {
    return this._flush(applicator, bypassTransport);
}

Channel.prototype._flush = function(applicator, bypassTransport) {
    // set request ID if not set
    if(!applicator.getMessagePart("x-request-id")) {
        applicator.setMessagePart("x-request-id", ""+(new Date().getTime()) + "" + Math.floor(Math.random()*1000+1) );
    }

    var messages = this.getOutgoing();
    if(messages.length==0) {
        return 0;
    }

    var util = {
        "applicator": applicator,
        "HEADER_PREFIX": this.HEADER_PREFIX
    };

    if(this.transport && !bypassTransport) {
        util.applicator = this.transport.newApplicator(applicator);
    }

    for( var i=0 ; i<messages.length ; i++ ) {
        var headers = messages[i];
        for( var j=0 ; j<headers.length ; j++ ) {
            util.applicator.setMessagePart(
                PROTOCOL.factory(headers[j][0]).encodeKey(util, headers[j][1], headers[j][2]),
                headers[j][3]
            );
        }
    }
    
    var count = messages.length;

    this.clearOutgoing();

    if(util.applicator.flush) {
        util.applicator.flush(this);
    }

    return count;
}


Channel.prototype.setMessagePart = function(key, value) {
    // overwrite in subclass
}

Channel.prototype.getMessagePart = function(key) {
    // overwrite in subclass
    return null;
}

Channel.prototype.encode = function(message) {
    var protocol_id = message.getProtocol();
    if(!protocol_id) {
        var err = new Error("Protocol not set for message");
        if (this.onError) {
            this.onError(err);
        } else {
            throw err;
        }
    }
    return PROTOCOL.factory(protocol_id).encodeMessage(this.options, message);
}

Channel.prototype.setNoReceiverCallback = function(callback) {
    this.noReceiverCallback = callback;
}

Channel.prototype.addReceiver = function(receiver) {
    // avoid duplicates
    for( var i=0 ; i<this.receivers.length ; i++ ) {
        if(this.receivers[i]==receiver) {
            return;
        }
    }
    this.receivers.push(receiver);
}

Channel.prototype.addListener = function(listener) {
    // avoid duplicates
    for( var i=0 ; i<this.listeners.length ; i++ ) {
        if(this.listeners[i]==listener) {
            return;
        }
    }
    this.listeners.push(listener);
}

function dispatch(channel, method, args)
{
    args = args || [];
    for( var i=0 ; i<channel.listeners.length ; i++ ) {
        if(typeof channel.listeners[i][method] === "function") {
            channel.listeners[i][method].apply(null, args);
        }
    }    
}

Channel.prototype.open = function(context) {
    this.status = "open";
    
    dispatch(this, "beforeChannelOpen", [context]);
    
    for( var i=0 ; i<this.receivers.length ; i++ ) {
        if(this.receivers[i]["onChannelOpen"]) {
            this.receivers[i].onChannelOpen(context);
        }
    }
    this.sinks = {
        protocolBuffers: {},
        buffers: {},
        protocols: {},
        receivers: {},
        senders: {},
        messages: {}
    }
    dispatch(this, "afterChannelOpen", [context]);
}

Channel.prototype.close = function(context) {
    this.status = "close";
    dispatch(this, "beforeChannelClose", [context]);
    for( var i=0 ; i<this.receivers.length ; i++ ) {
        if(this.receivers[i]["onChannelClose"]) {
            this.receivers[i].onChannelClose(context);
        }
    }
    dispatch(this, "afterChannelClose", [context]);
}

var parsing = false;

Channel.prototype.parseReceived = function(rawHeaders, context, options) {
    var self = this;

    if (parsing)
    {
        var err = new Error("Already parsing!");
        if (self.onError) {
            self.onError(err);
        } else {
            throw err;
        }        
    }

    options = options || {};
    options.skipChannelOpen = options.skipChannelOpen || false;
    options.skipChannelClose = options.skipChannelClose || false;
    options.enableContinuousParsing = options.enableContinuousParsing || false;

    if (
        typeof rawHeaders != "object" ||
        (
            Array.isArray(rawHeaders) &&
            typeof rawHeaders[0] === "string"
        )
    ) {
        rawHeaders = text_header_to_object(rawHeaders);
    }

    var headersFound = false;
    rawHeaders.forEach(function (header) {
        if (/x-wf-/i.test(header.name)) {
            headersFound = true;
        }
    });
    if (!headersFound) {
        return;
    }

    if(!options.skipChannelOpen) {

        // Include 'x-request-id' in context

        self.open(context);
    }

    parsing = true;
    
    // protocol related
    var protocolBuffers = (options.enableContinuousParsing)?this.sinks.protocolBuffers:{};

    // message related
    var buffers = (options.enableContinuousParsing)?this.sinks.buffers:{};
    var protocols = (options.enableContinuousParsing)?this.sinks.protocols:{};
    var receivers = (options.enableContinuousParsing)?this.sinks.receivers:{};
    var senders = (options.enableContinuousParsing)?this.sinks.senders:{};
    var messages = (options.enableContinuousParsing)?this.sinks.messages:{};

    try {
        // parse the raw headers into messages
        for( var i in rawHeaders ) {
            parseHeader(rawHeaders[i].name.toLowerCase(), rawHeaders[i].value);
        }
    
        // empty any remaining buffers in case protocol header was last
        if(protocolBuffers) {
            UTIL.forEach(protocolBuffers, function(item) {
                if(protocols[item[0]]) {
                    if(typeof buffers[item[0]] == "undefined") {
                        buffers[item[0]] = {};
                    }
                    if(typeof receivers[item[0]] == "undefined") {
                        receivers[item[0]] = {};
                    }
                    if(typeof senders[item[0]] == "undefined") {
                        senders[item[0]] = {};
                    }
                    if(typeof messages[item[0]] == "undefined") {
                        messages[item[0]] = {};
                    }
                    item[1].forEach(function(info) {
                        protocols[item[0]].parse(buffers[item[0]], receivers[item[0]], senders[item[0]], messages[item[0]], info[0], info[1]);
                    });
                    delete protocolBuffers[item[0]];
                }
            });
        }
    } catch(e) {
//        dump("Error parsing raw data: " + e);
        // clean up no matter what - a try/catch wrapper above this needs to recover from this properly
        parsing = false;
        buffers = {};
        protocols = {};
        receivers = {};
        senders = {};
        messages = {};
        console.error("Error parsing raw data", e);
        if (self.onError) {
            self.onError(e);
        } else {
            throw e;
        }
    }

    // deliver the messages to the appropriate receivers
    var deliveries = [];
    var messageCount = 0;
    for( var protocolId in protocols ) {

        for( var receiverKey in messages[protocolId] ) {

            // sort messages by index
            messages[protocolId][receiverKey].sort(function(a, b) {
                if(parseInt(a[0])>parseInt(b[0])) return 1;
                if(parseInt(a[0])<parseInt(b[0])) return -1;
                return 0;
            });

            // determine receiver
            var receiverId = receivers[protocolId][receiverKey];
            // fetch receivers that support ID
            var targetReceivers = [];
            for( var i=0 ; i<this.receivers.length ; i++ ) {
                if(this.receivers[i].hasId(receiverId)) {
                    if(this.receivers[i]["onMessageGroupStart"]) {
                        this.receivers[i].onMessageGroupStart(context);
                    }
                    targetReceivers.push(this.receivers[i]);
                }
            }
            
            messageCount += messages[protocolId][receiverKey].length;
            
            if(targetReceivers.length>0) {
                for( var j=0 ; j<messages[protocolId][receiverKey].length ; j++ ) {
                    // re-write sender and receiver keys to IDs
                    messages[protocolId][receiverKey][j][1].setSender(senders[protocolId][receiverKey+":"+messages[protocolId][receiverKey][j][1].getSender()]);
                    messages[protocolId][receiverKey][j][1].setReceiver(receiverId);
                    for( var k=0 ; k<targetReceivers.length ; k++ ) {
                        deliveries.push([targetReceivers[k], messages[protocolId][receiverKey][j][1]]);
                    }
                }
                for( var k=0 ; k<targetReceivers.length ; k++ ) {
                    if(targetReceivers[k]["onMessageGroupEnd"]) {
                        targetReceivers[k].onMessageGroupEnd(context);
                    }
                }
                if (options.enableContinuousParsing)
                    delete messages[protocolId][receiverKey];
            } else
            if(this.noReceiverCallback) {
                this.noReceiverCallback(receiverId);
            }
        }
    }

    if (options.enableContinuousParsing)
    {
        // TODO: Partial cleanup here or above for things we do not need any more
    }
    else
    {
        // cleanup - does this help with gc?
        buffers = {};
        protocols = {};
        receivers = {};
        senders = {};
        messages = {};
    }

    parsing = false;

    var onMessageReceivedOptions;

    deliveries.forEach(function(delivery)
    {
        try {
            onMessageReceivedOptions = delivery[0].onMessageReceived(context, delivery[1]);
        } catch(e) {
            console.error("Error delivering message: " + e, e.stack);
            if (self.onError) {
                self.onError(e);
            } else {
                throw e;
            }
        }
        if(onMessageReceivedOptions) {
            if(onMessageReceivedOptions.skipChannelClose) {
                options.skipChannelClose = true;
            }
        }
    });

    if(!options.skipChannelClose) {
        this.close(context);
    }

    return messageCount;

 
    function parseHeader(name, value)
    {
        if (name.substr(0, self.HEADER_PREFIX.length) == self.HEADER_PREFIX) {
            if (name.substring(0,self.HEADER_PREFIX.length + 9) == self.HEADER_PREFIX + 'protocol-') {
                var id = parseInt(name.substr(self.HEADER_PREFIX.length + 9));
                protocols[id] = PROTOCOL.factory(value);
            } else {
                var index = name.indexOf('-',self.HEADER_PREFIX.length);
                var id = parseInt(name.substr(self.HEADER_PREFIX.length,index-self.HEADER_PREFIX.length));

                if(protocols[id]) {

                    if(typeof buffers[id] == "undefined") {
                        buffers[id] = {};
                    }
                    if(typeof receivers[id] == "undefined") {
                        receivers[id] = {};
                    }
                    if(typeof senders[id] == "undefined") {
                        senders[id] = {};
                    }
                    if(typeof messages[id] == "undefined") {
                        messages[id] = {};
                    }

                    if(protocolBuffers[id]) {
                        protocolBuffers[id].forEach(function(info) {
                            protocols[id].parse(buffers[id], receivers[id], senders[id], messages[id], info[0], info[1]);
                        });
                        delete protocolBuffers[id];
                    }
                    protocols[id].parse(buffers[id], receivers[id], senders[id], messages[id], name.substr(index+1), value);
                } else {
                    if(!protocolBuffers[id]) {
                        protocolBuffers[id] = [];
                    }
                    protocolBuffers[id].push([name.substr(index+1), value]);
                }
            }
        }
    }
    
    function text_header_to_object(text) {
        // trim escape sequences \[...m
//        text = text.replace(/\x1B\x5B[^\x6D]*\x6D/g, "");

        if (Array.isArray(text)) {
            text = text.join("\n");
        }

        if(text.charCodeAt(0)==27 && text.charCodeAt(3)==109) {
            text = text.substring(4);
        }
        
        var headers = [];
        var lines = text.replace().split("\n");

        var expression = new RegExp("^.{0,2}("+self.HEADER_PREFIX+"[^:]*): (.*)$", "i");
        var m, offset, len, fuzzy = false;

        for( var i=0 ; i<lines.length ; i++ ) {
            if (lines[i])
            {
                if(m = expression.exec(lines[i])) {
                    if (m[1].toLowerCase() === "x-request-id")
                        context.id = m[2];

                    headers.push({
                        "name": m[1],
                        // prefixing value with '~' indicates approximate message length matching
                        // the message length has changed due to the newlines being replaced with &!10;
                        "value": m[2]
                    });
                }
            }
        }

        // This fudges lines together that should not have been split.
        // This happens if the payload inadvertantly included newline characters that
        // were not encoded with &!10;
/*
        for( var i=0 ; i<lines.length ; i++ ) {
            if (lines[i])
            {
                offset = lines[i].indexOf(self.HEADER_PREFIX);
                if (offset >=0 && offset <=3)
                {
                    len = lines[i].length;
                    if (i+1 == lines.length) offset = 0;
                    else offset = lines[i+1].indexOf(self.HEADER_PREFIX);
                    if (
                        (offset >=0 && offset <=3) ||
                        lines[i].charAt(len-1) === "|" ||
                        (lines[i].charAt(len-2) === "|" && lines[i].charAt(len-1) === "\\")
                    )
                    {
                        if(m = expression.exec(lines[i])) {
                            headers.push({
                                "name": m[1],
                                // prefixing value with '~' indicates approximate message length matching
                                // the message length has changed due to the newlines being replaced with &!10;
                                "value": ((true || fuzzy)?"~":"") + m[2]
                            });
                            fuzzy = false;
                        }
                    }
                    else
                    {
                        lines[i] = lines[i] + "&!10;" + lines[i+1];
                        lines.splice(i+1, 1);
                        i--;
                        fuzzy = true;
                    }
                } else
                if(m = expression.exec(lines[i])) {
                    headers.push({
                        "name": m[1],
                        "value": m[2]
                    });
                    fuzzy = false;
                }
            }
        }
*/
        return headers;
    }
}

Channel.prototype.setTransport = function(transport) {
    this.transport = transport;
}


},{"./protocol":109,"./transport":112,"fp-modules-for-nodejs/lib/util":122}],106:[function(require,module,exports){

var CHANNEL = require("../channel"),
    UTIL = require("fp-modules-for-nodejs/lib/util"),
    HTTP_CLIENT = require("fp-modules-for-nodejs/lib/http-client"),
    JSON = require("fp-modules-for-nodejs/lib/json");

// TODO: Make this configurable
var HOST = "localhost";
var PORT = 8099;

const HEADER_PREFIX = 'x-wf-';

var HttpClientChannel = exports.HttpClientChannel = function () {
    if (!(this instanceof exports.HttpClientChannel))
        return new exports.HttpClientChannel();

    this.__construct();

    this.HEADER_PREFIX = HEADER_PREFIX;
}

HttpClientChannel.prototype = CHANNEL.Channel();

HttpClientChannel.prototype.flush = function(applicator, bypassTransport)
{
    var self = this;
    if (typeof applicator === "undefined")
    {
        var parts = {};

        applicator = {
            setMessagePart: function(key, value)
            {
                parts[key] = value;
            },
            getMessagePart: function(key)
            {
                if (typeof parts[key] === "undefined")
                    return null;
                return parts[key];
            },
            flush: function(clannel)
            {
                if (UTIL.len(parts)==0)
                    return false;

                var data = [];
                UTIL.forEach(parts, function(part)
                {
                    data.push(part[0] + ": " + part[1]);
                });
                data = data.join("\n");

                HTTP_CLIENT.request({
                    host: HOST,
                    port: PORT,
                    path: "/wildfire-server",
                    method: "POST",
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        "content-length": data.length,
                        "connection": "close"
                    },
                    data: data
                }, function(response)
                {
                    if (response.status == 200)
                    {
                        try {
                            var data = JSON.decode(response.data);
                            if (data.success === true)
                            {
                                // success!!
                            }
                            else
                                console.error("ERROR Got error from wildfire server: " + data.error);                    
                        } catch(e) {
                            console.error("ERROR parsing JSON response from wildfire server (error: " + e + "): " + response.data);                    
                        }
                    }
                    else
                        console.error("ERROR from wildfire server (status: " + response.status + "): " + response.data);                    
                }, function(e)
                {
                    if (!/ECONNREFUSED/.test(e))
                        console.error("ERROR sending message to wildfire server: " + e);                    
//                    else
//                        module.print("\0red([Wildfire: Not Connected]\0)\n");                    
                });
                return true;
            }
        };
    }
    return self._flush(applicator);
}

},{"../channel":105,"fp-modules-for-nodejs/lib/http-client":115,"fp-modules-for-nodejs/lib/json":116,"fp-modules-for-nodejs/lib/util":122}],107:[function(require,module,exports){

var Dispatcher = exports.Dispatcher = function () {
    if (!(this instanceof exports.Dispatcher))
        return new exports.Dispatcher();
    this.channel = null;
}

Dispatcher.prototype.setChannel = function(channel) {
    return this._setChannel(channel);
}

Dispatcher.prototype._setChannel = function(channel) {
    this.channel = channel;
}

Dispatcher.prototype.setProtocol = function(protocol) {
    this.protocol = protocol;
}

Dispatcher.prototype.setSender = function(sender) {
    this.sender = sender;
}

Dispatcher.prototype.setReceiver = function(receiver) {
    this.receiver = receiver;
}

Dispatcher.prototype.dispatch = function(message, bypassReceivers) {
    return this._dispatch(message, bypassReceivers);
}
    
Dispatcher.prototype._dispatch = function(message, bypassReceivers) {
    if(!message.getProtocol()) message.setProtocol(this.protocol);
    if(!message.getSender()) message.setSender(this.sender);
    if(!message.getReceiver()) message.setReceiver(this.receiver);
    this.channel.enqueueOutgoing(message, bypassReceivers);
}

},{}],108:[function(require,module,exports){

var Message = exports.Message = function (dispatcher) {
    if (!(this instanceof exports.Message))
        return new exports.Message(dispatcher);
    
    this.meta = null;
    this.data = null;

    var self = this;
    self.dispatch = function() {
        if(!dispatcher) {
            throw new Error("dispatcher not set");
        }
        return dispatcher.dispatch(self);
    }
}

Message.prototype.setProtocol = function(protocol) {
    this.protocol = protocol;
}

Message.prototype.getProtocol = function() {
    return this.protocol;
}

Message.prototype.setSender = function(sender) {
    this.sender = sender;
}

Message.prototype.getSender = function() {
    return this.sender;
}

Message.prototype.setReceiver = function(receiver) {
    this.receiver = receiver;
}

Message.prototype.getReceiver = function() {
    return this.receiver;
}

Message.prototype.setMeta = function(meta) {
    this.meta = meta;
}

Message.prototype.getMeta = function() {
    return this.meta;
}

Message.prototype.setData = function(data) {
    this.data = data;
}

Message.prototype.getData = function() {
    return this.data;
}

},{}],109:[function(require,module,exports){

var MESSAGE = require("./message");
var JSON = require("fp-modules-for-nodejs/lib/json");
var UTIL = require("fp-modules-for-nodejs/lib/util");

// Tolerance within which messages must match the declared length
// This is used to compensate for length differences when messages are put back together
// because of newlines that were not encoded by sender
const FUZZY_MESSAGE_LENGTH_TOLERANCE = 200;

var instances = {};
var protocols = {};

exports.factory = function(uri) {
    if(instances[uri]) {
        return instances[uri];
    }
    if(protocols[uri]) {
        return (instances[uri] = protocols[uri](uri));
    }
    return null;
}


protocols["http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0"] =
protocols["__TEST__"] = function(uri) {

    return {
        parse: function(buffers, receivers, senders, messages, key, value) {

            var parts = key.split('-');
            // parts[0] - receiver
            // parts[1] - sender
            // parts[2] - message id/index

            if(parts[0]=='index') {
                // ignore the index header
                return;
            } else
            if(parts[1]=='receiver') {
                receivers[parts[0]] = value;
                return;
            } else
            if(parts[2]=='sender') {
                senders[parts[0] + ':' + parts[1]] = value;
                return;
            }

            // 62|...|\
            // @previous Did not allow for '|' in meta or data
            // @  var m = value.match(/^(\d*)?\|(.*)\|(\\)?$/);
            // @  if(!m) throw new Error("Error parsing message: " + value);
            var m = [], i, j;
            // TIP: fuzzy matching is not currently used
            m.push((value.charAt(0)=="~")?true:false);
            i = value.indexOf("|");
            // TODO: Check for \ before | and skip to next if present
    if (value.charAt(i-1) === "\\")
        throw new Error("Found \\ before |! in module " + module.id);
            m.push(value.substring((m[0])?1:0, i));
            if (value.charAt(value.length-1) === "|") {    // end in |
                m.push(value.substring(i+1, value.length-1));
                m.push("");
            } else if (value.charAt(value.length-1) === "\\") {    // end in |\ (i.e. a continuation)
                m.push(value.substring(i+1, value.length-2));
                m.push("\\");
            } else throw new Error("Error parsing for trailing '|' in message part: " + value);

//            m[2] = m[2].replace(/\\{2}/g, "\\");

            // length present and message matches length - complete message
            if(m[1] &&
               (
                 (m[0] && Math.abs(m[1]-m[2].length)<FUZZY_MESSAGE_LENGTH_TOLERANCE ) ||
                 (!m[0] && m[1]==m[2].length)
               ) && !m[3]) {
                enqueueMessage(parts[2], parts[0], parts[1], m[2]);
            } else
            // message continuation present - message part
            if( m[3] ) {
                enqueueBuffer(parts[2], parts[0], parts[1], m[2], (m[1])?'first':'part', m[1], m[0]);
            } else
            // no length and no message continuation - last message part
            if( !m[1] && !m[3] ) {
                enqueueBuffer(parts[2], parts[0], parts[1], m[2], 'last', void 0, m[0]);
            } else {
                throw new Error('Error parsing message: ' + value);
            }

            // this supports message parts arriving in any order as fast as possible
            function enqueueBuffer(index, receiver, sender, value, position, length, fuzzy) {
                if(!buffers[receiver]) {
                    buffers[receiver] = {"firsts": 0, "lasts": 0, "messages": []};
                }
                if(position=="first") buffers[receiver].firsts += 1;
                else if(position=="last") buffers[receiver].lasts += 1;
                buffers[receiver].messages.push([index, value, position, length, fuzzy]);

                // if we have a mathching number of first and last parts we assume we have
                // a complete message so we try and join it
                if(buffers[receiver].firsts>0 && buffers[receiver].firsts==buffers[receiver].lasts) {
                    // first we sort all messages
                    buffers[receiver].messages.sort(
                        function (a, b) {
                            return a[0] - b[0];
                        }
                    );
                    // find the first "first" part and start collecting parts
                    // until "last" is found
                    var startIndex = null;
                    var buffer = null;
                    fuzzy = false;
                    for( i=0 ; i<buffers[receiver].messages.length ; i++ ) {
                        if(buffers[receiver].messages[i][4])
                            fuzzy = true;
                        if(buffers[receiver].messages[i][2]=="first") {
                            startIndex = i;
                            buffer = buffers[receiver].messages[i][1];
                        } else
                        if(startIndex!==null) {
                            buffer += buffers[receiver].messages[i][1];
                            if(buffers[receiver].messages[i][2]=="last") {
                                // if our buffer matches the message length
                                // we have a complete message
                                if(
                                     (fuzzy && Math.abs(buffers[receiver].messages[startIndex][3]-buffer.length)<FUZZY_MESSAGE_LENGTH_TOLERANCE ) ||
                                     (!fuzzy && buffer.length==buffers[receiver].messages[startIndex][3])
                                ) {
                                    // message is complete
                                    enqueueMessage(buffers[receiver].messages[startIndex][0], receiver, sender, buffer);
                                    buffers[receiver].messages.splice(startIndex, i-startIndex+1);
                                    buffers[receiver].firsts -= 1;
                                    buffers[receiver].lasts -= 1;
                                    startIndex = null;
                                    buffer = null;
                                    fuzzy = false;
                                } else {
                                    // message is not complete
                                }
                            }
                        }
                    }
                }
            }

            function enqueueMessage(index, receiver, sender, value) {

                if(!messages[receiver]) {
                    messages[receiver] = [];
                }

                // Split "...\|...|...|.......
                // by ------------^
                var m = [ value ], i = 0;
                while(true) {
                    i = value.indexOf("|", i);
                    if (i===-1) throw new Error("Error parsing for '|' in message part: " + value);
                    if (value.charAt(i-1) != "\\") break;
                }
                m.push(value.substring(0, i));
                m.push(value.substring(i+1, value.length));

                var message = MESSAGE.Message();
                message.setReceiver(receiver);
                message.setSender(sender);
                // @previous
                // @  message.setMeta((m[1])?m[1].replace(/&#124;/g, "|").replace(/&#10;/g, "\n"):null);
                // @  message.setData(m[2].replace(/&#124;/g, "|").replace(/&#10;/g, "\n"));
                message.setMeta((m[1])?m[1].replace(/\\\|/g, "|").replace(/&!10;/g, "\n"):null);
                message.setData(m[2].replace(/&!10;/g, "\\n"));
                message.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');

                messages[receiver].push([index, message]);
            }
        },

        encodeMessage: function(options, message) {

            var protocol_id = message.getProtocol();
            if(!protocol_id) {
                throw new Error("Protocol not set for message");
            }
            var receiver_id = message.getReceiver();
            if(!receiver_id) {
                throw new Error("Receiver not set for message");
            }
            var sender_id = message.getSender();
            if(!sender_id) {
                throw new Error("Sender not set for message");
            }

            var headers = [];

            var meta = message.getMeta();
            if(!meta)
                meta = "";

            var data = message.getData() || "";
            if (typeof data != "string")
                throw new Error("Data in wildfire message is not a string!");

            data = meta.replace(/\|/g, "\\|").replace(/\n|\u000a|\\u000a/g, "&!10;") + '|' + data.replace(/\n|\u000a|\\u000a/g, "&!10;");
//            var data = meta.replace(/\|/g, "&#124;").replace(/\n|\u000a/g, "&#10;") + '|' + message.getData().replace(/\|/g, "&#124;").replace(/\n|\u000a/g, "&#10;");

            var parts = chunk_split(data, options.messagePartMaxLength);

            var part,
                msg;

            for( var i=0 ; i<parts.length ; i++) {
                if (part = parts[i]) {
                    msg = "";

                    // escape backslashes
                    // NOTE: This should probably be done during JSON encoding to ensure we do not double-escape
                    //       with different encoders, but not sure how different encoders behave yet.
//                    part = part.replace(/\\/g, "\\\\");

                    if (parts.length>1) {
                        msg = ((i==0)?data.length:'') +
                              '|' + part + '|' +
                              ((i<parts.length-1)?"\\":"");
                    } else {
                        msg = part.length + '|' + part + '|';
                    }

                    headers.push([
                        protocol_id,
                        receiver_id,
                        sender_id,
                        msg
                    ]);
                }
            }
            return headers;
        },

        encodeKey: function(util, receiverId, senderId) {

            if(!util["protocols"]) util["protocols"] = {};
            if(!util["messageIndexes"]) util["messageIndexes"] = {};
            if(!util["receivers"]) util["receivers"] = {};
            if(!util["senders"]) util["senders"] = {};

            var protocol = getProtocolIndex(uri);
            var messageIndex = getMessageIndex(protocol);
            var receiver = getReceiverIndex(protocol, receiverId);
            var sender = getSenderIndex(protocol, receiver, senderId);

            return util.HEADER_PREFIX + protocol + "-" + receiver + "-" + sender + "-" + messageIndex;

            function getProtocolIndex(protocolId) {
                if(util["protocols"][protocolId]) return util["protocols"][protocolId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + "protocol-" + i);
                    if(!value) {
                        util["protocols"][protocolId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + "protocol-" + i, protocolId);
                        return i;
                    } else
                    if(value==protocolId) {
                        util["protocols"][protocolId] = i;
                        return i;
                    }
                }
            }

            function getMessageIndex(protocolIndex) {
                var value = util["messageIndexes"][protocolIndex] || util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-index");
                if(!value) {
                    value = 0;
                }
                value++;
                util["messageIndexes"][protocolIndex] = value;
                util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-index", value);
                return value;
            }

            function getReceiverIndex(protocolIndex, receiverId) {
                if(util["receivers"][protocolIndex + ":" + receiverId]) return util["receivers"][protocolIndex + ":" + receiverId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + i + "-receiver");
                    if(!value) {
                        util["receivers"][protocolIndex + ":" + receiverId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + i + "-receiver", receiverId);
                        return i;
                    } else
                    if(value==receiverId) {
                        util["receivers"][protocolIndex + ":" + receiverId] = i;
                        return i;
                    }
                }
            }

            function getSenderIndex(protocolIndex, receiverIndex, senderId) {
                if(util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId]) return util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + receiverIndex + "-" + i + "-sender");
                    if(!value) {
                        util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + receiverIndex + "-" + i + "-sender", senderId);
                        return i;
                    } else
                    if(value==senderId) {
                        util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId] = i;
                        return i;
                    }
                }
            }
        }
    };
};


// @see http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/json-stream/0.2.0
protocols["http://meta.wildfirehq.org/Protocol/JsonStream/0.2"] = function(uri) {

    var groupStack = [];
    var groupIndex = 0;

    return {
        parse: function(buffers, receivers, senders, messages, key, value) {

            var parts = key.split('-');
            // parts[0] - receiver
            // parts[1] - sender
            // parts[2] - message id/index

            if(parts[0]=='index') {
                // ignore the index header
                return;
            } else
            if(parts[0]=='structure') {
/*
                if(value=="http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1") {
                    value = "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/page/0";
                } else
                if(value=="http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1") {
                    value = "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/page/0";
//                    value = "http://pinf.org/cadorn.org/fireconsole/meta/Receiver/NetServer/0.1"
                }
*/
                receivers[parts[1]] = value;

                // NOTE: The old protocol specifies senders independent from receivers so we need to add senders for every receiver if senders are already known
                if(UTIL.len(senders)>0) {
                    var newSenders = {};
                    for( var senderKey in senders ) {
                        var senderParts = senderKey.split(":");
                        newSenders[parts[1] + ":" + senderParts[1]] = senders[senderKey];
                    }
                    UTIL.complete(senders, newSenders);
                }
                return;
            } else
            if(parts[0]=='plugin') {

                // NOTE: The old protocol specifies senders independent from receivers so we need to add senders for every receiver
                //       If no receiver is known yet we assume a receiver key of "1"
                if(UTIL.len(receivers)==0) {
                    senders["1" + ":" + parts[1]] = value;
                } else {
                    for( var receiverKey in receivers ) {
                        senders[receiverKey + ":" + parts[1]] = value;
                    }
                }
                return;
            }

            // 62|...|\
            var m = value.match(/^(\d*)?\|(.*)\|(\\)?$/);
            if(!m) {
                throw new Error("Error parsing message: " + value);
            }

            // length present and message matches length - complete message
            if (m[1] && m[1] == m[2].length && !m[3]) {
                enqueueMessage(parts[2], parts[0], parts[1], m[2]);
            } else
            // message continuation present - message part
            if( m[3] ) {
                enqueueBuffer(parts[2], parts[0], parts[1], m[2], (m[1])?'first':'part', m[1]);
            } else
            // no length and no message continuation - last message part
            if( !m[1] && !m[3] ) {
                enqueueBuffer(parts[2], parts[0], parts[1], m[2], 'last');
            } else {
                console.error("m", m);
                console.error("m[1]", m[1]);
                console.error("m[2].length", m[2].length);
                throw new Error('Error parsing message parts: ' + value);
            }

            // this supports message parts arriving in any order as fast as possible
            function enqueueBuffer(index, receiver, sender, value, position, length) {
                if(!buffers[receiver]) {
                    buffers[receiver] = {"firsts": 0, "lasts": 0, "messages": []};
                }
                if(position=="first") buffers[receiver].firsts += 1;
                else if(position=="last") buffers[receiver].lasts += 1;
                buffers[receiver].messages.push([index, value, position, length]);

                // if we have a mathching number of first and last parts we assume we have
                // a complete message so we try and join it
                if(buffers[receiver].firsts>0 && buffers[receiver].firsts==buffers[receiver].lasts) {
                    // first we sort all messages
                    buffers[receiver].messages.sort(
                        function (a, b) {
                            return a[0] - b[0];
                        }
                    );
                    // find the first "first" part and start collecting parts
                    // until "last" is found
                    var startIndex = null;
                    var buffer = null;
                    for( i=0 ; i<buffers[receiver].messages.length ; i++ ) {
                        if(buffers[receiver].messages[i][2]=="first") {
                            startIndex = i;
                            buffer = buffers[receiver].messages[i][1];
                        } else
                        if(startIndex!==null) {
                            buffer += buffers[receiver].messages[i][1];
                            if(buffers[receiver].messages[i][2]=="last") {
                                // if our buffer matches the message length
                                // we have a complete message
                                if(buffer.length==buffers[receiver].messages[startIndex][3]) {
                                    // message is complete
                                    enqueueMessage(buffers[receiver].messages[startIndex][0], receiver, sender, buffer);
                                    buffers[receiver].messages.splice(startIndex, i-startIndex);
                                    buffers[receiver].firsts -= 1;
                                    buffers[receiver].lasts -= 1;
                                    if(buffers[receiver].messages.length==0) delete buffers[receiver];
                                    startIndex = null;
                                    buffer = null;
                                } else {
                                    // message is not complete
                                }
                            }
                        }
                    }
                }
            }

            function enqueueMessage(index, receiver, sender, value) {

                if(!messages[receiver]) {
                    messages[receiver] = [];
                }

                var meta = {
                        "msg.preprocessor": "FirePHPCoreCompatibility",
                        "target": "console",
                        "lang.id": "registry.pinf.org/cadorn.org/github/renderers/packages/php/master"
                    },
                    data,
                    parts;

                try {
                    parts = JSON.decode(value);
                } catch(e) {
                    console.error("Error parsing JsonStream message", e, value);
                    throw e;
                }

                // console
                if(UTIL.isArrayLike(parts) && parts.length==2 &&
                    (typeof parts[0] == "object") && UTIL.has(parts[0], "Type")) {

                    data = parts[1];

                    for( var name in parts[0] ) {
                        if(name=="Type") {

                            if(groupStack.length>0) {
                                meta["group"] = groupStack[groupStack.length-1];
                            }

                            switch(parts[0][name]) {
                                case "LOG":
                                    meta["priority"] = "log";
                                    break;
                                case "INFO":
                                    meta["priority"] = "info";
                                    break;
                                case "WARN":
                                    meta["priority"] = "warn";
                                    break;
                                case "ERROR":
                                    meta["priority"] = "error";
                                    break;
                                case "EXCEPTION":
                                    var originalData = data;
                                    data = {
                                        "__className": originalData.Class,
                                        "__isException": true,
                                        "protected:message": originalData.Message,
                                        "protected:file": originalData.File,
                                        "protected:line": originalData.Line,
                                        "private:trace": originalData.Trace
                                    }
                                    if (data["private:trace"] && data["private:trace"].length > 0) {
                                        if (data["private:trace"][0].file != originalData.File || data["private:trace"][0].line != originalData.Line) {
                                            data["private:trace"].unshift({
                                               "class": originalData.Class || "",
                                                "type": originalData.Type || "",
                                                "function": originalData.Function || "",
                                                "file": originalData.File || "",
                                                "line": originalData.Line || "",
                                                "args": originalData.Args || ""
                                            });
                                        }
                                    }
                                    meta["priority"] = "error";
                                    break;
                                case "TRACE":
                                    meta["renderer"] = "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/trace";
                                    var trace = [
                                        {
                                            "class": data.Class || "",
                                            "type": data.Type || "",
                                            "function": data.Function || "",
                                            "file": data.File || "",
                                            "line": data.Line || "",
                                            "args": data.Args || ""
                                        }
                                    ];
                                    if(data.Trace) {
                                        trace = trace.concat(data.Trace);
                                    }
                                    data = {
                                        "title": data.Message,
                                        "trace": trace
                                    };
                                    break;
                                case "TABLE":
                                    meta["renderer"] = "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table";
                                    data = {"data": data};
                                    if(data.data.length==2 && typeof data.data[0] == "string") {
                                        data.header = data.data[1].splice(0,1)[0];
                                        data.title = data.data[0];
                                        data.data = data.data[1];
                                    } else {
                                        data.header = data.data.splice(0,1)[0];
                                    }
                                    break;
                                case "GROUP_START":
                                    groupIndex++;
                                    meta["group.start"] = true;
                                    meta["group"] = "group-" + groupIndex;
                                    groupStack.push("group-" + groupIndex);
                                    break;
                                case "GROUP_END":
                                    meta["group.end"] = true;
                                    if(groupStack.length>0) {
                                        groupStack.pop();
                                    }
                                    break;
                                default:
                                    throw new Error("Log type '" + parts[0][name] + "' not implemented");
                                    break;
                            }
                        } else
                        if(name=="Label") {
                            meta["label"] = parts[0][name];
                        } else
                        if(name=="File") {
                            meta["file"] = parts[0][name];
                        } else
                        if(name=="Line") {
                            meta["line"] = parts[0][name];
                        } else
                        if(name=="Collapsed") {
                            meta[".collapsed"] = (parts[0][name]=='true')?true:false;
//                        } else
//                        if(name=="Color") {
//                            meta["fc.group.color"] = parts[0][name];
                        }
                    }
                } else
                // dump
                {
                    data = parts;
                    meta["label"] = "Dump";
                }

                if(meta["renderer"] == "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table") {
                    if(meta["label"]) {
                        data.title = meta["label"];
                        delete meta["label"];
                    }
                } else
                if(meta["group.start"]) {
                    meta["group.title"] = meta["label"];
                    delete meta["label"];
                    if(typeof meta[".collapsed"] == "undefined" || !meta[".collapsed"]) {
                        meta["group.expand"] = meta["group"];
                    }
                    delete meta[".collapsed"];
                }

                var message = MESSAGE.Message();
                message.setReceiver(receiver);
                message.setSender(sender);

                try {
                    message.setMeta(JSON.encode(meta));
                } catch(e) {
                    console.error("Error encoding object (JsonStream compatibility)", e, meta);
                    throw e;
                }

                try {
                    message.setData(JSON.encode(data));
                } catch(e) {
                    console.error("Error encoding object (JsonStream compatibility)", e, data);
                    throw e;
                }

                messages[receiver].push([index, message]);
            }
        },

        encodeMessage: function(options, message) {
            throw new Error("Not implemented!");
        },

        encodeKey: function(util, receiverId, senderId) {
            throw new Error("Not implemented!");
        }
    };
};



protocols["http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/announce/0.1.0"] = function(uri) {

    return {
        parse: function(buffers, receivers, senders, messages, key, value) {

            var parts = key.split('-');
            // parts[0] - message id/index

            if(parts[0]=='index') {
                // ignore the index header
                return;
            }

            // 62|...|\
            var m = value.match(/^(\d*)?\|(.*)\|(\\)?$/);
            if(!m) {
                throw new Error("Error parsing message: " + value);
            }

            // length present and message matches length - complete message
            if(m[1] && m[1]==m[2].length && !m[3]) {
                enqueueMessage(key, m[2]);
            } else
            // message continuation present - message part
            if( m[3] ) {
                enqueueBuffer(key, m[2], (m[1])?'first':'part', m[1]);
            } else
            // no length and no message continuation - last message part
            if( !m[1] && !m[3] ) {
                enqueueBuffer(key, m[2], 'last');
            } else {
                throw new Error('Error parsing message: ' + value);
            }

            // this supports message parts arriving in any order as fast as possible
            function enqueueBuffer(index, value, position, length) {

                receiver = "*";
                if(!buffers[receiver]) {
                    buffers[receiver] = {"firsts": 0, "lasts": 0, "messages": []};
                }
                if(position=="first") buffers[receiver].firsts += 1;
                else if(position=="last") buffers[receiver].lasts += 1;
                buffers[receiver].messages.push([index, value, position, length]);

                // if we have a mathching number of first and last parts we assume we have
                // a complete message so we try and join it
                if(buffers[receiver].firsts>0 && buffers[receiver].firsts==buffers[receiver].lasts) {
                    // first we sort all messages
                    buffers[receiver].messages.sort(
                        function (a, b) {
                            return a[0] - b[0];
                        }
                    );
                    // find the first "first" part and start collecting parts
                    // until "last" is found
                    var startIndex = null;
                    var buffer = null;
                    for( i=0 ; i<buffers[receiver].messages.length ; i++ ) {
                        if(buffers[receiver].messages[i][2]=="first") {
                            startIndex = i;
                            buffer = buffers[receiver].messages[i][1];
                        } else
                        if(startIndex!==null) {
                            buffer += buffers[receiver].messages[i][1];
                            if(buffers[receiver].messages[i][2]=="last") {
                                // if our buffer matches the message length
                                // we have a complete message
                                if(buffer.length==buffers[receiver].messages[startIndex][3]) {
                                    // message is complete
                                    enqueueMessage(buffers[receiver].messages[startIndex][0], buffer);
                                    buffers[receiver].messages.splice(startIndex, i-startIndex);
                                    buffers[receiver].firsts -= 1;
                                    buffers[receiver].lasts -= 1;
                                    if(buffers[receiver].messages.length==0) delete buffers[receiver];
                                    startIndex = null;
                                    buffer = null;
                                } else {
                                    // message is not complete
                                }
                            }
                        }
                    }
                }
            }

            function enqueueMessage(index, value) {

                receiver = "*";

                if(!messages[receiver]) {
                    messages[receiver] = [];
                }

                var m = /^(.*?[^\\])?\|(.*)$/.exec(value);

                var message = MESSAGE.Message();
                message.setReceiver(receiver);
                message.setMeta(m[1] || null);
                message.setData(m[2]);

                messages[receiver].push([index, message]);
            }
        },

        encodeMessage: function(options, message) {

            var protocol_id = message.getProtocol();
            if(!protocol_id) {
                throw new Error("Protocol not set for message");
            }

            var headers = [];

            var meta = message.getMeta() || "";

            var data = meta.replace(/\|/g, "\\|") + '|' + message.getData().replace(/\|/g, "\\|");

            var parts = chunk_split(data, options.messagePartMaxLength);

            var part,
                msg;
            for( var i=0 ; i<parts.length ; i++) {
                if (part = parts[i]) {

                    msg = "";

                    // escape backslashes
                    // NOTE: This should probably be done during JSON encoding to ensure we do not double-escape
                    //       with different encoders, but not sure how different encoders behave yet.
                    part = part.replace(/\\/g, "\\\\");

                    if (parts.length>2) {
                        msg = ((i==0)?data.length:'') +
                              '|' + part + '|' +
                              ((i<parts.length-2)?"\\":"");
                    } else {
                        msg = part.length + '|' + part + '|';
                    }

                    headers.push([
                        protocol_id,
                        "",
                        "",
                        msg
                    ]);
                }
            }
            return headers;
        },

        encodeKey: function(util) {

            if(!util["protocols"]) util["protocols"] = {};
            if(!util["messageIndexes"]) util["messageIndexes"] = {};

            var protocol = getProtocolIndex(uri);
            var messageIndex = getMessageIndex(protocol);

            return util.HEADER_PREFIX + protocol + "-" + messageIndex;

            function getProtocolIndex(protocolId) {
                if(util["protocols"][protocolId]) return util["protocols"][protocolId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + "protocol-" + i);
                    if(!value) {
                        util["protocols"][protocolId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + "protocol-" + i, protocolId);
                        return i;
                    } else
                    if(value==protocolId) {
                        util["protocols"][protocolId] = i;
                        return i;
                    }
                }
            }

            function getMessageIndex(protocolIndex) {
                var value = util["messageIndexes"][protocolIndex] || util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-index");
                if(!value) {
                    value = 0;
                }
                value++;
                util["messageIndexes"][protocolIndex] = value;
                util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-index", value);
                return value;
            }
        }
    };
};




function chunk_split(value, length) {
    var parts = [];
    var part;
    while( (part = value.substr(0, length)) && part.length > 0 ) {
        parts.push(part);
        value = value.substr(length);
    }
    return parts;
}

},{"./message":108,"fp-modules-for-nodejs/lib/json":116,"fp-modules-for-nodejs/lib/util":122}],110:[function(require,module,exports){

var Receiver = exports.Receiver = function () {
    if (!(this instanceof exports.Receiver))
        return new exports.Receiver();

    this.listeners = [];
    this.ids = [];
}
    
Receiver.prototype.setId = function(id) {
    if(this.ids.length > 0) {
        throw new Error("ID already set for receiver!");
    }
    this.ids.push(id);
}

Receiver.prototype.addId = function(id) {
    this.ids.push(id);
}

/**
 * @deprecated
 */
Receiver.prototype.getId = function() {
    if(this.ids.length > 1) {
        throw new Error("DEPRECATED: Multiple IDs for receiver. Cannot use getId(). Use getIds() instead!");
    }
    return this.ids[0];
}

Receiver.prototype.getIds = function() {
    return this.ids;
}

Receiver.prototype.hasId = function(id) {
    for( var i=0 ; i<this.ids.length ; i++ ) {
        if(this.ids[i]==id) {
            return true;
        }
    }
    return false;
}

Receiver.prototype.onChannelOpen = function(context) {
    this._dispatch("onChannelOpen", [context]);
}

Receiver.prototype.onChannelClose = function(context) {
    this._dispatch("onChannelClose", [context]);
}

Receiver.prototype.onMessageGroupStart = function(context) {
    this._dispatch("onMessageGroupStart", [context]);
}

Receiver.prototype.onMessageGroupEnd = function(context) {
    this._dispatch("onMessageGroupEnd", [context]);
}

Receiver.prototype.onMessageReceived = function(message, context) {
    return this._dispatch("onMessageReceived", [message, context]);
}

Receiver.prototype.addListener = function(listener) {
    this.listeners.push(listener);
}

Receiver.prototype._dispatch = function(event, args) {
    if(this.listeners.length==0) {
        return;
    }
    var returnOptions,
        opt;
    for( var i=0 ; i<this.listeners.length ; i++ ) {
        if(this.listeners[i][event]) {
            opt = this.listeners[i][event].apply(this.listeners[i], args);
            if(opt) {
                if(!returnOptions) {
                    returnOptions = opt;
                } else {
                    for( var key in opt ) {
                        returnOptions[key] = opt[key];
                    }
                }
            }
        }
    }
    return returnOptions;
}

},{}],111:[function(require,module,exports){

var WILDFIRE = require("../wildfire"),
    JSON = require("fp-modules-for-nodejs/lib/json");

var CallbackStream = exports.CallbackStream = function CallbackStream()
{
    if (!(this instanceof exports.CallbackStream))
        return new exports.CallbackStream();
    this.messagesIndex = 1;
    this.messages = {};

    var self = this;

    this.dispatcher = WILDFIRE.Dispatcher();
    // TODO: Use own protocol here
    this.dispatcher.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');


    this.receiver = WILDFIRE.Receiver();
    this.receiveHandler = null;

    this.receiver.addListener({
        onMessageReceived: function(context, message)
        {
            var meta = JSON.decode(message.getMeta());

            if(meta[".action"] == "request")
            {
                self.receiveHandler({
                    meta: meta,
                    data: JSON.decode(message.getData())
                }, function(message)
                {
                    if (!message || typeof message !== "object")
                        throw new Error("Did not get message object for receiveHandler response");
                    if (typeof message.data === "undefined")
                        throw new Error("Message object from receiveHandler response does not include 'data' property.");
                    
                    var msg = WILDFIRE.Message();
                    if (typeof message.meta == "undefined")
                        message.meta = {};

                    message.meta[".callbackid"] = meta[".callbackid"];
                    message.meta[".action"] = "respond";

                    try {
                        msg.setMeta(JSON.encode(message.meta));
                    } catch(e) {
                        console.warn("Error JSON encoding meta", e);
                        throw new Error("Error JSON encoding meta: " + e);
                    }
                    try {
                        msg.setData(JSON.encode(message.data));
                    } catch(e) {
                        console.warn("Error JSON encoding data", e);
                        throw new Error("Error JSON encoding data: " + e);
                    }

                    try {
                        self.dispatcher.dispatch(msg, true);
                    } catch(e) {
                        console.warn("Error dispatching message in " + module.id, e);
                        throw new Error("Error '"+e+"' dispatching message in " + module.id);
                    }
                });
            }
            else
            if(meta[".action"] == "respond")
            {
                if(self.messages["i:" + meta[".callbackid"]])
                {
                    self.messages["i:" + meta[".callbackid"]][1](
                        {
                            meta: meta,
                            data: JSON.decode(message.getData())
                        }
                    );
                    delete self.messages["i:" + meta[".callbackid"]];
                }
            }
            else
                throw new Error("NYI");
        }
    });
}

CallbackStream.prototype.setChannel = function(channel)
{
    this.dispatcher.setChannel(channel);
    channel.addReceiver(this.receiver);
}

CallbackStream.prototype.setHere = function(id)
{
    // TODO: Remove suffix once we use our own protocol for callbacks
    this.receiver.setId(id + "-callback");
    // TODO: Remove suffix once we use our own protocol for callbacks
    this.dispatcher.setSender(id + "-callback");
}

CallbackStream.prototype.setThere = function(id)
{
    // TODO: Remove suffix once we use our own protocol for callbacks
    this.dispatcher.setReceiver(id + "-callback");
}

CallbackStream.prototype.send = function(message, callback)
{
    var msg = WILDFIRE.Message();
    if (typeof message.meta == "undefined")
        message.meta = {};

    message.meta[".callbackid"] = this.messagesIndex;
    message.meta[".action"] = "request";

    msg.setMeta(JSON.encode(message.meta));
    msg.setData(JSON.encode(message.data));

    this.messages["i:" + this.messagesIndex] = [msg, callback];
    this.messagesIndex++;

    this.dispatcher.dispatch(msg, true);
}

CallbackStream.prototype.receive = function(handler)
{
    this.receiveHandler = handler;
}

},{"../wildfire":113,"fp-modules-for-nodejs/lib/json":116}],112:[function(require,module,exports){


const RECEIVER_ID = "http://registry.pinf.org/cadorn.org/wildfire/@meta/receiver/transport/0";

var MD5 = require("fp-modules-for-nodejs/lib/md5");
var STRUCT = require("fp-modules-for-nodejs/lib/struct");
var JSON = require("fp-modules-for-nodejs/lib/json");
//var HTTP = require("http");
var MESSAGE = require("./message");
var RECEIVER = require("./receiver");


var Transport = exports.Transport = function(options) {
    if (!(this instanceof exports.Transport))
        return new exports.Transport(options);
    this.options = options;
}

Transport.prototype.newApplicator = function(applicator) {
    return Applicator(this, applicator);
}

Transport.prototype.serviceDataRequest = function(key) {
    return require("./wildfire").getBinding().formatResponse({
        "contentType": "text/plain"
    }, this.getData(key));
}

Transport.prototype.getUrl = function(key) {
    return this.options.getUrl(key);
}

Transport.prototype.setData = function(key, value) {
    return this.options.setData(key, value);
}

Transport.prototype.getData = function(key) {
    return this.options.getData(key);
}


var Applicator = function(transport, applicator) {
    if (!(this instanceof Applicator))
        return new Applicator(transport, applicator);
    this.transport = transport;
    this.applicator = applicator;
    this.buffer = {};
}

Applicator.prototype.setMessagePart = function(key, value) {
    this.buffer[key] = value;
}

Applicator.prototype.getMessagePart = function(key) {
    if(!this.buffer[key]) return null;
    return this.buffer[key];
}

Applicator.prototype.flush = function(channel) {

    var data = [];
    var seed = [];

    // combine all message parts into one text block
    for( var key in this.buffer ) {
        data.push(key + ": " + this.buffer[key]);
        if(data.length % 3 == 0 && seed.length < 5) seed.push(this.buffer[key]);
    }
    
    // generate a key for the text block
    var key = STRUCT.bin2hex(MD5.hash(Math.random() + ":" + module.path + ":" + seed.join("")));

    // store the text block for future access
    this.transport.setData(key, data.join("\n"));
    
    // create a pointer message to be sent instead of the original messages
    var message = MESSAGE.Message();
    message.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0');
    message.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js/lib/transport.js');
    message.setReceiver(RECEIVER_ID);
    message.setData(JSON.encode({"url": this.transport.getUrl(key)}));
    
    // send the pointer message through the channel bypassing all transports and local receivers
    channel.enqueueOutgoing(message, true);
    return channel.flush(this.applicator, true);
}

exports.newReceiver = function(channel) {
    var receiver = RECEIVER.Receiver();
    receiver.setId(RECEIVER_ID);
    receiver.addListener({
        onMessageReceived: function(context, message) {
            try {
                context.transporter = RECEIVER_ID;

throw new Error("OOPS!!!");
/*
                // make a sync secondary request
                var data = HTTP.read(JSON.decode(message.getData()).url);
                if(data) {
                    channel.parseReceived(data, context, {
                        "skipChannelOpen": true,
                        "skipChannelClose": true
                    });
                }
*/
            } catch(e) {
                console.warn(e);
            }
        }
    });
    return receiver;
}


},{"./message":108,"./receiver":110,"./wildfire":113,"fp-modules-for-nodejs/lib/json":116,"fp-modules-for-nodejs/lib/md5":117,"fp-modules-for-nodejs/lib/struct":120}],113:[function(require,module,exports){

exports.Receiver = function() {
    return require("./receiver").Receiver();
}

exports.Dispatcher = function() {
    return require("./dispatcher").Dispatcher();
}

exports.Message = function() {
    return require("./message").Message();
}

exports.HttpHeaderChannel = function(options) {
    return require("./channel-httpheader").HttpHeaderChannel(options);
}

exports.HttpClientChannel = function() {
    return require("./channel/http-client").HttpClientChannel();
}

exports.ShellCommandChannel = function() {
    return require("./channel-shellcommand").ShellCommandChannel();
}

exports.PostMessageChannel = function() {
    return require("./channel-postmessage").PostMessageChannel();
}

exports.CallbackStream = function() {
    return require("./stream/callback").CallbackStream();
}

},{"./channel-httpheader":102,"./channel-postmessage":103,"./channel-shellcommand":104,"./channel/http-client":106,"./dispatcher":107,"./message":108,"./receiver":110,"./stream/callback":111}],114:[function(require,module,exports){

/* Binary */
// -- tlrobinson Tom Robinson
// -- gozala Irakli Gozalishvili
// -- tschaub
// -- nrstott Nathan Stott

//var engine = require("./platform/{platform}/binary"),
var engine = require("./platform/node/binary"),
    B_ALLOC = engine.B_ALLOC,
    B_LENGTH = engine.B_LENGTH,
    B_GET = engine.B_GET,
    B_SET = engine.B_SET,
    B_FILL = engine.B_FILL,
    B_COPY = engine.B_COPY,
    B_DECODE = engine.B_DECODE,
    B_ENCODE = engine.B_ENCODE,
    B_DECODE_DEFAULT = engine.B_DECODE_DEFAULT,
    B_ENCODE_DEFAULT = engine.B_ENCODE_DEFAULT,
    B_TRANSCODE = engine.B_TRANSCODE;
    
var Binary = exports.Binary = function() {
    // this._bytes
    // this._offset
    // this._length
};
/*
Object.defineProperty(Binary.prototype, "length", {
    "get": function () {
        return this._length;
    },
    "enumerable": false,
    "configurable": false
});
*/
// toArray() - n array of the byte values
// toArray(charset) - an array of the code points, decoded
Binary.prototype.toArray = function(charset) {
    if (arguments.length === 0) {
        var array = new Array(this._length);
        
        for (var i = 0; i < this._length; i++)
            array[i] = this.get(i);
        
        return array;
    }
    else if (arguments.length === 1) {
        var string = B_DECODE(this._bytes, this._offset, this._length, charset),
            length = string.length,
            array = new Array(length);
        
        for (var i = 0; i < length; i++)
            array[i] = string.charCodeAt(i);
        
        return array;
    }
    else
        throw new Error("Illegal arguments to toArray()");
};

// toByteArray() - just a copy
// toByteArray(sourceCharset, targetCharset) - transcoded
Binary.prototype.toByteArray = function(sourceCodec, targetCodec) {
    if (arguments.length < 2)
        return new ByteArray(this);
    else if (arguments.length === 2 && typeof sourceCodec === "string" && typeof targetCodec === "string") {
        var bytes = B_TRANSCODE(this._bytes, this._offset, this._length, sourceCodec, targetCodec);
        return new ByteArray(bytes, 0, B_LENGTH(bytes));
    }
    
    throw new Error("Illegal arguments to ByteArray toByteArray");
};

// toByteString() - byte for byte copy
// toByteString(sourceCharset, targetCharset) - transcoded
Binary.prototype.toByteString = function(sourceCodec, targetCodec) {
    if (arguments.length < 2)
        return new ByteString(this);
    else if (arguments.length === 2 && typeof sourceCodec === "string" && typeof targetCodec === "string") {
        var bytes = B_TRANSCODE(this._bytes, this._offset, this._length, sourceCodec, targetCodec);
        return new ByteString(bytes, 0, B_LENGTH(bytes));
    }
    
    throw new Error("Illegal arguments to ByteArray toByteString");
};

// decodeToString()
// decodeToString(charset) - returns a String from its decoded bytes in a given charset. If no charset is provided, or if the charset is "undefined", assumes the default system encoding.
// decodeToString(number) - returns a String from its decoded bytes in a given base, like 64, 32, 16, 8, 2
Binary.prototype.decodeToString = function(charset) {
    if (charset) {
        if (typeof charset == "number")
            return require("./base" + charset).encode(this);
        else if (/^base/.test(charset))
            return require(charset).encode(this);
        else
            return B_DECODE(this._bytes, this._offset, this._length, charset);
    }
    return B_DECODE_DEFAULT(this._bytes, this._offset, this._length);
};

// get(offset) - Return the byte at offset as a Number.
Binary.prototype.get = function(offset) {
    if (offset < 0 || offset >= this._length)
        return NaN;
    
    //var b = this._bytes[this._offset + offset];
    //return (b >= 0) ? b : -1 * ((b ^ 0xFF) + 1);
    return B_GET(this._bytes, this._offset + offset)
};

Binary.prototype.indexOf = function(byteValue, start, stop) {
    // HACK: use ByteString's slice since we know we won't be modifying result
    var array = ByteString.prototype.slice.apply(this, [start, stop]).toArray(),
        result = array.indexOf(byteValue);
    return (result < 0) ? -1 : result + (start || 0);
};

Binary.prototype.lastIndexOf = function(byteValue, start, stop) {
    // HACK: use ByteString's slice since we know we won't be modifying result
    var array = ByteString.prototype.slice.apply(this, [start, stop]).toArray(),
        result = array.lastIndexOf(byteValue);
    return (result < 0) ? -1 : result + (start || 0);
};

// valueOf()
Binary.prototype.valueOf = function() {
    return this;
};

/* ByteString */

var ByteString = exports.ByteString = function() {
    if (!(this instanceof ByteString)) {
        if (arguments.length == 0)
            return new ByteString();
        if (arguments.length == 1)
            return new ByteString(arguments[0]);
        if (arguments.length == 2)
            return new ByteString(arguments[0], arguments[1]);
        if (arguments.length == 3)
            return new ByteString(arguments[0], arguments[1], arguments[2]);
    }

    // ByteString() - Construct an empty byte string.
    if (arguments.length === 0) {
        this._bytes     = B_ALLOC(0); // null;
        this._offset    = 0;
        this._length    = 0;
    }
    // ByteString(byteString) - Copies byteString.
    else if (arguments.length === 1 && arguments[0] instanceof ByteString) {
        return arguments[0];
    }
    // ByteString(byteArray) - Use the contents of byteArray.
    else if (arguments.length === 1 && arguments[0] instanceof ByteArray) {
        var copy = arguments[0].toByteArray();
        this._bytes     = copy._bytes;
        this._offset    = copy._offset;
        this._length    = copy._length;
    }
    // ByteString(arrayOfNumbers) - Use the numbers in arrayOfNumbers as the bytes.
    else if (arguments.length === 1 && Array.isArray(arguments[0])) {
        var array = arguments[0];
        this._bytes = B_ALLOC(array.length);
        for (var i = 0; i < array.length; i++) {
            var b = array[i];
            // If any element is outside the range 0...255, an exception (TODO) is thrown.
            if (b < -0x80 || b > 0xFF)
                throw new Error("ByteString constructor argument Array of integers must be -128 - 255 ("+b+")");
            // Java "bytes" are interpreted as 2's complement
            //this._bytes[i] = (b < 128) ? b : -1 * ((b ^ 0xFF) + 1);
            B_SET(this._bytes, i, b);
        }
        this._offset = 0;
        this._length = B_LENGTH(this._bytes);
    }
    // ByteString(string, charset) - Convert a string. The ByteString will contain string encoded with charset.
    else if ((arguments.length === 1 || (arguments.length === 2 && arguments[1] === undefined)) && typeof arguments[0] === "string") {
        this._bytes     = B_ENCODE_DEFAULT(arguments[0]);
        this._offset    = 0;
        this._length    = B_LENGTH(this._bytes);
    }
    else if (arguments.length === 2 && typeof arguments[0] === "string" && typeof arguments[1] === "string") {
        this._bytes     = B_ENCODE(arguments[0], arguments[1]);
        this._offset    = 0;
        this._length    = B_LENGTH(this._bytes);
    }
    // private: ByteString(bytes, offset, length)
    else if (arguments.length === 3 && typeof arguments[1] === "number" && typeof arguments[2] === "number") {
        this._bytes     = arguments[0];
        this._offset    = arguments[1];
        this._length    = arguments[2];
    }
    else {
        var util = require("./util");
        throw new Error("Illegal arguments to ByteString constructor: " + util.repr(arguments));
    }
    
    if (engine.ByteStringWrapper)
        return engine.ByteStringWrapper(this);
    else
        return this;
};

ByteString.prototype = new Binary();

ByteString.prototype.__defineGetter__("length", function() {
    return this._length;
});
ByteString.prototype.__defineSetter__("length", function(length) {
});

// toByteArray() - Returns a byte for byte copy in a ByteArray.
// toByteArray(sourceCharset, targetCharset) - Returns a transcoded copy in a ByteArray.
//  - implemented on Binary

// toByteString() - Returns itself, since there's no need to copy an immutable ByteString.
// toByteString(sourceCharset, targetCharset) - Returns a transcoded copy.
//  - implemented on Binary

// toArray() - Returns an array containing the bytes as numbers.
// toArray(charset) - Returns an array containing the decoded Unicode code points.
//  - implemented on Binary

// toString()
ByteString.prototype.toString = function(charset) {
    if (charset)
        return this.decodeToString(charset);
        
    return "[ByteString "+this._length+"]";
};

// decodeToString(charset) - Returns the decoded ByteArray as a string.
//  - implemented on Binary

ByteString.prototype.byteAt =
ByteString.prototype.charAt = function(offset) {
    var byteValue = this.get(offset);
    
    if (isNaN(byteValue))
        return new ByteString();
        
    return new ByteString([byteValue]);
};

// indexOf() - implemented on Binary
// lastIndexOf() - implemented on Binary

// charCodeAt(offset)
ByteString.prototype.charCodeAt = Binary.prototype.get;

// get(offset) - implemented on Binary

// byteAt(offset) ByteString - implemented on Binary
// charAt(offset) ByteString - implemented on Binary

// split(delimiter, [options])
ByteString.prototype.split = function(delimiters, options) {
    var options = options || {},
        count = options.count === undefined ? -1 : options.count,
        includeDelimiter = options.includeDelimiter || false;
    
    // standardize delimiters into an array of ByteStrings:
    if (!Array.isArray(delimiters))
        delimiters = [delimiters];
        
    delimiters = delimiters.map(function(delimiter) {
        if (typeof delimiter === "number")
            delimiter = [delimiter];
        return new ByteString(delimiter);
    });
    
    var components = [],
        startOffset = this._offset,
        currentOffset = this._offset;
    
    // loop until there's no more bytes to consume
    bytes_loop :
    while (currentOffset < this._offset + this._length) {
        
        // try each delimiter until we find a match
        delimiters_loop :
        for (var i = 0; i < delimiters.length; i++) {
            var d = delimiters[i];
            
            for (var j = 0; j < d._length; j++) {
                // reached the end of the bytes, OR bytes not equal
                if (currentOffset + j > this._offset + this._length ||
                    B_GET(this._bytes, currentOffset + j) !== B_GET(d._bytes, d._offset + j)) {
                    continue delimiters_loop;
                }
            }
            
            // push the part before the delimiter
            components.push(new ByteString(this._bytes, startOffset, currentOffset - startOffset));
            
            // optionally push the delimiter
            if (includeDelimiter)
                components.push(new ByteString(this._bytes, currentOffset, d._length))
            
            // reset the offsets
            startOffset = currentOffset = currentOffset + d._length;
            
            continue bytes_loop;
        }
        
        // if there was no match, increment currentOffset to try the next one
        currentOffset++;
    }
    
    // push the remaining part, if any
    if (currentOffset > startOffset)
        components.push(new ByteString(this._bytes, startOffset, currentOffset - startOffset));
    
    return components;
};

// slice()
// slice(begin)
// slice(begin, end)
ByteString.prototype.slice = function(begin, end) {
    if (begin === undefined)
        begin = 0;
    else if (begin < 0)
        begin = this._length + begin;
        
    if (end === undefined)
        end = this._length;
    else if (end < 0)
        end = this._length + end;
    
    begin = Math.min(this._length, Math.max(0, begin));
    end = Math.min(this._length, Math.max(0, end));
    
    return new ByteString(this._bytes, this._offset + begin, end - begin);
};

// substr(start)
// substr(start, length)
ByteString.prototype.substr = function(start, length) {
    if (start !== undefined) {
        if (length !== undefined)
            return this.slice(start);
        else
            return this.slice(start, start + length);
    }
    return this.slice();
};

// substring(first)
// substring(first, last)
ByteString.prototype.substring = function(from, to) {
    if (from !== undefined) {
        if (to !== undefined)
            return this.slice(Math.max(Math.min(from, this._length), 0));
        else
            return this.slice(Math.max(Math.min(from, this._length), 0),
                              Math.max(Math.min(to, this._length), 0));
    }
    return this.slice();
};

// [] ByteString - TODO

// toSource()
ByteString.prototype.toSource = function() {
    return "ByteString(["+this.toArray().join(",")+"])";
};

/* ByteArray */

// ByteArray() - New, empty ByteArray.
// ByteArray(length) - New ByteArray filled with length zero bytes.
// ByteArray(byteArray) - Copy byteArray.
// ByteArray(byteString) - Copy contents of byteString.
// ByteArray(arrayOfBytes) - Use numbers in arrayOfBytes as contents.
//     Throws an exception if any element is outside the range 0...255 (TODO).
// ByteArray(string, charset) - Create a ByteArray from a Javascript string, the result being encoded with charset.
var ByteArray = exports.ByteArray = function() {
    if (!this instanceof ByteArray) {
        if (arguments.length == 0)
            return new ByteArray();
        if (arguments.length == 1)
            return new ByteArray(arguments[0]);
        if (arguments.length == 2)
            return new ByteArray(arguments[0], arguments[1]);
        if (arguments.length == 3)
            return new ByteArray(arguments[0], arguments[1], arguments[2]);
    }

    // ByteArray() - New, empty ByteArray.
    if (arguments.length === 0) {
        this._bytes     = B_ALLOC(0); // null;
        this._offset    = 0;
        this._length    = 0;
    }
    // ByteArray(length) - New ByteArray filled with length zero bytes.
    else if (arguments.length === 1 && typeof arguments[0] === "number") {
        this._bytes     = B_ALLOC(arguments[0]); // null;
        this._offset    = 0;
        this._length    = B_LENGTH(this._bytes);
    }
    // ByteArray(byteArray) - Copy byteArray.
    // ByteArray(byteString) - Copy contents of byteString.
    else if (arguments.length === 1 && (arguments[0] instanceof ByteArray || arguments[0] instanceof ByteString)) {
        var byteArray = new ByteArray(arguments[0]._length);
        B_COPY(arguments[0]._bytes, arguments[0]._offset, byteArray._bytes, byteArray._offset, byteArray._length);
        return byteArray;
    }
    // ByteArray(arrayOfBytes) - Use numbers in arrayOfBytes as contents.
    // Throws an exception if any element is outside the range 0...255 (TODO).
    else if (arguments.length === 1 && Array.isArray(arguments[0])) {
        var array = arguments[0];
        this._bytes = B_ALLOC(array.length);
        for (var i = 0; i < array.length; i++) {
            var b = array[i];
            // If any element is outside the range 0...255, an exception (TODO) is thrown.
            if (b < 0 || b > 0xFF)
                throw new Error("ByteString constructor argument Array of integers must be 0 - 255 ("+b+")");
            // Java "bytes" are interpreted as 2's complement
            //this._bytes[i] = (b < 128) ? b : -1 * ((b ^ 0xFF) + 1);
            B_SET(this._bytes, i, b);
        }
        this._offset = 0;
        this._length = B_LENGTH(this._bytes);
    }
    // ByteArray(string, charset) - Create a ByteArray from a Javascript string, the result being encoded with charset.
    else if ((arguments.length === 1 || (arguments.length === 2 && arguments[1] === undefined)) && typeof arguments[0] === "string") {
        this._bytes     = B_ENCODE_DEFAULT(arguments[0]);
        this._offset    = 0;
        this._length    = B_LENGTH(this._bytes);
    }
    else if (arguments.length === 2 && typeof arguments[0] === "string" && typeof arguments[1] === "string") {
        this._bytes     = B_ENCODE(arguments[0], arguments[1]);
        this._offset    = 0;
        this._length    = B_LENGTH(this._bytes);
    }
    // private: ByteArray(bytes, offset, length)
    else if (arguments.length === 3 && typeof arguments[1] === "number" && typeof arguments[2] === "number") {
        this._bytes     = arguments[0];
        this._offset    = arguments[1];
        this._length    = arguments[2];
    }
    else
        throw new Error("Illegal arguments to ByteString constructor: [" +
            Array.prototype.join.apply(arguments, [","]) + "] ("+arguments.length+")");
    
    if (engine.ByteArrayWrapper)
        return engine.ByteArrayWrapper(this);
    else
        return this;
};

ByteArray.prototype = new Binary();

ByteArray.prototype.__defineGetter__("length", function() {
    return this._length;
});
ByteArray.prototype.__defineSetter__("length", function(length) {
    if (typeof length !== "number")
        return;
    
    // same length
    if (length === this._length) {
        return;
    }
    // new length is less, truncate
    else if (length < this._length) {
        this._length = length;
    }
    // new length is more, but fits without moving, just clear new bytes
    else if (this._offset + length <= B_LENGTH(this._bytes)) {
        B_FILL(this._bytes, this._length, this._offset + length - 1, 0);
        this._length = length;
    }
    // new length is more, but fits if we shift to bottom, so do that.
    else if (length <= B_LENGTH(this._bytes)) {
        B_COPY(this._bytes, this._offset, this._bytes, 0, this._length);
        this._offset = 0;
        B_FILL(this._bytes, this._length, this._offset + length - 1, 0);
        this._length = length;
    }
    // new length is more than the allocated bytes array, allocate a new one and copy the data
    else {
        var newBytes = B_ALLOC(length);
        B_COPY(this._bytes, this._offset, newBytes, 0, this._length);
        this._bytes = newBytes;
        this._offset = 0;
        this._length = length;
    }
});

// FIXME: array notation for set and get
ByteArray.prototype.set = function(index, b) {
    // If any element is outside the range 0...255, an exception (TODO) is thrown.
    if (b < 0 || b > 0xFF)
        throw new Error("ByteString constructor argument Array of integers must be 0 - 255 ("+b+")");
        
    if (index < 0 || index >= this._length)
        throw new Error("Out of range");
    
    // Java "bytes" are interpreted as 2's complement
    //this._bytes[this._offset + index] = (b < 128) ? b : -1 * ((b ^ 0xFF) + 1);
    B_SET(this._bytes, this._offset + index, b);
};

// toArray()
// toArray(charset)
//  - implemented on Binary

// toByteArray() - just a copy
// toByteArray(sourceCharset, targetCharset) - transcoded
//  - implemented on Binary

// toByteString() - byte for byte copy
// toByteString(sourceCharset, targetCharset) - transcoded
//  - implemented on Binary

// toString() - a string representation like "[ByteArray 10]"
// toString(charset) - an alias for decodeToString(charset)
ByteArray.prototype.toString = function(charset) {
    if (charset)
        return this.decodeToString(charset);
    
    return "[ByteArray "+this._length+"]"; 
};

// decodeToString(charset) - implemented on Binary

// byteAt(offset) ByteString - Return the byte at offset as a ByteString.
//  - implemented on Binary

// get(offset) Number - Return the byte at offset as a Number.
//  - implemented on Binary

// concat(other ByteArray|ByteString|Array)
// TODO: I'm assuming Array means an array of ByteStrings/ByteArrays, not an array of integers.
ByteArray.prototype.concat = function() {
    var components = [this],
        totalLength = this._length;
    
    for (var i = 0; i < arguments.length; i++) {
        var component = Array.isArray(arguments[i]) ? arguments[i] : [arguments[i]];
        
        for (var j = 0; j < component.length; j++) {
            var subcomponent = component[j];
            if (!(subcomponent instanceof ByteString) && !(subcomponent instanceof ByteArray))
                throw "Arguments to ByteArray.concat() must be ByteStrings, ByteArrays, or Arrays of those.";
            
            components.push(subcomponent);
            totalLength += subcomponent.length;
        }
    }
    
    var result = new ByteArray(totalLength),
        offset = 0;
    
    components.forEach(function(component) {
        B_COPY(component._bytes, component._offset, result._bytes, offset, component._length);
        offset += component._length;
    });
    
    return result;
};

// pop() -> byte Number
ByteArray.prototype.pop = function() {
    if (this._length === 0)
        return undefined;
    
    this._length--;
    
    return B_GET(this._bytes, this._offset + this._length);
};

// push(...variadic Numbers...)-> count Number
ByteArray.prototype.push = function() {
    var length, newLength = this.length += length = arguments.length;
    try {
        for (var i = 0; i < length; i++)
            this.set(newLength - length + i, arguments[i]);
    } catch (e) {
        this.length -= length;
        throw e;
    }
    return newLength;
};

// extendRight(...variadic Numbers / Arrays / ByteArrays / ByteStrings ...)
ByteArray.prototype.extendRight = function() {
    throw "NYI";
};

// shift() -> byte Number
ByteArray.prototype.shift = function() {
    if (this._length === 0)
        return undefined;
    
    this._length--;
    this._offset++;
    
    return B_GET(this._bytes, this._offset - 1);
};

// unshift(...variadic Numbers...) -> count Number
ByteArray.prototype.unshift = function() {
    var copy = this.slice();
    this.length = 0;
    try {
        this.push.apply(this, arguments);
        this.push.apply(this, copy.toArray());
        return this.length;
    } catch(e) {
        B_COPY(copy._bytes, copy._offset, this._bytes, this._offset, copy.length);
        this.length = copy.length;
        throw e;
    }
};

// extendLeft(...variadic Numbers / Arrays / ByteArrays / ByteStrings ...)
ByteArray.prototype.extendLeft = function() {
    throw "NYI";
};

// reverse() in place reversal
ByteArray.prototype.reverse = function() {
    // "limit" is halfway, rounded down. "top" is the last index.
    var limit = Math.floor(this._length/2) + this._offset,
        top = this._length - 1;
        
    // swap each pair of bytes, up to the halfway point
    for (var i = this._offset; i < limit; i++) {
        var tmp = B_GET(this._bytes, i);
        B_SET(this._bytes, i, B_GET(this._bytes, top - i));
        B_SET(this._bytes, top - i, tmp);
    }
    
    return this;
};

// slice()
ByteArray.prototype.slice = function() {
    return new ByteArray(ByteString.prototype.slice.apply(this, arguments));
};

var numericCompareFunction = function(o1, o2) { return o1 - o2; };

// sort([compareFunction])
ByteArray.prototype.sort = function(compareFunction) {
    // FIXME: inefficient?
    
    var array = this.toArray();
    
    if (arguments.length)
        array.sort(compareFunction);
    else
        array.sort(numericCompareFunction);
    
    for (var i = 0; i < array.length; i++)
        this.set(i, array[i]);
};

// splice()
ByteArray.prototype.splice = function(index, howMany /*, elem1, elem2 */) {
    if (index === undefined) return;
    if (index < 0) index += this.length;
    if (howMany === undefined) howMany = this._length - index;
    var end = index + howMany;
    var remove = this.slice(index, end);
    var keep = this.slice(end);
    var inject = Array.prototype.slice.call(arguments, 2);
    this._length = index;
    this.push.apply(this, inject);
    this.push.apply(this, keep.toArray());
    return remove;
};

// indexOf() - implemented on Binary
// lastIndexOf() - implemented on Binary

// split() Returns an array of ByteArrays instead of ByteStrings.
ByteArray.prototype.split = function() {
    var components = ByteString.prototype.split.apply(this.toByteString(), arguments);
    
    // convert ByteStrings to ByteArrays
    for (var i = 0; i < components.length; i++) {
        // we know we can use these byte buffers directly since we copied them above
        components[i] = new ByteArray(components[i]._bytes, components[i]._offset, components[i]._length);
    }
    
    return components;
};

// filter(callback[, thisObject])
ByteArray.prototype.filter = function(callback, thisObject) {
    var result = new ByteArray(this._length);
    for (var i = 0, length = this._length; i < length; i++) {
        var value = this.get(i);
        if (callback.apply(thisObject, [value, i, this]))
            result.push(value);
    }
    return result;
};

// forEach(callback[, thisObject]);
ByteArray.prototype.forEach = function(callback, thisObject) {
    for (var i = 0, length = this._length; i < length; i++)
        callback.apply(thisObject, [this.get(i), i, this]);
};

// every(callback[, thisObject])
ByteArray.prototype.every = function(callback, thisObject) {
    for (var i = 0, length = this._length; i < length; i++)
        if (!callback.apply(thisObject, [this.get(i), i, this]))
            return false;
    return true;
};

// some(callback[, thisObject])
ByteArray.prototype.some = function(callback, thisObject) {
    for (var i = 0, length = this._length; i < length; i++)
        if (callback.apply(thisObject, [this.get(i), i, this]))
            return true;
    return false;
};

// map(callback[, thisObject]);
ByteArray.prototype.map = function(callback, thisObject) {
    var result = new ByteArray(this._length);
    for (var i = 0, length = this._length; i < length; i++)
        result.set(i, callback.apply(thisObject, [this.get(i), i, this]));
    return result;
};

// reduce(callback[, initialValue])
ByteArray.prototype.reduce = function(callback, initialValue) {
    var value = initialValue;
    for (var i = 0, length = this._length; i < length; i++)
        value = callback(value, this.get(i), i, this);
    return value;
};

// reduceRight(callback[, initialValue])
ByteArray.prototype.reduceRight = function(callback, initialValue) {
    var value = initialValue;
    for (var i = this._length-1; i > 0; i--)
        value = callback(value, this.get(i), i, this);
    return value;
};

// displace(begin, end, values/ByteStrings/ByteArrays/Arrays...) -> length
//     begin/end are specified like for slice. Can be used like splice but does not return the removed elements.
ByteArray.prototype.displace = function(begin, end) {
    throw "NYI";
};

// toSource() returns a string like "ByteArray([])" for a null byte-array.
ByteArray.prototype.toSource = function() {
    return "ByteArray(["+this.toArray().join(",")+"])";
};


},{"./platform/node/binary":119,"./util":122}],115:[function(require,module,exports){

//var ENGINE = require("./platform/{platform}/http-client");
var ENGINE = require("./platform/browser/http-client");
var URI = require("./uri");

/**
 * @param options object
 *   host: 'www.google.com'
 *   port: 80
 *   path: '/upload'
 *   method: 'POST'
 *   headers: {}
 *   data: request (post) data
 *   responseEncoding: 'utf8'
 */
exports.request = function(options, successCallback, errorCallback)
{
    if (typeof options.url !== "undefined")
    {
        if (typeof options.host !== "undefined")
            throw new Error("Cannot set 'host' when 'url' is set!");
        if (typeof options.path !== "undefined")
            throw new Error("Cannot set 'path' when 'url' is set!");
        if (typeof options.port !== "undefined")
            throw new Error("Cannot set 'port' when 'url' is set!");

        var uri = URI.URI(options.url);

        options.host = uri.authority;
        options.port = uri.port || ((uri.scheme === "https")?443:80);
        options.path = uri.path || "/";
        
        if (uri.query) {
        	options.path += "?" + uri.query;
        }
    }
    options.method = options.method || "GET";
    options.port = options.port || 80;
    options.path = options.path || "/";
    options.url = options.url || ("http://" + options.host + ":" + options.port + options.path);
    options.headers = options.headers || { "Host": options.host };

    options.headers["Host"] = options.headers["Host"] || options.host;
    options.headers["User-Agent"] = options.headers["User-Agent"] || "pinf/modules-js/http-client";

    return ENGINE.request(options, successCallback, errorCallback);
}

},{"./platform/browser/http-client":118,"./uri":121}],116:[function(require,module,exports){

exports.encode = JSON.stringify;
exports.decode = JSON.parse;

},{}],117:[function(require,module,exports){

/*!
    A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
    Digest Algorithm, as defined in RFC 1321.
    Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
    Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
    Distributed under the BSD License
    See http://pajhome.org.uk/crypt/md5 for more info.
    Ported to Chiron and Narwhal by Kris Kowal, kriskowal
*/

// ported by:
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License

var util = require("./util");
var struct = require("./struct");

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */

/*** hash
    returns a hex string of the md5 hash for a given string.
*/
exports.hash_md5 = function(s) {
    return struct.bin2hex(exports.hash(s));
}
exports.hash = function (s, _characterSize) {
    if (util.no(_characterSize)) _characterSize = struct.characterSize;
    return struct.binl2bin(core_md5(struct.str2binl(s), s.length * _characterSize));
};

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
var core_md5 = function (x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << ((len) % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;

    var a =  1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d =  271733878;

    for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;

        a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
        d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
        c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
        b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
        a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
        d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
        c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
        b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
        a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
        d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
        c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
        b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
        a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
        d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
        c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
        b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

        a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
        d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
        c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
        b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
        a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
        d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
        c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
        b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
        a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
        d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
        c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
        b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
        a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
        d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
        c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
        b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

        a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
        d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
        c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
        b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
        a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
        d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
        c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
        b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
        a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
        d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
        c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
        b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
        a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
        d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
        c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
        b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

        a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
        d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
        c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
        b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
        a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
        d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
        c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
        b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
        a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
        d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
        c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
        b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
        a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
        d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
        c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
        b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

        a = struct.addU32(a, olda);
        b = struct.addU32(b, oldb);
        c = struct.addU32(c, oldc);
        d = struct.addU32(d, oldd);
    }
    return [a, b, c, d];

};

/*
 * These functions implement the four basic operations the algorithm uses.
 */

var md5_cmn = function (q, a, b, x, s, t) {
    return struct.addU32(struct.rolU32(struct.addU32(a, q, x, t), s), b);
};

var md5_ff = function (a, b, c, d, x, s, t) {
    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
};

var md5_gg = function (a, b, c, d, x, s, t) {
    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
};

var md5_hh = function (a, b, c, d, x, s, t) {
    return md5_cmn(b ^ c ^ d, a, b, x, s, t);
};

var md5_ii = function (a, b, c, d, x, s, t) {
    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
};

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
var core_hmac_md5 = function (key, data, _characterSize) {
    if (util.no(_characterSize)) _characterSize = struct.characterSize;
    var bkey = struct.str2binl(key);
    if(bkey.length > 16) bkey = core_md5(bkey, key.length * _characterSize);

    var ipad = [], opad = [];
    for (var i = 0; i < 16; i++) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = core_md5(ipad.concat(struct.str2binl(data)), 512 + data.length * _characterSize);
    return core_md5(opad.concat(hash), 512 + 128);
};


},{"./struct":120,"./util":122}],118:[function(require,module,exports){

exports.request = function(options, successCallback, errorCallback)
{
    try {

        // TODO: Add support for other browsers

        var request = new XMLHttpRequest();
        request.onreadystatechange = function (event) {
            if (request.readyState == 4) {
                
                var headers = {},
                    lines = request.getAllResponseHeaders().split("\n");
                for (var i=0,ic=lines.length ; i<ic ; i++ )
                {
                    if (lines[i])
                    {
                        var m = lines[i].match(/^([^:]*):\s*(.*)$/);
                        headers[m[1]] = m[2];
                    }
                }

                successCallback({
                    status: request.status,
                    headers: headers,
                    data: request.responseText
                });
            }
        };
        request.open(options.method, options.url, true);

        for (var name in options.headers)
        {
            if (name.toLowerCase() != "host")
            {
                request.setRequestHeader(name, options.headers[name]);
            }
        }

        request.send(options.data);

    } catch(e) {
        console.warn(e);
        errorCallback(e);
    }
}

},{}],119:[function(require,module,exports){
(function (Buffer){

//var Buffer = require("../../buffer").Buffer;

exports.B_LENGTH = function (bytes) {
    return bytes.length;
};

exports.B_ALLOC = function (length) {
//    throw new Error("NYI - exports.B_ALLOC in " + module.id);
    return new Buffer(length);
};

exports.B_FILL = function(bytes, length, offset, value) {
    bytes.fill(value, offset, offset + length);
};

exports.B_COPY = function(src, srcOffset, dst, dstOffset, length) {
    src.copy(dst, srcOffset, srcOffset + length, dstOffset);
};

exports.B_GET = function(bytes, index) {
    return bytes[index];
};

exports.B_SET = function(bytes, index, value) {
    bytes[index] = value;
};

exports.B_DECODE = function(bytes, offset, length, charset) {
    return bytes.toString(charset, offset, offset + length);
};

exports.B_DECODE_DEFAULT = function(bytes, offset, length) {
    return bytes.utf8Slice(offset, length);
};

exports.B_ENCODE = function(string, charset) {
    throw new Error("NYI - exports.B_ENCODE in " + module.id);
//    return Buffer.fromStringCharset(string, charset);
};

exports.B_ENCODE_DEFAULT = function(string) {
    return exports.B_ENCODE(string, 'utf-8');
};

exports.B_TRANSCODE = function(bytes, offset, length, sourceCharset, targetCharset) {
    var raw = exports.B_DECODE(bytes, offset, length, sourceCharset);
    return exports.B_ENCODE(bytes, 0, raw.length, targetCharset);
};

}).call(this,require("buffer").Buffer)
},{"buffer":128}],120:[function(require,module,exports){

// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License

var util = require("./util");
var binary = require("./binary");

/*** alphabet16Upper
*/
exports.alphabet16Upper = "0123456789ABCDEF";

/*** alphabet16Lower
*/
exports.alphabet16Lower = "0123456789abcdef";

/*** alphabet16
    ``alphabet16Lower`` is the default hexadecimal alphabet.
    This value can be overridden on the module
    and function level.
*/

exports.alphabet16 = exports.alphabet16Lower;

/*** alphabet36
*/
exports.alphabet36 = "0123456789abcdefghijklmnopqrstuvwxyz";

/*** alphabet64
*/
exports.alphabet64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/*** padBase64 
    base-64 pad character. "=" for strict RFC compliance, "" for brevity
    "=" by default.
    This value can be overridden on the module
    and function level.
*/
exports.padBase64 = "=";

/*** characterSize
    bits per input character. 8 - ASCII; 16 - Unicode
    This value can be overridden on the module
    and function level.
*/
exports.characterSize = 8; 

/*** ord
    Returns the character code ordinal (offset in the ASCII or Unicode tables)
    for a given single character. 

     - inverse: `chr`

*/
exports.ord = function (chr) {
    return chr.charCodeAt();
};

/*** chr
    Returns the character for a given character code ordinal (offset in the
    ASCII or Unicode tables).

     - inverse: `ord`

*/
exports.chr = function (ord) {
    return String.fromCharCode(ord);
};

/* undocumented addU32
    Add integers, wrapping at 2**32. This uses 16-bit operations internally
    to work around bugs in some JavaScript interpreters.

    - `variadic`
*/
exports.addU32 = function (/* ... */) {
    var acc = 0;
    for (var i = 0; i < arguments.length; i++) {
        var x = arguments[i];
        var lsw = (acc & 0xFFFF) + (x & 0xFFFF);
        var msw = (acc >> 16) + (x >> 16) + (lsw >> 16);
        acc = (msw << 16) | (lsw & 0xFFFF);
    }
    return acc;
};

/* undocumented rolU32
    Bitwise rotate a 32-bit number to the left.
*/
exports.rolU32 = function (num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
};

/* undocumented str2binl
    Convert a string to an array of little-endian words
    If characterSize is ASCII, characters >255 have their hi-byte silently ignored.
*/
exports.str2binl = function (str, _characterSize) {
    if (util.no(_characterSize))
        _characterSize = exports.characterSize;
    var bin = [];
    var mask = (1 << _characterSize) - 1;
    for (var i = 0; i < str.length * _characterSize; i += _characterSize)
        bin[i>>5] |= (str.charCodeAt(i / _characterSize) & mask) << (i % 32);
    return bin;
};

/* undocumented str2binb
    Convert an 8-bit or 16-bit string to an array of big-endian words
    In 8-bit function, characters >255 have their hi-byte silently ignored.
*/
exports.str2binb = function (str, _characterSize) {
    if (util.no(_characterSize))
        _characterSize = exports.characterSize;
    var bin = [];
    var mask = (1 << _characterSize) - 1;
    for (var i = 0; i < str.length * _characterSize; i += _characterSize)
        bin[i>>5] |= (
            (str.charCodeAt(i / _characterSize) & mask) <<
            (32 - _characterSize - i % 32)
        );
    return bin;
};

/* undocumented binl2str
    Convert an array of little-endian words to a string
*/
exports.binl2str = function (bin, _characterSize) {
    return exports.binl2bin(bin, _characterSize).decodeToString('ascii');
};

/* undocumented binl2bin
    Convert an array of little-endian words to a string
*/
exports.binl2bin = function (bin, _characterSize) {
    if (util.no(_characterSize)) 
        _characterSize = exports.characterSize;
    var str = [];
    var mask = (1 << _characterSize) - 1;
    for (var i = 0; i < bin.length * 32; i += _characterSize)
        str.push((bin[i>>5] >>> (i % 32)) & mask);
    return binary.ByteString(str);
};

/* undocumented binb2str
    Convert an array of big-endian words to a string
*/
exports.binb2str = function (bin, _characterSize) {
    return exports.binb2bin(bin, _characterSize).decodeToString('ascii');
};

/* undocumented binb2bin
    Convert an array of big-endian words to a string
*/
exports.binb2bin = function (bin, _characterSize) {
    if (util.no(_characterSize)) 
        _characterSize = exports.characterSize;
    var str = [];
    var mask = (1 << _characterSize) - 1;
    for (var i = 0; i < bin.length * 32; i += _characterSize)
        str.push((bin[i>>5] >>> (32 - _characterSize - i % 32)) & mask);
    return binary.ByteString(str);
};

/* undocumented binl2hex
    Convert an array of little-endian words to a hex string.
*/
exports.binl2hex = function (binarray, _alphabet16) {
    if (util.no(_alphabet16))
        _alphabet16 = exports.alphabet16;
    var str = "";
    for (var i = 0; i < binarray.length * 4; i++) {
        str += _alphabet16.charAt((binarray[i>>2] >> ((i % 4) * 8 + 4)) & 0xF) +
               _alphabet16.charAt((binarray[i>>2] >> ((i % 4) * 8)) & 0xF);
    }
    return str;
};

/* undocumented binb2hex
    Convert an array of big-endian words to a hex string.
*/
exports.binb2hex = function (binarray, _alphabet16) {
    if (util.no(_alphabet16))
        _alphabet16 = exports.alphabet16;
    var str = "";
    for (var i = 0; i < binarray.length * 4; i++) {
        str += _alphabet16.charAt((binarray[i>>2] >> ((3 - i % 4)*8+4)) & 0xF) +
               _alphabet16.charAt((binarray[i>>2] >> ((3 - i % 4) * 8)) & 0xF);
    }
    return str;
};

/* undocumented binl2base64
    Convert an array of little-endian words to a base-64 string
*/
exports.binl2base64 = function (binarray) {
    var str = "";
    for (var i = 0; i < binarray.length * 4; i += 3) {
        var triplet = (
            (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16) |
            (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8) |
            ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF)
        );
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > binarray.length * 32)
                str += exports.padBase64;
            else str += exports.alphabet64.charAt((triplet >> 6*(3-j)) & 0x3F);
        }
    }
    return str;
};

/* undocumented binb2base64
    Convert an array of big-endian words to a base-64 string
*/
exports.binb2base64 = function (binarray) {
    var str = "";
    for (var i = 0; i < binarray.length * 4; i += 3) {
        var triplet = (
            (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) |
            (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 ) |
            ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF)
        );
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > binarray.length * 32)
                str += exports.padBase64;
            else str += exports.alphabet64.charAt((triplet >> 6*(3-j)) & 0x3F);
        }
    }
    return str;
};

/* undocumented bin2hex
    Convert a string to a hex string.
 */
exports.bin2hex = function (bin) {
    
    function convert(num) {
        if (num > 65535) throw "error";
        var first = Math.round(num/4096 - .5),
            temp1 = (num - first * 4096),
            second = Math.round(temp1/256 -.5),
            temp2 = (temp1 - second * 256),
            third = Math.round(temp2/16 - .5),
            fourth = (temp2 - third * 16);
        return String(letter(third) + letter(fourth));
    }
    
    function letter(num) {
        if (num < 10) return ""+num;
        else {
            if (num == 10) return "A";
            if (num == 11) return "B";
            if (num == 12) return "C";
            if (num == 13) return "D";
            if (num == 14) return "E";
            if (num == 15) return "F";
        }
    }
    
    var str = "";
    for (var i = 0; i < bin.length; i++) {
        str += convert(bin.charCodeAt(i));
    }
    return str;
}

},{"./binary":114,"./util":122}],121:[function(require,module,exports){

// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// gmosx, George Moschovitis

// Based on: http://data.iana.org/TLD/tlds-alpha-by-domain.txt
var TLDS = exports.TLDS = [
    "AC","AD","AE","AERO","AF","AG","AI","AL","AM","AN","AO","AQ","AR","ARPA","AS","ASIA","AT","AU","AW","AX","AZ",
    "BA","BB","BD","BE","BF","BG","BH","BI","BIZ","BJ","BM","BN","BO","BR","BS","BT","BV","BW","BY","BZ",
    "CA","CAT","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","COM","COOP","CR","CU","CV","CX","CY","CZ",
    "DE","DJ","DK","DM","DO","DZ",
    "EC","EDU","EE","EG","ER","ES","ET","EU",
    "FI","FJ","FK","FM","FO","FR",
    "GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GOV","GP","GQ","GR","GS","GT","GU","GW","GY",
    "HK","HM","HN","HR","HT","HU",
    "ID","IE","IL","IM","IN","INFO","INT","IO","IQ","IR","IS","IT",
    "JE","JM","JO","JOBS","JP",
    "KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ",
    "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
    "MA","MC","MD","ME","MG","MH","MIL","MK","ML","MM","MN","MO","MOBI","MP","MQ","MR","MS","MT","MU","MUSEUM","MV","MW","MX","MY","MZ",
    "NA","NAME","NC","NE","NET","NF","NG","NI","NL","NO","NP","NR","NU","NZ",
    "OM","ORG",
    "PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PRO","PS","PT","PW","PY",
    "QA",
    "RE","RO","RS","RU","RW",
    "SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","ST","SU","SV","SY","SZ",
    "TC","TD","TEL","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TP","TR","TRAVEL","TT","TV","TW","TZ",
    "UA","UG","UK","US","UY","UZ",
    "VA","VC","VE","VG","VI","VN","VU",
    "WF","WS",
    "XN",
    "YE","YT","YU",
    "ZA","ZM","ZW"
];


/**
 * Uniform Resource Identifier (URI) - RFC3986
 * http://www.ietf.org/rfc/rfc3986.txt
 */
var URI = exports.URI = function (uri) {
    if (!(this instanceof URI))
        return new URI(uri);
    if (typeof uri === "object") {
        for (var name in uri) {
            if (Object.prototype.hasOwnProperty.call(uri, name)) {
                this[name] = uri[name];
            }
        }
    } else if (typeof uri === "string") {
        exports.parse.call(this, uri);
    } else {
        throw new TypeError("Invalid argument for URI constructor.");
    }

};

URI.prototype.resolve = function (other) {
    return exports.resolve(this, other);
};

URI.prototype.to = function (other) {
    return exports.relative(this, other);
};

URI.prototype.from = function (other) {
    return exports.relative(other, this);
};

/**
 * Convert the URI to a String.
 */
URI.prototype.toString = function () {
    return exports.format(this);
}

exports.unescape = URI.unescape = function(uri, plus) {
    return decodeURI(uri.replace(/\+/g, " "));
}

exports.unescapeComponent = URI.unescapeComponent = function(uri, plus) {
    return decodeURIComponent(uri.replace(/\+/g, " "));
}

// from Chiron's HTTP module:

/**** keys
    members of a parsed URI object.
*/
exports.keys = [
    "url",
    "scheme",
    "authorityRoot",
    "authority",
        "userInfo",
            "user",
            "password",
        "domain",
            "domains",
        "port",
    "path",
        "root",
        "directory",
            "directories",
        "file",
    "query",
    "anchor"
];

/**** expressionKeys
    members of a parsed URI object that you get
    from evaluting the strict regular expression.
*/
exports.expressionKeys = [
    "url",
    "scheme",
    "authorityRoot",
    "authority",
        "userInfo",
            "user",
            "password",
        "domain",
        "port",
    "path",
        "root",
        "directory",
        "file",
    "query",
    "anchor"
];

/**** strictExpression
*/
exports.strictExpression = new RegExp( /* url */
    "^" +
    "(?:" +
        "([^:/?#]+):" + /* scheme */
    ")?" +
    "(?:" +
        "(//)" + /* authorityRoot */
        "(" + /* authority */
            "(?:" +
                "(" + /* userInfo */
                    "([^:@/]*)" + /* user */
                    ":?" +
                    "([^:@/]*)" + /* password */
                ")?" +
                "@" +
            ")?" +
            "([^:/?#]*)" + /* domain */
            "(?::(\\d*))?" + /* port */
        ")" +
    ")?" +
    "(" + /* path */
        "(/?)" + /* root */
        "((?:[^?#/]*/)*)" +
        "([^?#]*)" + /* file */
    ")" +
    "(?:\\?([^#]*))?" + /* query */
    "(?:#(.*))?" /*anchor */
);

/**** Parser
    returns a URI parser function given
    a regular expression that renders 
    `expressionKeys` and returns an `Object`
    mapping all `keys` to values.
*/
exports.Parser = function (expression) {
    return function (url) {
        if (typeof url == "undefined")
            throw new Error("HttpError: URL is undefined");
        if (typeof url != "string")
            return new Object(url);

        var items = this instanceof URI ? this : Object.create(URI.prototype);
        var parts = expression.exec(url);

        for (var i = 0; i < parts.length; i++) {
            items[exports.expressionKeys[i]] = parts[i] ? parts[i] : "";
        }

        items.root = (items.root || items.authorityRoot) ? '/' : '';

        items.directories = items.directory.split("/");
        if (items.directories[items.directories.length - 1] == "") {
            items.directories.pop();
        }

        /* normalize */
        var directories = [];
        for (var i = 0; i < items.directories.length; i++) {
            var directory = items.directories[i];
            if (directory == '.') {
            } else if (directory == '..') {
                if (directories.length && directories[directories.length - 1] != '..')
                    directories.pop();
                else
                    directories.push('..');
            } else {
                directories.push(directory);
            }
        }
        items.directories = directories;

        items.domains = items.domain.split(".");

        return items;
    };
};

/**** parse
    a strict URI parser.
*/
exports.parse = exports.Parser(exports.strictExpression);

/**** format
    accepts a parsed URI object and returns
    the corresponding string.
*/
exports.format = function (object) {
    if (typeof(object) == 'undefined')
        throw new Error("UrlError: URL undefined for urls#format");
    if (object instanceof String || typeof(object) == 'string')
        return object;
    var domain =
        object.domains ?
        object.domains.join(".") :
        object.domain;
    var userInfo = (
            object.user ||
            object.password 
        ) ?
        (
            (object.user || "") + 
            (object.password ? ":" + object.password : "") 
        ) :
        object.userInfo;
    var authority = (
            userInfo ||
            domain ||
            object.port
        ) ? (
            (userInfo ? userInfo + "@" : "") +
            (domain || "") + 
            (object.port ? ":" + object.port : "")
        ) :
        object.authority;
    var directory =
        object.directories ?
        object.directories.join("/") :
        object.directory;
    var path =
        directory || object.file ?
        (
            (directory ? directory + "/" : "") +
            (object.file || "")
        ) :
        object.path;
    return (
        (object.scheme ? object.scheme + ":" : "") +
        (authority ? "//" + authority : "") +
        (object.root || (authority && path) ? "/" : "") +
        (path ? path.replace(/^\//, "") : "") +
        (object.query ? "?" + object.query : "") +
        (object.anchor ? "#" + object.anchor : "")
    ) || object.url || "";
};

/**** resolveObject
    returns an object representing a URL resolved from
    a relative location and a source location.
*/
exports.resolveObject = function (source, relative) {
    if (!source) 
        return relative;

    source = exports.parse(source);
    relative = exports.parse(relative);

    if (relative.url == "")
        return source;

    delete source.url;
    delete source.authority;
    delete source.domain;
    delete source.userInfo;
    delete source.path;
    delete source.directory;

    if (
        relative.scheme && relative.scheme != source.scheme ||
        relative.authority && relative.authority != source.authority
    ) {
        source = relative;
    } else {
        if (relative.root) {
            source.directories = relative.directories;
        } else {

            var directories = relative.directories;
            for (var i = 0; i < directories.length; i++) {
                var directory = directories[i];
                if (directory == ".") {
                } else if (directory == "..") {
                    if (source.directories.length) {
                        source.directories.pop();
                    } else {
                        source.directories.push('..');
                    }
                } else {
                    source.directories.push(directory);
                }
            }

            if (relative.file == ".") {
                relative.file = "";
            } else if (relative.file == "..") {
                source.directories.pop();
                relative.file = "";
            }
        }
    }

    if (relative.root)
        source.root = relative.root;
    if (relative.protcol)
        source.scheme = relative.scheme;
    if (!(!relative.path && relative.anchor))
        source.file = relative.file;
    source.query = relative.query;
    source.anchor = relative.anchor;

    return source;
};

/**** relativeObject
    returns an object representing a relative URL to
    a given target URL from a source URL.
*/
exports.relativeObject = function (source, target) {
    target = exports.parse(target);
    source = exports.parse(source);

    delete target.url;

    if (
        target.scheme == source.scheme &&
        target.authority == source.authority
    ) {
        delete target.scheme;
        delete target.authority;
        delete target.userInfo;
        delete target.user;
        delete target.password;
        delete target.domain;
        delete target.domains;
        delete target.port;
        if (
            !!target.root == !!source.root && !(
                target.root &&
                target.directories[0] != source.directories[0]
            )
        ) {
            delete target.path;
            delete target.root;
            delete target.directory;
            while (
                source.directories.length &&
                target.directories.length &&
                target.directories[0] == source.directories[0]
            ) {
                target.directories.shift();
                source.directories.shift();
            }
            while (source.directories.length) {
                source.directories.shift();
                target.directories.unshift('..');
            }

            if (!target.root && !target.directories.length && !target.file && source.file)
                target.directories.push('.');

            if (source.file == target.file)
                delete target.file;
            if (source.query == target.query)
                delete target.query;
            if (source.anchor == target.anchor)
                delete target.anchor;
        }
    }

    return target;
};

/**
 * @returns a URL resovled to a relative URL from a source URL.
 */
exports.resolve = function (source, relative) {
    return exports.format(exports.resolveObject(source, relative));
};

/**
 * @returns a relative URL to a target from a source.
 */
exports.relative = function (source, target) {
    return exports.format(exports.relativeObject(source, target));
};

/**
 * converts a file-system path to a URI.
 * @param path a String or String-like object, possibly a Path object,
 * representing a file system Path
 * @returns a URI as a String
 */
/*
TODO: Refactor
exports.pathToUri = function (path) {
    var FS = require("file");
    return "file:" + FS.split(path).map(encodeURIComponent).join('/');
};
*/

},{}],122:[function(require,module,exports){

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


},{}],123:[function(require,module,exports){

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
        ret = {"type": "dictionary", "dictionary": {}};

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
                ret["dictionary"][name] = val;
            } else {
                ret["dictionary"][item[0]] = self.encodeVariable(meta, item[1], objectDepth + 1, 1, overallDepth + 1);
            }
        } catch(e) {
            console.warn(e);
            ret["dictionary"]["__oops__"] = {"notice": "Error encoding member (" + e + ")"};
        }
    });

    completeWithMeta(meta, ret);

    return ret;
}
},{"fp-modules-for-nodejs/lib/json":124,"fp-modules-for-nodejs/lib/util":125}],124:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"dup":116}],125:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"dup":122}],126:[function(require,module,exports){

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
    }

    var context = new InsightDomplateContext();

    function ensureRepsForNodeLoaded (node) {

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

            if (typeof node.value !== 'undefined') {

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
                    context: context,
                    node: node
                }, el);

                return;
            }

            var rep = context.repForNode(node);

            rep[options.tagName || 'tag'].replace({
                context: context,
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

},{"domplate/dist/domplate.js":1}],127:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],128:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":127,"ieee754":129}],129:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],130:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[99])(99)
});

	});
});