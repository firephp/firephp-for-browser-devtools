
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
