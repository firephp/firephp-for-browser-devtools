/* Riot v3.13.2, @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.riot = {})));
}(this, (function (exports) { 'use strict';

  /**
   * Shorter and fast way to select a single node in the DOM
   * @param   { String } selector - unique dom selector
   * @param   { Object } ctx - DOM node where the target of our search will is located
   * @returns { Object } dom node found
   */
  function $(selector, ctx) {
    return (ctx || document).querySelector(selector)
  }

  var
    // be aware, internal usage
    // ATTENTION: prefix the global dynamic variables with `__`
    // tags instances cache
    __TAGS_CACHE = [],
    // tags implementation cache
    __TAG_IMPL = {},
    YIELD_TAG = 'yield',

    /**
     * Const
     */
    GLOBAL_MIXIN = '__global_mixin',

    // riot specific prefixes or attributes
    ATTRS_PREFIX = 'riot-',

    // Riot Directives
    REF_DIRECTIVES = ['ref', 'data-ref'],
    IS_DIRECTIVE = 'data-is',
    CONDITIONAL_DIRECTIVE = 'if',
    LOOP_DIRECTIVE = 'each',
    LOOP_NO_REORDER_DIRECTIVE = 'no-reorder',
    SHOW_DIRECTIVE = 'show',
    HIDE_DIRECTIVE = 'hide',
    KEY_DIRECTIVE = 'key',
    RIOT_EVENTS_KEY = '__riot-events__',

    // for typeof == '' comparisons
    T_STRING = 'string',
    T_OBJECT = 'object',
    T_UNDEF  = 'undefined',
    T_FUNCTION = 'function',

    XLINK_NS = 'http://www.w3.org/1999/xlink',
    SVG_NS = 'http://www.w3.org/2000/svg',
    XLINK_REGEX = /^xlink:(\w+)/,

    WIN = typeof window === T_UNDEF ? /* istanbul ignore next */ undefined : window,

    // special native tags that cannot be treated like the others
    RE_SPECIAL_TAGS = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/,
    RE_SPECIAL_TAGS_NO_OPTION = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/,
    RE_EVENTS_PREFIX = /^on/,
    RE_HTML_ATTRS = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g,
    // some DOM attributes must be normalized
    CASE_SENSITIVE_ATTRIBUTES = {
      'viewbox': 'viewBox',
      'preserveaspectratio': 'preserveAspectRatio'
    },
    /**
     * Matches boolean HTML attributes in the riot tag definition.
     * With a long list like this, a regex is faster than `[].indexOf` in most browsers.
     * @const {RegExp}
     * @see [attributes.md](https://github.com/riot/compiler/blob/dev/doc/attributes.md)
     */
    RE_BOOL_ATTRS = /^(?:disabled|checked|readonly|required|allowfullscreen|auto(?:focus|play)|compact|controls|default|formnovalidate|hidden|ismap|itemscope|loop|multiple|muted|no(?:resize|shade|validate|wrap)?|open|reversed|seamless|selected|sortable|truespeed|typemustmatch)$/,
    // version# for IE 8-11, 0 for others
    IE_VERSION = (WIN && WIN.document || /* istanbul ignore next */ {}).documentMode | 0;

  /**
   * Create a generic DOM node
   * @param   { String } name - name of the DOM node we want to create
   * @returns { Object } DOM node just created
   */
  function makeElement(name) {
    return name === 'svg' ? document.createElementNS(SVG_NS, name) : document.createElement(name)
  }

  /**
   * Set any DOM attribute
   * @param { Object } dom - DOM node we want to update
   * @param { String } name - name of the property we want to set
   * @param { String } val - value of the property we want to set
   */
  function setAttribute(dom, name, val) {
    var xlink = XLINK_REGEX.exec(name);
    if (xlink && xlink[1])
      { dom.setAttributeNS(XLINK_NS, xlink[1], val); }
    else
      { dom.setAttribute(name, val); }
  }

  var styleNode;
  // Create cache and shortcut to the correct property
  var cssTextProp;
  var byName = {};
  var needsInject = false;

  // skip the following code on the server
  if (WIN) {
    styleNode = ((function () {
      // create a new style element with the correct type
      var newNode = makeElement('style');
      // replace any user node or insert the new one into the head
      var userNode = $('style[type=riot]');

      setAttribute(newNode, 'type', 'text/css');
      /* istanbul ignore next */
      if (userNode) {
        if (userNode.id) { newNode.id = userNode.id; }
        userNode.parentNode.replaceChild(newNode, userNode);
      } else { document.head.appendChild(newNode); }

      return newNode
    }))();
    cssTextProp = styleNode.styleSheet;
  }

  /**
   * Object that will be used to inject and manage the css of every tag instance
   */
  var styleManager = {
    styleNode: styleNode,
    /**
     * Save a tag style to be later injected into DOM
     * @param { String } css - css string
     * @param { String } name - if it's passed we will map the css to a tagname
     */
    add: function add(css, name) {
      byName[name] = css;
      needsInject = true;
    },
    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     */
    inject: function inject() {
      if (!WIN || !needsInject) { return }
      needsInject = false;
      var style = Object.keys(byName)
        .map(function (k) { return byName[k]; })
        .join('\n');
      /* istanbul ignore next */
      if (cssTextProp) { cssTextProp.cssText = style; }
      else { styleNode.innerHTML = style; }
    },

    /**
     * Remove a tag style of injected DOM later.
     * @param {String} name a registered tagname
     */
    remove: function remove(name) {
      delete byName[name];
      needsInject = true;
    }
  };

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var csp_tmpl = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
  	factory(exports);
  }(commonjsGlobal, (function (exports) {
  function InfiniteChecker (maxIterations) {
    if (this instanceof InfiniteChecker) {
      this.maxIterations = maxIterations;
      this.count = 0;
    } else {
      return new InfiniteChecker(maxIterations)
    }
  }

  InfiniteChecker.prototype.check = function () {
    this.count += 1;
    if (this.count > this.maxIterations) {
      throw new Error('Infinite loop detected - reached max iterations')
    }
  };

  function getGlobal (str) {
    var ctx = (typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : this);
    return typeof str !== 'undefined' ? ctx[str] : ctx
  }

  var names = ['Object', 'String', 'Boolean', 'Number', 'RegExp', 'Date', 'Array'];
  var immutable = { string: 'String', boolean: 'Boolean', number: 'Number' };

  var primitives = names.map(getGlobal);
  var protos = primitives.map(getProto);

  function Primitives (context) {
    var this$1 = this;

    if (this instanceof Primitives) {
      this.context = context;
      for (var i = 0; i < names.length; i++) {
        if (!this$1.context[names[i]]) {
          this$1.context[names[i]] = wrap(primitives[i]);
        }
      }
    } else {
      return new Primitives(context)
    }
  }

  Primitives.prototype.replace = function (value) {
    var primIndex = primitives.indexOf(value),
      protoIndex = protos.indexOf(value),
      name;

    if (~primIndex) {
      name = names[primIndex];
      return this.context[name]
    } else if (~protoIndex) {
      name = names[protoIndex];
      return this.context[name].prototype
    }

    return value
  };

  Primitives.prototype.getPropertyObject = function (object, property) {
    if (immutable[typeof object]) {
      return this.getPrototypeOf(object)
    }
    return object
  };

  Primitives.prototype.isPrimitive = function (value) {
    return !!~primitives.indexOf(value) || !!~protos.indexOf(value)
  };

  Primitives.prototype.getPrototypeOf = function (value) {
    if (value == null) { // handle null and undefined
      return value
    }

    var immutableType = immutable[typeof value],
      proto;

    if (immutableType) {
      proto = this.context[immutableType].prototype;
    } else {
      proto = Object.getPrototypeOf(value);
    }

    if (!proto || proto === Object.prototype) {
      return null
    }

    var replacement = this.replace(proto);

    if (replacement === value) {
      replacement = this.replace(Object.prototype);
    }
    return replacement

  };

  Primitives.prototype.applyNew = function (func, args) {
    if (func.wrapped) {
      var prim = Object.getPrototypeOf(func);
      var instance = new (Function.prototype.bind.apply(prim, arguments));

      setProto(instance, func.prototype);
      return instance
    }

    return new (Function.prototype.bind.apply(func, arguments))

  };

  function getProto (func) {
    return func.prototype
  }

  function setProto (obj, proto) {
    obj.__proto__ = proto; // eslint-disable-line
  }

  function wrap (prim) {
    var proto = Object.create(prim.prototype);

    var result = function () {
      if (this instanceof result) {
        prim.apply(this, arguments);
      } else {
        var instance = prim.apply(null, arguments);

        setProto(instance, proto);
        return instance
      }
    };

    setProto(result, prim);
    result.prototype = proto;
    result.wrapped = true;
    return result
  }

  var commonjsGlobal$$1 = typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self : {};





  function createCommonjsModule$$1(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var esprima = createCommonjsModule$$1(function (module, exports) {
  (function webpackUniversalModuleDefinition(root, factory) {
  /* istanbul ignore next */
  	module.exports = factory();
  })(commonjsGlobal$$1, function() {
  return /******/ (function(modules) { // webpackBootstrap
  /******/ 	// The module cache
  /******/ 	var installedModules = {};

  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {

  /******/ 		// Check if module is in cache
  /* istanbul ignore if */
  /******/ 		if(installedModules[moduleId])
  /******/ 			{ return installedModules[moduleId].exports; }

  /******/ 		// Create a new module (and put it into the cache)
  /******/ 		var module = installedModules[moduleId] = {
  /******/ 			exports: {},
  /******/ 			id: moduleId,
  /******/ 			loaded: false
  /******/ 		};

  /******/ 		// Execute the module function
  /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

  /******/ 		// Flag the module as loaded
  /******/ 		module.loaded = true;

  /******/ 		// Return the exports of the module
  /******/ 		return module.exports;
  /******/ 	}


  /******/ 	// expose the modules object (__webpack_modules__)
  /******/ 	__webpack_require__.m = modules;

  /******/ 	// expose the module cache
  /******/ 	__webpack_require__.c = installedModules;

  /******/ 	// __webpack_public_path__
  /******/ 	__webpack_require__.p = "";

  /******/ 	// Load entry module and return exports
  /******/ 	return __webpack_require__(0);
  /******/ })
  /************************************************************************/
  /******/ ([
  /* 0 */
  /***/ function(module, exports, __webpack_require__) {
  	var comment_handler_1 = __webpack_require__(1);
  	var parser_1 = __webpack_require__(3);
  	var jsx_parser_1 = __webpack_require__(11);
  	var tokenizer_1 = __webpack_require__(15);
  	function parse(code, options, delegate) {
  	    var commentHandler = null;
  	    var proxyDelegate = function (node, metadata) {
  	        if (delegate) {
  	            delegate(node, metadata);
  	        }
  	        if (commentHandler) {
  	            commentHandler.visit(node, metadata);
  	        }
  	    };
  	    var parserDelegate = (typeof delegate === 'function') ? proxyDelegate : null;
  	    var collectComment = false;
  	    if (options) {
  	        collectComment = (typeof options.comment === 'boolean' && options.comment);
  	        var attachComment = (typeof options.attachComment === 'boolean' && options.attachComment);
  	        if (collectComment || attachComment) {
  	            commentHandler = new comment_handler_1.CommentHandler();
  	            commentHandler.attach = attachComment;
  	            options.comment = true;
  	            parserDelegate = proxyDelegate;
  	        }
  	    }
  	    var parser;
  	    if (options && typeof options.jsx === 'boolean' && options.jsx) {
  	        parser = new jsx_parser_1.JSXParser(code, options, parserDelegate);
  	    }
  	    else {
  	        parser = new parser_1.Parser(code, options, parserDelegate);
  	    }
  	    var ast = (parser.parseProgram());
  	    if (collectComment) {
  	        ast.comments = commentHandler.comments;
  	    }
  	    if (parser.config.tokens) {
  	        ast.tokens = parser.tokens;
  	    }
  	    if (parser.config.tolerant) {
  	        ast.errors = parser.errorHandler.errors;
  	    }
  	    return ast;
  	}
  	exports.parse = parse;
  	function tokenize(code, options, delegate) {
  	    var tokenizer = new tokenizer_1.Tokenizer(code, options);
  	    var tokens;
  	    tokens = [];
  	    try {
  	        while (true) {
  	            var token = tokenizer.getNextToken();
  	            if (!token) {
  	                break;
  	            }
  	            if (delegate) {
  	                token = delegate(token);
  	            }
  	            tokens.push(token);
  	        }
  	    }
  	    catch (e) {
  	        tokenizer.errorHandler.tolerate(e);
  	    }
  	    if (tokenizer.errorHandler.tolerant) {
  	        tokens.errors = tokenizer.errors();
  	    }
  	    return tokens;
  	}
  	exports.tokenize = tokenize;
  	var syntax_1 = __webpack_require__(2);
  	exports.Syntax = syntax_1.Syntax;
  	// Sync with *.json manifests.
  	exports.version = '3.1.3';


  /***/ },
  /* 1 */
  /***/ function(module, exports, __webpack_require__) {
  	var syntax_1 = __webpack_require__(2);
  	var CommentHandler = (function () {
  	    function CommentHandler() {
  	        this.attach = false;
  	        this.comments = [];
  	        this.stack = [];
  	        this.leading = [];
  	        this.trailing = [];
  	    }
  	    CommentHandler.prototype.insertInnerComments = function (node, metadata) {
  	        var this$1 = this;

  	        //  innnerComments for properties empty block
  	        //  `function a() {/** comments **\/}`
  	        if (node.type === syntax_1.Syntax.BlockStatement && node.body.length === 0) {
  	            var innerComments = [];
  	            for (var i = this.leading.length - 1; i >= 0; --i) {
  	                var entry = this$1.leading[i];
  	                if (metadata.end.offset >= entry.start) {
  	                    innerComments.unshift(entry.comment);
  	                    this$1.leading.splice(i, 1);
  	                    this$1.trailing.splice(i, 1);
  	                }
  	            }
  	            if (innerComments.length) {
  	                node.innerComments = innerComments;
  	            }
  	        }
  	    };
  	    CommentHandler.prototype.findTrailingComments = function (node, metadata) {
  	        var this$1 = this;

  	        var trailingComments = [];
  	        if (this.trailing.length > 0) {
  	            for (var i = this.trailing.length - 1; i >= 0; --i) {
  	                var entry_1 = this$1.trailing[i];
  	                if (entry_1.start >= metadata.end.offset) {
  	                    trailingComments.unshift(entry_1.comment);
  	                }
  	            }
  	            this.trailing.length = 0;
  	            return trailingComments;
  	        }
  	        var entry = this.stack[this.stack.length - 1];
  	        if (entry && entry.node.trailingComments) {
  	            var firstComment = entry.node.trailingComments[0];
  	            if (firstComment && firstComment.range[0] >= metadata.end.offset) {
  	                trailingComments = entry.node.trailingComments;
  	                delete entry.node.trailingComments;
  	            }
  	        }
  	        return trailingComments;
  	    };
  	    CommentHandler.prototype.findLeadingComments = function (node, metadata) {
  	        var this$1 = this;

  	        var leadingComments = [];
  	        var target;
  	        while (this.stack.length > 0) {
  	            var entry = this$1.stack[this$1.stack.length - 1];
  	            if (entry && entry.start >= metadata.start.offset) {
  	                target = this$1.stack.pop().node;
  	            }
  	            else {
  	                break;
  	            }
  	        }
  	        if (target) {
  	            var count = target.leadingComments ? target.leadingComments.length : 0;
  	            for (var i = count - 1; i >= 0; --i) {
  	                var comment = target.leadingComments[i];
  	                if (comment.range[1] <= metadata.start.offset) {
  	                    leadingComments.unshift(comment);
  	                    target.leadingComments.splice(i, 1);
  	                }
  	            }
  	            if (target.leadingComments && target.leadingComments.length === 0) {
  	                delete target.leadingComments;
  	            }
  	            return leadingComments;
  	        }
  	        for (var i = this.leading.length - 1; i >= 0; --i) {
  	            var entry = this$1.leading[i];
  	            if (entry.start <= metadata.start.offset) {
  	                leadingComments.unshift(entry.comment);
  	                this$1.leading.splice(i, 1);
  	            }
  	        }
  	        return leadingComments;
  	    };
  	    CommentHandler.prototype.visitNode = function (node, metadata) {
  	        if (node.type === syntax_1.Syntax.Program && node.body.length > 0) {
  	            return;
  	        }
  	        this.insertInnerComments(node, metadata);
  	        var trailingComments = this.findTrailingComments(node, metadata);
  	        var leadingComments = this.findLeadingComments(node, metadata);
  	        if (leadingComments.length > 0) {
  	            node.leadingComments = leadingComments;
  	        }
  	        if (trailingComments.length > 0) {
  	            node.trailingComments = trailingComments;
  	        }
  	        this.stack.push({
  	            node: node,
  	            start: metadata.start.offset
  	        });
  	    };
  	    CommentHandler.prototype.visitComment = function (node, metadata) {
  	        var type = (node.type[0] === 'L') ? 'Line' : 'Block';
  	        var comment = {
  	            type: type,
  	            value: node.value
  	        };
  	        if (node.range) {
  	            comment.range = node.range;
  	        }
  	        if (node.loc) {
  	            comment.loc = node.loc;
  	        }
  	        this.comments.push(comment);
  	        if (this.attach) {
  	            var entry = {
  	                comment: {
  	                    type: type,
  	                    value: node.value,
  	                    range: [metadata.start.offset, metadata.end.offset]
  	                },
  	                start: metadata.start.offset
  	            };
  	            if (node.loc) {
  	                entry.comment.loc = node.loc;
  	            }
  	            node.type = type;
  	            this.leading.push(entry);
  	            this.trailing.push(entry);
  	        }
  	    };
  	    CommentHandler.prototype.visit = function (node, metadata) {
  	        if (node.type === 'LineComment') {
  	            this.visitComment(node, metadata);
  	        }
  	        else if (node.type === 'BlockComment') {
  	            this.visitComment(node, metadata);
  	        }
  	        else if (this.attach) {
  	            this.visitNode(node, metadata);
  	        }
  	    };
  	    return CommentHandler;
  	}());
  	exports.CommentHandler = CommentHandler;


  /***/ },
  /* 2 */
  /***/ function(module, exports) {
  	exports.Syntax = {
  	    AssignmentExpression: 'AssignmentExpression',
  	    AssignmentPattern: 'AssignmentPattern',
  	    ArrayExpression: 'ArrayExpression',
  	    ArrayPattern: 'ArrayPattern',
  	    ArrowFunctionExpression: 'ArrowFunctionExpression',
  	    BlockStatement: 'BlockStatement',
  	    BinaryExpression: 'BinaryExpression',
  	    BreakStatement: 'BreakStatement',
  	    CallExpression: 'CallExpression',
  	    CatchClause: 'CatchClause',
  	    ClassBody: 'ClassBody',
  	    ClassDeclaration: 'ClassDeclaration',
  	    ClassExpression: 'ClassExpression',
  	    ConditionalExpression: 'ConditionalExpression',
  	    ContinueStatement: 'ContinueStatement',
  	    DoWhileStatement: 'DoWhileStatement',
  	    DebuggerStatement: 'DebuggerStatement',
  	    EmptyStatement: 'EmptyStatement',
  	    ExportAllDeclaration: 'ExportAllDeclaration',
  	    ExportDefaultDeclaration: 'ExportDefaultDeclaration',
  	    ExportNamedDeclaration: 'ExportNamedDeclaration',
  	    ExportSpecifier: 'ExportSpecifier',
  	    ExpressionStatement: 'ExpressionStatement',
  	    ForStatement: 'ForStatement',
  	    ForOfStatement: 'ForOfStatement',
  	    ForInStatement: 'ForInStatement',
  	    FunctionDeclaration: 'FunctionDeclaration',
  	    FunctionExpression: 'FunctionExpression',
  	    Identifier: 'Identifier',
  	    IfStatement: 'IfStatement',
  	    ImportDeclaration: 'ImportDeclaration',
  	    ImportDefaultSpecifier: 'ImportDefaultSpecifier',
  	    ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
  	    ImportSpecifier: 'ImportSpecifier',
  	    Literal: 'Literal',
  	    LabeledStatement: 'LabeledStatement',
  	    LogicalExpression: 'LogicalExpression',
  	    MemberExpression: 'MemberExpression',
  	    MetaProperty: 'MetaProperty',
  	    MethodDefinition: 'MethodDefinition',
  	    NewExpression: 'NewExpression',
  	    ObjectExpression: 'ObjectExpression',
  	    ObjectPattern: 'ObjectPattern',
  	    Program: 'Program',
  	    Property: 'Property',
  	    RestElement: 'RestElement',
  	    ReturnStatement: 'ReturnStatement',
  	    SequenceExpression: 'SequenceExpression',
  	    SpreadElement: 'SpreadElement',
  	    Super: 'Super',
  	    SwitchCase: 'SwitchCase',
  	    SwitchStatement: 'SwitchStatement',
  	    TaggedTemplateExpression: 'TaggedTemplateExpression',
  	    TemplateElement: 'TemplateElement',
  	    TemplateLiteral: 'TemplateLiteral',
  	    ThisExpression: 'ThisExpression',
  	    ThrowStatement: 'ThrowStatement',
  	    TryStatement: 'TryStatement',
  	    UnaryExpression: 'UnaryExpression',
  	    UpdateExpression: 'UpdateExpression',
  	    VariableDeclaration: 'VariableDeclaration',
  	    VariableDeclarator: 'VariableDeclarator',
  	    WhileStatement: 'WhileStatement',
  	    WithStatement: 'WithStatement',
  	    YieldExpression: 'YieldExpression'
  	};


  /***/ },
  /* 3 */
  /***/ function(module, exports, __webpack_require__) {
  	var assert_1 = __webpack_require__(4);
  	var messages_1 = __webpack_require__(5);
  	var error_handler_1 = __webpack_require__(6);
  	var token_1 = __webpack_require__(7);
  	var scanner_1 = __webpack_require__(8);
  	var syntax_1 = __webpack_require__(2);
  	var Node = __webpack_require__(10);
  	var ArrowParameterPlaceHolder = 'ArrowParameterPlaceHolder';
  	var Parser = (function () {
  	    function Parser(code, options, delegate) {
  	        if (options === void 0) { options = {}; }
  	        this.config = {
  	            range: (typeof options.range === 'boolean') && options.range,
  	            loc: (typeof options.loc === 'boolean') && options.loc,
  	            source: null,
  	            tokens: (typeof options.tokens === 'boolean') && options.tokens,
  	            comment: (typeof options.comment === 'boolean') && options.comment,
  	            tolerant: (typeof options.tolerant === 'boolean') && options.tolerant
  	        };
  	        if (this.config.loc && options.source && options.source !== null) {
  	            this.config.source = String(options.source);
  	        }
  	        this.delegate = delegate;
  	        this.errorHandler = new error_handler_1.ErrorHandler();
  	        this.errorHandler.tolerant = this.config.tolerant;
  	        this.scanner = new scanner_1.Scanner(code, this.errorHandler);
  	        this.scanner.trackComment = this.config.comment;
  	        this.operatorPrecedence = {
  	            ')': 0,
  	            ';': 0,
  	            ',': 0,
  	            '=': 0,
  	            ']': 0,
  	            '||': 1,
  	            '&&': 2,
  	            '|': 3,
  	            '^': 4,
  	            '&': 5,
  	            '==': 6,
  	            '!=': 6,
  	            '===': 6,
  	            '!==': 6,
  	            '<': 7,
  	            '>': 7,
  	            '<=': 7,
  	            '>=': 7,
  	            '<<': 8,
  	            '>>': 8,
  	            '>>>': 8,
  	            '+': 9,
  	            '-': 9,
  	            '*': 11,
  	            '/': 11,
  	            '%': 11
  	        };
  	        this.sourceType = (options && options.sourceType === 'module') ? 'module' : 'script';
  	        this.lookahead = null;
  	        this.hasLineTerminator = false;
  	        this.context = {
  	            allowIn: true,
  	            allowYield: true,
  	            firstCoverInitializedNameError: null,
  	            isAssignmentTarget: false,
  	            isBindingElement: false,
  	            inFunctionBody: false,
  	            inIteration: false,
  	            inSwitch: false,
  	            labelSet: {},
  	            strict: (this.sourceType === 'module')
  	        };
  	        this.tokens = [];
  	        this.startMarker = {
  	            index: 0,
  	            lineNumber: this.scanner.lineNumber,
  	            lineStart: 0
  	        };
  	        this.lastMarker = {
  	            index: 0,
  	            lineNumber: this.scanner.lineNumber,
  	            lineStart: 0
  	        };
  	        this.nextToken();
  	        this.lastMarker = {
  	            index: this.scanner.index,
  	            lineNumber: this.scanner.lineNumber,
  	            lineStart: this.scanner.lineStart
  	        };
  	    }
  	    Parser.prototype.throwError = function (messageFormat) {
  	        var arguments$1 = arguments;

  	        var values = [];
  	        for (var _i = 1; _i < arguments.length; _i++) {
  	            values[_i - 1] = arguments$1[_i];
  	        }
  	        var args = Array.prototype.slice.call(arguments, 1);
  	        var msg = messageFormat.replace(/%(\d)/g, function (whole, idx) {
  	            assert_1.assert(idx < args.length, 'Message reference must be in range');
  	            return args[idx];
  	        });
  	        var index = this.lastMarker.index;
  	        var line = this.lastMarker.lineNumber;
  	        var column = this.lastMarker.index - this.lastMarker.lineStart + 1;
  	        throw this.errorHandler.createError(index, line, column, msg);
  	    };
  	    Parser.prototype.tolerateError = function (messageFormat) {
  	        var arguments$1 = arguments;

  	        var values = [];
  	        for (var _i = 1; _i < arguments.length; _i++) {
  	            values[_i - 1] = arguments$1[_i];
  	        }
  	        var args = Array.prototype.slice.call(arguments, 1);
  	        var msg = messageFormat.replace(/%(\d)/g, function (whole, idx) {
  	            assert_1.assert(idx < args.length, 'Message reference must be in range');
  	            return args[idx];
  	        });
  	        var index = this.lastMarker.index;
  	        var line = this.scanner.lineNumber;
  	        var column = this.lastMarker.index - this.lastMarker.lineStart + 1;
  	        this.errorHandler.tolerateError(index, line, column, msg);
  	    };
  	    // Throw an exception because of the token.
  	    Parser.prototype.unexpectedTokenError = function (token, message) {
  	        var msg = message || messages_1.Messages.UnexpectedToken;
  	        var value;
  	        if (token) {
  	            if (!message) {
  	                msg = (token.type === token_1.Token.EOF) ? messages_1.Messages.UnexpectedEOS :
  	                    (token.type === token_1.Token.Identifier) ? messages_1.Messages.UnexpectedIdentifier :
  	                        (token.type === token_1.Token.NumericLiteral) ? messages_1.Messages.UnexpectedNumber :
  	                            (token.type === token_1.Token.StringLiteral) ? messages_1.Messages.UnexpectedString :
  	                                (token.type === token_1.Token.Template) ? messages_1.Messages.UnexpectedTemplate :
  	                                    messages_1.Messages.UnexpectedToken;
  	                if (token.type === token_1.Token.Keyword) {
  	                    if (this.scanner.isFutureReservedWord(token.value)) {
  	                        msg = messages_1.Messages.UnexpectedReserved;
  	                    }
  	                    else if (this.context.strict && this.scanner.isStrictModeReservedWord(token.value)) {
  	                        msg = messages_1.Messages.StrictReservedWord;
  	                    }
  	                }
  	            }
  	            value = (token.type === token_1.Token.Template) ? token.value.raw : token.value;
  	        }
  	        else {
  	            value = 'ILLEGAL';
  	        }
  	        msg = msg.replace('%0', value);
  	        if (token && typeof token.lineNumber === 'number') {
  	            var index = token.start;
  	            var line = token.lineNumber;
  	            var column = token.start - this.lastMarker.lineStart + 1;
  	            return this.errorHandler.createError(index, line, column, msg);
  	        }
  	        else {
  	            var index = this.lastMarker.index;
  	            var line = this.lastMarker.lineNumber;
  	            var column = index - this.lastMarker.lineStart + 1;
  	            return this.errorHandler.createError(index, line, column, msg);
  	        }
  	    };
  	    Parser.prototype.throwUnexpectedToken = function (token, message) {
  	        throw this.unexpectedTokenError(token, message);
  	    };
  	    Parser.prototype.tolerateUnexpectedToken = function (token, message) {
  	        this.errorHandler.tolerate(this.unexpectedTokenError(token, message));
  	    };
  	    Parser.prototype.collectComments = function () {
  	        var this$1 = this;

  	        if (!this.config.comment) {
  	            this.scanner.scanComments();
  	        }
  	        else {
  	            var comments = this.scanner.scanComments();
  	            if (comments.length > 0 && this.delegate) {
  	                for (var i = 0; i < comments.length; ++i) {
  	                    var e = comments[i];
  	                    var node = void 0;
  	                    node = {
  	                        type: e.multiLine ? 'BlockComment' : 'LineComment',
  	                        value: this$1.scanner.source.slice(e.slice[0], e.slice[1])
  	                    };
  	                    if (this$1.config.range) {
  	                        node.range = e.range;
  	                    }
  	                    if (this$1.config.loc) {
  	                        node.loc = e.loc;
  	                    }
  	                    var metadata = {
  	                        start: {
  	                            line: e.loc.start.line,
  	                            column: e.loc.start.column,
  	                            offset: e.range[0]
  	                        },
  	                        end: {
  	                            line: e.loc.end.line,
  	                            column: e.loc.end.column,
  	                            offset: e.range[1]
  	                        }
  	                    };
  	                    this$1.delegate(node, metadata);
  	                }
  	            }
  	        }
  	    };
  	    // From internal representation to an external structure
  	    Parser.prototype.getTokenRaw = function (token) {
  	        return this.scanner.source.slice(token.start, token.end);
  	    };
  	    Parser.prototype.convertToken = function (token) {
  	        var t;
  	        t = {
  	            type: token_1.TokenName[token.type],
  	            value: this.getTokenRaw(token)
  	        };
  	        if (this.config.range) {
  	            t.range = [token.start, token.end];
  	        }
  	        if (this.config.loc) {
  	            t.loc = {
  	                start: {
  	                    line: this.startMarker.lineNumber,
  	                    column: this.startMarker.index - this.startMarker.lineStart
  	                },
  	                end: {
  	                    line: this.scanner.lineNumber,
  	                    column: this.scanner.index - this.scanner.lineStart
  	                }
  	            };
  	        }
  	        if (token.regex) {
  	            t.regex = token.regex;
  	        }
  	        return t;
  	    };
  	    Parser.prototype.nextToken = function () {
  	        var token = this.lookahead;
  	        this.lastMarker.index = this.scanner.index;
  	        this.lastMarker.lineNumber = this.scanner.lineNumber;
  	        this.lastMarker.lineStart = this.scanner.lineStart;
  	        this.collectComments();
  	        this.startMarker.index = this.scanner.index;
  	        this.startMarker.lineNumber = this.scanner.lineNumber;
  	        this.startMarker.lineStart = this.scanner.lineStart;
  	        var next;
  	        next = this.scanner.lex();
  	        this.hasLineTerminator = (token && next) ? (token.lineNumber !== next.lineNumber) : false;
  	        if (next && this.context.strict && next.type === token_1.Token.Identifier) {
  	            if (this.scanner.isStrictModeReservedWord(next.value)) {
  	                next.type = token_1.Token.Keyword;
  	            }
  	        }
  	        this.lookahead = next;
  	        if (this.config.tokens && next.type !== token_1.Token.EOF) {
  	            this.tokens.push(this.convertToken(next));
  	        }
  	        return token;
  	    };
  	    Parser.prototype.nextRegexToken = function () {
  	        this.collectComments();
  	        var token = this.scanner.scanRegExp();
  	        if (this.config.tokens) {
  	            // Pop the previous token, '/' or '/='
  	            // This is added from the lookahead token.
  	            this.tokens.pop();
  	            this.tokens.push(this.convertToken(token));
  	        }
  	        // Prime the next lookahead.
  	        this.lookahead = token;
  	        this.nextToken();
  	        return token;
  	    };
  	    Parser.prototype.createNode = function () {
  	        return {
  	            index: this.startMarker.index,
  	            line: this.startMarker.lineNumber,
  	            column: this.startMarker.index - this.startMarker.lineStart
  	        };
  	    };
  	    Parser.prototype.startNode = function (token) {
  	        return {
  	            index: token.start,
  	            line: token.lineNumber,
  	            column: token.start - token.lineStart
  	        };
  	    };
  	    Parser.prototype.finalize = function (meta, node) {
  	        if (this.config.range) {
  	            node.range = [meta.index, this.lastMarker.index];
  	        }
  	        if (this.config.loc) {
  	            node.loc = {
  	                start: {
  	                    line: meta.line,
  	                    column: meta.column
  	                },
  	                end: {
  	                    line: this.lastMarker.lineNumber,
  	                    column: this.lastMarker.index - this.lastMarker.lineStart
  	                }
  	            };
  	            if (this.config.source) {
  	                node.loc.source = this.config.source;
  	            }
  	        }
  	        if (this.delegate) {
  	            var metadata = {
  	                start: {
  	                    line: meta.line,
  	                    column: meta.column,
  	                    offset: meta.index
  	                },
  	                end: {
  	                    line: this.lastMarker.lineNumber,
  	                    column: this.lastMarker.index - this.lastMarker.lineStart,
  	                    offset: this.lastMarker.index
  	                }
  	            };
  	            this.delegate(node, metadata);
  	        }
  	        return node;
  	    };
  	    // Expect the next token to match the specified punctuator.
  	    // If not, an exception will be thrown.
  	    Parser.prototype.expect = function (value) {
  	        var token = this.nextToken();
  	        if (token.type !== token_1.Token.Punctuator || token.value !== value) {
  	            this.throwUnexpectedToken(token);
  	        }
  	    };
  	    // Quietly expect a comma when in tolerant mode, otherwise delegates to expect().
  	    Parser.prototype.expectCommaSeparator = function () {
  	        if (this.config.tolerant) {
  	            var token = this.lookahead;
  	            if (token.type === token_1.Token.Punctuator && token.value === ',') {
  	                this.nextToken();
  	            }
  	            else if (token.type === token_1.Token.Punctuator && token.value === ';') {
  	                this.nextToken();
  	                this.tolerateUnexpectedToken(token);
  	            }
  	            else {
  	                this.tolerateUnexpectedToken(token, messages_1.Messages.UnexpectedToken);
  	            }
  	        }
  	        else {
  	            this.expect(',');
  	        }
  	    };
  	    // Expect the next token to match the specified keyword.
  	    // If not, an exception will be thrown.
  	    Parser.prototype.expectKeyword = function (keyword) {
  	        var token = this.nextToken();
  	        if (token.type !== token_1.Token.Keyword || token.value !== keyword) {
  	            this.throwUnexpectedToken(token);
  	        }
  	    };
  	    // Return true if the next token matches the specified punctuator.
  	    Parser.prototype.match = function (value) {
  	        return this.lookahead.type === token_1.Token.Punctuator && this.lookahead.value === value;
  	    };
  	    // Return true if the next token matches the specified keyword
  	    Parser.prototype.matchKeyword = function (keyword) {
  	        return this.lookahead.type === token_1.Token.Keyword && this.lookahead.value === keyword;
  	    };
  	    // Return true if the next token matches the specified contextual keyword
  	    // (where an identifier is sometimes a keyword depending on the context)
  	    Parser.prototype.matchContextualKeyword = function (keyword) {
  	        return this.lookahead.type === token_1.Token.Identifier && this.lookahead.value === keyword;
  	    };
  	    // Return true if the next token is an assignment operator
  	    Parser.prototype.matchAssign = function () {
  	        if (this.lookahead.type !== token_1.Token.Punctuator) {
  	            return false;
  	        }
  	        var op = this.lookahead.value;
  	        return op === '=' ||
  	            op === '*=' ||
  	            op === '**=' ||
  	            op === '/=' ||
  	            op === '%=' ||
  	            op === '+=' ||
  	            op === '-=' ||
  	            op === '<<=' ||
  	            op === '>>=' ||
  	            op === '>>>=' ||
  	            op === '&=' ||
  	            op === '^=' ||
  	            op === '|=';
  	    };
  	    // Cover grammar support.
  	    //
  	    // When an assignment expression position starts with an left parenthesis, the determination of the type
  	    // of the syntax is to be deferred arbitrarily long until the end of the parentheses pair (plus a lookahead)
  	    // or the first comma. This situation also defers the determination of all the expressions nested in the pair.
  	    //
  	    // There are three productions that can be parsed in a parentheses pair that needs to be determined
  	    // after the outermost pair is closed. They are:
  	    //
  	    //   1. AssignmentExpression
  	    //   2. BindingElements
  	    //   3. AssignmentTargets
  	    //
  	    // In order to avoid exponential backtracking, we use two flags to denote if the production can be
  	    // binding element or assignment target.
  	    //
  	    // The three productions have the relationship:
  	    //
  	    //   BindingElements ⊆ AssignmentTargets ⊆ AssignmentExpression
  	    //
  	    // with a single exception that CoverInitializedName when used directly in an Expression, generates
  	    // an early error. Therefore, we need the third state, firstCoverInitializedNameError, to track the
  	    // first usage of CoverInitializedName and report it when we reached the end of the parentheses pair.
  	    //
  	    // isolateCoverGrammar function runs the given parser function with a new cover grammar context, and it does not
  	    // effect the current flags. This means the production the parser parses is only used as an expression. Therefore
  	    // the CoverInitializedName check is conducted.
  	    //
  	    // inheritCoverGrammar function runs the given parse function with a new cover grammar context, and it propagates
  	    // the flags outside of the parser. This means the production the parser parses is used as a part of a potential
  	    // pattern. The CoverInitializedName check is deferred.
  	    Parser.prototype.isolateCoverGrammar = function (parseFunction) {
  	        var previousIsBindingElement = this.context.isBindingElement;
  	        var previousIsAssignmentTarget = this.context.isAssignmentTarget;
  	        var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
  	        this.context.isBindingElement = true;
  	        this.context.isAssignmentTarget = true;
  	        this.context.firstCoverInitializedNameError = null;
  	        var result = parseFunction.call(this);
  	        if (this.context.firstCoverInitializedNameError !== null) {
  	            this.throwUnexpectedToken(this.context.firstCoverInitializedNameError);
  	        }
  	        this.context.isBindingElement = previousIsBindingElement;
  	        this.context.isAssignmentTarget = previousIsAssignmentTarget;
  	        this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError;
  	        return result;
  	    };
  	    Parser.prototype.inheritCoverGrammar = function (parseFunction) {
  	        var previousIsBindingElement = this.context.isBindingElement;
  	        var previousIsAssignmentTarget = this.context.isAssignmentTarget;
  	        var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
  	        this.context.isBindingElement = true;
  	        this.context.isAssignmentTarget = true;
  	        this.context.firstCoverInitializedNameError = null;
  	        var result = parseFunction.call(this);
  	        this.context.isBindingElement = this.context.isBindingElement && previousIsBindingElement;
  	        this.context.isAssignmentTarget = this.context.isAssignmentTarget && previousIsAssignmentTarget;
  	        this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError || this.context.firstCoverInitializedNameError;
  	        return result;
  	    };
  	    Parser.prototype.consumeSemicolon = function () {
  	        if (this.match(';')) {
  	            this.nextToken();
  	        }
  	        else if (!this.hasLineTerminator) {
  	            if (this.lookahead.type !== token_1.Token.EOF && !this.match('}')) {
  	                this.throwUnexpectedToken(this.lookahead);
  	            }
  	            this.lastMarker.index = this.startMarker.index;
  	            this.lastMarker.lineNumber = this.startMarker.lineNumber;
  	            this.lastMarker.lineStart = this.startMarker.lineStart;
  	        }
  	    };
  	    // ECMA-262 12.2 Primary Expressions
  	    Parser.prototype.parsePrimaryExpression = function () {
  	        var node = this.createNode();
  	        var expr;
  	        var value, token, raw;
  	        switch (this.lookahead.type) {
  	            case token_1.Token.Identifier:
  	                if (this.sourceType === 'module' && this.lookahead.value === 'await') {
  	                    this.tolerateUnexpectedToken(this.lookahead);
  	                }
  	                expr = this.finalize(node, new Node.Identifier(this.nextToken().value));
  	                break;
  	            case token_1.Token.NumericLiteral:
  	            case token_1.Token.StringLiteral:
  	                if (this.context.strict && this.lookahead.octal) {
  	                    this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.StrictOctalLiteral);
  	                }
  	                this.context.isAssignmentTarget = false;
  	                this.context.isBindingElement = false;
  	                token = this.nextToken();
  	                raw = this.getTokenRaw(token);
  	                expr = this.finalize(node, new Node.Literal(token.value, raw));
  	                break;
  	            case token_1.Token.BooleanLiteral:
  	                this.context.isAssignmentTarget = false;
  	                this.context.isBindingElement = false;
  	                token = this.nextToken();
  	                token.value = (token.value === 'true');
  	                raw = this.getTokenRaw(token);
  	                expr = this.finalize(node, new Node.Literal(token.value, raw));
  	                break;
  	            case token_1.Token.NullLiteral:
  	                this.context.isAssignmentTarget = false;
  	                this.context.isBindingElement = false;
  	                token = this.nextToken();
  	                token.value = null;
  	                raw = this.getTokenRaw(token);
  	                expr = this.finalize(node, new Node.Literal(token.value, raw));
  	                break;
  	            case token_1.Token.Template:
  	                expr = this.parseTemplateLiteral();
  	                break;
  	            case token_1.Token.Punctuator:
  	                value = this.lookahead.value;
  	                switch (value) {
  	                    case '(':
  	                        this.context.isBindingElement = false;
  	                        expr = this.inheritCoverGrammar(this.parseGroupExpression);
  	                        break;
  	                    case '[':
  	                        expr = this.inheritCoverGrammar(this.parseArrayInitializer);
  	                        break;
  	                    case '{':
  	                        expr = this.inheritCoverGrammar(this.parseObjectInitializer);
  	                        break;
  	                    case '/':
  	                    case '/=':
  	                        this.context.isAssignmentTarget = false;
  	                        this.context.isBindingElement = false;
  	                        this.scanner.index = this.startMarker.index;
  	                        token = this.nextRegexToken();
  	                        raw = this.getTokenRaw(token);
  	                        expr = this.finalize(node, new Node.RegexLiteral(token.value, raw, token.regex));
  	                        break;
  	                    default:
  	                        this.throwUnexpectedToken(this.nextToken());
  	                }
  	                break;
  	            case token_1.Token.Keyword:
  	                if (!this.context.strict && this.context.allowYield && this.matchKeyword('yield')) {
  	                    expr = this.parseIdentifierName();
  	                }
  	                else if (!this.context.strict && this.matchKeyword('let')) {
  	                    expr = this.finalize(node, new Node.Identifier(this.nextToken().value));
  	                }
  	                else {
  	                    this.context.isAssignmentTarget = false;
  	                    this.context.isBindingElement = false;
  	                    if (this.matchKeyword('function')) {
  	                        expr = this.parseFunctionExpression();
  	                    }
  	                    else if (this.matchKeyword('this')) {
  	                        this.nextToken();
  	                        expr = this.finalize(node, new Node.ThisExpression());
  	                    }
  	                    else if (this.matchKeyword('class')) {
  	                        expr = this.parseClassExpression();
  	                    }
  	                    else {
  	                        this.throwUnexpectedToken(this.nextToken());
  	                    }
  	                }
  	                break;
  	            default:
  	                this.throwUnexpectedToken(this.nextToken());
  	        }
  	        return expr;
  	    };
  	    // ECMA-262 12.2.5 Array Initializer
  	    Parser.prototype.parseSpreadElement = function () {
  	        var node = this.createNode();
  	        this.expect('...');
  	        var arg = this.inheritCoverGrammar(this.parseAssignmentExpression);
  	        return this.finalize(node, new Node.SpreadElement(arg));
  	    };
  	    Parser.prototype.parseArrayInitializer = function () {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        var elements = [];
  	        this.expect('[');
  	        while (!this.match(']')) {
  	            if (this$1.match(',')) {
  	                this$1.nextToken();
  	                elements.push(null);
  	            }
  	            else if (this$1.match('...')) {
  	                var element = this$1.parseSpreadElement();
  	                if (!this$1.match(']')) {
  	                    this$1.context.isAssignmentTarget = false;
  	                    this$1.context.isBindingElement = false;
  	                    this$1.expect(',');
  	                }
  	                elements.push(element);
  	            }
  	            else {
  	                elements.push(this$1.inheritCoverGrammar(this$1.parseAssignmentExpression));
  	                if (!this$1.match(']')) {
  	                    this$1.expect(',');
  	                }
  	            }
  	        }
  	        this.expect(']');
  	        return this.finalize(node, new Node.ArrayExpression(elements));
  	    };
  	    // ECMA-262 12.2.6 Object Initializer
  	    Parser.prototype.parsePropertyMethod = function (params) {
  	        this.context.isAssignmentTarget = false;
  	        this.context.isBindingElement = false;
  	        var previousStrict = this.context.strict;
  	        var body = this.isolateCoverGrammar(this.parseFunctionSourceElements);
  	        if (this.context.strict && params.firstRestricted) {
  	            this.tolerateUnexpectedToken(params.firstRestricted, params.message);
  	        }
  	        if (this.context.strict && params.stricted) {
  	            this.tolerateUnexpectedToken(params.stricted, params.message);
  	        }
  	        this.context.strict = previousStrict;
  	        return body;
  	    };
  	    Parser.prototype.parsePropertyMethodFunction = function () {
  	        var isGenerator = false;
  	        var node = this.createNode();
  	        var previousAllowYield = this.context.allowYield;
  	        this.context.allowYield = false;
  	        var params = this.parseFormalParameters();
  	        var method = this.parsePropertyMethod(params);
  	        this.context.allowYield = previousAllowYield;
  	        return this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
  	    };
  	    Parser.prototype.parseObjectPropertyKey = function () {
  	        var node = this.createNode();
  	        var token = this.nextToken();
  	        var key = null;
  	        switch (token.type) {
  	            case token_1.Token.StringLiteral:
  	            case token_1.Token.NumericLiteral:
  	                if (this.context.strict && token.octal) {
  	                    this.tolerateUnexpectedToken(token, messages_1.Messages.StrictOctalLiteral);
  	                }
  	                var raw = this.getTokenRaw(token);
  	                key = this.finalize(node, new Node.Literal(token.value, raw));
  	                break;
  	            case token_1.Token.Identifier:
  	            case token_1.Token.BooleanLiteral:
  	            case token_1.Token.NullLiteral:
  	            case token_1.Token.Keyword:
  	                key = this.finalize(node, new Node.Identifier(token.value));
  	                break;
  	            case token_1.Token.Punctuator:
  	                if (token.value === '[') {
  	                    key = this.isolateCoverGrammar(this.parseAssignmentExpression);
  	                    this.expect(']');
  	                }
  	                else {
  	                    this.throwUnexpectedToken(token);
  	                }
  	                break;
  	            default:
  	                this.throwUnexpectedToken(token);
  	        }
  	        return key;
  	    };
  	    Parser.prototype.isPropertyKey = function (key, value) {
  	        return (key.type === syntax_1.Syntax.Identifier && key.name === value) ||
  	            (key.type === syntax_1.Syntax.Literal && key.value === value);
  	    };
  	    Parser.prototype.parseObjectProperty = function (hasProto) {
  	        var node = this.createNode();
  	        var token = this.lookahead;
  	        var kind;
  	        var key;
  	        var value;
  	        var computed = false;
  	        var method = false;
  	        var shorthand = false;
  	        if (token.type === token_1.Token.Identifier) {
  	            this.nextToken();
  	            key = this.finalize(node, new Node.Identifier(token.value));
  	        }
  	        else if (this.match('*')) {
  	            this.nextToken();
  	        }
  	        else {
  	            computed = this.match('[');
  	            key = this.parseObjectPropertyKey();
  	        }
  	        var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
  	        if (token.type === token_1.Token.Identifier && token.value === 'get' && lookaheadPropertyKey) {
  	            kind = 'get';
  	            computed = this.match('[');
  	            key = this.parseObjectPropertyKey();
  	            this.context.allowYield = false;
  	            value = this.parseGetterMethod();
  	        }
  	        else if (token.type === token_1.Token.Identifier && token.value === 'set' && lookaheadPropertyKey) {
  	            kind = 'set';
  	            computed = this.match('[');
  	            key = this.parseObjectPropertyKey();
  	            value = this.parseSetterMethod();
  	        }
  	        else if (token.type === token_1.Token.Punctuator && token.value === '*' && lookaheadPropertyKey) {
  	            kind = 'init';
  	            computed = this.match('[');
  	            key = this.parseObjectPropertyKey();
  	            value = this.parseGeneratorMethod();
  	            method = true;
  	        }
  	        else {
  	            if (!key) {
  	                this.throwUnexpectedToken(this.lookahead);
  	            }
  	            kind = 'init';
  	            if (this.match(':')) {
  	                if (!computed && this.isPropertyKey(key, '__proto__')) {
  	                    if (hasProto.value) {
  	                        this.tolerateError(messages_1.Messages.DuplicateProtoProperty);
  	                    }
  	                    hasProto.value = true;
  	                }
  	                this.nextToken();
  	                value = this.inheritCoverGrammar(this.parseAssignmentExpression);
  	            }
  	            else if (this.match('(')) {
  	                value = this.parsePropertyMethodFunction();
  	                method = true;
  	            }
  	            else if (token.type === token_1.Token.Identifier) {
  	                var id = this.finalize(node, new Node.Identifier(token.value));
  	                if (this.match('=')) {
  	                    this.context.firstCoverInitializedNameError = this.lookahead;
  	                    this.nextToken();
  	                    shorthand = true;
  	                    var init = this.isolateCoverGrammar(this.parseAssignmentExpression);
  	                    value = this.finalize(node, new Node.AssignmentPattern(id, init));
  	                }
  	                else {
  	                    shorthand = true;
  	                    value = id;
  	                }
  	            }
  	            else {
  	                this.throwUnexpectedToken(this.nextToken());
  	            }
  	        }
  	        return this.finalize(node, new Node.Property(kind, key, computed, value, method, shorthand));
  	    };
  	    Parser.prototype.parseObjectInitializer = function () {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        this.expect('{');
  	        var properties = [];
  	        var hasProto = { value: false };
  	        while (!this.match('}')) {
  	            properties.push(this$1.parseObjectProperty(hasProto));
  	            if (!this$1.match('}')) {
  	                this$1.expectCommaSeparator();
  	            }
  	        }
  	        this.expect('}');
  	        return this.finalize(node, new Node.ObjectExpression(properties));
  	    };
  	    // ECMA-262 12.2.9 Template Literals
  	    Parser.prototype.parseTemplateHead = function () {
  	        assert_1.assert(this.lookahead.head, 'Template literal must start with a template head');
  	        var node = this.createNode();
  	        var token = this.nextToken();
  	        var value = {
  	            raw: token.value.raw,
  	            cooked: token.value.cooked
  	        };
  	        return this.finalize(node, new Node.TemplateElement(value, token.tail));
  	    };
  	    Parser.prototype.parseTemplateElement = function () {
  	        if (this.lookahead.type !== token_1.Token.Template) {
  	            this.throwUnexpectedToken();
  	        }
  	        var node = this.createNode();
  	        var token = this.nextToken();
  	        var value = {
  	            raw: token.value.raw,
  	            cooked: token.value.cooked
  	        };
  	        return this.finalize(node, new Node.TemplateElement(value, token.tail));
  	    };
  	    Parser.prototype.parseTemplateLiteral = function () {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        var expressions = [];
  	        var quasis = [];
  	        var quasi = this.parseTemplateHead();
  	        quasis.push(quasi);
  	        while (!quasi.tail) {
  	            expressions.push(this$1.parseExpression());
  	            quasi = this$1.parseTemplateElement();
  	            quasis.push(quasi);
  	        }
  	        return this.finalize(node, new Node.TemplateLiteral(quasis, expressions));
  	    };
  	    // ECMA-262 12.2.10 The Grouping Operator
  	    Parser.prototype.reinterpretExpressionAsPattern = function (expr) {
  	        var this$1 = this;

  	        switch (expr.type) {
  	            case syntax_1.Syntax.Identifier:
  	            case syntax_1.Syntax.MemberExpression:
  	            case syntax_1.Syntax.RestElement:
  	            case syntax_1.Syntax.AssignmentPattern:
  	                break;
  	            case syntax_1.Syntax.SpreadElement:
  	                expr.type = syntax_1.Syntax.RestElement;
  	                this.reinterpretExpressionAsPattern(expr.argument);
  	                break;
  	            case syntax_1.Syntax.ArrayExpression:
  	                expr.type = syntax_1.Syntax.ArrayPattern;
  	                for (var i = 0; i < expr.elements.length; i++) {
  	                    if (expr.elements[i] !== null) {
  	                        this$1.reinterpretExpressionAsPattern(expr.elements[i]);
  	                    }
  	                }
  	                break;
  	            case syntax_1.Syntax.ObjectExpression:
  	                expr.type = syntax_1.Syntax.ObjectPattern;
  	                for (var i = 0; i < expr.properties.length; i++) {
  	                    this$1.reinterpretExpressionAsPattern(expr.properties[i].value);
  	                }
  	                break;
  	            case syntax_1.Syntax.AssignmentExpression:
  	                expr.type = syntax_1.Syntax.AssignmentPattern;
  	                delete expr.operator;
  	                this.reinterpretExpressionAsPattern(expr.left);
  	                break;
  	            default:
  	                // Allow other node type for tolerant parsing.
  	                break;
  	        }
  	    };
  	    Parser.prototype.parseGroupExpression = function () {
  	        var this$1 = this;

  	        var expr;
  	        this.expect('(');
  	        if (this.match(')')) {
  	            this.nextToken();
  	            if (!this.match('=>')) {
  	                this.expect('=>');
  	            }
  	            expr = {
  	                type: ArrowParameterPlaceHolder,
  	                params: []
  	            };
  	        }
  	        else {
  	            var startToken = this.lookahead;
  	            var params = [];
  	            if (this.match('...')) {
  	                expr = this.parseRestElement(params);
  	                this.expect(')');
  	                if (!this.match('=>')) {
  	                    this.expect('=>');
  	                }
  	                expr = {
  	                    type: ArrowParameterPlaceHolder,
  	                    params: [expr]
  	                };
  	            }
  	            else {
  	                var arrow = false;
  	                this.context.isBindingElement = true;
  	                expr = this.inheritCoverGrammar(this.parseAssignmentExpression);
  	                if (this.match(',')) {
  	                    var expressions = [];
  	                    this.context.isAssignmentTarget = false;
  	                    expressions.push(expr);
  	                    while (this.startMarker.index < this.scanner.length) {
  	                        if (!this$1.match(',')) {
  	                            break;
  	                        }
  	                        this$1.nextToken();
  	                        if (this$1.match('...')) {
  	                            if (!this$1.context.isBindingElement) {
  	                                this$1.throwUnexpectedToken(this$1.lookahead);
  	                            }
  	                            expressions.push(this$1.parseRestElement(params));
  	                            this$1.expect(')');
  	                            if (!this$1.match('=>')) {
  	                                this$1.expect('=>');
  	                            }
  	                            this$1.context.isBindingElement = false;
  	                            for (var i = 0; i < expressions.length; i++) {
  	                                this$1.reinterpretExpressionAsPattern(expressions[i]);
  	                            }
  	                            arrow = true;
  	                            expr = {
  	                                type: ArrowParameterPlaceHolder,
  	                                params: expressions
  	                            };
  	                        }
  	                        else {
  	                            expressions.push(this$1.inheritCoverGrammar(this$1.parseAssignmentExpression));
  	                        }
  	                        if (arrow) {
  	                            break;
  	                        }
  	                    }
  	                    if (!arrow) {
  	                        expr = this.finalize(this.startNode(startToken), new Node.SequenceExpression(expressions));
  	                    }
  	                }
  	                if (!arrow) {
  	                    this.expect(')');
  	                    if (this.match('=>')) {
  	                        if (expr.type === syntax_1.Syntax.Identifier && expr.name === 'yield') {
  	                            arrow = true;
  	                            expr = {
  	                                type: ArrowParameterPlaceHolder,
  	                                params: [expr]
  	                            };
  	                        }
  	                        if (!arrow) {
  	                            if (!this.context.isBindingElement) {
  	                                this.throwUnexpectedToken(this.lookahead);
  	                            }
  	                            if (expr.type === syntax_1.Syntax.SequenceExpression) {
  	                                for (var i = 0; i < expr.expressions.length; i++) {
  	                                    this$1.reinterpretExpressionAsPattern(expr.expressions[i]);
  	                                }
  	                            }
  	                            else {
  	                                this.reinterpretExpressionAsPattern(expr);
  	                            }
  	                            var params_1 = (expr.type === syntax_1.Syntax.SequenceExpression ? expr.expressions : [expr]);
  	                            expr = {
  	                                type: ArrowParameterPlaceHolder,
  	                                params: params_1
  	                            };
  	                        }
  	                    }
  	                    this.context.isBindingElement = false;
  	                }
  	            }
  	        }
  	        return expr;
  	    };
  	    // ECMA-262 12.3 Left-Hand-Side Expressions
  	    Parser.prototype.parseArguments = function () {
  	        var this$1 = this;

  	        this.expect('(');
  	        var args = [];
  	        if (!this.match(')')) {
  	            while (true) {
  	                var expr = this$1.match('...') ? this$1.parseSpreadElement() :
  	                    this$1.isolateCoverGrammar(this$1.parseAssignmentExpression);
  	                args.push(expr);
  	                if (this$1.match(')')) {
  	                    break;
  	                }
  	                this$1.expectCommaSeparator();
  	            }
  	        }
  	        this.expect(')');
  	        return args;
  	    };
  	    Parser.prototype.isIdentifierName = function (token) {
  	        return token.type === token_1.Token.Identifier ||
  	            token.type === token_1.Token.Keyword ||
  	            token.type === token_1.Token.BooleanLiteral ||
  	            token.type === token_1.Token.NullLiteral;
  	    };
  	    Parser.prototype.parseIdentifierName = function () {
  	        var node = this.createNode();
  	        var token = this.nextToken();
  	        if (!this.isIdentifierName(token)) {
  	            this.throwUnexpectedToken(token);
  	        }
  	        return this.finalize(node, new Node.Identifier(token.value));
  	    };
  	    Parser.prototype.parseNewExpression = function () {
  	        var node = this.createNode();
  	        var id = this.parseIdentifierName();
  	        assert_1.assert(id.name === 'new', 'New expression must start with `new`');
  	        var expr;
  	        if (this.match('.')) {
  	            this.nextToken();
  	            if (this.lookahead.type === token_1.Token.Identifier && this.context.inFunctionBody && this.lookahead.value === 'target') {
  	                var property = this.parseIdentifierName();
  	                expr = new Node.MetaProperty(id, property);
  	            }
  	            else {
  	                this.throwUnexpectedToken(this.lookahead);
  	            }
  	        }
  	        else {
  	            var callee = this.isolateCoverGrammar(this.parseLeftHandSideExpression);
  	            var args = this.match('(') ? this.parseArguments() : [];
  	            expr = new Node.NewExpression(callee, args);
  	            this.context.isAssignmentTarget = false;
  	            this.context.isBindingElement = false;
  	        }
  	        return this.finalize(node, expr);
  	    };
  	    Parser.prototype.parseLeftHandSideExpressionAllowCall = function () {
  	        var this$1 = this;

  	        var startToken = this.lookahead;
  	        var previousAllowIn = this.context.allowIn;
  	        this.context.allowIn = true;
  	        var expr;
  	        if (this.matchKeyword('super') && this.context.inFunctionBody) {
  	            expr = this.createNode();
  	            this.nextToken();
  	            expr = this.finalize(expr, new Node.Super());
  	            if (!this.match('(') && !this.match('.') && !this.match('[')) {
  	                this.throwUnexpectedToken(this.lookahead);
  	            }
  	        }
  	        else {
  	            expr = this.inheritCoverGrammar(this.matchKeyword('new') ? this.parseNewExpression : this.parsePrimaryExpression);
  	        }
  	        while (true) {
  	            if (this$1.match('.')) {
  	                this$1.context.isBindingElement = false;
  	                this$1.context.isAssignmentTarget = true;
  	                this$1.expect('.');
  	                var property = this$1.parseIdentifierName();
  	                expr = this$1.finalize(this$1.startNode(startToken), new Node.StaticMemberExpression(expr, property));
  	            }
  	            else if (this$1.match('(')) {
  	                this$1.context.isBindingElement = false;
  	                this$1.context.isAssignmentTarget = false;
  	                var args = this$1.parseArguments();
  	                expr = this$1.finalize(this$1.startNode(startToken), new Node.CallExpression(expr, args));
  	            }
  	            else if (this$1.match('[')) {
  	                this$1.context.isBindingElement = false;
  	                this$1.context.isAssignmentTarget = true;
  	                this$1.expect('[');
  	                var property = this$1.isolateCoverGrammar(this$1.parseExpression);
  	                this$1.expect(']');
  	                expr = this$1.finalize(this$1.startNode(startToken), new Node.ComputedMemberExpression(expr, property));
  	            }
  	            else if (this$1.lookahead.type === token_1.Token.Template && this$1.lookahead.head) {
  	                var quasi = this$1.parseTemplateLiteral();
  	                expr = this$1.finalize(this$1.startNode(startToken), new Node.TaggedTemplateExpression(expr, quasi));
  	            }
  	            else {
  	                break;
  	            }
  	        }
  	        this.context.allowIn = previousAllowIn;
  	        return expr;
  	    };
  	    Parser.prototype.parseSuper = function () {
  	        var node = this.createNode();
  	        this.expectKeyword('super');
  	        if (!this.match('[') && !this.match('.')) {
  	            this.throwUnexpectedToken(this.lookahead);
  	        }
  	        return this.finalize(node, new Node.Super());
  	    };
  	    Parser.prototype.parseLeftHandSideExpression = function () {
  	        var this$1 = this;

  	        assert_1.assert(this.context.allowIn, 'callee of new expression always allow in keyword.');
  	        var node = this.startNode(this.lookahead);
  	        var expr = (this.matchKeyword('super') && this.context.inFunctionBody) ? this.parseSuper() :
  	            this.inheritCoverGrammar(this.matchKeyword('new') ? this.parseNewExpression : this.parsePrimaryExpression);
  	        while (true) {
  	            if (this$1.match('[')) {
  	                this$1.context.isBindingElement = false;
  	                this$1.context.isAssignmentTarget = true;
  	                this$1.expect('[');
  	                var property = this$1.isolateCoverGrammar(this$1.parseExpression);
  	                this$1.expect(']');
  	                expr = this$1.finalize(node, new Node.ComputedMemberExpression(expr, property));
  	            }
  	            else if (this$1.match('.')) {
  	                this$1.context.isBindingElement = false;
  	                this$1.context.isAssignmentTarget = true;
  	                this$1.expect('.');
  	                var property = this$1.parseIdentifierName();
  	                expr = this$1.finalize(node, new Node.StaticMemberExpression(expr, property));
  	            }
  	            else if (this$1.lookahead.type === token_1.Token.Template && this$1.lookahead.head) {
  	                var quasi = this$1.parseTemplateLiteral();
  	                expr = this$1.finalize(node, new Node.TaggedTemplateExpression(expr, quasi));
  	            }
  	            else {
  	                break;
  	            }
  	        }
  	        return expr;
  	    };
  	    // ECMA-262 12.4 Update Expressions
  	    Parser.prototype.parseUpdateExpression = function () {
  	        var expr;
  	        var startToken = this.lookahead;
  	        if (this.match('++') || this.match('--')) {
  	            var node = this.startNode(startToken);
  	            var token = this.nextToken();
  	            expr = this.inheritCoverGrammar(this.parseUnaryExpression);
  	            if (this.context.strict && expr.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(expr.name)) {
  	                this.tolerateError(messages_1.Messages.StrictLHSPrefix);
  	            }
  	            if (!this.context.isAssignmentTarget) {
  	                this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
  	            }
  	            var prefix = true;
  	            expr = this.finalize(node, new Node.UpdateExpression(token.value, expr, prefix));
  	            this.context.isAssignmentTarget = false;
  	            this.context.isBindingElement = false;
  	        }
  	        else {
  	            expr = this.inheritCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
  	            if (!this.hasLineTerminator && this.lookahead.type === token_1.Token.Punctuator) {
  	                if (this.match('++') || this.match('--')) {
  	                    if (this.context.strict && expr.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(expr.name)) {
  	                        this.tolerateError(messages_1.Messages.StrictLHSPostfix);
  	                    }
  	                    if (!this.context.isAssignmentTarget) {
  	                        this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
  	                    }
  	                    this.context.isAssignmentTarget = false;
  	                    this.context.isBindingElement = false;
  	                    var operator = this.nextToken().value;
  	                    var prefix = false;
  	                    expr = this.finalize(this.startNode(startToken), new Node.UpdateExpression(operator, expr, prefix));
  	                }
  	            }
  	        }
  	        return expr;
  	    };
  	    // ECMA-262 12.5 Unary Operators
  	    Parser.prototype.parseUnaryExpression = function () {
  	        var expr;
  	        if (this.match('+') || this.match('-') || this.match('~') || this.match('!') ||
  	            this.matchKeyword('delete') || this.matchKeyword('void') || this.matchKeyword('typeof')) {
  	            var node = this.startNode(this.lookahead);
  	            var token = this.nextToken();
  	            expr = this.inheritCoverGrammar(this.parseUnaryExpression);
  	            expr = this.finalize(node, new Node.UnaryExpression(token.value, expr));
  	            if (this.context.strict && expr.operator === 'delete' && expr.argument.type === syntax_1.Syntax.Identifier) {
  	                this.tolerateError(messages_1.Messages.StrictDelete);
  	            }
  	            this.context.isAssignmentTarget = false;
  	            this.context.isBindingElement = false;
  	        }
  	        else {
  	            expr = this.parseUpdateExpression();
  	        }
  	        return expr;
  	    };
  	    Parser.prototype.parseExponentiationExpression = function () {
  	        var startToken = this.lookahead;
  	        var expr = this.inheritCoverGrammar(this.parseUnaryExpression);
  	        if (expr.type !== syntax_1.Syntax.UnaryExpression && this.match('**')) {
  	            this.nextToken();
  	            this.context.isAssignmentTarget = false;
  	            this.context.isBindingElement = false;
  	            var left = expr;
  	            var right = this.isolateCoverGrammar(this.parseExponentiationExpression);
  	            expr = this.finalize(this.startNode(startToken), new Node.BinaryExpression('**', left, right));
  	        }
  	        return expr;
  	    };
  	    // ECMA-262 12.6 Exponentiation Operators
  	    // ECMA-262 12.7 Multiplicative Operators
  	    // ECMA-262 12.8 Additive Operators
  	    // ECMA-262 12.9 Bitwise Shift Operators
  	    // ECMA-262 12.10 Relational Operators
  	    // ECMA-262 12.11 Equality Operators
  	    // ECMA-262 12.12 Binary Bitwise Operators
  	    // ECMA-262 12.13 Binary Logical Operators
  	    Parser.prototype.binaryPrecedence = function (token) {
  	        var op = token.value;
  	        var precedence;
  	        if (token.type === token_1.Token.Punctuator) {
  	            precedence = this.operatorPrecedence[op] || 0;
  	        }
  	        else if (token.type === token_1.Token.Keyword) {
  	            precedence = (op === 'instanceof' || (this.context.allowIn && op === 'in')) ? 7 : 0;
  	        }
  	        else {
  	            precedence = 0;
  	        }
  	        return precedence;
  	    };
  	    Parser.prototype.parseBinaryExpression = function () {
  	        var this$1 = this;

  	        var startToken = this.lookahead;
  	        var expr = this.inheritCoverGrammar(this.parseExponentiationExpression);
  	        var token = this.lookahead;
  	        var prec = this.binaryPrecedence(token);
  	        if (prec > 0) {
  	            this.nextToken();
  	            token.prec = prec;
  	            this.context.isAssignmentTarget = false;
  	            this.context.isBindingElement = false;
  	            var markers = [startToken, this.lookahead];
  	            var left = expr;
  	            var right = this.isolateCoverGrammar(this.parseExponentiationExpression);
  	            var stack = [left, token, right];
  	            while (true) {
  	                prec = this$1.binaryPrecedence(this$1.lookahead);
  	                if (prec <= 0) {
  	                    break;
  	                }
  	                // Reduce: make a binary expression from the three topmost entries.
  	                while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
  	                    right = stack.pop();
  	                    var operator = stack.pop().value;
  	                    left = stack.pop();
  	                    markers.pop();
  	                    var node = this$1.startNode(markers[markers.length - 1]);
  	                    stack.push(this$1.finalize(node, new Node.BinaryExpression(operator, left, right)));
  	                }
  	                // Shift.
  	                token = this$1.nextToken();
  	                token.prec = prec;
  	                stack.push(token);
  	                markers.push(this$1.lookahead);
  	                stack.push(this$1.isolateCoverGrammar(this$1.parseExponentiationExpression));
  	            }
  	            // Final reduce to clean-up the stack.
  	            var i = stack.length - 1;
  	            expr = stack[i];
  	            markers.pop();
  	            while (i > 1) {
  	                var node = this$1.startNode(markers.pop());
  	                expr = this$1.finalize(node, new Node.BinaryExpression(stack[i - 1].value, stack[i - 2], expr));
  	                i -= 2;
  	            }
  	        }
  	        return expr;
  	    };
  	    // ECMA-262 12.14 Conditional Operator
  	    Parser.prototype.parseConditionalExpression = function () {
  	        var startToken = this.lookahead;
  	        var expr = this.inheritCoverGrammar(this.parseBinaryExpression);
  	        if (this.match('?')) {
  	            this.nextToken();
  	            var previousAllowIn = this.context.allowIn;
  	            this.context.allowIn = true;
  	            var consequent = this.isolateCoverGrammar(this.parseAssignmentExpression);
  	            this.context.allowIn = previousAllowIn;
  	            this.expect(':');
  	            var alternate = this.isolateCoverGrammar(this.parseAssignmentExpression);
  	            expr = this.finalize(this.startNode(startToken), new Node.ConditionalExpression(expr, consequent, alternate));
  	            this.context.isAssignmentTarget = false;
  	            this.context.isBindingElement = false;
  	        }
  	        return expr;
  	    };
  	    // ECMA-262 12.15 Assignment Operators
  	    Parser.prototype.checkPatternParam = function (options, param) {
  	        var this$1 = this;

  	        switch (param.type) {
  	            case syntax_1.Syntax.Identifier:
  	                this.validateParam(options, param, param.name);
  	                break;
  	            case syntax_1.Syntax.RestElement:
  	                this.checkPatternParam(options, param.argument);
  	                break;
  	            case syntax_1.Syntax.AssignmentPattern:
  	                this.checkPatternParam(options, param.left);
  	                break;
  	            case syntax_1.Syntax.ArrayPattern:
  	                for (var i = 0; i < param.elements.length; i++) {
  	                    if (param.elements[i] !== null) {
  	                        this$1.checkPatternParam(options, param.elements[i]);
  	                    }
  	                }
  	                break;
  	            case syntax_1.Syntax.YieldExpression:
  	                break;
  	            default:
  	                assert_1.assert(param.type === syntax_1.Syntax.ObjectPattern, 'Invalid type');
  	                for (var i = 0; i < param.properties.length; i++) {
  	                    this$1.checkPatternParam(options, param.properties[i].value);
  	                }
  	                break;
  	        }
  	    };
  	    Parser.prototype.reinterpretAsCoverFormalsList = function (expr) {
  	        var this$1 = this;

  	        var params = [expr];
  	        var options;
  	        switch (expr.type) {
  	            case syntax_1.Syntax.Identifier:
  	                break;
  	            case ArrowParameterPlaceHolder:
  	                params = expr.params;
  	                break;
  	            default:
  	                return null;
  	        }
  	        options = {
  	            paramSet: {}
  	        };
  	        for (var i = 0; i < params.length; ++i) {
  	            var param = params[i];
  	            if (param.type === syntax_1.Syntax.AssignmentPattern) {
  	                if (param.right.type === syntax_1.Syntax.YieldExpression) {
  	                    if (param.right.argument) {
  	                        this$1.throwUnexpectedToken(this$1.lookahead);
  	                    }
  	                    param.right.type = syntax_1.Syntax.Identifier;
  	                    param.right.name = 'yield';
  	                    delete param.right.argument;
  	                    delete param.right.delegate;
  	                }
  	            }
  	            this$1.checkPatternParam(options, param);
  	            params[i] = param;
  	        }
  	        if (this.context.strict || !this.context.allowYield) {
  	            for (var i = 0; i < params.length; ++i) {
  	                var param = params[i];
  	                if (param.type === syntax_1.Syntax.YieldExpression) {
  	                    this$1.throwUnexpectedToken(this$1.lookahead);
  	                }
  	            }
  	        }
  	        if (options.message === messages_1.Messages.StrictParamDupe) {
  	            var token = this.context.strict ? options.stricted : options.firstRestricted;
  	            this.throwUnexpectedToken(token, options.message);
  	        }
  	        return {
  	            params: params,
  	            stricted: options.stricted,
  	            firstRestricted: options.firstRestricted,
  	            message: options.message
  	        };
  	    };
  	    Parser.prototype.parseAssignmentExpression = function () {
  	        var expr;
  	        if (!this.context.allowYield && this.matchKeyword('yield')) {
  	            expr = this.parseYieldExpression();
  	        }
  	        else {
  	            var startToken = this.lookahead;
  	            var token = startToken;
  	            expr = this.parseConditionalExpression();
  	            if (expr.type === ArrowParameterPlaceHolder || this.match('=>')) {
  	                // ECMA-262 14.2 Arrow Function Definitions
  	                this.context.isAssignmentTarget = false;
  	                this.context.isBindingElement = false;
  	                var list = this.reinterpretAsCoverFormalsList(expr);
  	                if (list) {
  	                    if (this.hasLineTerminator) {
  	                        this.tolerateUnexpectedToken(this.lookahead);
  	                    }
  	                    this.context.firstCoverInitializedNameError = null;
  	                    var previousStrict = this.context.strict;
  	                    var previousAllowYield = this.context.allowYield;
  	                    this.context.allowYield = true;
  	                    var node = this.startNode(startToken);
  	                    this.expect('=>');
  	                    var body = this.match('{') ? this.parseFunctionSourceElements() :
  	                        this.isolateCoverGrammar(this.parseAssignmentExpression);
  	                    var expression = body.type !== syntax_1.Syntax.BlockStatement;
  	                    if (this.context.strict && list.firstRestricted) {
  	                        this.throwUnexpectedToken(list.firstRestricted, list.message);
  	                    }
  	                    if (this.context.strict && list.stricted) {
  	                        this.tolerateUnexpectedToken(list.stricted, list.message);
  	                    }
  	                    expr = this.finalize(node, new Node.ArrowFunctionExpression(list.params, body, expression));
  	                    this.context.strict = previousStrict;
  	                    this.context.allowYield = previousAllowYield;
  	                }
  	            }
  	            else {
  	                if (this.matchAssign()) {
  	                    if (!this.context.isAssignmentTarget) {
  	                        this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
  	                    }
  	                    if (this.context.strict && expr.type === syntax_1.Syntax.Identifier) {
  	                        var id = (expr);
  	                        if (this.scanner.isRestrictedWord(id.name)) {
  	                            this.tolerateUnexpectedToken(token, messages_1.Messages.StrictLHSAssignment);
  	                        }
  	                        if (this.scanner.isStrictModeReservedWord(id.name)) {
  	                            this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
  	                        }
  	                    }
  	                    if (!this.match('=')) {
  	                        this.context.isAssignmentTarget = false;
  	                        this.context.isBindingElement = false;
  	                    }
  	                    else {
  	                        this.reinterpretExpressionAsPattern(expr);
  	                    }
  	                    token = this.nextToken();
  	                    var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
  	                    expr = this.finalize(this.startNode(startToken), new Node.AssignmentExpression(token.value, expr, right));
  	                    this.context.firstCoverInitializedNameError = null;
  	                }
  	            }
  	        }
  	        return expr;
  	    };
  	    // ECMA-262 12.16 Comma Operator
  	    Parser.prototype.parseExpression = function () {
  	        var this$1 = this;

  	        var startToken = this.lookahead;
  	        var expr = this.isolateCoverGrammar(this.parseAssignmentExpression);
  	        if (this.match(',')) {
  	            var expressions = [];
  	            expressions.push(expr);
  	            while (this.startMarker.index < this.scanner.length) {
  	                if (!this$1.match(',')) {
  	                    break;
  	                }
  	                this$1.nextToken();
  	                expressions.push(this$1.isolateCoverGrammar(this$1.parseAssignmentExpression));
  	            }
  	            expr = this.finalize(this.startNode(startToken), new Node.SequenceExpression(expressions));
  	        }
  	        return expr;
  	    };
  	    // ECMA-262 13.2 Block
  	    Parser.prototype.parseStatementListItem = function () {
  	        var statement = null;
  	        this.context.isAssignmentTarget = true;
  	        this.context.isBindingElement = true;
  	        if (this.lookahead.type === token_1.Token.Keyword) {
  	            switch (this.lookahead.value) {
  	                case 'export':
  	                    if (this.sourceType !== 'module') {
  	                        this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.IllegalExportDeclaration);
  	                    }
  	                    statement = this.parseExportDeclaration();
  	                    break;
  	                case 'import':
  	                    if (this.sourceType !== 'module') {
  	                        this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.IllegalImportDeclaration);
  	                    }
  	                    statement = this.parseImportDeclaration();
  	                    break;
  	                case 'const':
  	                    statement = this.parseLexicalDeclaration({ inFor: false });
  	                    break;
  	                case 'function':
  	                    statement = this.parseFunctionDeclaration();
  	                    break;
  	                case 'class':
  	                    statement = this.parseClassDeclaration();
  	                    break;
  	                case 'let':
  	                    statement = this.isLexicalDeclaration() ? this.parseLexicalDeclaration({ inFor: false }) : this.parseStatement();
  	                    break;
  	                default:
  	                    statement = this.parseStatement();
  	                    break;
  	            }
  	        }
  	        else {
  	            statement = this.parseStatement();
  	        }
  	        return statement;
  	    };
  	    Parser.prototype.parseBlock = function () {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        this.expect('{');
  	        var block = [];
  	        while (true) {
  	            if (this$1.match('}')) {
  	                break;
  	            }
  	            block.push(this$1.parseStatementListItem());
  	        }
  	        this.expect('}');
  	        return this.finalize(node, new Node.BlockStatement(block));
  	    };
  	    // ECMA-262 13.3.1 Let and Const Declarations
  	    Parser.prototype.parseLexicalBinding = function (kind, options) {
  	        var node = this.createNode();
  	        var params = [];
  	        var id = this.parsePattern(params, kind);
  	        // ECMA-262 12.2.1
  	        if (this.context.strict && id.type === syntax_1.Syntax.Identifier) {
  	            if (this.scanner.isRestrictedWord((id).name)) {
  	                this.tolerateError(messages_1.Messages.StrictVarName);
  	            }
  	        }
  	        var init = null;
  	        if (kind === 'const') {
  	            if (!this.matchKeyword('in') && !this.matchContextualKeyword('of')) {
  	                this.expect('=');
  	                init = this.isolateCoverGrammar(this.parseAssignmentExpression);
  	            }
  	        }
  	        else if ((!options.inFor && id.type !== syntax_1.Syntax.Identifier) || this.match('=')) {
  	            this.expect('=');
  	            init = this.isolateCoverGrammar(this.parseAssignmentExpression);
  	        }
  	        return this.finalize(node, new Node.VariableDeclarator(id, init));
  	    };
  	    Parser.prototype.parseBindingList = function (kind, options) {
  	        var this$1 = this;

  	        var list = [this.parseLexicalBinding(kind, options)];
  	        while (this.match(',')) {
  	            this$1.nextToken();
  	            list.push(this$1.parseLexicalBinding(kind, options));
  	        }
  	        return list;
  	    };
  	    Parser.prototype.isLexicalDeclaration = function () {
  	        var previousIndex = this.scanner.index;
  	        var previousLineNumber = this.scanner.lineNumber;
  	        var previousLineStart = this.scanner.lineStart;
  	        this.collectComments();
  	        var next = this.scanner.lex();
  	        this.scanner.index = previousIndex;
  	        this.scanner.lineNumber = previousLineNumber;
  	        this.scanner.lineStart = previousLineStart;
  	        return (next.type === token_1.Token.Identifier) ||
  	            (next.type === token_1.Token.Punctuator && next.value === '[') ||
  	            (next.type === token_1.Token.Punctuator && next.value === '{') ||
  	            (next.type === token_1.Token.Keyword && next.value === 'let') ||
  	            (next.type === token_1.Token.Keyword && next.value === 'yield');
  	    };
  	    Parser.prototype.parseLexicalDeclaration = function (options) {
  	        var node = this.createNode();
  	        var kind = this.nextToken().value;
  	        assert_1.assert(kind === 'let' || kind === 'const', 'Lexical declaration must be either let or const');
  	        var declarations = this.parseBindingList(kind, options);
  	        this.consumeSemicolon();
  	        return this.finalize(node, new Node.VariableDeclaration(declarations, kind));
  	    };
  	    // ECMA-262 13.3.3 Destructuring Binding Patterns
  	    Parser.prototype.parseBindingRestElement = function (params, kind) {
  	        var node = this.createNode();
  	        this.expect('...');
  	        var arg = this.parsePattern(params, kind);
  	        return this.finalize(node, new Node.RestElement(arg));
  	    };
  	    Parser.prototype.parseArrayPattern = function (params, kind) {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        this.expect('[');
  	        var elements = [];
  	        while (!this.match(']')) {
  	            if (this$1.match(',')) {
  	                this$1.nextToken();
  	                elements.push(null);
  	            }
  	            else {
  	                if (this$1.match('...')) {
  	                    elements.push(this$1.parseBindingRestElement(params, kind));
  	                    break;
  	                }
  	                else {
  	                    elements.push(this$1.parsePatternWithDefault(params, kind));
  	                }
  	                if (!this$1.match(']')) {
  	                    this$1.expect(',');
  	                }
  	            }
  	        }
  	        this.expect(']');
  	        return this.finalize(node, new Node.ArrayPattern(elements));
  	    };
  	    Parser.prototype.parsePropertyPattern = function (params, kind) {
  	        var node = this.createNode();
  	        var computed = false;
  	        var shorthand = false;
  	        var method = false;
  	        var key;
  	        var value;
  	        if (this.lookahead.type === token_1.Token.Identifier) {
  	            var keyToken = this.lookahead;
  	            key = this.parseVariableIdentifier();
  	            var init = this.finalize(node, new Node.Identifier(keyToken.value));
  	            if (this.match('=')) {
  	                params.push(keyToken);
  	                shorthand = true;
  	                this.nextToken();
  	                var expr = this.parseAssignmentExpression();
  	                value = this.finalize(this.startNode(keyToken), new Node.AssignmentPattern(init, expr));
  	            }
  	            else if (!this.match(':')) {
  	                params.push(keyToken);
  	                shorthand = true;
  	                value = init;
  	            }
  	            else {
  	                this.expect(':');
  	                value = this.parsePatternWithDefault(params, kind);
  	            }
  	        }
  	        else {
  	            computed = this.match('[');
  	            key = this.parseObjectPropertyKey();
  	            this.expect(':');
  	            value = this.parsePatternWithDefault(params, kind);
  	        }
  	        return this.finalize(node, new Node.Property('init', key, computed, value, method, shorthand));
  	    };
  	    Parser.prototype.parseObjectPattern = function (params, kind) {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        var properties = [];
  	        this.expect('{');
  	        while (!this.match('}')) {
  	            properties.push(this$1.parsePropertyPattern(params, kind));
  	            if (!this$1.match('}')) {
  	                this$1.expect(',');
  	            }
  	        }
  	        this.expect('}');
  	        return this.finalize(node, new Node.ObjectPattern(properties));
  	    };
  	    Parser.prototype.parsePattern = function (params, kind) {
  	        var pattern;
  	        if (this.match('[')) {
  	            pattern = this.parseArrayPattern(params, kind);
  	        }
  	        else if (this.match('{')) {
  	            pattern = this.parseObjectPattern(params, kind);
  	        }
  	        else {
  	            if (this.matchKeyword('let') && (kind === 'const' || kind === 'let')) {
  	                this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.UnexpectedToken);
  	            }
  	            params.push(this.lookahead);
  	            pattern = this.parseVariableIdentifier(kind);
  	        }
  	        return pattern;
  	    };
  	    Parser.prototype.parsePatternWithDefault = function (params, kind) {
  	        var startToken = this.lookahead;
  	        var pattern = this.parsePattern(params, kind);
  	        if (this.match('=')) {
  	            this.nextToken();
  	            var previousAllowYield = this.context.allowYield;
  	            this.context.allowYield = true;
  	            var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
  	            this.context.allowYield = previousAllowYield;
  	            pattern = this.finalize(this.startNode(startToken), new Node.AssignmentPattern(pattern, right));
  	        }
  	        return pattern;
  	    };
  	    // ECMA-262 13.3.2 Variable Statement
  	    Parser.prototype.parseVariableIdentifier = function (kind) {
  	        var node = this.createNode();
  	        var token = this.nextToken();
  	        if (token.type === token_1.Token.Keyword && token.value === 'yield') {
  	            if (this.context.strict) {
  	                this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
  	            }
  	            if (!this.context.allowYield) {
  	                this.throwUnexpectedToken(token);
  	            }
  	        }
  	        else if (token.type !== token_1.Token.Identifier) {
  	            if (this.context.strict && token.type === token_1.Token.Keyword && this.scanner.isStrictModeReservedWord(token.value)) {
  	                this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
  	            }
  	            else {
  	                if (this.context.strict || token.value !== 'let' || kind !== 'var') {
  	                    this.throwUnexpectedToken(token);
  	                }
  	            }
  	        }
  	        else if (this.sourceType === 'module' && token.type === token_1.Token.Identifier && token.value === 'await') {
  	            this.tolerateUnexpectedToken(token);
  	        }
  	        return this.finalize(node, new Node.Identifier(token.value));
  	    };
  	    Parser.prototype.parseVariableDeclaration = function (options) {
  	        var node = this.createNode();
  	        var params = [];
  	        var id = this.parsePattern(params, 'var');
  	        // ECMA-262 12.2.1
  	        if (this.context.strict && id.type === syntax_1.Syntax.Identifier) {
  	            if (this.scanner.isRestrictedWord((id).name)) {
  	                this.tolerateError(messages_1.Messages.StrictVarName);
  	            }
  	        }
  	        var init = null;
  	        if (this.match('=')) {
  	            this.nextToken();
  	            init = this.isolateCoverGrammar(this.parseAssignmentExpression);
  	        }
  	        else if (id.type !== syntax_1.Syntax.Identifier && !options.inFor) {
  	            this.expect('=');
  	        }
  	        return this.finalize(node, new Node.VariableDeclarator(id, init));
  	    };
  	    Parser.prototype.parseVariableDeclarationList = function (options) {
  	        var this$1 = this;

  	        var opt = { inFor: options.inFor };
  	        var list = [];
  	        list.push(this.parseVariableDeclaration(opt));
  	        while (this.match(',')) {
  	            this$1.nextToken();
  	            list.push(this$1.parseVariableDeclaration(opt));
  	        }
  	        return list;
  	    };
  	    Parser.prototype.parseVariableStatement = function () {
  	        var node = this.createNode();
  	        this.expectKeyword('var');
  	        var declarations = this.parseVariableDeclarationList({ inFor: false });
  	        this.consumeSemicolon();
  	        return this.finalize(node, new Node.VariableDeclaration(declarations, 'var'));
  	    };
  	    // ECMA-262 13.4 Empty Statement
  	    Parser.prototype.parseEmptyStatement = function () {
  	        var node = this.createNode();
  	        this.expect(';');
  	        return this.finalize(node, new Node.EmptyStatement());
  	    };
  	    // ECMA-262 13.5 Expression Statement
  	    Parser.prototype.parseExpressionStatement = function () {
  	        var node = this.createNode();
  	        var expr = this.parseExpression();
  	        this.consumeSemicolon();
  	        return this.finalize(node, new Node.ExpressionStatement(expr));
  	    };
  	    // ECMA-262 13.6 If statement
  	    Parser.prototype.parseIfStatement = function () {
  	        var node = this.createNode();
  	        var consequent;
  	        var alternate = null;
  	        this.expectKeyword('if');
  	        this.expect('(');
  	        var test = this.parseExpression();
  	        if (!this.match(')') && this.config.tolerant) {
  	            this.tolerateUnexpectedToken(this.nextToken());
  	            consequent = this.finalize(this.createNode(), new Node.EmptyStatement());
  	        }
  	        else {
  	            this.expect(')');
  	            consequent = this.parseStatement();
  	            if (this.matchKeyword('else')) {
  	                this.nextToken();
  	                alternate = this.parseStatement();
  	            }
  	        }
  	        return this.finalize(node, new Node.IfStatement(test, consequent, alternate));
  	    };
  	    // ECMA-262 13.7.2 The do-while Statement
  	    Parser.prototype.parseDoWhileStatement = function () {
  	        var node = this.createNode();
  	        this.expectKeyword('do');
  	        var previousInIteration = this.context.inIteration;
  	        this.context.inIteration = true;
  	        var body = this.parseStatement();
  	        this.context.inIteration = previousInIteration;
  	        this.expectKeyword('while');
  	        this.expect('(');
  	        var test = this.parseExpression();
  	        this.expect(')');
  	        if (this.match(';')) {
  	            this.nextToken();
  	        }
  	        return this.finalize(node, new Node.DoWhileStatement(body, test));
  	    };
  	    // ECMA-262 13.7.3 The while Statement
  	    Parser.prototype.parseWhileStatement = function () {
  	        var node = this.createNode();
  	        var body;
  	        this.expectKeyword('while');
  	        this.expect('(');
  	        var test = this.parseExpression();
  	        if (!this.match(')') && this.config.tolerant) {
  	            this.tolerateUnexpectedToken(this.nextToken());
  	            body = this.finalize(this.createNode(), new Node.EmptyStatement());
  	        }
  	        else {
  	            this.expect(')');
  	            var previousInIteration = this.context.inIteration;
  	            this.context.inIteration = true;
  	            body = this.parseStatement();
  	            this.context.inIteration = previousInIteration;
  	        }
  	        return this.finalize(node, new Node.WhileStatement(test, body));
  	    };
  	    // ECMA-262 13.7.4 The for Statement
  	    // ECMA-262 13.7.5 The for-in and for-of Statements
  	    Parser.prototype.parseForStatement = function () {
  	        var this$1 = this;

  	        var init = null;
  	        var test = null;
  	        var update = null;
  	        var forIn = true;
  	        var left, right;
  	        var node = this.createNode();
  	        this.expectKeyword('for');
  	        this.expect('(');
  	        if (this.match(';')) {
  	            this.nextToken();
  	        }
  	        else {
  	            if (this.matchKeyword('var')) {
  	                init = this.createNode();
  	                this.nextToken();
  	                var previousAllowIn = this.context.allowIn;
  	                this.context.allowIn = false;
  	                var declarations = this.parseVariableDeclarationList({ inFor: true });
  	                this.context.allowIn = previousAllowIn;
  	                if (declarations.length === 1 && this.matchKeyword('in')) {
  	                    var decl = declarations[0];
  	                    if (decl.init && (decl.id.type === syntax_1.Syntax.ArrayPattern || decl.id.type === syntax_1.Syntax.ObjectPattern || this.context.strict)) {
  	                        this.tolerateError(messages_1.Messages.ForInOfLoopInitializer, 'for-in');
  	                    }
  	                    init = this.finalize(init, new Node.VariableDeclaration(declarations, 'var'));
  	                    this.nextToken();
  	                    left = init;
  	                    right = this.parseExpression();
  	                    init = null;
  	                }
  	                else if (declarations.length === 1 && declarations[0].init === null && this.matchContextualKeyword('of')) {
  	                    init = this.finalize(init, new Node.VariableDeclaration(declarations, 'var'));
  	                    this.nextToken();
  	                    left = init;
  	                    right = this.parseAssignmentExpression();
  	                    init = null;
  	                    forIn = false;
  	                }
  	                else {
  	                    init = this.finalize(init, new Node.VariableDeclaration(declarations, 'var'));
  	                    this.expect(';');
  	                }
  	            }
  	            else if (this.matchKeyword('const') || this.matchKeyword('let')) {
  	                init = this.createNode();
  	                var kind = this.nextToken().value;
  	                if (!this.context.strict && this.lookahead.value === 'in') {
  	                    init = this.finalize(init, new Node.Identifier(kind));
  	                    this.nextToken();
  	                    left = init;
  	                    right = this.parseExpression();
  	                    init = null;
  	                }
  	                else {
  	                    var previousAllowIn = this.context.allowIn;
  	                    this.context.allowIn = false;
  	                    var declarations = this.parseBindingList(kind, { inFor: true });
  	                    this.context.allowIn = previousAllowIn;
  	                    if (declarations.length === 1 && declarations[0].init === null && this.matchKeyword('in')) {
  	                        init = this.finalize(init, new Node.VariableDeclaration(declarations, kind));
  	                        this.nextToken();
  	                        left = init;
  	                        right = this.parseExpression();
  	                        init = null;
  	                    }
  	                    else if (declarations.length === 1 && declarations[0].init === null && this.matchContextualKeyword('of')) {
  	                        init = this.finalize(init, new Node.VariableDeclaration(declarations, kind));
  	                        this.nextToken();
  	                        left = init;
  	                        right = this.parseAssignmentExpression();
  	                        init = null;
  	                        forIn = false;
  	                    }
  	                    else {
  	                        this.consumeSemicolon();
  	                        init = this.finalize(init, new Node.VariableDeclaration(declarations, kind));
  	                    }
  	                }
  	            }
  	            else {
  	                var initStartToken = this.lookahead;
  	                var previousAllowIn = this.context.allowIn;
  	                this.context.allowIn = false;
  	                init = this.inheritCoverGrammar(this.parseAssignmentExpression);
  	                this.context.allowIn = previousAllowIn;
  	                if (this.matchKeyword('in')) {
  	                    if (!this.context.isAssignmentTarget || init.type === syntax_1.Syntax.AssignmentExpression) {
  	                        this.tolerateError(messages_1.Messages.InvalidLHSInForIn);
  	                    }
  	                    this.nextToken();
  	                    this.reinterpretExpressionAsPattern(init);
  	                    left = init;
  	                    right = this.parseExpression();
  	                    init = null;
  	                }
  	                else if (this.matchContextualKeyword('of')) {
  	                    if (!this.context.isAssignmentTarget || init.type === syntax_1.Syntax.AssignmentExpression) {
  	                        this.tolerateError(messages_1.Messages.InvalidLHSInForLoop);
  	                    }
  	                    this.nextToken();
  	                    this.reinterpretExpressionAsPattern(init);
  	                    left = init;
  	                    right = this.parseAssignmentExpression();
  	                    init = null;
  	                    forIn = false;
  	                }
  	                else {
  	                    if (this.match(',')) {
  	                        var initSeq = [init];
  	                        while (this.match(',')) {
  	                            this$1.nextToken();
  	                            initSeq.push(this$1.isolateCoverGrammar(this$1.parseAssignmentExpression));
  	                        }
  	                        init = this.finalize(this.startNode(initStartToken), new Node.SequenceExpression(initSeq));
  	                    }
  	                    this.expect(';');
  	                }
  	            }
  	        }
  	        if (typeof left === 'undefined') {
  	            if (!this.match(';')) {
  	                test = this.parseExpression();
  	            }
  	            this.expect(';');
  	            if (!this.match(')')) {
  	                update = this.parseExpression();
  	            }
  	        }
  	        var body;
  	        if (!this.match(')') && this.config.tolerant) {
  	            this.tolerateUnexpectedToken(this.nextToken());
  	            body = this.finalize(this.createNode(), new Node.EmptyStatement());
  	        }
  	        else {
  	            this.expect(')');
  	            var previousInIteration = this.context.inIteration;
  	            this.context.inIteration = true;
  	            body = this.isolateCoverGrammar(this.parseStatement);
  	            this.context.inIteration = previousInIteration;
  	        }
  	        return (typeof left === 'undefined') ?
  	            this.finalize(node, new Node.ForStatement(init, test, update, body)) :
  	            forIn ? this.finalize(node, new Node.ForInStatement(left, right, body)) :
  	                this.finalize(node, new Node.ForOfStatement(left, right, body));
  	    };
  	    // ECMA-262 13.8 The continue statement
  	    Parser.prototype.parseContinueStatement = function () {
  	        var node = this.createNode();
  	        this.expectKeyword('continue');
  	        var label = null;
  	        if (this.lookahead.type === token_1.Token.Identifier && !this.hasLineTerminator) {
  	            label = this.parseVariableIdentifier();
  	            var key = '$' + label.name;
  	            if (!Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
  	                this.throwError(messages_1.Messages.UnknownLabel, label.name);
  	            }
  	        }
  	        this.consumeSemicolon();
  	        if (label === null && !this.context.inIteration) {
  	            this.throwError(messages_1.Messages.IllegalContinue);
  	        }
  	        return this.finalize(node, new Node.ContinueStatement(label));
  	    };
  	    // ECMA-262 13.9 The break statement
  	    Parser.prototype.parseBreakStatement = function () {
  	        var node = this.createNode();
  	        this.expectKeyword('break');
  	        var label = null;
  	        if (this.lookahead.type === token_1.Token.Identifier && !this.hasLineTerminator) {
  	            label = this.parseVariableIdentifier();
  	            var key = '$' + label.name;
  	            if (!Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
  	                this.throwError(messages_1.Messages.UnknownLabel, label.name);
  	            }
  	        }
  	        this.consumeSemicolon();
  	        if (label === null && !this.context.inIteration && !this.context.inSwitch) {
  	            this.throwError(messages_1.Messages.IllegalBreak);
  	        }
  	        return this.finalize(node, new Node.BreakStatement(label));
  	    };
  	    // ECMA-262 13.10 The return statement
  	    Parser.prototype.parseReturnStatement = function () {
  	        if (!this.context.inFunctionBody) {
  	            this.tolerateError(messages_1.Messages.IllegalReturn);
  	        }
  	        var node = this.createNode();
  	        this.expectKeyword('return');
  	        var hasArgument = !this.match(';') && !this.match('}') &&
  	            !this.hasLineTerminator && this.lookahead.type !== token_1.Token.EOF;
  	        var argument = hasArgument ? this.parseExpression() : null;
  	        this.consumeSemicolon();
  	        return this.finalize(node, new Node.ReturnStatement(argument));
  	    };
  	    // ECMA-262 13.11 The with statement
  	    Parser.prototype.parseWithStatement = function () {
  	        if (this.context.strict) {
  	            this.tolerateError(messages_1.Messages.StrictModeWith);
  	        }
  	        var node = this.createNode();
  	        this.expectKeyword('with');
  	        this.expect('(');
  	        var object = this.parseExpression();
  	        this.expect(')');
  	        var body = this.parseStatement();
  	        return this.finalize(node, new Node.WithStatement(object, body));
  	    };
  	    // ECMA-262 13.12 The switch statement
  	    Parser.prototype.parseSwitchCase = function () {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        var test;
  	        if (this.matchKeyword('default')) {
  	            this.nextToken();
  	            test = null;
  	        }
  	        else {
  	            this.expectKeyword('case');
  	            test = this.parseExpression();
  	        }
  	        this.expect(':');
  	        var consequent = [];
  	        while (true) {
  	            if (this$1.match('}') || this$1.matchKeyword('default') || this$1.matchKeyword('case')) {
  	                break;
  	            }
  	            consequent.push(this$1.parseStatementListItem());
  	        }
  	        return this.finalize(node, new Node.SwitchCase(test, consequent));
  	    };
  	    Parser.prototype.parseSwitchStatement = function () {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        this.expectKeyword('switch');
  	        this.expect('(');
  	        var discriminant = this.parseExpression();
  	        this.expect(')');
  	        var previousInSwitch = this.context.inSwitch;
  	        this.context.inSwitch = true;
  	        var cases = [];
  	        var defaultFound = false;
  	        this.expect('{');
  	        while (true) {
  	            if (this$1.match('}')) {
  	                break;
  	            }
  	            var clause = this$1.parseSwitchCase();
  	            if (clause.test === null) {
  	                if (defaultFound) {
  	                    this$1.throwError(messages_1.Messages.MultipleDefaultsInSwitch);
  	                }
  	                defaultFound = true;
  	            }
  	            cases.push(clause);
  	        }
  	        this.expect('}');
  	        this.context.inSwitch = previousInSwitch;
  	        return this.finalize(node, new Node.SwitchStatement(discriminant, cases));
  	    };
  	    // ECMA-262 13.13 Labelled Statements
  	    Parser.prototype.parseLabelledStatement = function () {
  	        var node = this.createNode();
  	        var expr = this.parseExpression();
  	        var statement;
  	        if ((expr.type === syntax_1.Syntax.Identifier) && this.match(':')) {
  	            this.nextToken();
  	            var id = (expr);
  	            var key = '$' + id.name;
  	            if (Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
  	                this.throwError(messages_1.Messages.Redeclaration, 'Label', id.name);
  	            }
  	            this.context.labelSet[key] = true;
  	            var labeledBody = this.parseStatement();
  	            delete this.context.labelSet[key];
  	            statement = new Node.LabeledStatement(id, labeledBody);
  	        }
  	        else {
  	            this.consumeSemicolon();
  	            statement = new Node.ExpressionStatement(expr);
  	        }
  	        return this.finalize(node, statement);
  	    };
  	    // ECMA-262 13.14 The throw statement
  	    Parser.prototype.parseThrowStatement = function () {
  	        var node = this.createNode();
  	        this.expectKeyword('throw');
  	        if (this.hasLineTerminator) {
  	            this.throwError(messages_1.Messages.NewlineAfterThrow);
  	        }
  	        var argument = this.parseExpression();
  	        this.consumeSemicolon();
  	        return this.finalize(node, new Node.ThrowStatement(argument));
  	    };
  	    // ECMA-262 13.15 The try statement
  	    Parser.prototype.parseCatchClause = function () {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        this.expectKeyword('catch');
  	        this.expect('(');
  	        if (this.match(')')) {
  	            this.throwUnexpectedToken(this.lookahead);
  	        }
  	        var params = [];
  	        var param = this.parsePattern(params);
  	        var paramMap = {};
  	        for (var i = 0; i < params.length; i++) {
  	            var key = '$' + params[i].value;
  	            if (Object.prototype.hasOwnProperty.call(paramMap, key)) {
  	                this$1.tolerateError(messages_1.Messages.DuplicateBinding, params[i].value);
  	            }
  	            paramMap[key] = true;
  	        }
  	        if (this.context.strict && param.type === syntax_1.Syntax.Identifier) {
  	            if (this.scanner.isRestrictedWord((param).name)) {
  	                this.tolerateError(messages_1.Messages.StrictCatchVariable);
  	            }
  	        }
  	        this.expect(')');
  	        var body = this.parseBlock();
  	        return this.finalize(node, new Node.CatchClause(param, body));
  	    };
  	    Parser.prototype.parseFinallyClause = function () {
  	        this.expectKeyword('finally');
  	        return this.parseBlock();
  	    };
  	    Parser.prototype.parseTryStatement = function () {
  	        var node = this.createNode();
  	        this.expectKeyword('try');
  	        var block = this.parseBlock();
  	        var handler = this.matchKeyword('catch') ? this.parseCatchClause() : null;
  	        var finalizer = this.matchKeyword('finally') ? this.parseFinallyClause() : null;
  	        if (!handler && !finalizer) {
  	            this.throwError(messages_1.Messages.NoCatchOrFinally);
  	        }
  	        return this.finalize(node, new Node.TryStatement(block, handler, finalizer));
  	    };
  	    // ECMA-262 13.16 The debugger statement
  	    Parser.prototype.parseDebuggerStatement = function () {
  	        var node = this.createNode();
  	        this.expectKeyword('debugger');
  	        this.consumeSemicolon();
  	        return this.finalize(node, new Node.DebuggerStatement());
  	    };
  	    // ECMA-262 13 Statements
  	    Parser.prototype.parseStatement = function () {
  	        var statement = null;
  	        switch (this.lookahead.type) {
  	            case token_1.Token.BooleanLiteral:
  	            case token_1.Token.NullLiteral:
  	            case token_1.Token.NumericLiteral:
  	            case token_1.Token.StringLiteral:
  	            case token_1.Token.Template:
  	            case token_1.Token.RegularExpression:
  	                statement = this.parseExpressionStatement();
  	                break;
  	            case token_1.Token.Punctuator:
  	                var value = this.lookahead.value;
  	                if (value === '{') {
  	                    statement = this.parseBlock();
  	                }
  	                else if (value === '(') {
  	                    statement = this.parseExpressionStatement();
  	                }
  	                else if (value === ';') {
  	                    statement = this.parseEmptyStatement();
  	                }
  	                else {
  	                    statement = this.parseExpressionStatement();
  	                }
  	                break;
  	            case token_1.Token.Identifier:
  	                statement = this.parseLabelledStatement();
  	                break;
  	            case token_1.Token.Keyword:
  	                switch (this.lookahead.value) {
  	                    case 'break':
  	                        statement = this.parseBreakStatement();
  	                        break;
  	                    case 'continue':
  	                        statement = this.parseContinueStatement();
  	                        break;
  	                    case 'debugger':
  	                        statement = this.parseDebuggerStatement();
  	                        break;
  	                    case 'do':
  	                        statement = this.parseDoWhileStatement();
  	                        break;
  	                    case 'for':
  	                        statement = this.parseForStatement();
  	                        break;
  	                    case 'function':
  	                        statement = this.parseFunctionDeclaration();
  	                        break;
  	                    case 'if':
  	                        statement = this.parseIfStatement();
  	                        break;
  	                    case 'return':
  	                        statement = this.parseReturnStatement();
  	                        break;
  	                    case 'switch':
  	                        statement = this.parseSwitchStatement();
  	                        break;
  	                    case 'throw':
  	                        statement = this.parseThrowStatement();
  	                        break;
  	                    case 'try':
  	                        statement = this.parseTryStatement();
  	                        break;
  	                    case 'var':
  	                        statement = this.parseVariableStatement();
  	                        break;
  	                    case 'while':
  	                        statement = this.parseWhileStatement();
  	                        break;
  	                    case 'with':
  	                        statement = this.parseWithStatement();
  	                        break;
  	                    default:
  	                        statement = this.parseExpressionStatement();
  	                        break;
  	                }
  	                break;
  	            default:
  	                this.throwUnexpectedToken(this.lookahead);
  	        }
  	        return statement;
  	    };
  	    // ECMA-262 14.1 Function Definition
  	    Parser.prototype.parseFunctionSourceElements = function () {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        this.expect('{');
  	        var body = this.parseDirectivePrologues();
  	        var previousLabelSet = this.context.labelSet;
  	        var previousInIteration = this.context.inIteration;
  	        var previousInSwitch = this.context.inSwitch;
  	        var previousInFunctionBody = this.context.inFunctionBody;
  	        this.context.labelSet = {};
  	        this.context.inIteration = false;
  	        this.context.inSwitch = false;
  	        this.context.inFunctionBody = true;
  	        while (this.startMarker.index < this.scanner.length) {
  	            if (this$1.match('}')) {
  	                break;
  	            }
  	            body.push(this$1.parseStatementListItem());
  	        }
  	        this.expect('}');
  	        this.context.labelSet = previousLabelSet;
  	        this.context.inIteration = previousInIteration;
  	        this.context.inSwitch = previousInSwitch;
  	        this.context.inFunctionBody = previousInFunctionBody;
  	        return this.finalize(node, new Node.BlockStatement(body));
  	    };
  	    Parser.prototype.validateParam = function (options, param, name) {
  	        var key = '$' + name;
  	        if (this.context.strict) {
  	            if (this.scanner.isRestrictedWord(name)) {
  	                options.stricted = param;
  	                options.message = messages_1.Messages.StrictParamName;
  	            }
  	            if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
  	                options.stricted = param;
  	                options.message = messages_1.Messages.StrictParamDupe;
  	            }
  	        }
  	        else if (!options.firstRestricted) {
  	            if (this.scanner.isRestrictedWord(name)) {
  	                options.firstRestricted = param;
  	                options.message = messages_1.Messages.StrictParamName;
  	            }
  	            else if (this.scanner.isStrictModeReservedWord(name)) {
  	                options.firstRestricted = param;
  	                options.message = messages_1.Messages.StrictReservedWord;
  	            }
  	            else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
  	                options.stricted = param;
  	                options.message = messages_1.Messages.StrictParamDupe;
  	            }
  	        }
  	        /* istanbul ignore next */
  	        if (typeof Object.defineProperty === 'function') {
  	            Object.defineProperty(options.paramSet, key, { value: true, enumerable: true, writable: true, configurable: true });
  	        }
  	        else {
  	            options.paramSet[key] = true;
  	        }
  	    };
  	    Parser.prototype.parseRestElement = function (params) {
  	        var node = this.createNode();
  	        this.expect('...');
  	        var arg = this.parsePattern(params);
  	        if (this.match('=')) {
  	            this.throwError(messages_1.Messages.DefaultRestParameter);
  	        }
  	        if (!this.match(')')) {
  	            this.throwError(messages_1.Messages.ParameterAfterRestParameter);
  	        }
  	        return this.finalize(node, new Node.RestElement(arg));
  	    };
  	    Parser.prototype.parseFormalParameter = function (options) {
  	        var this$1 = this;

  	        var params = [];
  	        var param = this.match('...') ? this.parseRestElement(params) : this.parsePatternWithDefault(params);
  	        for (var i = 0; i < params.length; i++) {
  	            this$1.validateParam(options, params[i], params[i].value);
  	        }
  	        options.params.push(param);
  	        return !this.match(')');
  	    };
  	    Parser.prototype.parseFormalParameters = function (firstRestricted) {
  	        var this$1 = this;

  	        var options;
  	        options = {
  	            params: [],
  	            firstRestricted: firstRestricted
  	        };
  	        this.expect('(');
  	        if (!this.match(')')) {
  	            options.paramSet = {};
  	            while (this.startMarker.index < this.scanner.length) {
  	                if (!this$1.parseFormalParameter(options)) {
  	                    break;
  	                }
  	                this$1.expect(',');
  	            }
  	        }
  	        this.expect(')');
  	        return {
  	            params: options.params,
  	            stricted: options.stricted,
  	            firstRestricted: options.firstRestricted,
  	            message: options.message
  	        };
  	    };
  	    Parser.prototype.parseFunctionDeclaration = function (identifierIsOptional) {
  	        var node = this.createNode();
  	        this.expectKeyword('function');
  	        var isGenerator = this.match('*');
  	        if (isGenerator) {
  	            this.nextToken();
  	        }
  	        var message;
  	        var id = null;
  	        var firstRestricted = null;
  	        if (!identifierIsOptional || !this.match('(')) {
  	            var token = this.lookahead;
  	            id = this.parseVariableIdentifier();
  	            if (this.context.strict) {
  	                if (this.scanner.isRestrictedWord(token.value)) {
  	                    this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunctionName);
  	                }
  	            }
  	            else {
  	                if (this.scanner.isRestrictedWord(token.value)) {
  	                    firstRestricted = token;
  	                    message = messages_1.Messages.StrictFunctionName;
  	                }
  	                else if (this.scanner.isStrictModeReservedWord(token.value)) {
  	                    firstRestricted = token;
  	                    message = messages_1.Messages.StrictReservedWord;
  	                }
  	            }
  	        }
  	        var previousAllowYield = this.context.allowYield;
  	        this.context.allowYield = !isGenerator;
  	        var formalParameters = this.parseFormalParameters(firstRestricted);
  	        var params = formalParameters.params;
  	        var stricted = formalParameters.stricted;
  	        firstRestricted = formalParameters.firstRestricted;
  	        if (formalParameters.message) {
  	            message = formalParameters.message;
  	        }
  	        var previousStrict = this.context.strict;
  	        var body = this.parseFunctionSourceElements();
  	        if (this.context.strict && firstRestricted) {
  	            this.throwUnexpectedToken(firstRestricted, message);
  	        }
  	        if (this.context.strict && stricted) {
  	            this.tolerateUnexpectedToken(stricted, message);
  	        }
  	        this.context.strict = previousStrict;
  	        this.context.allowYield = previousAllowYield;
  	        return this.finalize(node, new Node.FunctionDeclaration(id, params, body, isGenerator));
  	    };
  	    Parser.prototype.parseFunctionExpression = function () {
  	        var node = this.createNode();
  	        this.expectKeyword('function');
  	        var isGenerator = this.match('*');
  	        if (isGenerator) {
  	            this.nextToken();
  	        }
  	        var message;
  	        var id = null;
  	        var firstRestricted;
  	        var previousAllowYield = this.context.allowYield;
  	        this.context.allowYield = !isGenerator;
  	        if (!this.match('(')) {
  	            var token = this.lookahead;
  	            id = (!this.context.strict && !isGenerator && this.matchKeyword('yield')) ? this.parseIdentifierName() : this.parseVariableIdentifier();
  	            if (this.context.strict) {
  	                if (this.scanner.isRestrictedWord(token.value)) {
  	                    this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunctionName);
  	                }
  	            }
  	            else {
  	                if (this.scanner.isRestrictedWord(token.value)) {
  	                    firstRestricted = token;
  	                    message = messages_1.Messages.StrictFunctionName;
  	                }
  	                else if (this.scanner.isStrictModeReservedWord(token.value)) {
  	                    firstRestricted = token;
  	                    message = messages_1.Messages.StrictReservedWord;
  	                }
  	            }
  	        }
  	        var formalParameters = this.parseFormalParameters(firstRestricted);
  	        var params = formalParameters.params;
  	        var stricted = formalParameters.stricted;
  	        firstRestricted = formalParameters.firstRestricted;
  	        if (formalParameters.message) {
  	            message = formalParameters.message;
  	        }
  	        var previousStrict = this.context.strict;
  	        var body = this.parseFunctionSourceElements();
  	        if (this.context.strict && firstRestricted) {
  	            this.throwUnexpectedToken(firstRestricted, message);
  	        }
  	        if (this.context.strict && stricted) {
  	            this.tolerateUnexpectedToken(stricted, message);
  	        }
  	        this.context.strict = previousStrict;
  	        this.context.allowYield = previousAllowYield;
  	        return this.finalize(node, new Node.FunctionExpression(id, params, body, isGenerator));
  	    };
  	    // ECMA-262 14.1.1 Directive Prologues
  	    Parser.prototype.parseDirective = function () {
  	        var token = this.lookahead;
  	        var directive = null;
  	        var node = this.createNode();
  	        var expr = this.parseExpression();
  	        if (expr.type === syntax_1.Syntax.Literal) {
  	            directive = this.getTokenRaw(token).slice(1, -1);
  	        }
  	        this.consumeSemicolon();
  	        return this.finalize(node, directive ? new Node.Directive(expr, directive) :
  	            new Node.ExpressionStatement(expr));
  	    };
  	    Parser.prototype.parseDirectivePrologues = function () {
  	        var this$1 = this;

  	        var firstRestricted = null;
  	        var body = [];
  	        while (true) {
  	            var token = this$1.lookahead;
  	            if (token.type !== token_1.Token.StringLiteral) {
  	                break;
  	            }
  	            var statement = this$1.parseDirective();
  	            body.push(statement);
  	            var directive = statement.directive;
  	            if (typeof directive !== 'string') {
  	                break;
  	            }
  	            if (directive === 'use strict') {
  	                this$1.context.strict = true;
  	                if (firstRestricted) {
  	                    this$1.tolerateUnexpectedToken(firstRestricted, messages_1.Messages.StrictOctalLiteral);
  	                }
  	            }
  	            else {
  	                if (!firstRestricted && token.octal) {
  	                    firstRestricted = token;
  	                }
  	            }
  	        }
  	        return body;
  	    };
  	    // ECMA-262 14.3 Method Definitions
  	    Parser.prototype.qualifiedPropertyName = function (token) {
  	        switch (token.type) {
  	            case token_1.Token.Identifier:
  	            case token_1.Token.StringLiteral:
  	            case token_1.Token.BooleanLiteral:
  	            case token_1.Token.NullLiteral:
  	            case token_1.Token.NumericLiteral:
  	            case token_1.Token.Keyword:
  	                return true;
  	            case token_1.Token.Punctuator:
  	                return token.value === '[';
  	        }
  	        return false;
  	    };
  	    Parser.prototype.parseGetterMethod = function () {
  	        var node = this.createNode();
  	        this.expect('(');
  	        this.expect(')');
  	        var isGenerator = false;
  	        var params = {
  	            params: [],
  	            stricted: null,
  	            firstRestricted: null,
  	            message: null
  	        };
  	        var previousAllowYield = this.context.allowYield;
  	        this.context.allowYield = false;
  	        var method = this.parsePropertyMethod(params);
  	        this.context.allowYield = previousAllowYield;
  	        return this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
  	    };
  	    Parser.prototype.parseSetterMethod = function () {
  	        var node = this.createNode();
  	        var options = {
  	            params: [],
  	            firstRestricted: null,
  	            paramSet: {}
  	        };
  	        var isGenerator = false;
  	        var previousAllowYield = this.context.allowYield;
  	        this.context.allowYield = false;
  	        this.expect('(');
  	        if (this.match(')')) {
  	            this.tolerateUnexpectedToken(this.lookahead);
  	        }
  	        else {
  	            this.parseFormalParameter(options);
  	        }
  	        this.expect(')');
  	        var method = this.parsePropertyMethod(options);
  	        this.context.allowYield = previousAllowYield;
  	        return this.finalize(node, new Node.FunctionExpression(null, options.params, method, isGenerator));
  	    };
  	    Parser.prototype.parseGeneratorMethod = function () {
  	        var node = this.createNode();
  	        var isGenerator = true;
  	        var previousAllowYield = this.context.allowYield;
  	        this.context.allowYield = true;
  	        var params = this.parseFormalParameters();
  	        this.context.allowYield = false;
  	        var method = this.parsePropertyMethod(params);
  	        this.context.allowYield = previousAllowYield;
  	        return this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
  	    };
  	    // ECMA-262 14.4 Generator Function Definitions
  	    Parser.prototype.isStartOfExpression = function () {
  	        var start = true;
  	        var value = this.lookahead.value;
  	        switch (this.lookahead.type) {
  	            case token_1.Token.Punctuator:
  	                start = (value === '[') || (value === '(') || (value === '{') ||
  	                    (value === '+') || (value === '-') ||
  	                    (value === '!') || (value === '~') ||
  	                    (value === '++') || (value === '--') ||
  	                    (value === '/') || (value === '/='); // regular expression literal
  	                break;
  	            case token_1.Token.Keyword:
  	                start = (value === 'class') || (value === 'delete') ||
  	                    (value === 'function') || (value === 'let') || (value === 'new') ||
  	                    (value === 'super') || (value === 'this') || (value === 'typeof') ||
  	                    (value === 'void') || (value === 'yield');
  	                break;
  	            default:
  	                break;
  	        }
  	        return start;
  	    };
  	    Parser.prototype.parseYieldExpression = function () {
  	        var node = this.createNode();
  	        this.expectKeyword('yield');
  	        var argument = null;
  	        var delegate = false;
  	        if (!this.hasLineTerminator) {
  	            var previousAllowYield = this.context.allowYield;
  	            this.context.allowYield = false;
  	            delegate = this.match('*');
  	            if (delegate) {
  	                this.nextToken();
  	                argument = this.parseAssignmentExpression();
  	            }
  	            else if (this.isStartOfExpression()) {
  	                argument = this.parseAssignmentExpression();
  	            }
  	            this.context.allowYield = previousAllowYield;
  	        }
  	        return this.finalize(node, new Node.YieldExpression(argument, delegate));
  	    };
  	    // ECMA-262 14.5 Class Definitions
  	    Parser.prototype.parseClassElement = function (hasConstructor) {
  	        var token = this.lookahead;
  	        var node = this.createNode();
  	        var kind;
  	        var key;
  	        var value;
  	        var computed = false;
  	        var method = false;
  	        var isStatic = false;
  	        if (this.match('*')) {
  	            this.nextToken();
  	        }
  	        else {
  	            computed = this.match('[');
  	            key = this.parseObjectPropertyKey();
  	            var id = key;
  	            if (id.name === 'static' && (this.qualifiedPropertyName(this.lookahead) || this.match('*'))) {
  	                token = this.lookahead;
  	                isStatic = true;
  	                computed = this.match('[');
  	                if (this.match('*')) {
  	                    this.nextToken();
  	                }
  	                else {
  	                    key = this.parseObjectPropertyKey();
  	                }
  	            }
  	        }
  	        var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
  	        if (token.type === token_1.Token.Identifier) {
  	            if (token.value === 'get' && lookaheadPropertyKey) {
  	                kind = 'get';
  	                computed = this.match('[');
  	                key = this.parseObjectPropertyKey();
  	                this.context.allowYield = false;
  	                value = this.parseGetterMethod();
  	            }
  	            else if (token.value === 'set' && lookaheadPropertyKey) {
  	                kind = 'set';
  	                computed = this.match('[');
  	                key = this.parseObjectPropertyKey();
  	                value = this.parseSetterMethod();
  	            }
  	        }
  	        else if (token.type === token_1.Token.Punctuator && token.value === '*' && lookaheadPropertyKey) {
  	            kind = 'init';
  	            computed = this.match('[');
  	            key = this.parseObjectPropertyKey();
  	            value = this.parseGeneratorMethod();
  	            method = true;
  	        }
  	        if (!kind && key && this.match('(')) {
  	            kind = 'init';
  	            value = this.parsePropertyMethodFunction();
  	            method = true;
  	        }
  	        if (!kind) {
  	            this.throwUnexpectedToken(this.lookahead);
  	        }
  	        if (kind === 'init') {
  	            kind = 'method';
  	        }
  	        if (!computed) {
  	            if (isStatic && this.isPropertyKey(key, 'prototype')) {
  	                this.throwUnexpectedToken(token, messages_1.Messages.StaticPrototype);
  	            }
  	            if (!isStatic && this.isPropertyKey(key, 'constructor')) {
  	                if (kind !== 'method' || !method || value.generator) {
  	                    this.throwUnexpectedToken(token, messages_1.Messages.ConstructorSpecialMethod);
  	                }
  	                if (hasConstructor.value) {
  	                    this.throwUnexpectedToken(token, messages_1.Messages.DuplicateConstructor);
  	                }
  	                else {
  	                    hasConstructor.value = true;
  	                }
  	                kind = 'constructor';
  	            }
  	        }
  	        return this.finalize(node, new Node.MethodDefinition(key, computed, value, kind, isStatic));
  	    };
  	    Parser.prototype.parseClassElementList = function () {
  	        var this$1 = this;

  	        var body = [];
  	        var hasConstructor = { value: false };
  	        this.expect('{');
  	        while (!this.match('}')) {
  	            if (this$1.match(';')) {
  	                this$1.nextToken();
  	            }
  	            else {
  	                body.push(this$1.parseClassElement(hasConstructor));
  	            }
  	        }
  	        this.expect('}');
  	        return body;
  	    };
  	    Parser.prototype.parseClassBody = function () {
  	        var node = this.createNode();
  	        var elementList = this.parseClassElementList();
  	        return this.finalize(node, new Node.ClassBody(elementList));
  	    };
  	    Parser.prototype.parseClassDeclaration = function (identifierIsOptional) {
  	        var node = this.createNode();
  	        var previousStrict = this.context.strict;
  	        this.context.strict = true;
  	        this.expectKeyword('class');
  	        var id = (identifierIsOptional && (this.lookahead.type !== token_1.Token.Identifier)) ? null : this.parseVariableIdentifier();
  	        var superClass = null;
  	        if (this.matchKeyword('extends')) {
  	            this.nextToken();
  	            superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
  	        }
  	        var classBody = this.parseClassBody();
  	        this.context.strict = previousStrict;
  	        return this.finalize(node, new Node.ClassDeclaration(id, superClass, classBody));
  	    };
  	    Parser.prototype.parseClassExpression = function () {
  	        var node = this.createNode();
  	        var previousStrict = this.context.strict;
  	        this.context.strict = true;
  	        this.expectKeyword('class');
  	        var id = (this.lookahead.type === token_1.Token.Identifier) ? this.parseVariableIdentifier() : null;
  	        var superClass = null;
  	        if (this.matchKeyword('extends')) {
  	            this.nextToken();
  	            superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
  	        }
  	        var classBody = this.parseClassBody();
  	        this.context.strict = previousStrict;
  	        return this.finalize(node, new Node.ClassExpression(id, superClass, classBody));
  	    };
  	    // ECMA-262 15.1 Scripts
  	    // ECMA-262 15.2 Modules
  	    Parser.prototype.parseProgram = function () {
  	        var this$1 = this;

  	        var node = this.createNode();
  	        var body = this.parseDirectivePrologues();
  	        while (this.startMarker.index < this.scanner.length) {
  	            body.push(this$1.parseStatementListItem());
  	        }
  	        return this.finalize(node, new Node.Program(body, this.sourceType));
  	    };
  	    // ECMA-262 15.2.2 Imports
  	    Parser.prototype.parseModuleSpecifier = function () {
  	        var node = this.createNode();
  	        if (this.lookahead.type !== token_1.Token.StringLiteral) {
  	            this.throwError(messages_1.Messages.InvalidModuleSpecifier);
  	        }
  	        var token = this.nextToken();
  	        var raw = this.getTokenRaw(token);
  	        return this.finalize(node, new Node.Literal(token.value, raw));
  	    };
  	    // import {<foo as bar>} ...;
  	    Parser.prototype.parseImportSpecifier = function () {
  	        var node = this.createNode();
  	        var imported;
  	        var local;
  	        if (this.lookahead.type === token_1.Token.Identifier) {
  	            imported = this.parseVariableIdentifier();
  	            local = imported;
  	            if (this.matchContextualKeyword('as')) {
  	                this.nextToken();
  	                local = this.parseVariableIdentifier();
  	            }
  	        }
  	        else {
  	            imported = this.parseIdentifierName();
  	            local = imported;
  	            if (this.matchContextualKeyword('as')) {
  	                this.nextToken();
  	                local = this.parseVariableIdentifier();
  	            }
  	            else {
  	                this.throwUnexpectedToken(this.nextToken());
  	            }
  	        }
  	        return this.finalize(node, new Node.ImportSpecifier(local, imported));
  	    };
  	    // {foo, bar as bas}
  	    Parser.prototype.parseNamedImports = function () {
  	        var this$1 = this;

  	        this.expect('{');
  	        var specifiers = [];
  	        while (!this.match('}')) {
  	            specifiers.push(this$1.parseImportSpecifier());
  	            if (!this$1.match('}')) {
  	                this$1.expect(',');
  	            }
  	        }
  	        this.expect('}');
  	        return specifiers;
  	    };
  	    // import <foo> ...;
  	    Parser.prototype.parseImportDefaultSpecifier = function () {
  	        var node = this.createNode();
  	        var local = this.parseIdentifierName();
  	        return this.finalize(node, new Node.ImportDefaultSpecifier(local));
  	    };
  	    // import <* as foo> ...;
  	    Parser.prototype.parseImportNamespaceSpecifier = function () {
  	        var node = this.createNode();
  	        this.expect('*');
  	        if (!this.matchContextualKeyword('as')) {
  	            this.throwError(messages_1.Messages.NoAsAfterImportNamespace);
  	        }
  	        this.nextToken();
  	        var local = this.parseIdentifierName();
  	        return this.finalize(node, new Node.ImportNamespaceSpecifier(local));
  	    };
  	    Parser.prototype.parseImportDeclaration = function () {
  	        if (this.context.inFunctionBody) {
  	            this.throwError(messages_1.Messages.IllegalImportDeclaration);
  	        }
  	        var node = this.createNode();
  	        this.expectKeyword('import');
  	        var src;
  	        var specifiers = [];
  	        if (this.lookahead.type === token_1.Token.StringLiteral) {
  	            // import 'foo';
  	            src = this.parseModuleSpecifier();
  	        }
  	        else {
  	            if (this.match('{')) {
  	                // import {bar}
  	                specifiers = specifiers.concat(this.parseNamedImports());
  	            }
  	            else if (this.match('*')) {
  	                // import * as foo
  	                specifiers.push(this.parseImportNamespaceSpecifier());
  	            }
  	            else if (this.isIdentifierName(this.lookahead) && !this.matchKeyword('default')) {
  	                // import foo
  	                specifiers.push(this.parseImportDefaultSpecifier());
  	                if (this.match(',')) {
  	                    this.nextToken();
  	                    if (this.match('*')) {
  	                        // import foo, * as foo
  	                        specifiers.push(this.parseImportNamespaceSpecifier());
  	                    }
  	                    else if (this.match('{')) {
  	                        // import foo, {bar}
  	                        specifiers = specifiers.concat(this.parseNamedImports());
  	                    }
  	                    else {
  	                        this.throwUnexpectedToken(this.lookahead);
  	                    }
  	                }
  	            }
  	            else {
  	                this.throwUnexpectedToken(this.nextToken());
  	            }
  	            if (!this.matchContextualKeyword('from')) {
  	                var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
  	                this.throwError(message, this.lookahead.value);
  	            }
  	            this.nextToken();
  	            src = this.parseModuleSpecifier();
  	        }
  	        this.consumeSemicolon();
  	        return this.finalize(node, new Node.ImportDeclaration(specifiers, src));
  	    };
  	    // ECMA-262 15.2.3 Exports
  	    Parser.prototype.parseExportSpecifier = function () {
  	        var node = this.createNode();
  	        var local = this.parseIdentifierName();
  	        var exported = local;
  	        if (this.matchContextualKeyword('as')) {
  	            this.nextToken();
  	            exported = this.parseIdentifierName();
  	        }
  	        return this.finalize(node, new Node.ExportSpecifier(local, exported));
  	    };
  	    Parser.prototype.parseExportDeclaration = function () {
  	        var this$1 = this;

  	        if (this.context.inFunctionBody) {
  	            this.throwError(messages_1.Messages.IllegalExportDeclaration);
  	        }
  	        var node = this.createNode();
  	        this.expectKeyword('export');
  	        var exportDeclaration;
  	        if (this.matchKeyword('default')) {
  	            // export default ...
  	            this.nextToken();
  	            if (this.matchKeyword('function')) {
  	                // export default function foo () {}
  	                // export default function () {}
  	                var declaration = this.parseFunctionDeclaration(true);
  	                exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
  	            }
  	            else if (this.matchKeyword('class')) {
  	                // export default class foo {}
  	                var declaration = this.parseClassDeclaration(true);
  	                exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
  	            }
  	            else {
  	                if (this.matchContextualKeyword('from')) {
  	                    this.throwError(messages_1.Messages.UnexpectedToken, this.lookahead.value);
  	                }
  	                // export default {};
  	                // export default [];
  	                // export default (1 + 2);
  	                var declaration = this.match('{') ? this.parseObjectInitializer() :
  	                    this.match('[') ? this.parseArrayInitializer() : this.parseAssignmentExpression();
  	                this.consumeSemicolon();
  	                exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
  	            }
  	        }
  	        else if (this.match('*')) {
  	            // export * from 'foo';
  	            this.nextToken();
  	            if (!this.matchContextualKeyword('from')) {
  	                var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
  	                this.throwError(message, this.lookahead.value);
  	            }
  	            this.nextToken();
  	            var src = this.parseModuleSpecifier();
  	            this.consumeSemicolon();
  	            exportDeclaration = this.finalize(node, new Node.ExportAllDeclaration(src));
  	        }
  	        else if (this.lookahead.type === token_1.Token.Keyword) {
  	            // export var f = 1;
  	            var declaration = void 0;
  	            switch (this.lookahead.value) {
  	                case 'let':
  	                case 'const':
  	                    declaration = this.parseLexicalDeclaration({ inFor: false });
  	                    break;
  	                case 'var':
  	                case 'class':
  	                case 'function':
  	                    declaration = this.parseStatementListItem();
  	                    break;
  	                default:
  	                    this.throwUnexpectedToken(this.lookahead);
  	            }
  	            exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(declaration, [], null));
  	        }
  	        else {
  	            var specifiers = [];
  	            var source = null;
  	            var isExportFromIdentifier = false;
  	            this.expect('{');
  	            while (!this.match('}')) {
  	                isExportFromIdentifier = isExportFromIdentifier || this$1.matchKeyword('default');
  	                specifiers.push(this$1.parseExportSpecifier());
  	                if (!this$1.match('}')) {
  	                    this$1.expect(',');
  	                }
  	            }
  	            this.expect('}');
  	            if (this.matchContextualKeyword('from')) {
  	                // export {default} from 'foo';
  	                // export {foo} from 'foo';
  	                this.nextToken();
  	                source = this.parseModuleSpecifier();
  	                this.consumeSemicolon();
  	            }
  	            else if (isExportFromIdentifier) {
  	                // export {default}; // missing fromClause
  	                var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
  	                this.throwError(message, this.lookahead.value);
  	            }
  	            else {
  	                // export {foo};
  	                this.consumeSemicolon();
  	            }
  	            exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(null, specifiers, source));
  	        }
  	        return exportDeclaration;
  	    };
  	    return Parser;
  	}());
  	exports.Parser = Parser;


  /***/ },
  /* 4 */
  /***/ function(module, exports) {
  	function assert(condition, message) {
  	    /* istanbul ignore if */
  	    if (!condition) {
  	        throw new Error('ASSERT: ' + message);
  	    }
  	}
  	exports.assert = assert;


  /***/ },
  /* 5 */
  /***/ function(module, exports) {
  	// Error messages should be identical to V8.
  	exports.Messages = {
  	    UnexpectedToken: 'Unexpected token %0',
  	    UnexpectedTokenIllegal: 'Unexpected token ILLEGAL',
  	    UnexpectedNumber: 'Unexpected number',
  	    UnexpectedString: 'Unexpected string',
  	    UnexpectedIdentifier: 'Unexpected identifier',
  	    UnexpectedReserved: 'Unexpected reserved word',
  	    UnexpectedTemplate: 'Unexpected quasi %0',
  	    UnexpectedEOS: 'Unexpected end of input',
  	    NewlineAfterThrow: 'Illegal newline after throw',
  	    InvalidRegExp: 'Invalid regular expression',
  	    UnterminatedRegExp: 'Invalid regular expression: missing /',
  	    InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
  	    InvalidLHSInForIn: 'Invalid left-hand side in for-in',
  	    InvalidLHSInForLoop: 'Invalid left-hand side in for-loop',
  	    MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
  	    NoCatchOrFinally: 'Missing catch or finally after try',
  	    UnknownLabel: 'Undefined label \'%0\'',
  	    Redeclaration: '%0 \'%1\' has already been declared',
  	    IllegalContinue: 'Illegal continue statement',
  	    IllegalBreak: 'Illegal break statement',
  	    IllegalReturn: 'Illegal return statement',
  	    StrictModeWith: 'Strict mode code may not include a with statement',
  	    StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
  	    StrictVarName: 'Variable name may not be eval or arguments in strict mode',
  	    StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
  	    StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
  	    StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
  	    StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
  	    StrictDelete: 'Delete of an unqualified identifier in strict mode.',
  	    StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
  	    StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
  	    StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
  	    StrictReservedWord: 'Use of future reserved word in strict mode',
  	    TemplateOctalLiteral: 'Octal literals are not allowed in template strings.',
  	    ParameterAfterRestParameter: 'Rest parameter must be last formal parameter',
  	    DefaultRestParameter: 'Unexpected token =',
  	    DuplicateProtoProperty: 'Duplicate __proto__ fields are not allowed in object literals',
  	    ConstructorSpecialMethod: 'Class constructor may not be an accessor',
  	    DuplicateConstructor: 'A class may only have one constructor',
  	    StaticPrototype: 'Classes may not have static property named prototype',
  	    MissingFromClause: 'Unexpected token',
  	    NoAsAfterImportNamespace: 'Unexpected token',
  	    InvalidModuleSpecifier: 'Unexpected token',
  	    IllegalImportDeclaration: 'Unexpected token',
  	    IllegalExportDeclaration: 'Unexpected token',
  	    DuplicateBinding: 'Duplicate binding %0',
  	    ForInOfLoopInitializer: '%0 loop variable declaration may not have an initializer'
  	};


  /***/ },
  /* 6 */
  /***/ function(module, exports) {
  	var ErrorHandler = (function () {
  	    function ErrorHandler() {
  	        this.errors = [];
  	        this.tolerant = false;
  	    }
  	    
  	    ErrorHandler.prototype.recordError = function (error) {
  	        this.errors.push(error);
  	    };
  	    
  	    ErrorHandler.prototype.tolerate = function (error) {
  	        if (this.tolerant) {
  	            this.recordError(error);
  	        }
  	        else {
  	            throw error;
  	        }
  	    };
  	    
  	    ErrorHandler.prototype.constructError = function (msg, column) {
  	        var error = new Error(msg);
  	        try {
  	            throw error;
  	        }
  	        catch (base) {
  	            /* istanbul ignore else */
  	            if (Object.create && Object.defineProperty) {
  	                error = Object.create(base);
  	                Object.defineProperty(error, 'column', { value: column });
  	            }
  	        }
  	        finally {
  	            return error;
  	        }
  	    };
  	    
  	    ErrorHandler.prototype.createError = function (index, line, col, description) {
  	        var msg = 'Line ' + line + ': ' + description;
  	        var error = this.constructError(msg, col);
  	        error.index = index;
  	        error.lineNumber = line;
  	        error.description = description;
  	        return error;
  	    };
  	    
  	    ErrorHandler.prototype.throwError = function (index, line, col, description) {
  	        throw this.createError(index, line, col, description);
  	    };
  	    
  	    ErrorHandler.prototype.tolerateError = function (index, line, col, description) {
  	        var error = this.createError(index, line, col, description);
  	        if (this.tolerant) {
  	            this.recordError(error);
  	        }
  	        else {
  	            throw error;
  	        }
  	    };
  	    
  	    return ErrorHandler;
  	}());
  	exports.ErrorHandler = ErrorHandler;


  /***/ },
  /* 7 */
  /***/ function(module, exports) {
  	(function (Token) {
  	    Token[Token["BooleanLiteral"] = 1] = "BooleanLiteral";
  	    Token[Token["EOF"] = 2] = "EOF";
  	    Token[Token["Identifier"] = 3] = "Identifier";
  	    Token[Token["Keyword"] = 4] = "Keyword";
  	    Token[Token["NullLiteral"] = 5] = "NullLiteral";
  	    Token[Token["NumericLiteral"] = 6] = "NumericLiteral";
  	    Token[Token["Punctuator"] = 7] = "Punctuator";
  	    Token[Token["StringLiteral"] = 8] = "StringLiteral";
  	    Token[Token["RegularExpression"] = 9] = "RegularExpression";
  	    Token[Token["Template"] = 10] = "Template";
  	})(exports.Token || (exports.Token = {}));
  	var Token = exports.Token;
  	
  	exports.TokenName = {};
  	exports.TokenName[Token.BooleanLiteral] = 'Boolean';
  	exports.TokenName[Token.EOF] = '<end>';
  	exports.TokenName[Token.Identifier] = 'Identifier';
  	exports.TokenName[Token.Keyword] = 'Keyword';
  	exports.TokenName[Token.NullLiteral] = 'Null';
  	exports.TokenName[Token.NumericLiteral] = 'Numeric';
  	exports.TokenName[Token.Punctuator] = 'Punctuator';
  	exports.TokenName[Token.StringLiteral] = 'String';
  	exports.TokenName[Token.RegularExpression] = 'RegularExpression';
  	exports.TokenName[Token.Template] = 'Template';


  /***/ },
  /* 8 */
  /***/ function(module, exports, __webpack_require__) {
  	var assert_1 = __webpack_require__(4);
  	var messages_1 = __webpack_require__(5);
  	var character_1 = __webpack_require__(9);
  	var token_1 = __webpack_require__(7);
  	function hexValue(ch) {
  	    return '0123456789abcdef'.indexOf(ch.toLowerCase());
  	}
  	function octalValue(ch) {
  	    return '01234567'.indexOf(ch);
  	}
  	var Scanner = (function () {
  	    function Scanner(code, handler) {
  	        this.source = code;
  	        this.errorHandler = handler;
  	        this.trackComment = false;
  	        this.length = code.length;
  	        this.index = 0;
  	        this.lineNumber = (code.length > 0) ? 1 : 0;
  	        this.lineStart = 0;
  	        this.curlyStack = [];
  	    }
  	    
  	    Scanner.prototype.eof = function () {
  	        return this.index >= this.length;
  	    };
  	    
  	    Scanner.prototype.throwUnexpectedToken = function (message) {
  	        if (message === void 0) { message = messages_1.Messages.UnexpectedTokenIllegal; }
  	        this.errorHandler.throwError(this.index, this.lineNumber, this.index - this.lineStart + 1, message);
  	    };
  	    
  	    Scanner.prototype.tolerateUnexpectedToken = function () {
  	        this.errorHandler.tolerateError(this.index, this.lineNumber, this.index - this.lineStart + 1, messages_1.Messages.UnexpectedTokenIllegal);
  	    };
  	    
  	    // ECMA-262 11.4 Comments
  	    Scanner.prototype.skipSingleLineComment = function (offset) {
  	        var this$1 = this;

  	        var comments;
  	        var start, loc;
  	        if (this.trackComment) {
  	            comments = [];
  	            start = this.index - offset;
  	            loc = {
  	                start: {
  	                    line: this.lineNumber,
  	                    column: this.index - this.lineStart - offset
  	                },
  	                end: {}
  	            };
  	        }
  	        while (!this.eof()) {
  	            var ch = this$1.source.charCodeAt(this$1.index);
  	            ++this$1.index;
  	            if (character_1.Character.isLineTerminator(ch)) {
  	                if (this$1.trackComment) {
  	                    loc.end = {
  	                        line: this$1.lineNumber,
  	                        column: this$1.index - this$1.lineStart - 1
  	                    };
  	                    var entry = {
  	                        multiLine: false,
  	                        slice: [start + offset, this$1.index - 1],
  	                        range: [start, this$1.index - 1],
  	                        loc: loc
  	                    };
  	                    comments.push(entry);
  	                }
  	                if (ch === 13 && this$1.source.charCodeAt(this$1.index) === 10) {
  	                    ++this$1.index;
  	                }
  	                ++this$1.lineNumber;
  	                this$1.lineStart = this$1.index;
  	                return comments;
  	            }
  	        }
  	        if (this.trackComment) {
  	            loc.end = {
  	                line: this.lineNumber,
  	                column: this.index - this.lineStart
  	            };
  	            var entry = {
  	                multiLine: false,
  	                slice: [start + offset, this.index],
  	                range: [start, this.index],
  	                loc: loc
  	            };
  	            comments.push(entry);
  	        }
  	        return comments;
  	    };
  	    
  	    Scanner.prototype.skipMultiLineComment = function () {
  	        var this$1 = this;

  	        var comments;
  	        var start, loc;
  	        if (this.trackComment) {
  	            comments = [];
  	            start = this.index - 2;
  	            loc = {
  	                start: {
  	                    line: this.lineNumber,
  	                    column: this.index - this.lineStart - 2
  	                },
  	                end: {}
  	            };
  	        }
  	        while (!this.eof()) {
  	            var ch = this$1.source.charCodeAt(this$1.index);
  	            if (character_1.Character.isLineTerminator(ch)) {
  	                if (ch === 0x0D && this$1.source.charCodeAt(this$1.index + 1) === 0x0A) {
  	                    ++this$1.index;
  	                }
  	                ++this$1.lineNumber;
  	                ++this$1.index;
  	                this$1.lineStart = this$1.index;
  	            }
  	            else if (ch === 0x2A) {
  	                // Block comment ends with '*/'.
  	                if (this$1.source.charCodeAt(this$1.index + 1) === 0x2F) {
  	                    this$1.index += 2;
  	                    if (this$1.trackComment) {
  	                        loc.end = {
  	                            line: this$1.lineNumber,
  	                            column: this$1.index - this$1.lineStart
  	                        };
  	                        var entry = {
  	                            multiLine: true,
  	                            slice: [start + 2, this$1.index - 2],
  	                            range: [start, this$1.index],
  	                            loc: loc
  	                        };
  	                        comments.push(entry);
  	                    }
  	                    return comments;
  	                }
  	                ++this$1.index;
  	            }
  	            else {
  	                ++this$1.index;
  	            }
  	        }
  	        // Ran off the end of the file - the whole thing is a comment
  	        if (this.trackComment) {
  	            loc.end = {
  	                line: this.lineNumber,
  	                column: this.index - this.lineStart
  	            };
  	            var entry = {
  	                multiLine: true,
  	                slice: [start + 2, this.index],
  	                range: [start, this.index],
  	                loc: loc
  	            };
  	            comments.push(entry);
  	        }
  	        this.tolerateUnexpectedToken();
  	        return comments;
  	    };
  	    
  	    Scanner.prototype.scanComments = function () {
  	        var this$1 = this;

  	        var comments;
  	        if (this.trackComment) {
  	            comments = [];
  	        }
  	        var start = (this.index === 0);
  	        while (!this.eof()) {
  	            var ch = this$1.source.charCodeAt(this$1.index);
  	            if (character_1.Character.isWhiteSpace(ch)) {
  	                ++this$1.index;
  	            }
  	            else if (character_1.Character.isLineTerminator(ch)) {
  	                ++this$1.index;
  	                if (ch === 0x0D && this$1.source.charCodeAt(this$1.index) === 0x0A) {
  	                    ++this$1.index;
  	                }
  	                ++this$1.lineNumber;
  	                this$1.lineStart = this$1.index;
  	                start = true;
  	            }
  	            else if (ch === 0x2F) {
  	                ch = this$1.source.charCodeAt(this$1.index + 1);
  	                if (ch === 0x2F) {
  	                    this$1.index += 2;
  	                    var comment = this$1.skipSingleLineComment(2);
  	                    if (this$1.trackComment) {
  	                        comments = comments.concat(comment);
  	                    }
  	                    start = true;
  	                }
  	                else if (ch === 0x2A) {
  	                    this$1.index += 2;
  	                    var comment = this$1.skipMultiLineComment();
  	                    if (this$1.trackComment) {
  	                        comments = comments.concat(comment);
  	                    }
  	                }
  	                else {
  	                    break;
  	                }
  	            }
  	            else if (start && ch === 0x2D) {
  	                // U+003E is '>'
  	                if ((this$1.source.charCodeAt(this$1.index + 1) === 0x2D) && (this$1.source.charCodeAt(this$1.index + 2) === 0x3E)) {
  	                    // '-->' is a single-line comment
  	                    this$1.index += 3;
  	                    var comment = this$1.skipSingleLineComment(3);
  	                    if (this$1.trackComment) {
  	                        comments = comments.concat(comment);
  	                    }
  	                }
  	                else {
  	                    break;
  	                }
  	            }
  	            else if (ch === 0x3C) {
  	                if (this$1.source.slice(this$1.index + 1, this$1.index + 4) === '!--') {
  	                    this$1.index += 4; // `<!--`
  	                    var comment = this$1.skipSingleLineComment(4);
  	                    if (this$1.trackComment) {
  	                        comments = comments.concat(comment);
  	                    }
  	                }
  	                else {
  	                    break;
  	                }
  	            }
  	            else {
  	                break;
  	            }
  	        }
  	        return comments;
  	    };
  	    
  	    // ECMA-262 11.6.2.2 Future Reserved Words
  	    Scanner.prototype.isFutureReservedWord = function (id) {
  	        switch (id) {
  	            case 'enum':
  	            case 'export':
  	            case 'import':
  	            case 'super':
  	                return true;
  	            default:
  	                return false;
  	        }
  	    };
  	    
  	    Scanner.prototype.isStrictModeReservedWord = function (id) {
  	        switch (id) {
  	            case 'implements':
  	            case 'interface':
  	            case 'package':
  	            case 'private':
  	            case 'protected':
  	            case 'public':
  	            case 'static':
  	            case 'yield':
  	            case 'let':
  	                return true;
  	            default:
  	                return false;
  	        }
  	    };
  	    
  	    Scanner.prototype.isRestrictedWord = function (id) {
  	        return id === 'eval' || id === 'arguments';
  	    };
  	    
  	    // ECMA-262 11.6.2.1 Keywords
  	    Scanner.prototype.isKeyword = function (id) {
  	        switch (id.length) {
  	            case 2:
  	                return (id === 'if') || (id === 'in') || (id === 'do');
  	            case 3:
  	                return (id === 'var') || (id === 'for') || (id === 'new') ||
  	                    (id === 'try') || (id === 'let');
  	            case 4:
  	                return (id === 'this') || (id === 'else') || (id === 'case') ||
  	                    (id === 'void') || (id === 'with') || (id === 'enum');
  	            case 5:
  	                return (id === 'while') || (id === 'break') || (id === 'catch') ||
  	                    (id === 'throw') || (id === 'const') || (id === 'yield') ||
  	                    (id === 'class') || (id === 'super');
  	            case 6:
  	                return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
  	                    (id === 'switch') || (id === 'export') || (id === 'import');
  	            case 7:
  	                return (id === 'default') || (id === 'finally') || (id === 'extends');
  	            case 8:
  	                return (id === 'function') || (id === 'continue') || (id === 'debugger');
  	            case 10:
  	                return (id === 'instanceof');
  	            default:
  	                return false;
  	        }
  	    };
  	    
  	    Scanner.prototype.codePointAt = function (i) {
  	        var cp = this.source.charCodeAt(i);
  	        if (cp >= 0xD800 && cp <= 0xDBFF) {
  	            var second = this.source.charCodeAt(i + 1);
  	            if (second >= 0xDC00 && second <= 0xDFFF) {
  	                var first = cp;
  	                cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
  	            }
  	        }
  	        return cp;
  	    };
  	    
  	    Scanner.prototype.scanHexEscape = function (prefix) {
  	        var this$1 = this;

  	        var len = (prefix === 'u') ? 4 : 2;
  	        var code = 0;
  	        for (var i = 0; i < len; ++i) {
  	            if (!this$1.eof() && character_1.Character.isHexDigit(this$1.source.charCodeAt(this$1.index))) {
  	                code = code * 16 + hexValue(this$1.source[this$1.index++]);
  	            }
  	            else {
  	                return '';
  	            }
  	        }
  	        return String.fromCharCode(code);
  	    };
  	    
  	    Scanner.prototype.scanUnicodeCodePointEscape = function () {
  	        var this$1 = this;

  	        var ch = this.source[this.index];
  	        var code = 0;
  	        // At least, one hex digit is required.
  	        if (ch === '}') {
  	            this.throwUnexpectedToken();
  	        }
  	        while (!this.eof()) {
  	            ch = this$1.source[this$1.index++];
  	            if (!character_1.Character.isHexDigit(ch.charCodeAt(0))) {
  	                break;
  	            }
  	            code = code * 16 + hexValue(ch);
  	        }
  	        if (code > 0x10FFFF || ch !== '}') {
  	            this.throwUnexpectedToken();
  	        }
  	        return character_1.Character.fromCodePoint(code);
  	    };
  	    
  	    Scanner.prototype.getIdentifier = function () {
  	        var this$1 = this;

  	        var start = this.index++;
  	        while (!this.eof()) {
  	            var ch = this$1.source.charCodeAt(this$1.index);
  	            if (ch === 0x5C) {
  	                // Blackslash (U+005C) marks Unicode escape sequence.
  	                this$1.index = start;
  	                return this$1.getComplexIdentifier();
  	            }
  	            else if (ch >= 0xD800 && ch < 0xDFFF) {
  	                // Need to handle surrogate pairs.
  	                this$1.index = start;
  	                return this$1.getComplexIdentifier();
  	            }
  	            if (character_1.Character.isIdentifierPart(ch)) {
  	                ++this$1.index;
  	            }
  	            else {
  	                break;
  	            }
  	        }
  	        return this.source.slice(start, this.index);
  	    };
  	    
  	    Scanner.prototype.getComplexIdentifier = function () {
  	        var this$1 = this;

  	        var cp = this.codePointAt(this.index);
  	        var id = character_1.Character.fromCodePoint(cp);
  	        this.index += id.length;
  	        // '\u' (U+005C, U+0075) denotes an escaped character.
  	        var ch;
  	        if (cp === 0x5C) {
  	            if (this.source.charCodeAt(this.index) !== 0x75) {
  	                this.throwUnexpectedToken();
  	            }
  	            ++this.index;
  	            if (this.source[this.index] === '{') {
  	                ++this.index;
  	                ch = this.scanUnicodeCodePointEscape();
  	            }
  	            else {
  	                ch = this.scanHexEscape('u');
  	                cp = ch.charCodeAt(0);
  	                if (!ch || ch === '\\' || !character_1.Character.isIdentifierStart(cp)) {
  	                    this.throwUnexpectedToken();
  	                }
  	            }
  	            id = ch;
  	        }
  	        while (!this.eof()) {
  	            cp = this$1.codePointAt(this$1.index);
  	            if (!character_1.Character.isIdentifierPart(cp)) {
  	                break;
  	            }
  	            ch = character_1.Character.fromCodePoint(cp);
  	            id += ch;
  	            this$1.index += ch.length;
  	            // '\u' (U+005C, U+0075) denotes an escaped character.
  	            if (cp === 0x5C) {
  	                id = id.substr(0, id.length - 1);
  	                if (this$1.source.charCodeAt(this$1.index) !== 0x75) {
  	                    this$1.throwUnexpectedToken();
  	                }
  	                ++this$1.index;
  	                if (this$1.source[this$1.index] === '{') {
  	                    ++this$1.index;
  	                    ch = this$1.scanUnicodeCodePointEscape();
  	                }
  	                else {
  	                    ch = this$1.scanHexEscape('u');
  	                    cp = ch.charCodeAt(0);
  	                    if (!ch || ch === '\\' || !character_1.Character.isIdentifierPart(cp)) {
  	                        this$1.throwUnexpectedToken();
  	                    }
  	                }
  	                id += ch;
  	            }
  	        }
  	        return id;
  	    };
  	    
  	    Scanner.prototype.octalToDecimal = function (ch) {
  	        // \0 is not octal escape sequence
  	        var octal = (ch !== '0');
  	        var code = octalValue(ch);
  	        if (!this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) {
  	            octal = true;
  	            code = code * 8 + octalValue(this.source[this.index++]);
  	            // 3 digits are only allowed when string starts
  	            // with 0, 1, 2, 3
  	            if ('0123'.indexOf(ch) >= 0 && !this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) {
  	                code = code * 8 + octalValue(this.source[this.index++]);
  	            }
  	        }
  	        return {
  	            code: code,
  	            octal: octal
  	        };
  	    };
  	    
  	    // ECMA-262 11.6 Names and Keywords
  	    Scanner.prototype.scanIdentifier = function () {
  	        var type;
  	        var start = this.index;
  	        // Backslash (U+005C) starts an escaped character.
  	        var id = (this.source.charCodeAt(start) === 0x5C) ? this.getComplexIdentifier() : this.getIdentifier();
  	        // There is no keyword or literal with only one character.
  	        // Thus, it must be an identifier.
  	        if (id.length === 1) {
  	            type = token_1.Token.Identifier;
  	        }
  	        else if (this.isKeyword(id)) {
  	            type = token_1.Token.Keyword;
  	        }
  	        else if (id === 'null') {
  	            type = token_1.Token.NullLiteral;
  	        }
  	        else if (id === 'true' || id === 'false') {
  	            type = token_1.Token.BooleanLiteral;
  	        }
  	        else {
  	            type = token_1.Token.Identifier;
  	        }
  	        return {
  	            type: type,
  	            value: id,
  	            lineNumber: this.lineNumber,
  	            lineStart: this.lineStart,
  	            start: start,
  	            end: this.index
  	        };
  	    };
  	    
  	    // ECMA-262 11.7 Punctuators
  	    Scanner.prototype.scanPunctuator = function () {
  	        var token = {
  	            type: token_1.Token.Punctuator,
  	            value: '',
  	            lineNumber: this.lineNumber,
  	            lineStart: this.lineStart,
  	            start: this.index,
  	            end: this.index
  	        };
  	        // Check for most common single-character punctuators.
  	        var str = this.source[this.index];
  	        switch (str) {
  	            case '(':
  	            case '{':
  	                if (str === '{') {
  	                    this.curlyStack.push('{');
  	                }
  	                ++this.index;
  	                break;
  	            case '.':
  	                ++this.index;
  	                if (this.source[this.index] === '.' && this.source[this.index + 1] === '.') {
  	                    // Spread operator: ...
  	                    this.index += 2;
  	                    str = '...';
  	                }
  	                break;
  	            case '}':
  	                ++this.index;
  	                this.curlyStack.pop();
  	                break;
  	            case ')':
  	            case ';':
  	            case ',':
  	            case '[':
  	            case ']':
  	            case ':':
  	            case '?':
  	            case '~':
  	                ++this.index;
  	                break;
  	            default:
  	                // 4-character punctuator.
  	                str = this.source.substr(this.index, 4);
  	                if (str === '>>>=') {
  	                    this.index += 4;
  	                }
  	                else {
  	                    // 3-character punctuators.
  	                    str = str.substr(0, 3);
  	                    if (str === '===' || str === '!==' || str === '>>>' ||
  	                        str === '<<=' || str === '>>=' || str === '**=') {
  	                        this.index += 3;
  	                    }
  	                    else {
  	                        // 2-character punctuators.
  	                        str = str.substr(0, 2);
  	                        if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
  	                            str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
  	                            str === '++' || str === '--' || str === '<<' || str === '>>' ||
  	                            str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
  	                            str === '<=' || str === '>=' || str === '=>' || str === '**') {
  	                            this.index += 2;
  	                        }
  	                        else {
  	                            // 1-character punctuators.
  	                            str = this.source[this.index];
  	                            if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
  	                                ++this.index;
  	                            }
  	                        }
  	                    }
  	                }
  	        }
  	        if (this.index === token.start) {
  	            this.throwUnexpectedToken();
  	        }
  	        token.end = this.index;
  	        token.value = str;
  	        return token;
  	    };
  	    
  	    // ECMA-262 11.8.3 Numeric Literals
  	    Scanner.prototype.scanHexLiteral = function (start) {
  	        var this$1 = this;

  	        var number = '';
  	        while (!this.eof()) {
  	            if (!character_1.Character.isHexDigit(this$1.source.charCodeAt(this$1.index))) {
  	                break;
  	            }
  	            number += this$1.source[this$1.index++];
  	        }
  	        if (number.length === 0) {
  	            this.throwUnexpectedToken();
  	        }
  	        if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index))) {
  	            this.throwUnexpectedToken();
  	        }
  	        return {
  	            type: token_1.Token.NumericLiteral,
  	            value: parseInt('0x' + number, 16),
  	            lineNumber: this.lineNumber,
  	            lineStart: this.lineStart,
  	            start: start,
  	            end: this.index
  	        };
  	    };
  	    
  	    Scanner.prototype.scanBinaryLiteral = function (start) {
  	        var this$1 = this;

  	        var number = '';
  	        var ch;
  	        while (!this.eof()) {
  	            ch = this$1.source[this$1.index];
  	            if (ch !== '0' && ch !== '1') {
  	                break;
  	            }
  	            number += this$1.source[this$1.index++];
  	        }
  	        if (number.length === 0) {
  	            // only 0b or 0B
  	            this.throwUnexpectedToken();
  	        }
  	        if (!this.eof()) {
  	            ch = this.source.charCodeAt(this.index);
  	            /* istanbul ignore else */
  	            if (character_1.Character.isIdentifierStart(ch) || character_1.Character.isDecimalDigit(ch)) {
  	                this.throwUnexpectedToken();
  	            }
  	        }
  	        return {
  	            type: token_1.Token.NumericLiteral,
  	            value: parseInt(number, 2),
  	            lineNumber: this.lineNumber,
  	            lineStart: this.lineStart,
  	            start: start,
  	            end: this.index
  	        };
  	    };
  	    
  	    Scanner.prototype.scanOctalLiteral = function (prefix, start) {
  	        var this$1 = this;

  	        var number = '';
  	        var octal = false;
  	        if (character_1.Character.isOctalDigit(prefix.charCodeAt(0))) {
  	            octal = true;
  	            number = '0' + this.source[this.index++];
  	        }
  	        else {
  	            ++this.index;
  	        }
  	        while (!this.eof()) {
  	            if (!character_1.Character.isOctalDigit(this$1.source.charCodeAt(this$1.index))) {
  	                break;
  	            }
  	            number += this$1.source[this$1.index++];
  	        }
  	        if (!octal && number.length === 0) {
  	            // only 0o or 0O
  	            this.throwUnexpectedToken();
  	        }
  	        if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index)) || character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
  	            this.throwUnexpectedToken();
  	        }
  	        return {
  	            type: token_1.Token.NumericLiteral,
  	            value: parseInt(number, 8),
  	            octal: octal,
  	            lineNumber: this.lineNumber,
  	            lineStart: this.lineStart,
  	            start: start,
  	            end: this.index
  	        };
  	    };
  	    
  	    Scanner.prototype.isImplicitOctalLiteral = function () {
  	        var this$1 = this;

  	        // Implicit octal, unless there is a non-octal digit.
  	        // (Annex B.1.1 on Numeric Literals)
  	        for (var i = this.index + 1; i < this.length; ++i) {
  	            var ch = this$1.source[i];
  	            if (ch === '8' || ch === '9') {
  	                return false;
  	            }
  	            if (!character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
  	                return true;
  	            }
  	        }
  	        return true;
  	    };
  	    
  	    Scanner.prototype.scanNumericLiteral = function () {
  	        var this$1 = this;

  	        var start = this.index;
  	        var ch = this.source[start];
  	        assert_1.assert(character_1.Character.isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'), 'Numeric literal must start with a decimal digit or a decimal point');
  	        var number = '';
  	        if (ch !== '.') {
  	            number = this.source[this.index++];
  	            ch = this.source[this.index];
  	            // Hex number starts with '0x'.
  	            // Octal number starts with '0'.
  	            // Octal number in ES6 starts with '0o'.
  	            // Binary number in ES6 starts with '0b'.
  	            if (number === '0') {
  	                if (ch === 'x' || ch === 'X') {
  	                    ++this.index;
  	                    return this.scanHexLiteral(start);
  	                }
  	                if (ch === 'b' || ch === 'B') {
  	                    ++this.index;
  	                    return this.scanBinaryLiteral(start);
  	                }
  	                if (ch === 'o' || ch === 'O') {
  	                    return this.scanOctalLiteral(ch, start);
  	                }
  	                if (ch && character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
  	                    if (this.isImplicitOctalLiteral()) {
  	                        return this.scanOctalLiteral(ch, start);
  	                    }
  	                }
  	            }
  	            while (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
  	                number += this$1.source[this$1.index++];
  	            }
  	            ch = this.source[this.index];
  	        }
  	        if (ch === '.') {
  	            number += this.source[this.index++];
  	            while (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
  	                number += this$1.source[this$1.index++];
  	            }
  	            ch = this.source[this.index];
  	        }
  	        if (ch === 'e' || ch === 'E') {
  	            number += this.source[this.index++];
  	            ch = this.source[this.index];
  	            if (ch === '+' || ch === '-') {
  	                number += this.source[this.index++];
  	            }
  	            if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
  	                while (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
  	                    number += this$1.source[this$1.index++];
  	                }
  	            }
  	            else {
  	                this.throwUnexpectedToken();
  	            }
  	        }
  	        if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index))) {
  	            this.throwUnexpectedToken();
  	        }
  	        return {
  	            type: token_1.Token.NumericLiteral,
  	            value: parseFloat(number),
  	            lineNumber: this.lineNumber,
  	            lineStart: this.lineStart,
  	            start: start,
  	            end: this.index
  	        };
  	    };
  	    
  	    // ECMA-262 11.8.4 String Literals
  	    Scanner.prototype.scanStringLiteral = function () {
  	        var this$1 = this;

  	        var start = this.index;
  	        var quote = this.source[start];
  	        assert_1.assert((quote === '\'' || quote === '"'), 'String literal must starts with a quote');
  	        ++this.index;
  	        var octal = false;
  	        var str = '';
  	        while (!this.eof()) {
  	            var ch = this$1.source[this$1.index++];
  	            if (ch === quote) {
  	                quote = '';
  	                break;
  	            }
  	            else if (ch === '\\') {
  	                ch = this$1.source[this$1.index++];
  	                if (!ch || !character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
  	                    switch (ch) {
  	                        case 'u':
  	                        case 'x':
  	                            if (this$1.source[this$1.index] === '{') {
  	                                ++this$1.index;
  	                                str += this$1.scanUnicodeCodePointEscape();
  	                            }
  	                            else {
  	                                var unescaped = this$1.scanHexEscape(ch);
  	                                if (!unescaped) {
  	                                    this$1.throwUnexpectedToken();
  	                                }
  	                                str += unescaped;
  	                            }
  	                            break;
  	                        case 'n':
  	                            str += '\n';
  	                            break;
  	                        case 'r':
  	                            str += '\r';
  	                            break;
  	                        case 't':
  	                            str += '\t';
  	                            break;
  	                        case 'b':
  	                            str += '\b';
  	                            break;
  	                        case 'f':
  	                            str += '\f';
  	                            break;
  	                        case 'v':
  	                            str += '\x0B';
  	                            break;
  	                        case '8':
  	                        case '9':
  	                            str += ch;
  	                            this$1.tolerateUnexpectedToken();
  	                            break;
  	                        default:
  	                            if (ch && character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
  	                                var octToDec = this$1.octalToDecimal(ch);
  	                                octal = octToDec.octal || octal;
  	                                str += String.fromCharCode(octToDec.code);
  	                            }
  	                            else {
  	                                str += ch;
  	                            }
  	                            break;
  	                    }
  	                }
  	                else {
  	                    ++this$1.lineNumber;
  	                    if (ch === '\r' && this$1.source[this$1.index] === '\n') {
  	                        ++this$1.index;
  	                    }
  	                    this$1.lineStart = this$1.index;
  	                }
  	            }
  	            else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
  	                break;
  	            }
  	            else {
  	                str += ch;
  	            }
  	        }
  	        if (quote !== '') {
  	            this.index = start;
  	            this.throwUnexpectedToken();
  	        }
  	        return {
  	            type: token_1.Token.StringLiteral,
  	            value: str,
  	            octal: octal,
  	            lineNumber: this.lineNumber,
  	            lineStart: this.lineStart,
  	            start: start,
  	            end: this.index
  	        };
  	    };
  	    
  	    // ECMA-262 11.8.6 Template Literal Lexical Components
  	    Scanner.prototype.scanTemplate = function () {
  	        var this$1 = this;

  	        var cooked = '';
  	        var terminated = false;
  	        var start = this.index;
  	        var head = (this.source[start] === '`');
  	        var tail = false;
  	        var rawOffset = 2;
  	        ++this.index;
  	        while (!this.eof()) {
  	            var ch = this$1.source[this$1.index++];
  	            if (ch === '`') {
  	                rawOffset = 1;
  	                tail = true;
  	                terminated = true;
  	                break;
  	            }
  	            else if (ch === '$') {
  	                if (this$1.source[this$1.index] === '{') {
  	                    this$1.curlyStack.push('${');
  	                    ++this$1.index;
  	                    terminated = true;
  	                    break;
  	                }
  	                cooked += ch;
  	            }
  	            else if (ch === '\\') {
  	                ch = this$1.source[this$1.index++];
  	                if (!character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
  	                    switch (ch) {
  	                        case 'n':
  	                            cooked += '\n';
  	                            break;
  	                        case 'r':
  	                            cooked += '\r';
  	                            break;
  	                        case 't':
  	                            cooked += '\t';
  	                            break;
  	                        case 'u':
  	                        case 'x':
  	                            if (this$1.source[this$1.index] === '{') {
  	                                ++this$1.index;
  	                                cooked += this$1.scanUnicodeCodePointEscape();
  	                            }
  	                            else {
  	                                var restore = this$1.index;
  	                                var unescaped = this$1.scanHexEscape(ch);
  	                                if (unescaped) {
  	                                    cooked += unescaped;
  	                                }
  	                                else {
  	                                    this$1.index = restore;
  	                                    cooked += ch;
  	                                }
  	                            }
  	                            break;
  	                        case 'b':
  	                            cooked += '\b';
  	                            break;
  	                        case 'f':
  	                            cooked += '\f';
  	                            break;
  	                        case 'v':
  	                            cooked += '\v';
  	                            break;
  	                        default:
  	                            if (ch === '0') {
  	                                if (character_1.Character.isDecimalDigit(this$1.source.charCodeAt(this$1.index))) {
  	                                    // Illegal: \01 \02 and so on
  	                                    this$1.throwUnexpectedToken(messages_1.Messages.TemplateOctalLiteral);
  	                                }
  	                                cooked += '\0';
  	                            }
  	                            else if (character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
  	                                // Illegal: \1 \2
  	                                this$1.throwUnexpectedToken(messages_1.Messages.TemplateOctalLiteral);
  	                            }
  	                            else {
  	                                cooked += ch;
  	                            }
  	                            break;
  	                    }
  	                }
  	                else {
  	                    ++this$1.lineNumber;
  	                    if (ch === '\r' && this$1.source[this$1.index] === '\n') {
  	                        ++this$1.index;
  	                    }
  	                    this$1.lineStart = this$1.index;
  	                }
  	            }
  	            else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
  	                ++this$1.lineNumber;
  	                if (ch === '\r' && this$1.source[this$1.index] === '\n') {
  	                    ++this$1.index;
  	                }
  	                this$1.lineStart = this$1.index;
  	                cooked += '\n';
  	            }
  	            else {
  	                cooked += ch;
  	            }
  	        }
  	        if (!terminated) {
  	            this.throwUnexpectedToken();
  	        }
  	        if (!head) {
  	            this.curlyStack.pop();
  	        }
  	        return {
  	            type: token_1.Token.Template,
  	            value: {
  	                cooked: cooked,
  	                raw: this.source.slice(start + 1, this.index - rawOffset)
  	            },
  	            head: head,
  	            tail: tail,
  	            lineNumber: this.lineNumber,
  	            lineStart: this.lineStart,
  	            start: start,
  	            end: this.index
  	        };
  	    };
  	    
  	    // ECMA-262 11.8.5 Regular Expression Literals
  	    Scanner.prototype.testRegExp = function (pattern, flags) {
  	        // The BMP character to use as a replacement for astral symbols when
  	        // translating an ES6 "u"-flagged pattern to an ES5-compatible
  	        // approximation.
  	        // Note: replacing with '\uFFFF' enables false positives in unlikely
  	        // scenarios. For example, `[\u{1044f}-\u{10440}]` is an invalid
  	        // pattern that would not be detected by this substitution.
  	        var astralSubstitute = '\uFFFF';
  	        var tmp = pattern;
  	        var self = this;
  	        if (flags.indexOf('u') >= 0) {
  	            tmp = tmp
  	                .replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g, function ($0, $1, $2) {
  	                var codePoint = parseInt($1 || $2, 16);
  	                if (codePoint > 0x10FFFF) {
  	                    self.throwUnexpectedToken(messages_1.Messages.InvalidRegExp);
  	                }
  	                if (codePoint <= 0xFFFF) {
  	                    return String.fromCharCode(codePoint);
  	                }
  	                return astralSubstitute;
  	            })
  	                .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, astralSubstitute);
  	        }
  	        // First, detect invalid regular expressions.
  	        try {
  	        }
  	        catch (e) {
  	            this.throwUnexpectedToken(messages_1.Messages.InvalidRegExp);
  	        }
  	        // Return a regular expression object for this pattern-flag pair, or
  	        // `null` in case the current environment doesn't support the flags it
  	        // uses.
  	        try {
  	            return new RegExp(pattern, flags);
  	        }
  	        catch (exception) {
  	            /* istanbul ignore next */
  	            return null;
  	        }
  	    };
  	    
  	    Scanner.prototype.scanRegExpBody = function () {
  	        var this$1 = this;

  	        var ch = this.source[this.index];
  	        assert_1.assert(ch === '/', 'Regular expression literal must start with a slash');
  	        var str = this.source[this.index++];
  	        var classMarker = false;
  	        var terminated = false;
  	        while (!this.eof()) {
  	            ch = this$1.source[this$1.index++];
  	            str += ch;
  	            if (ch === '\\') {
  	                ch = this$1.source[this$1.index++];
  	                // ECMA-262 7.8.5
  	                if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
  	                    this$1.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
  	                }
  	                str += ch;
  	            }
  	            else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
  	                this$1.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
  	            }
  	            else if (classMarker) {
  	                if (ch === ']') {
  	                    classMarker = false;
  	                }
  	            }
  	            else {
  	                if (ch === '/') {
  	                    terminated = true;
  	                    break;
  	                }
  	                else if (ch === '[') {
  	                    classMarker = true;
  	                }
  	            }
  	        }
  	        if (!terminated) {
  	            this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
  	        }
  	        // Exclude leading and trailing slash.
  	        var body = str.substr(1, str.length - 2);
  	        return {
  	            value: body,
  	            literal: str
  	        };
  	    };
  	    
  	    Scanner.prototype.scanRegExpFlags = function () {
  	        var this$1 = this;

  	        var str = '';
  	        var flags = '';
  	        while (!this.eof()) {
  	            var ch = this$1.source[this$1.index];
  	            if (!character_1.Character.isIdentifierPart(ch.charCodeAt(0))) {
  	                break;
  	            }
  	            ++this$1.index;
  	            if (ch === '\\' && !this$1.eof()) {
  	                ch = this$1.source[this$1.index];
  	                if (ch === 'u') {
  	                    ++this$1.index;
  	                    var restore = this$1.index;
  	                    ch = this$1.scanHexEscape('u');
  	                    if (ch) {
  	                        flags += ch;
  	                        for (str += '\\u'; restore < this.index; ++restore) {
  	                            str += this$1.source[restore];
  	                        }
  	                    }
  	                    else {
  	                        this$1.index = restore;
  	                        flags += 'u';
  	                        str += '\\u';
  	                    }
  	                    this$1.tolerateUnexpectedToken();
  	                }
  	                else {
  	                    str += '\\';
  	                    this$1.tolerateUnexpectedToken();
  	                }
  	            }
  	            else {
  	                flags += ch;
  	                str += ch;
  	            }
  	        }
  	        return {
  	            value: flags,
  	            literal: str
  	        };
  	    };
  	    
  	    Scanner.prototype.scanRegExp = function () {
  	        var start = this.index;
  	        var body = this.scanRegExpBody();
  	        var flags = this.scanRegExpFlags();
  	        var value = this.testRegExp(body.value, flags.value);
  	        return {
  	            type: token_1.Token.RegularExpression,
  	            value: value,
  	            literal: body.literal + flags.literal,
  	            regex: {
  	                pattern: body.value,
  	                flags: flags.value
  	            },
  	            lineNumber: this.lineNumber,
  	            lineStart: this.lineStart,
  	            start: start,
  	            end: this.index
  	        };
  	    };
  	    
  	    Scanner.prototype.lex = function () {
  	        if (this.eof()) {
  	            return {
  	                type: token_1.Token.EOF,
  	                lineNumber: this.lineNumber,
  	                lineStart: this.lineStart,
  	                start: this.index,
  	                end: this.index
  	            };
  	        }
  	        var cp = this.source.charCodeAt(this.index);
  	        if (character_1.Character.isIdentifierStart(cp)) {
  	            return this.scanIdentifier();
  	        }
  	        // Very common: ( and ) and ;
  	        if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
  	            return this.scanPunctuator();
  	        }
  	        // String literal starts with single quote (U+0027) or double quote (U+0022).
  	        if (cp === 0x27 || cp === 0x22) {
  	            return this.scanStringLiteral();
  	        }
  	        // Dot (.) U+002E can also start a floating-point number, hence the need
  	        // to check the next character.
  	        if (cp === 0x2E) {
  	            if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index + 1))) {
  	                return this.scanNumericLiteral();
  	            }
  	            return this.scanPunctuator();
  	        }
  	        if (character_1.Character.isDecimalDigit(cp)) {
  	            return this.scanNumericLiteral();
  	        }
  	        // Template literals start with ` (U+0060) for template head
  	        // or } (U+007D) for template middle or template tail.
  	        if (cp === 0x60 || (cp === 0x7D && this.curlyStack[this.curlyStack.length - 1] === '${')) {
  	            return this.scanTemplate();
  	        }
  	        // Possible identifier start in a surrogate pair.
  	        if (cp >= 0xD800 && cp < 0xDFFF) {
  	            if (character_1.Character.isIdentifierStart(this.codePointAt(this.index))) {
  	                return this.scanIdentifier();
  	            }
  	        }
  	        return this.scanPunctuator();
  	    };
  	    
  	    return Scanner;
  	}());
  	exports.Scanner = Scanner;


  /***/ },
  /* 9 */
  /***/ function(module, exports) {
  	// See also tools/generate-unicode-regex.js.
  	var Regex = {
  	    // Unicode v8.0.0 NonAsciiIdentifierStart:
  	    NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,
  	    // Unicode v8.0.0 NonAsciiIdentifierPart:
  	    NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
  	};
  	exports.Character = {
  	    fromCodePoint: function (cp) {
  	        return (cp < 0x10000) ? String.fromCharCode(cp) :
  	            String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
  	                String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
  	    },
  	    // ECMA-262 11.2 White Space
  	    isWhiteSpace: function (cp) {
  	        return (cp === 0x20) || (cp === 0x09) || (cp === 0x0B) || (cp === 0x0C) || (cp === 0xA0) ||
  	            (cp >= 0x1680 && [0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(cp) >= 0);
  	    },
  	    // ECMA-262 11.3 Line Terminators
  	    isLineTerminator: function (cp) {
  	        return (cp === 0x0A) || (cp === 0x0D) || (cp === 0x2028) || (cp === 0x2029);
  	    },
  	    // ECMA-262 11.6 Identifier Names and Identifiers
  	    isIdentifierStart: function (cp) {
  	        return (cp === 0x24) || (cp === 0x5F) ||
  	            (cp >= 0x41 && cp <= 0x5A) ||
  	            (cp >= 0x61 && cp <= 0x7A) ||
  	            (cp === 0x5C) ||
  	            ((cp >= 0x80) && Regex.NonAsciiIdentifierStart.test(exports.Character.fromCodePoint(cp)));
  	    },
  	    isIdentifierPart: function (cp) {
  	        return (cp === 0x24) || (cp === 0x5F) ||
  	            (cp >= 0x41 && cp <= 0x5A) ||
  	            (cp >= 0x61 && cp <= 0x7A) ||
  	            (cp >= 0x30 && cp <= 0x39) ||
  	            (cp === 0x5C) ||
  	            ((cp >= 0x80) && Regex.NonAsciiIdentifierPart.test(exports.Character.fromCodePoint(cp)));
  	    },
  	    // ECMA-262 11.8.3 Numeric Literals
  	    isDecimalDigit: function (cp) {
  	        return (cp >= 0x30 && cp <= 0x39); // 0..9
  	    },
  	    isHexDigit: function (cp) {
  	        return (cp >= 0x30 && cp <= 0x39) ||
  	            (cp >= 0x41 && cp <= 0x46) ||
  	            (cp >= 0x61 && cp <= 0x66); // a..f
  	    },
  	    isOctalDigit: function (cp) {
  	        return (cp >= 0x30 && cp <= 0x37); // 0..7
  	    }
  	};


  /***/ },
  /* 10 */
  /***/ function(module, exports, __webpack_require__) {
  	var syntax_1 = __webpack_require__(2);
  	var ArrayExpression = (function () {
  	    function ArrayExpression(elements) {
  	        this.type = syntax_1.Syntax.ArrayExpression;
  	        this.elements = elements;
  	    }
  	    return ArrayExpression;
  	}());
  	exports.ArrayExpression = ArrayExpression;
  	var ArrayPattern = (function () {
  	    function ArrayPattern(elements) {
  	        this.type = syntax_1.Syntax.ArrayPattern;
  	        this.elements = elements;
  	    }
  	    return ArrayPattern;
  	}());
  	exports.ArrayPattern = ArrayPattern;
  	var ArrowFunctionExpression = (function () {
  	    function ArrowFunctionExpression(params, body, expression) {
  	        this.type = syntax_1.Syntax.ArrowFunctionExpression;
  	        this.id = null;
  	        this.params = params;
  	        this.body = body;
  	        this.generator = false;
  	        this.expression = expression;
  	    }
  	    return ArrowFunctionExpression;
  	}());
  	exports.ArrowFunctionExpression = ArrowFunctionExpression;
  	var AssignmentExpression = (function () {
  	    function AssignmentExpression(operator, left, right) {
  	        this.type = syntax_1.Syntax.AssignmentExpression;
  	        this.operator = operator;
  	        this.left = left;
  	        this.right = right;
  	    }
  	    return AssignmentExpression;
  	}());
  	exports.AssignmentExpression = AssignmentExpression;
  	var AssignmentPattern = (function () {
  	    function AssignmentPattern(left, right) {
  	        this.type = syntax_1.Syntax.AssignmentPattern;
  	        this.left = left;
  	        this.right = right;
  	    }
  	    return AssignmentPattern;
  	}());
  	exports.AssignmentPattern = AssignmentPattern;
  	var BinaryExpression = (function () {
  	    function BinaryExpression(operator, left, right) {
  	        var logical = (operator === '||' || operator === '&&');
  	        this.type = logical ? syntax_1.Syntax.LogicalExpression : syntax_1.Syntax.BinaryExpression;
  	        this.operator = operator;
  	        this.left = left;
  	        this.right = right;
  	    }
  	    return BinaryExpression;
  	}());
  	exports.BinaryExpression = BinaryExpression;
  	var BlockStatement = (function () {
  	    function BlockStatement(body) {
  	        this.type = syntax_1.Syntax.BlockStatement;
  	        this.body = body;
  	    }
  	    return BlockStatement;
  	}());
  	exports.BlockStatement = BlockStatement;
  	var BreakStatement = (function () {
  	    function BreakStatement(label) {
  	        this.type = syntax_1.Syntax.BreakStatement;
  	        this.label = label;
  	    }
  	    return BreakStatement;
  	}());
  	exports.BreakStatement = BreakStatement;
  	var CallExpression = (function () {
  	    function CallExpression(callee, args) {
  	        this.type = syntax_1.Syntax.CallExpression;
  	        this.callee = callee;
  	        this.arguments = args;
  	    }
  	    return CallExpression;
  	}());
  	exports.CallExpression = CallExpression;
  	var CatchClause = (function () {
  	    function CatchClause(param, body) {
  	        this.type = syntax_1.Syntax.CatchClause;
  	        this.param = param;
  	        this.body = body;
  	    }
  	    return CatchClause;
  	}());
  	exports.CatchClause = CatchClause;
  	var ClassBody = (function () {
  	    function ClassBody(body) {
  	        this.type = syntax_1.Syntax.ClassBody;
  	        this.body = body;
  	    }
  	    return ClassBody;
  	}());
  	exports.ClassBody = ClassBody;
  	var ClassDeclaration = (function () {
  	    function ClassDeclaration(id, superClass, body) {
  	        this.type = syntax_1.Syntax.ClassDeclaration;
  	        this.id = id;
  	        this.superClass = superClass;
  	        this.body = body;
  	    }
  	    return ClassDeclaration;
  	}());
  	exports.ClassDeclaration = ClassDeclaration;
  	var ClassExpression = (function () {
  	    function ClassExpression(id, superClass, body) {
  	        this.type = syntax_1.Syntax.ClassExpression;
  	        this.id = id;
  	        this.superClass = superClass;
  	        this.body = body;
  	    }
  	    return ClassExpression;
  	}());
  	exports.ClassExpression = ClassExpression;
  	var ComputedMemberExpression = (function () {
  	    function ComputedMemberExpression(object, property) {
  	        this.type = syntax_1.Syntax.MemberExpression;
  	        this.computed = true;
  	        this.object = object;
  	        this.property = property;
  	    }
  	    return ComputedMemberExpression;
  	}());
  	exports.ComputedMemberExpression = ComputedMemberExpression;
  	var ConditionalExpression = (function () {
  	    function ConditionalExpression(test, consequent, alternate) {
  	        this.type = syntax_1.Syntax.ConditionalExpression;
  	        this.test = test;
  	        this.consequent = consequent;
  	        this.alternate = alternate;
  	    }
  	    return ConditionalExpression;
  	}());
  	exports.ConditionalExpression = ConditionalExpression;
  	var ContinueStatement = (function () {
  	    function ContinueStatement(label) {
  	        this.type = syntax_1.Syntax.ContinueStatement;
  	        this.label = label;
  	    }
  	    return ContinueStatement;
  	}());
  	exports.ContinueStatement = ContinueStatement;
  	var DebuggerStatement = (function () {
  	    function DebuggerStatement() {
  	        this.type = syntax_1.Syntax.DebuggerStatement;
  	    }
  	    return DebuggerStatement;
  	}());
  	exports.DebuggerStatement = DebuggerStatement;
  	var Directive = (function () {
  	    function Directive(expression, directive) {
  	        this.type = syntax_1.Syntax.ExpressionStatement;
  	        this.expression = expression;
  	        this.directive = directive;
  	    }
  	    return Directive;
  	}());
  	exports.Directive = Directive;
  	var DoWhileStatement = (function () {
  	    function DoWhileStatement(body, test) {
  	        this.type = syntax_1.Syntax.DoWhileStatement;
  	        this.body = body;
  	        this.test = test;
  	    }
  	    return DoWhileStatement;
  	}());
  	exports.DoWhileStatement = DoWhileStatement;
  	var EmptyStatement = (function () {
  	    function EmptyStatement() {
  	        this.type = syntax_1.Syntax.EmptyStatement;
  	    }
  	    return EmptyStatement;
  	}());
  	exports.EmptyStatement = EmptyStatement;
  	var ExportAllDeclaration = (function () {
  	    function ExportAllDeclaration(source) {
  	        this.type = syntax_1.Syntax.ExportAllDeclaration;
  	        this.source = source;
  	    }
  	    return ExportAllDeclaration;
  	}());
  	exports.ExportAllDeclaration = ExportAllDeclaration;
  	var ExportDefaultDeclaration = (function () {
  	    function ExportDefaultDeclaration(declaration) {
  	        this.type = syntax_1.Syntax.ExportDefaultDeclaration;
  	        this.declaration = declaration;
  	    }
  	    return ExportDefaultDeclaration;
  	}());
  	exports.ExportDefaultDeclaration = ExportDefaultDeclaration;
  	var ExportNamedDeclaration = (function () {
  	    function ExportNamedDeclaration(declaration, specifiers, source) {
  	        this.type = syntax_1.Syntax.ExportNamedDeclaration;
  	        this.declaration = declaration;
  	        this.specifiers = specifiers;
  	        this.source = source;
  	    }
  	    return ExportNamedDeclaration;
  	}());
  	exports.ExportNamedDeclaration = ExportNamedDeclaration;
  	var ExportSpecifier = (function () {
  	    function ExportSpecifier(local, exported) {
  	        this.type = syntax_1.Syntax.ExportSpecifier;
  	        this.exported = exported;
  	        this.local = local;
  	    }
  	    return ExportSpecifier;
  	}());
  	exports.ExportSpecifier = ExportSpecifier;
  	var ExpressionStatement = (function () {
  	    function ExpressionStatement(expression) {
  	        this.type = syntax_1.Syntax.ExpressionStatement;
  	        this.expression = expression;
  	    }
  	    return ExpressionStatement;
  	}());
  	exports.ExpressionStatement = ExpressionStatement;
  	var ForInStatement = (function () {
  	    function ForInStatement(left, right, body) {
  	        this.type = syntax_1.Syntax.ForInStatement;
  	        this.left = left;
  	        this.right = right;
  	        this.body = body;
  	        this.each = false;
  	    }
  	    return ForInStatement;
  	}());
  	exports.ForInStatement = ForInStatement;
  	var ForOfStatement = (function () {
  	    function ForOfStatement(left, right, body) {
  	        this.type = syntax_1.Syntax.ForOfStatement;
  	        this.left = left;
  	        this.right = right;
  	        this.body = body;
  	    }
  	    return ForOfStatement;
  	}());
  	exports.ForOfStatement = ForOfStatement;
  	var ForStatement = (function () {
  	    function ForStatement(init, test, update, body) {
  	        this.type = syntax_1.Syntax.ForStatement;
  	        this.init = init;
  	        this.test = test;
  	        this.update = update;
  	        this.body = body;
  	    }
  	    return ForStatement;
  	}());
  	exports.ForStatement = ForStatement;
  	var FunctionDeclaration = (function () {
  	    function FunctionDeclaration(id, params, body, generator) {
  	        this.type = syntax_1.Syntax.FunctionDeclaration;
  	        this.id = id;
  	        this.params = params;
  	        this.body = body;
  	        this.generator = generator;
  	        this.expression = false;
  	    }
  	    return FunctionDeclaration;
  	}());
  	exports.FunctionDeclaration = FunctionDeclaration;
  	var FunctionExpression = (function () {
  	    function FunctionExpression(id, params, body, generator) {
  	        this.type = syntax_1.Syntax.FunctionExpression;
  	        this.id = id;
  	        this.params = params;
  	        this.body = body;
  	        this.generator = generator;
  	        this.expression = false;
  	    }
  	    return FunctionExpression;
  	}());
  	exports.FunctionExpression = FunctionExpression;
  	var Identifier = (function () {
  	    function Identifier(name) {
  	        this.type = syntax_1.Syntax.Identifier;
  	        this.name = name;
  	    }
  	    return Identifier;
  	}());
  	exports.Identifier = Identifier;
  	var IfStatement = (function () {
  	    function IfStatement(test, consequent, alternate) {
  	        this.type = syntax_1.Syntax.IfStatement;
  	        this.test = test;
  	        this.consequent = consequent;
  	        this.alternate = alternate;
  	    }
  	    return IfStatement;
  	}());
  	exports.IfStatement = IfStatement;
  	var ImportDeclaration = (function () {
  	    function ImportDeclaration(specifiers, source) {
  	        this.type = syntax_1.Syntax.ImportDeclaration;
  	        this.specifiers = specifiers;
  	        this.source = source;
  	    }
  	    return ImportDeclaration;
  	}());
  	exports.ImportDeclaration = ImportDeclaration;
  	var ImportDefaultSpecifier = (function () {
  	    function ImportDefaultSpecifier(local) {
  	        this.type = syntax_1.Syntax.ImportDefaultSpecifier;
  	        this.local = local;
  	    }
  	    return ImportDefaultSpecifier;
  	}());
  	exports.ImportDefaultSpecifier = ImportDefaultSpecifier;
  	var ImportNamespaceSpecifier = (function () {
  	    function ImportNamespaceSpecifier(local) {
  	        this.type = syntax_1.Syntax.ImportNamespaceSpecifier;
  	        this.local = local;
  	    }
  	    return ImportNamespaceSpecifier;
  	}());
  	exports.ImportNamespaceSpecifier = ImportNamespaceSpecifier;
  	var ImportSpecifier = (function () {
  	    function ImportSpecifier(local, imported) {
  	        this.type = syntax_1.Syntax.ImportSpecifier;
  	        this.local = local;
  	        this.imported = imported;
  	    }
  	    return ImportSpecifier;
  	}());
  	exports.ImportSpecifier = ImportSpecifier;
  	var LabeledStatement = (function () {
  	    function LabeledStatement(label, body) {
  	        this.type = syntax_1.Syntax.LabeledStatement;
  	        this.label = label;
  	        this.body = body;
  	    }
  	    return LabeledStatement;
  	}());
  	exports.LabeledStatement = LabeledStatement;
  	var Literal = (function () {
  	    function Literal(value, raw) {
  	        this.type = syntax_1.Syntax.Literal;
  	        this.value = value;
  	        this.raw = raw;
  	    }
  	    return Literal;
  	}());
  	exports.Literal = Literal;
  	var MetaProperty = (function () {
  	    function MetaProperty(meta, property) {
  	        this.type = syntax_1.Syntax.MetaProperty;
  	        this.meta = meta;
  	        this.property = property;
  	    }
  	    return MetaProperty;
  	}());
  	exports.MetaProperty = MetaProperty;
  	var MethodDefinition = (function () {
  	    function MethodDefinition(key, computed, value, kind, isStatic) {
  	        this.type = syntax_1.Syntax.MethodDefinition;
  	        this.key = key;
  	        this.computed = computed;
  	        this.value = value;
  	        this.kind = kind;
  	        this.static = isStatic;
  	    }
  	    return MethodDefinition;
  	}());
  	exports.MethodDefinition = MethodDefinition;
  	var NewExpression = (function () {
  	    function NewExpression(callee, args) {
  	        this.type = syntax_1.Syntax.NewExpression;
  	        this.callee = callee;
  	        this.arguments = args;
  	    }
  	    return NewExpression;
  	}());
  	exports.NewExpression = NewExpression;
  	var ObjectExpression = (function () {
  	    function ObjectExpression(properties) {
  	        this.type = syntax_1.Syntax.ObjectExpression;
  	        this.properties = properties;
  	    }
  	    return ObjectExpression;
  	}());
  	exports.ObjectExpression = ObjectExpression;
  	var ObjectPattern = (function () {
  	    function ObjectPattern(properties) {
  	        this.type = syntax_1.Syntax.ObjectPattern;
  	        this.properties = properties;
  	    }
  	    return ObjectPattern;
  	}());
  	exports.ObjectPattern = ObjectPattern;
  	var Program = (function () {
  	    function Program(body, sourceType) {
  	        this.type = syntax_1.Syntax.Program;
  	        this.body = body;
  	        this.sourceType = sourceType;
  	    }
  	    return Program;
  	}());
  	exports.Program = Program;
  	var Property = (function () {
  	    function Property(kind, key, computed, value, method, shorthand) {
  	        this.type = syntax_1.Syntax.Property;
  	        this.key = key;
  	        this.computed = computed;
  	        this.value = value;
  	        this.kind = kind;
  	        this.method = method;
  	        this.shorthand = shorthand;
  	    }
  	    return Property;
  	}());
  	exports.Property = Property;
  	var RegexLiteral = (function () {
  	    function RegexLiteral(value, raw, regex) {
  	        this.type = syntax_1.Syntax.Literal;
  	        this.value = value;
  	        this.raw = raw;
  	        this.regex = regex;
  	    }
  	    return RegexLiteral;
  	}());
  	exports.RegexLiteral = RegexLiteral;
  	var RestElement = (function () {
  	    function RestElement(argument) {
  	        this.type = syntax_1.Syntax.RestElement;
  	        this.argument = argument;
  	    }
  	    return RestElement;
  	}());
  	exports.RestElement = RestElement;
  	var ReturnStatement = (function () {
  	    function ReturnStatement(argument) {
  	        this.type = syntax_1.Syntax.ReturnStatement;
  	        this.argument = argument;
  	    }
  	    return ReturnStatement;
  	}());
  	exports.ReturnStatement = ReturnStatement;
  	var SequenceExpression = (function () {
  	    function SequenceExpression(expressions) {
  	        this.type = syntax_1.Syntax.SequenceExpression;
  	        this.expressions = expressions;
  	    }
  	    return SequenceExpression;
  	}());
  	exports.SequenceExpression = SequenceExpression;
  	var SpreadElement = (function () {
  	    function SpreadElement(argument) {
  	        this.type = syntax_1.Syntax.SpreadElement;
  	        this.argument = argument;
  	    }
  	    return SpreadElement;
  	}());
  	exports.SpreadElement = SpreadElement;
  	var StaticMemberExpression = (function () {
  	    function StaticMemberExpression(object, property) {
  	        this.type = syntax_1.Syntax.MemberExpression;
  	        this.computed = false;
  	        this.object = object;
  	        this.property = property;
  	    }
  	    return StaticMemberExpression;
  	}());
  	exports.StaticMemberExpression = StaticMemberExpression;
  	var Super = (function () {
  	    function Super() {
  	        this.type = syntax_1.Syntax.Super;
  	    }
  	    return Super;
  	}());
  	exports.Super = Super;
  	var SwitchCase = (function () {
  	    function SwitchCase(test, consequent) {
  	        this.type = syntax_1.Syntax.SwitchCase;
  	        this.test = test;
  	        this.consequent = consequent;
  	    }
  	    return SwitchCase;
  	}());
  	exports.SwitchCase = SwitchCase;
  	var SwitchStatement = (function () {
  	    function SwitchStatement(discriminant, cases) {
  	        this.type = syntax_1.Syntax.SwitchStatement;
  	        this.discriminant = discriminant;
  	        this.cases = cases;
  	    }
  	    return SwitchStatement;
  	}());
  	exports.SwitchStatement = SwitchStatement;
  	var TaggedTemplateExpression = (function () {
  	    function TaggedTemplateExpression(tag, quasi) {
  	        this.type = syntax_1.Syntax.TaggedTemplateExpression;
  	        this.tag = tag;
  	        this.quasi = quasi;
  	    }
  	    return TaggedTemplateExpression;
  	}());
  	exports.TaggedTemplateExpression = TaggedTemplateExpression;
  	var TemplateElement = (function () {
  	    function TemplateElement(value, tail) {
  	        this.type = syntax_1.Syntax.TemplateElement;
  	        this.value = value;
  	        this.tail = tail;
  	    }
  	    return TemplateElement;
  	}());
  	exports.TemplateElement = TemplateElement;
  	var TemplateLiteral = (function () {
  	    function TemplateLiteral(quasis, expressions) {
  	        this.type = syntax_1.Syntax.TemplateLiteral;
  	        this.quasis = quasis;
  	        this.expressions = expressions;
  	    }
  	    return TemplateLiteral;
  	}());
  	exports.TemplateLiteral = TemplateLiteral;
  	var ThisExpression = (function () {
  	    function ThisExpression() {
  	        this.type = syntax_1.Syntax.ThisExpression;
  	    }
  	    return ThisExpression;
  	}());
  	exports.ThisExpression = ThisExpression;
  	var ThrowStatement = (function () {
  	    function ThrowStatement(argument) {
  	        this.type = syntax_1.Syntax.ThrowStatement;
  	        this.argument = argument;
  	    }
  	    return ThrowStatement;
  	}());
  	exports.ThrowStatement = ThrowStatement;
  	var TryStatement = (function () {
  	    function TryStatement(block, handler, finalizer) {
  	        this.type = syntax_1.Syntax.TryStatement;
  	        this.block = block;
  	        this.handler = handler;
  	        this.finalizer = finalizer;
  	    }
  	    return TryStatement;
  	}());
  	exports.TryStatement = TryStatement;
  	var UnaryExpression = (function () {
  	    function UnaryExpression(operator, argument) {
  	        this.type = syntax_1.Syntax.UnaryExpression;
  	        this.operator = operator;
  	        this.argument = argument;
  	        this.prefix = true;
  	    }
  	    return UnaryExpression;
  	}());
  	exports.UnaryExpression = UnaryExpression;
  	var UpdateExpression = (function () {
  	    function UpdateExpression(operator, argument, prefix) {
  	        this.type = syntax_1.Syntax.UpdateExpression;
  	        this.operator = operator;
  	        this.argument = argument;
  	        this.prefix = prefix;
  	    }
  	    return UpdateExpression;
  	}());
  	exports.UpdateExpression = UpdateExpression;
  	var VariableDeclaration = (function () {
  	    function VariableDeclaration(declarations, kind) {
  	        this.type = syntax_1.Syntax.VariableDeclaration;
  	        this.declarations = declarations;
  	        this.kind = kind;
  	    }
  	    return VariableDeclaration;
  	}());
  	exports.VariableDeclaration = VariableDeclaration;
  	var VariableDeclarator = (function () {
  	    function VariableDeclarator(id, init) {
  	        this.type = syntax_1.Syntax.VariableDeclarator;
  	        this.id = id;
  	        this.init = init;
  	    }
  	    return VariableDeclarator;
  	}());
  	exports.VariableDeclarator = VariableDeclarator;
  	var WhileStatement = (function () {
  	    function WhileStatement(test, body) {
  	        this.type = syntax_1.Syntax.WhileStatement;
  	        this.test = test;
  	        this.body = body;
  	    }
  	    return WhileStatement;
  	}());
  	exports.WhileStatement = WhileStatement;
  	var WithStatement = (function () {
  	    function WithStatement(object, body) {
  	        this.type = syntax_1.Syntax.WithStatement;
  	        this.object = object;
  	        this.body = body;
  	    }
  	    return WithStatement;
  	}());
  	exports.WithStatement = WithStatement;
  	var YieldExpression = (function () {
  	    function YieldExpression(argument, delegate) {
  	        this.type = syntax_1.Syntax.YieldExpression;
  	        this.argument = argument;
  	        this.delegate = delegate;
  	    }
  	    return YieldExpression;
  	}());
  	exports.YieldExpression = YieldExpression;


  /***/ },
  /* 11 */
  /***/ function(module, exports, __webpack_require__) {
  /* istanbul ignore next */
  	var __extends = (this && this.__extends) || function (d, b) {
  	    for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } }
  	    function __() { this.constructor = d; }
  	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  	};
  	var character_1 = __webpack_require__(9);
  	var token_1 = __webpack_require__(7);
  	var parser_1 = __webpack_require__(3);
  	var xhtml_entities_1 = __webpack_require__(12);
  	var jsx_syntax_1 = __webpack_require__(13);
  	var Node = __webpack_require__(10);
  	var JSXNode = __webpack_require__(14);
  	var JSXToken;
  	(function (JSXToken) {
  	    JSXToken[JSXToken["Identifier"] = 100] = "Identifier";
  	    JSXToken[JSXToken["Text"] = 101] = "Text";
  	})(JSXToken || (JSXToken = {}));
  	token_1.TokenName[JSXToken.Identifier] = 'JSXIdentifier';
  	token_1.TokenName[JSXToken.Text] = 'JSXText';
  	// Fully qualified element name, e.g. <svg:path> returns "svg:path"
  	function getQualifiedElementName(elementName) {
  	    var qualifiedName;
  	    switch (elementName.type) {
  	        case jsx_syntax_1.JSXSyntax.JSXIdentifier:
  	            var id = (elementName);
  	            qualifiedName = id.name;
  	            break;
  	        case jsx_syntax_1.JSXSyntax.JSXNamespacedName:
  	            var ns = (elementName);
  	            qualifiedName = getQualifiedElementName(ns.namespace) + ':' +
  	                getQualifiedElementName(ns.name);
  	            break;
  	        case jsx_syntax_1.JSXSyntax.JSXMemberExpression:
  	            var expr = (elementName);
  	            qualifiedName = getQualifiedElementName(expr.object) + '.' +
  	                getQualifiedElementName(expr.property);
  	            break;
  	    }
  	    return qualifiedName;
  	}
  	var JSXParser = (function (_super) {
  	    __extends(JSXParser, _super);
  	    function JSXParser(code, options, delegate) {
  	        _super.call(this, code, options, delegate);
  	    }
  	    JSXParser.prototype.parsePrimaryExpression = function () {
  	        return this.match('<') ? this.parseJSXRoot() : _super.prototype.parsePrimaryExpression.call(this);
  	    };
  	    JSXParser.prototype.startJSX = function () {
  	        // Unwind the scanner before the lookahead token.
  	        this.scanner.index = this.startMarker.index;
  	        this.scanner.lineNumber = this.startMarker.lineNumber;
  	        this.scanner.lineStart = this.startMarker.lineStart;
  	    };
  	    JSXParser.prototype.finishJSX = function () {
  	        // Prime the next lookahead.
  	        this.nextToken();
  	    };
  	    JSXParser.prototype.reenterJSX = function () {
  	        this.startJSX();
  	        this.expectJSX('}');
  	        // Pop the closing '}' added from the lookahead.
  	        if (this.config.tokens) {
  	            this.tokens.pop();
  	        }
  	    };
  	    JSXParser.prototype.createJSXNode = function () {
  	        this.collectComments();
  	        return {
  	            index: this.scanner.index,
  	            line: this.scanner.lineNumber,
  	            column: this.scanner.index - this.scanner.lineStart
  	        };
  	    };
  	    JSXParser.prototype.createJSXChildNode = function () {
  	        return {
  	            index: this.scanner.index,
  	            line: this.scanner.lineNumber,
  	            column: this.scanner.index - this.scanner.lineStart
  	        };
  	    };
  	    JSXParser.prototype.scanXHTMLEntity = function (quote) {
  	        var this$1 = this;

  	        var result = '&';
  	        var valid = true;
  	        var terminated = false;
  	        var numeric = false;
  	        var hex = false;
  	        while (!this.scanner.eof() && valid && !terminated) {
  	            var ch = this$1.scanner.source[this$1.scanner.index];
  	            if (ch === quote) {
  	                break;
  	            }
  	            terminated = (ch === ';');
  	            result += ch;
  	            ++this$1.scanner.index;
  	            if (!terminated) {
  	                switch (result.length) {
  	                    case 2:
  	                        // e.g. '&#123;'
  	                        numeric = (ch === '#');
  	                        break;
  	                    case 3:
  	                        if (numeric) {
  	                            // e.g. '&#x41;'
  	                            hex = (ch === 'x');
  	                            valid = hex || character_1.Character.isDecimalDigit(ch.charCodeAt(0));
  	                            numeric = numeric && !hex;
  	                        }
  	                        break;
  	                    default:
  	                        valid = valid && !(numeric && !character_1.Character.isDecimalDigit(ch.charCodeAt(0)));
  	                        valid = valid && !(hex && !character_1.Character.isHexDigit(ch.charCodeAt(0)));
  	                        break;
  	                }
  	            }
  	        }
  	        if (valid && terminated && result.length > 2) {
  	            // e.g. '&#x41;' becomes just '#x41'
  	            var str = result.substr(1, result.length - 2);
  	            if (numeric && str.length > 1) {
  	                result = String.fromCharCode(parseInt(str.substr(1), 10));
  	            }
  	            else if (hex && str.length > 2) {
  	                result = String.fromCharCode(parseInt('0' + str.substr(1), 16));
  	            }
  	            else if (!numeric && !hex && xhtml_entities_1.XHTMLEntities[str]) {
  	                result = xhtml_entities_1.XHTMLEntities[str];
  	            }
  	        }
  	        return result;
  	    };
  	    // Scan the next JSX token. This replaces Scanner#lex when in JSX mode.
  	    JSXParser.prototype.lexJSX = function () {
  	        var this$1 = this;

  	        var cp = this.scanner.source.charCodeAt(this.scanner.index);
  	        // < > / : = { }
  	        if (cp === 60 || cp === 62 || cp === 47 || cp === 58 || cp === 61 || cp === 123 || cp === 125) {
  	            var value = this.scanner.source[this.scanner.index++];
  	            return {
  	                type: token_1.Token.Punctuator,
  	                value: value,
  	                lineNumber: this.scanner.lineNumber,
  	                lineStart: this.scanner.lineStart,
  	                start: this.scanner.index - 1,
  	                end: this.scanner.index
  	            };
  	        }
  	        // " '
  	        if (cp === 34 || cp === 39) {
  	            var start = this.scanner.index;
  	            var quote = this.scanner.source[this.scanner.index++];
  	            var str = '';
  	            while (!this.scanner.eof()) {
  	                var ch = this$1.scanner.source[this$1.scanner.index++];
  	                if (ch === quote) {
  	                    break;
  	                }
  	                else if (ch === '&') {
  	                    str += this$1.scanXHTMLEntity(quote);
  	                }
  	                else {
  	                    str += ch;
  	                }
  	            }
  	            return {
  	                type: token_1.Token.StringLiteral,
  	                value: str,
  	                lineNumber: this.scanner.lineNumber,
  	                lineStart: this.scanner.lineStart,
  	                start: start,
  	                end: this.scanner.index
  	            };
  	        }
  	        // ... or .
  	        if (cp === 46) {
  	            var n1 = this.scanner.source.charCodeAt(this.scanner.index + 1);
  	            var n2 = this.scanner.source.charCodeAt(this.scanner.index + 2);
  	            var value = (n1 === 46 && n2 === 46) ? '...' : '.';
  	            var start = this.scanner.index;
  	            this.scanner.index += value.length;
  	            return {
  	                type: token_1.Token.Punctuator,
  	                value: value,
  	                lineNumber: this.scanner.lineNumber,
  	                lineStart: this.scanner.lineStart,
  	                start: start,
  	                end: this.scanner.index
  	            };
  	        }
  	        // `
  	        if (cp === 96) {
  	            // Only placeholder, since it will be rescanned as a real assignment expression.
  	            return {
  	                type: token_1.Token.Template,
  	                lineNumber: this.scanner.lineNumber,
  	                lineStart: this.scanner.lineStart,
  	                start: this.scanner.index,
  	                end: this.scanner.index
  	            };
  	        }
  	        // Identifer can not contain backslash (char code 92).
  	        if (character_1.Character.isIdentifierStart(cp) && (cp !== 92)) {
  	            var start = this.scanner.index;
  	            ++this.scanner.index;
  	            while (!this.scanner.eof()) {
  	                var ch = this$1.scanner.source.charCodeAt(this$1.scanner.index);
  	                if (character_1.Character.isIdentifierPart(ch) && (ch !== 92)) {
  	                    ++this$1.scanner.index;
  	                }
  	                else if (ch === 45) {
  	                    // Hyphen (char code 45) can be part of an identifier.
  	                    ++this$1.scanner.index;
  	                }
  	                else {
  	                    break;
  	                }
  	            }
  	            var id = this.scanner.source.slice(start, this.scanner.index);
  	            return {
  	                type: JSXToken.Identifier,
  	                value: id,
  	                lineNumber: this.scanner.lineNumber,
  	                lineStart: this.scanner.lineStart,
  	                start: start,
  	                end: this.scanner.index
  	            };
  	        }
  	        this.scanner.throwUnexpectedToken();
  	    };
  	    JSXParser.prototype.nextJSXToken = function () {
  	        this.collectComments();
  	        this.startMarker.index = this.scanner.index;
  	        this.startMarker.lineNumber = this.scanner.lineNumber;
  	        this.startMarker.lineStart = this.scanner.lineStart;
  	        var token = this.lexJSX();
  	        this.lastMarker.index = this.scanner.index;
  	        this.lastMarker.lineNumber = this.scanner.lineNumber;
  	        this.lastMarker.lineStart = this.scanner.lineStart;
  	        if (this.config.tokens) {
  	            this.tokens.push(this.convertToken(token));
  	        }
  	        return token;
  	    };
  	    JSXParser.prototype.nextJSXText = function () {
  	        var this$1 = this;

  	        this.startMarker.index = this.scanner.index;
  	        this.startMarker.lineNumber = this.scanner.lineNumber;
  	        this.startMarker.lineStart = this.scanner.lineStart;
  	        var start = this.scanner.index;
  	        var text = '';
  	        while (!this.scanner.eof()) {
  	            var ch = this$1.scanner.source[this$1.scanner.index];
  	            if (ch === '{' || ch === '<') {
  	                break;
  	            }
  	            ++this$1.scanner.index;
  	            text += ch;
  	            if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
  	                ++this$1.scanner.lineNumber;
  	                if (ch === '\r' && this$1.scanner.source[this$1.scanner.index] === '\n') {
  	                    ++this$1.scanner.index;
  	                }
  	                this$1.scanner.lineStart = this$1.scanner.index;
  	            }
  	        }
  	        this.lastMarker.index = this.scanner.index;
  	        this.lastMarker.lineNumber = this.scanner.lineNumber;
  	        this.lastMarker.lineStart = this.scanner.lineStart;
  	        var token = {
  	            type: JSXToken.Text,
  	            value: text,
  	            lineNumber: this.scanner.lineNumber,
  	            lineStart: this.scanner.lineStart,
  	            start: start,
  	            end: this.scanner.index
  	        };
  	        if ((text.length > 0) && this.config.tokens) {
  	            this.tokens.push(this.convertToken(token));
  	        }
  	        return token;
  	    };
  	    JSXParser.prototype.peekJSXToken = function () {
  	        var previousIndex = this.scanner.index;
  	        var previousLineNumber = this.scanner.lineNumber;
  	        var previousLineStart = this.scanner.lineStart;
  	        this.scanner.scanComments();
  	        var next = this.lexJSX();
  	        this.scanner.index = previousIndex;
  	        this.scanner.lineNumber = previousLineNumber;
  	        this.scanner.lineStart = previousLineStart;
  	        return next;
  	    };
  	    // Expect the next JSX token to match the specified punctuator.
  	    // If not, an exception will be thrown.
  	    JSXParser.prototype.expectJSX = function (value) {
  	        var token = this.nextJSXToken();
  	        if (token.type !== token_1.Token.Punctuator || token.value !== value) {
  	            this.throwUnexpectedToken(token);
  	        }
  	    };
  	    // Return true if the next JSX token matches the specified punctuator.
  	    JSXParser.prototype.matchJSX = function (value) {
  	        var next = this.peekJSXToken();
  	        return next.type === token_1.Token.Punctuator && next.value === value;
  	    };
  	    JSXParser.prototype.parseJSXIdentifier = function () {
  	        var node = this.createJSXNode();
  	        var token = this.nextJSXToken();
  	        if (token.type !== JSXToken.Identifier) {
  	            this.throwUnexpectedToken(token);
  	        }
  	        return this.finalize(node, new JSXNode.JSXIdentifier(token.value));
  	    };
  	    JSXParser.prototype.parseJSXElementName = function () {
  	        var this$1 = this;

  	        var node = this.createJSXNode();
  	        var elementName = this.parseJSXIdentifier();
  	        if (this.matchJSX(':')) {
  	            var namespace = elementName;
  	            this.expectJSX(':');
  	            var name_1 = this.parseJSXIdentifier();
  	            elementName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_1));
  	        }
  	        else if (this.matchJSX('.')) {
  	            while (this.matchJSX('.')) {
  	                var object = elementName;
  	                this$1.expectJSX('.');
  	                var property = this$1.parseJSXIdentifier();
  	                elementName = this$1.finalize(node, new JSXNode.JSXMemberExpression(object, property));
  	            }
  	        }
  	        return elementName;
  	    };
  	    JSXParser.prototype.parseJSXAttributeName = function () {
  	        var node = this.createJSXNode();
  	        var attributeName;
  	        var identifier = this.parseJSXIdentifier();
  	        if (this.matchJSX(':')) {
  	            var namespace = identifier;
  	            this.expectJSX(':');
  	            var name_2 = this.parseJSXIdentifier();
  	            attributeName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_2));
  	        }
  	        else {
  	            attributeName = identifier;
  	        }
  	        return attributeName;
  	    };
  	    JSXParser.prototype.parseJSXStringLiteralAttribute = function () {
  	        var node = this.createJSXNode();
  	        var token = this.nextJSXToken();
  	        if (token.type !== token_1.Token.StringLiteral) {
  	            this.throwUnexpectedToken(token);
  	        }
  	        var raw = this.getTokenRaw(token);
  	        return this.finalize(node, new Node.Literal(token.value, raw));
  	    };
  	    JSXParser.prototype.parseJSXExpressionAttribute = function () {
  	        var node = this.createJSXNode();
  	        this.expectJSX('{');
  	        this.finishJSX();
  	        if (this.match('}')) {
  	            this.tolerateError('JSX attributes must only be assigned a non-empty expression');
  	        }
  	        var expression = this.parseAssignmentExpression();
  	        this.reenterJSX();
  	        return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
  	    };
  	    JSXParser.prototype.parseJSXAttributeValue = function () {
  	        return this.matchJSX('{') ? this.parseJSXExpressionAttribute() :
  	            this.matchJSX('<') ? this.parseJSXElement() : this.parseJSXStringLiteralAttribute();
  	    };
  	    JSXParser.prototype.parseJSXNameValueAttribute = function () {
  	        var node = this.createJSXNode();
  	        var name = this.parseJSXAttributeName();
  	        var value = null;
  	        if (this.matchJSX('=')) {
  	            this.expectJSX('=');
  	            value = this.parseJSXAttributeValue();
  	        }
  	        return this.finalize(node, new JSXNode.JSXAttribute(name, value));
  	    };
  	    JSXParser.prototype.parseJSXSpreadAttribute = function () {
  	        var node = this.createJSXNode();
  	        this.expectJSX('{');
  	        this.expectJSX('...');
  	        this.finishJSX();
  	        var argument = this.parseAssignmentExpression();
  	        this.reenterJSX();
  	        return this.finalize(node, new JSXNode.JSXSpreadAttribute(argument));
  	    };
  	    JSXParser.prototype.parseJSXAttributes = function () {
  	        var this$1 = this;

  	        var attributes = [];
  	        while (!this.matchJSX('/') && !this.matchJSX('>')) {
  	            var attribute = this$1.matchJSX('{') ? this$1.parseJSXSpreadAttribute() :
  	                this$1.parseJSXNameValueAttribute();
  	            attributes.push(attribute);
  	        }
  	        return attributes;
  	    };
  	    JSXParser.prototype.parseJSXOpeningElement = function () {
  	        var node = this.createJSXNode();
  	        this.expectJSX('<');
  	        var name = this.parseJSXElementName();
  	        var attributes = this.parseJSXAttributes();
  	        var selfClosing = this.matchJSX('/');
  	        if (selfClosing) {
  	            this.expectJSX('/');
  	        }
  	        this.expectJSX('>');
  	        return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
  	    };
  	    JSXParser.prototype.parseJSXBoundaryElement = function () {
  	        var node = this.createJSXNode();
  	        this.expectJSX('<');
  	        if (this.matchJSX('/')) {
  	            this.expectJSX('/');
  	            var name_3 = this.parseJSXElementName();
  	            this.expectJSX('>');
  	            return this.finalize(node, new JSXNode.JSXClosingElement(name_3));
  	        }
  	        var name = this.parseJSXElementName();
  	        var attributes = this.parseJSXAttributes();
  	        var selfClosing = this.matchJSX('/');
  	        if (selfClosing) {
  	            this.expectJSX('/');
  	        }
  	        this.expectJSX('>');
  	        return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
  	    };
  	    JSXParser.prototype.parseJSXEmptyExpression = function () {
  	        var node = this.createJSXChildNode();
  	        this.collectComments();
  	        this.lastMarker.index = this.scanner.index;
  	        this.lastMarker.lineNumber = this.scanner.lineNumber;
  	        this.lastMarker.lineStart = this.scanner.lineStart;
  	        return this.finalize(node, new JSXNode.JSXEmptyExpression());
  	    };
  	    JSXParser.prototype.parseJSXExpressionContainer = function () {
  	        var node = this.createJSXNode();
  	        this.expectJSX('{');
  	        var expression;
  	        if (this.matchJSX('}')) {
  	            expression = this.parseJSXEmptyExpression();
  	            this.expectJSX('}');
  	        }
  	        else {
  	            this.finishJSX();
  	            expression = this.parseAssignmentExpression();
  	            this.reenterJSX();
  	        }
  	        return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
  	    };
  	    JSXParser.prototype.parseJSXChildren = function () {
  	        var this$1 = this;

  	        var children = [];
  	        while (!this.scanner.eof()) {
  	            var node = this$1.createJSXChildNode();
  	            var token = this$1.nextJSXText();
  	            if (token.start < token.end) {
  	                var raw = this$1.getTokenRaw(token);
  	                var child = this$1.finalize(node, new JSXNode.JSXText(token.value, raw));
  	                children.push(child);
  	            }
  	            if (this$1.scanner.source[this$1.scanner.index] === '{') {
  	                var container = this$1.parseJSXExpressionContainer();
  	                children.push(container);
  	            }
  	            else {
  	                break;
  	            }
  	        }
  	        return children;
  	    };
  	    JSXParser.prototype.parseComplexJSXElement = function (el) {
  	        var this$1 = this;

  	        var stack = [];
  	        while (!this.scanner.eof()) {
  	            el.children = el.children.concat(this$1.parseJSXChildren());
  	            var node = this$1.createJSXChildNode();
  	            var element = this$1.parseJSXBoundaryElement();
  	            if (element.type === jsx_syntax_1.JSXSyntax.JSXOpeningElement) {
  	                var opening = (element);
  	                if (opening.selfClosing) {
  	                    var child = this$1.finalize(node, new JSXNode.JSXElement(opening, [], null));
  	                    el.children.push(child);
  	                }
  	                else {
  	                    stack.push(el);
  	                    el = { node: node, opening: opening, closing: null, children: [] };
  	                }
  	            }
  	            if (element.type === jsx_syntax_1.JSXSyntax.JSXClosingElement) {
  	                el.closing = (element);
  	                var open_1 = getQualifiedElementName(el.opening.name);
  	                var close_1 = getQualifiedElementName(el.closing.name);
  	                if (open_1 !== close_1) {
  	                    this$1.tolerateError('Expected corresponding JSX closing tag for %0', open_1);
  	                }
  	                if (stack.length > 0) {
  	                    var child = this$1.finalize(el.node, new JSXNode.JSXElement(el.opening, el.children, el.closing));
  	                    el = stack.pop();
  	                    el.children.push(child);
  	                }
  	                else {
  	                    break;
  	                }
  	            }
  	        }
  	        return el;
  	    };
  	    JSXParser.prototype.parseJSXElement = function () {
  	        var node = this.createJSXNode();
  	        var opening = this.parseJSXOpeningElement();
  	        var children = [];
  	        var closing = null;
  	        if (!opening.selfClosing) {
  	            var el = this.parseComplexJSXElement({ node: node, opening: opening, closing: closing, children: children });
  	            children = el.children;
  	            closing = el.closing;
  	        }
  	        return this.finalize(node, new JSXNode.JSXElement(opening, children, closing));
  	    };
  	    JSXParser.prototype.parseJSXRoot = function () {
  	        // Pop the opening '<' added from the lookahead.
  	        if (this.config.tokens) {
  	            this.tokens.pop();
  	        }
  	        this.startJSX();
  	        var element = this.parseJSXElement();
  	        this.finishJSX();
  	        return element;
  	    };
  	    return JSXParser;
  	}(parser_1.Parser));
  	exports.JSXParser = JSXParser;


  /***/ },
  /* 12 */
  /***/ function(module, exports) {
  	exports.XHTMLEntities = {
  	    quot: '\u0022',
  	    amp: '\u0026',
  	    apos: '\u0027',
  	    gt: '\u003E',
  	    nbsp: '\u00A0',
  	    iexcl: '\u00A1',
  	    cent: '\u00A2',
  	    pound: '\u00A3',
  	    curren: '\u00A4',
  	    yen: '\u00A5',
  	    brvbar: '\u00A6',
  	    sect: '\u00A7',
  	    uml: '\u00A8',
  	    copy: '\u00A9',
  	    ordf: '\u00AA',
  	    laquo: '\u00AB',
  	    not: '\u00AC',
  	    shy: '\u00AD',
  	    reg: '\u00AE',
  	    macr: '\u00AF',
  	    deg: '\u00B0',
  	    plusmn: '\u00B1',
  	    sup2: '\u00B2',
  	    sup3: '\u00B3',
  	    acute: '\u00B4',
  	    micro: '\u00B5',
  	    para: '\u00B6',
  	    middot: '\u00B7',
  	    cedil: '\u00B8',
  	    sup1: '\u00B9',
  	    ordm: '\u00BA',
  	    raquo: '\u00BB',
  	    frac14: '\u00BC',
  	    frac12: '\u00BD',
  	    frac34: '\u00BE',
  	    iquest: '\u00BF',
  	    Agrave: '\u00C0',
  	    Aacute: '\u00C1',
  	    Acirc: '\u00C2',
  	    Atilde: '\u00C3',
  	    Auml: '\u00C4',
  	    Aring: '\u00C5',
  	    AElig: '\u00C6',
  	    Ccedil: '\u00C7',
  	    Egrave: '\u00C8',
  	    Eacute: '\u00C9',
  	    Ecirc: '\u00CA',
  	    Euml: '\u00CB',
  	    Igrave: '\u00CC',
  	    Iacute: '\u00CD',
  	    Icirc: '\u00CE',
  	    Iuml: '\u00CF',
  	    ETH: '\u00D0',
  	    Ntilde: '\u00D1',
  	    Ograve: '\u00D2',
  	    Oacute: '\u00D3',
  	    Ocirc: '\u00D4',
  	    Otilde: '\u00D5',
  	    Ouml: '\u00D6',
  	    times: '\u00D7',
  	    Oslash: '\u00D8',
  	    Ugrave: '\u00D9',
  	    Uacute: '\u00DA',
  	    Ucirc: '\u00DB',
  	    Uuml: '\u00DC',
  	    Yacute: '\u00DD',
  	    THORN: '\u00DE',
  	    szlig: '\u00DF',
  	    agrave: '\u00E0',
  	    aacute: '\u00E1',
  	    acirc: '\u00E2',
  	    atilde: '\u00E3',
  	    auml: '\u00E4',
  	    aring: '\u00E5',
  	    aelig: '\u00E6',
  	    ccedil: '\u00E7',
  	    egrave: '\u00E8',
  	    eacute: '\u00E9',
  	    ecirc: '\u00EA',
  	    euml: '\u00EB',
  	    igrave: '\u00EC',
  	    iacute: '\u00ED',
  	    icirc: '\u00EE',
  	    iuml: '\u00EF',
  	    eth: '\u00F0',
  	    ntilde: '\u00F1',
  	    ograve: '\u00F2',
  	    oacute: '\u00F3',
  	    ocirc: '\u00F4',
  	    otilde: '\u00F5',
  	    ouml: '\u00F6',
  	    divide: '\u00F7',
  	    oslash: '\u00F8',
  	    ugrave: '\u00F9',
  	    uacute: '\u00FA',
  	    ucirc: '\u00FB',
  	    uuml: '\u00FC',
  	    yacute: '\u00FD',
  	    thorn: '\u00FE',
  	    yuml: '\u00FF',
  	    OElig: '\u0152',
  	    oelig: '\u0153',
  	    Scaron: '\u0160',
  	    scaron: '\u0161',
  	    Yuml: '\u0178',
  	    fnof: '\u0192',
  	    circ: '\u02C6',
  	    tilde: '\u02DC',
  	    Alpha: '\u0391',
  	    Beta: '\u0392',
  	    Gamma: '\u0393',
  	    Delta: '\u0394',
  	    Epsilon: '\u0395',
  	    Zeta: '\u0396',
  	    Eta: '\u0397',
  	    Theta: '\u0398',
  	    Iota: '\u0399',
  	    Kappa: '\u039A',
  	    Lambda: '\u039B',
  	    Mu: '\u039C',
  	    Nu: '\u039D',
  	    Xi: '\u039E',
  	    Omicron: '\u039F',
  	    Pi: '\u03A0',
  	    Rho: '\u03A1',
  	    Sigma: '\u03A3',
  	    Tau: '\u03A4',
  	    Upsilon: '\u03A5',
  	    Phi: '\u03A6',
  	    Chi: '\u03A7',
  	    Psi: '\u03A8',
  	    Omega: '\u03A9',
  	    alpha: '\u03B1',
  	    beta: '\u03B2',
  	    gamma: '\u03B3',
  	    delta: '\u03B4',
  	    epsilon: '\u03B5',
  	    zeta: '\u03B6',
  	    eta: '\u03B7',
  	    theta: '\u03B8',
  	    iota: '\u03B9',
  	    kappa: '\u03BA',
  	    lambda: '\u03BB',
  	    mu: '\u03BC',
  	    nu: '\u03BD',
  	    xi: '\u03BE',
  	    omicron: '\u03BF',
  	    pi: '\u03C0',
  	    rho: '\u03C1',
  	    sigmaf: '\u03C2',
  	    sigma: '\u03C3',
  	    tau: '\u03C4',
  	    upsilon: '\u03C5',
  	    phi: '\u03C6',
  	    chi: '\u03C7',
  	    psi: '\u03C8',
  	    omega: '\u03C9',
  	    thetasym: '\u03D1',
  	    upsih: '\u03D2',
  	    piv: '\u03D6',
  	    ensp: '\u2002',
  	    emsp: '\u2003',
  	    thinsp: '\u2009',
  	    zwnj: '\u200C',
  	    zwj: '\u200D',
  	    lrm: '\u200E',
  	    rlm: '\u200F',
  	    ndash: '\u2013',
  	    mdash: '\u2014',
  	    lsquo: '\u2018',
  	    rsquo: '\u2019',
  	    sbquo: '\u201A',
  	    ldquo: '\u201C',
  	    rdquo: '\u201D',
  	    bdquo: '\u201E',
  	    dagger: '\u2020',
  	    Dagger: '\u2021',
  	    bull: '\u2022',
  	    hellip: '\u2026',
  	    permil: '\u2030',
  	    prime: '\u2032',
  	    Prime: '\u2033',
  	    lsaquo: '\u2039',
  	    rsaquo: '\u203A',
  	    oline: '\u203E',
  	    frasl: '\u2044',
  	    euro: '\u20AC',
  	    image: '\u2111',
  	    weierp: '\u2118',
  	    real: '\u211C',
  	    trade: '\u2122',
  	    alefsym: '\u2135',
  	    larr: '\u2190',
  	    uarr: '\u2191',
  	    rarr: '\u2192',
  	    darr: '\u2193',
  	    harr: '\u2194',
  	    crarr: '\u21B5',
  	    lArr: '\u21D0',
  	    uArr: '\u21D1',
  	    rArr: '\u21D2',
  	    dArr: '\u21D3',
  	    hArr: '\u21D4',
  	    forall: '\u2200',
  	    part: '\u2202',
  	    exist: '\u2203',
  	    empty: '\u2205',
  	    nabla: '\u2207',
  	    isin: '\u2208',
  	    notin: '\u2209',
  	    ni: '\u220B',
  	    prod: '\u220F',
  	    sum: '\u2211',
  	    minus: '\u2212',
  	    lowast: '\u2217',
  	    radic: '\u221A',
  	    prop: '\u221D',
  	    infin: '\u221E',
  	    ang: '\u2220',
  	    and: '\u2227',
  	    or: '\u2228',
  	    cap: '\u2229',
  	    cup: '\u222A',
  	    int: '\u222B',
  	    there4: '\u2234',
  	    sim: '\u223C',
  	    cong: '\u2245',
  	    asymp: '\u2248',
  	    ne: '\u2260',
  	    equiv: '\u2261',
  	    le: '\u2264',
  	    ge: '\u2265',
  	    sub: '\u2282',
  	    sup: '\u2283',
  	    nsub: '\u2284',
  	    sube: '\u2286',
  	    supe: '\u2287',
  	    oplus: '\u2295',
  	    otimes: '\u2297',
  	    perp: '\u22A5',
  	    sdot: '\u22C5',
  	    lceil: '\u2308',
  	    rceil: '\u2309',
  	    lfloor: '\u230A',
  	    rfloor: '\u230B',
  	    loz: '\u25CA',
  	    spades: '\u2660',
  	    clubs: '\u2663',
  	    hearts: '\u2665',
  	    diams: '\u2666',
  	    lang: '\u27E8',
  	    rang: '\u27E9'
  	};


  /***/ },
  /* 13 */
  /***/ function(module, exports) {
  	exports.JSXSyntax = {
  	    JSXAttribute: 'JSXAttribute',
  	    JSXClosingElement: 'JSXClosingElement',
  	    JSXElement: 'JSXElement',
  	    JSXEmptyExpression: 'JSXEmptyExpression',
  	    JSXExpressionContainer: 'JSXExpressionContainer',
  	    JSXIdentifier: 'JSXIdentifier',
  	    JSXMemberExpression: 'JSXMemberExpression',
  	    JSXNamespacedName: 'JSXNamespacedName',
  	    JSXOpeningElement: 'JSXOpeningElement',
  	    JSXSpreadAttribute: 'JSXSpreadAttribute',
  	    JSXText: 'JSXText'
  	};


  /***/ },
  /* 14 */
  /***/ function(module, exports, __webpack_require__) {
  	var jsx_syntax_1 = __webpack_require__(13);
  	var JSXClosingElement = (function () {
  	    function JSXClosingElement(name) {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXClosingElement;
  	        this.name = name;
  	    }
  	    return JSXClosingElement;
  	}());
  	exports.JSXClosingElement = JSXClosingElement;
  	var JSXElement = (function () {
  	    function JSXElement(openingElement, children, closingElement) {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXElement;
  	        this.openingElement = openingElement;
  	        this.children = children;
  	        this.closingElement = closingElement;
  	    }
  	    return JSXElement;
  	}());
  	exports.JSXElement = JSXElement;
  	var JSXEmptyExpression = (function () {
  	    function JSXEmptyExpression() {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXEmptyExpression;
  	    }
  	    return JSXEmptyExpression;
  	}());
  	exports.JSXEmptyExpression = JSXEmptyExpression;
  	var JSXExpressionContainer = (function () {
  	    function JSXExpressionContainer(expression) {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXExpressionContainer;
  	        this.expression = expression;
  	    }
  	    return JSXExpressionContainer;
  	}());
  	exports.JSXExpressionContainer = JSXExpressionContainer;
  	var JSXIdentifier = (function () {
  	    function JSXIdentifier(name) {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXIdentifier;
  	        this.name = name;
  	    }
  	    return JSXIdentifier;
  	}());
  	exports.JSXIdentifier = JSXIdentifier;
  	var JSXMemberExpression = (function () {
  	    function JSXMemberExpression(object, property) {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXMemberExpression;
  	        this.object = object;
  	        this.property = property;
  	    }
  	    return JSXMemberExpression;
  	}());
  	exports.JSXMemberExpression = JSXMemberExpression;
  	var JSXAttribute = (function () {
  	    function JSXAttribute(name, value) {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXAttribute;
  	        this.name = name;
  	        this.value = value;
  	    }
  	    return JSXAttribute;
  	}());
  	exports.JSXAttribute = JSXAttribute;
  	var JSXNamespacedName = (function () {
  	    function JSXNamespacedName(namespace, name) {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXNamespacedName;
  	        this.namespace = namespace;
  	        this.name = name;
  	    }
  	    return JSXNamespacedName;
  	}());
  	exports.JSXNamespacedName = JSXNamespacedName;
  	var JSXOpeningElement = (function () {
  	    function JSXOpeningElement(name, selfClosing, attributes) {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXOpeningElement;
  	        this.name = name;
  	        this.selfClosing = selfClosing;
  	        this.attributes = attributes;
  	    }
  	    return JSXOpeningElement;
  	}());
  	exports.JSXOpeningElement = JSXOpeningElement;
  	var JSXSpreadAttribute = (function () {
  	    function JSXSpreadAttribute(argument) {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXSpreadAttribute;
  	        this.argument = argument;
  	    }
  	    return JSXSpreadAttribute;
  	}());
  	exports.JSXSpreadAttribute = JSXSpreadAttribute;
  	var JSXText = (function () {
  	    function JSXText(value, raw) {
  	        this.type = jsx_syntax_1.JSXSyntax.JSXText;
  	        this.value = value;
  	        this.raw = raw;
  	    }
  	    return JSXText;
  	}());
  	exports.JSXText = JSXText;


  /***/ },
  /* 15 */
  /***/ function(module, exports, __webpack_require__) {
  	var scanner_1 = __webpack_require__(8);
  	var error_handler_1 = __webpack_require__(6);
  	var token_1 = __webpack_require__(7);
  	var Reader = (function () {
  	    function Reader() {
  	        this.values = [];
  	        this.curly = this.paren = -1;
  	    }
  	    
  	    // A function following one of those tokens is an expression.
  	    Reader.prototype.beforeFunctionExpression = function (t) {
  	        return ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
  	            'return', 'case', 'delete', 'throw', 'void',
  	            // assignment operators
  	            '=', '+=', '-=', '*=', '**=', '/=', '%=', '<<=', '>>=', '>>>=',
  	            '&=', '|=', '^=', ',',
  	            // binary/unary operators
  	            '+', '-', '*', '**', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
  	            '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
  	            '<=', '<', '>', '!=', '!=='].indexOf(t) >= 0;
  	    };
  	    
  	    // Determine if forward slash (/) is an operator or part of a regular expression
  	    // https://github.com/mozilla/sweet.js/wiki/design
  	    Reader.prototype.isRegexStart = function () {
  	        var previous = this.values[this.values.length - 1];
  	        var regex = (previous !== null);
  	        switch (previous) {
  	            case 'this':
  	            case ']':
  	                regex = false;
  	                break;
  	            case ')':
  	                var check = this.values[this.paren - 1];
  	                regex = (check === 'if' || check === 'while' || check === 'for' || check === 'with');
  	                break;
  	            case '}':
  	                // Dividing a function by anything makes little sense,
  	                // but we have to check for that.
  	                regex = false;
  	                if (this.values[this.curly - 3] === 'function') {
  	                    // Anonymous function, e.g. function(){} /42
  	                    var check_1 = this.values[this.curly - 4];
  	                    regex = check_1 ? !this.beforeFunctionExpression(check_1) : false;
  	                }
  	                else if (this.values[this.curly - 4] === 'function') {
  	                    // Named function, e.g. function f(){} /42/
  	                    var check_2 = this.values[this.curly - 5];
  	                    regex = check_2 ? !this.beforeFunctionExpression(check_2) : true;
  	                }
  	        }
  	        return regex;
  	    };
  	    
  	    Reader.prototype.push = function (token) {
  	        if (token.type === token_1.Token.Punctuator || token.type === token_1.Token.Keyword) {
  	            if (token.value === '{') {
  	                this.curly = this.values.length;
  	            }
  	            else if (token.value === '(') {
  	                this.paren = this.values.length;
  	            }
  	            this.values.push(token.value);
  	        }
  	        else {
  	            this.values.push(null);
  	        }
  	    };
  	    
  	    return Reader;
  	}());
  	var Tokenizer = (function () {
  	    function Tokenizer(code, config) {
  	        this.errorHandler = new error_handler_1.ErrorHandler();
  	        this.errorHandler.tolerant = config ? (typeof config.tolerant === 'boolean' && config.tolerant) : false;
  	        this.scanner = new scanner_1.Scanner(code, this.errorHandler);
  	        this.scanner.trackComment = config ? (typeof config.comment === 'boolean' && config.comment) : false;
  	        this.trackRange = config ? (typeof config.range === 'boolean' && config.range) : false;
  	        this.trackLoc = config ? (typeof config.loc === 'boolean' && config.loc) : false;
  	        this.buffer = [];
  	        this.reader = new Reader();
  	    }
  	    
  	    Tokenizer.prototype.errors = function () {
  	        return this.errorHandler.errors;
  	    };
  	    
  	    Tokenizer.prototype.getNextToken = function () {
  	        var this$1 = this;

  	        if (this.buffer.length === 0) {
  	            var comments = this.scanner.scanComments();
  	            if (this.scanner.trackComment) {
  	                for (var i = 0; i < comments.length; ++i) {
  	                    var e = comments[i];
  	                    var comment = void 0;
  	                    var value = this$1.scanner.source.slice(e.slice[0], e.slice[1]);
  	                    comment = {
  	                        type: e.multiLine ? 'BlockComment' : 'LineComment',
  	                        value: value
  	                    };
  	                    if (this$1.trackRange) {
  	                        comment.range = e.range;
  	                    }
  	                    if (this$1.trackLoc) {
  	                        comment.loc = e.loc;
  	                    }
  	                    this$1.buffer.push(comment);
  	                }
  	            }
  	            if (!this.scanner.eof()) {
  	                var loc = void 0;
  	                if (this.trackLoc) {
  	                    loc = {
  	                        start: {
  	                            line: this.scanner.lineNumber,
  	                            column: this.scanner.index - this.scanner.lineStart
  	                        },
  	                        end: {}
  	                    };
  	                }
  	                var token = void 0;
  	                if (this.scanner.source[this.scanner.index] === '/') {
  	                    token = this.reader.isRegexStart() ? this.scanner.scanRegExp() : this.scanner.scanPunctuator();
  	                }
  	                else {
  	                    token = this.scanner.lex();
  	                }
  	                this.reader.push(token);
  	                var entry = void 0;
  	                entry = {
  	                    type: token_1.TokenName[token.type],
  	                    value: this.scanner.source.slice(token.start, token.end)
  	                };
  	                if (this.trackRange) {
  	                    entry.range = [token.start, token.end];
  	                }
  	                if (this.trackLoc) {
  	                    loc.end = {
  	                        line: this.scanner.lineNumber,
  	                        column: this.scanner.index - this.scanner.lineStart
  	                    };
  	                    entry.loc = loc;
  	                }
  	                if (token.regex) {
  	                    entry.regex = token.regex;
  	                }
  	                this.buffer.push(entry);
  	            }
  	        }
  	        return this.buffer.shift();
  	    };
  	    
  	    return Tokenizer;
  	}());
  	exports.Tokenizer = Tokenizer;


  /***/ }
  /******/ ])
  });

  });

  var index = hoist;

  function hoist(ast){

    var parentStack = [];
    var variables = [];
    var functions = [];

    if (Array.isArray(ast)){

      walkAll(ast);
      prependScope(ast, variables, functions);
      
    } else {
      walk(ast);
    }

    return ast

    // walk through each node of a program of block statement
    function walkAll(nodes){
      var result = null;
      for (var i=0;i<nodes.length;i++){
        var childNode = nodes[i];
        if (childNode.type === 'EmptyStatement') { continue }
        var result = walk(childNode);
        if (result === 'remove'){
          nodes.splice(i--, 1);
        }
      }
    }

    function walk(node){
      var parent = parentStack[parentStack.length-1];
      var remove = false;
      parentStack.push(node);

      var excludeBody = false;
      if (shouldScope(node, parent)){
        hoist(node.body);
        excludeBody = true;
      }

      if (node.type === 'VariableDeclarator'){
        variables.push(node);
      }

      if (node.type === 'FunctionDeclaration'){
        functions.push(node);
        remove = true;
      }

      for (var key in node){
        if (key === 'type' || (excludeBody && key === 'body')) { continue }
        if (key in node && node[key] && typeof node[key] == 'object'){
          if (node[key].type){
            walk(node[key]);
          } else if (Array.isArray(node[key])){
            walkAll(node[key]);
          }
        }
      }

      parentStack.pop();
      if (remove){
        return 'remove'
      }
    }
  }

  function shouldScope(node, parent){
    if (node.type === 'Program'){
      return true
    } else if (node.type === 'BlockStatement'){
      if (parent && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')){
        return true
      }
    }
  }

  function prependScope(nodes, variables, functions){
    if (variables && variables.length){
      var declarations = [];
      for (var i=0;i<variables.length;i++){
        declarations.push({
          type: 'VariableDeclarator', 
          id: variables[i].id,
          init: null
        });
      }
      
      nodes.unshift({
        type: 'VariableDeclaration', 
        kind: 'var', 
        declarations: declarations
      });

    }

    if (functions && functions.length){
      for (var i=0;i<functions.length;i++){
        nodes.unshift(functions[i]); 
      }
    }
  }

  var maxIterations = 1000000;
  var parse = esprima.parse;

  // 'eval' with a controlled environment
  function safeEval(src, parentContext){
    var tree = prepareAst(src);
    var context = Object.create(parentContext || {});
    return finalValue(evaluateAst(tree, context))
  }

  safeEval.func = FunctionFactory();

  // create a 'Function' constructor for a controlled environment
  function FunctionFactory(parentContext){
    var context = Object.create(parentContext || {});
    return function Function() {
      // normalize arguments array
      var args = Array.prototype.slice.call(arguments);
      var src = args.slice(-1)[0];
      args = args.slice(0,-1);
      if (typeof src === 'string'){
        //HACK: esprima doesn't like returns outside functions
        src = parse('function a(){ ' + src + '}').body[0].body;
      }
      var tree = prepareAst(src);
      return getFunction(tree, args, context)
    }
  }

  // takes an AST or js source and returns an AST
  function prepareAst(src){
    var tree = (typeof src === 'string') ? parse(src) : src;
    return index(tree)
  }

  // evaluate an AST in the given context
  function evaluateAst(tree, context){

    var safeFunction = FunctionFactory(context);
    var primitives = Primitives(context);

    // block scoped context for catch (ex) and 'let'
    var blockContext = context;

    return walk(tree)

    // recursively walk every node in an array
    function walkAll(nodes){
      var result = undefined;
      for (var i=0;i<nodes.length;i++){
        var childNode = nodes[i];
        if (childNode.type === 'EmptyStatement') { continue }
        result = walk(childNode);
        if (result instanceof ReturnValue){
          return result
        }
      }
      return result
    }

    // recursively evalutate the node of an AST
    function walk(node){
      if (!node) { return }

      switch (node.type) {

        case 'Program':
          return walkAll(node.body )

        case 'BlockStatement':
          enterBlock();
          var result = walkAll(node.body);
          leaveBlock();
          return result

        case 'SequenceExpression':
          return walkAll(node.expressions)

        case 'FunctionDeclaration':
          var params = node.params.map(getName);
          var value = getFunction(node.body, params, blockContext);
          return context[node.id.name] = value

        case 'FunctionExpression':
          var params = node.params.map(getName);
          return getFunction(node.body, params, blockContext)

        case 'ReturnStatement':
          var value = walk(node.argument);
          return new ReturnValue('return', value)

        case 'BreakStatement':
          return new ReturnValue('break')

        case 'ContinueStatement':
          return new ReturnValue('continue')

        case 'ExpressionStatement':
          return walk(node.expression)

        case 'AssignmentExpression':
          return setValue(blockContext, node.left, node.right, node.operator)

        case 'UpdateExpression':
          return setValue(blockContext, node.argument, null, node.operator)

        case 'VariableDeclaration':
          node.declarations.forEach(function(declaration){
            var target = node.kind === 'let' ? blockContext : context;
            if (declaration.init){
              target[declaration.id.name] = walk(declaration.init);
            } else {
              target[declaration.id.name] = undefined;
            }
          });
          break

        case 'SwitchStatement':
          var defaultHandler = null;
          var matched = false;
          var value = walk(node.discriminant);
          var result = undefined;

          enterBlock();

          var i = 0;
          while (result == null){
            if (i<node.cases.length){
              if (node.cases[i].test){ // check or fall through
                matched = matched || (walk(node.cases[i].test) === value);
              } else if (defaultHandler == null) {
                defaultHandler = i;
              }
              if (matched){
                var r = walkAll(node.cases[i].consequent);
                if (r instanceof ReturnValue){ // break out
                  if (r.type == 'break') { break }
                  result = r;
                }
              }
              i += 1; // continue
            } else if (!matched && defaultHandler != null){
              // go back and do the default handler
              i = defaultHandler;
              matched = true;
            } else {
              // nothing we can do
              break
            }
          }

          leaveBlock();
          return result

        case 'IfStatement':
          if (walk(node.test)){
            return walk(node.consequent)
          } else if (node.alternate) {
            return walk(node.alternate)
          }

        case 'ForStatement':
          var infinite = InfiniteChecker(maxIterations);
          var result = undefined;

          enterBlock(); // allow lets on delarations
          for (walk(node.init); walk(node.test); walk(node.update)){
            var r = walk(node.body);

            // handle early return, continue and break
            if (r instanceof ReturnValue){
              if (r.type == 'continue') { continue }
              if (r.type == 'break') { break }
              result = r;
              break
            }

            infinite.check();
          }
          leaveBlock();
          return result

        case 'ForInStatement':
          var infinite = InfiniteChecker(maxIterations);
          var result = undefined;

          var value = walk(node.right);
          var property = node.left;

          var target = context;
          enterBlock();

          if (property.type == 'VariableDeclaration'){
            walk(property);
            property = property.declarations[0].id;
            if (property.kind === 'let'){
              target = blockContext;
            }
          }

          for (var key in value){
            setValue(target, property, {type: 'Literal', value: key});
            var r = walk(node.body);

            // handle early return, continue and break
            if (r instanceof ReturnValue){
              if (r.type == 'continue') { continue }
              if (r.type == 'break') { break }
              result = r;
              break
            }

            infinite.check();
          }
          leaveBlock();

          return result

        case 'WhileStatement':
          var infinite = InfiniteChecker(maxIterations);
          while (walk(node.test)){
            walk(node.body);
            infinite.check();
          }
          break

        case 'TryStatement':
          try {
            walk(node.block);
          } catch (error) {
            enterBlock();
            var catchClause = node.handlers[0];
            if (catchClause) {
              blockContext[catchClause.param.name] = error;
              walk(catchClause.body);
            }
            leaveBlock();
          } finally {
            if (node.finalizer) {
              walk(node.finalizer);
            }
          }
          break

        case 'Literal':
          return node.value

        case 'UnaryExpression':
          var val = walk(node.argument);
          switch(node.operator) {
            case '+': return +val
            case '-': return -val
            case '~': return ~val
            case '!': return !val
            case 'void': return void val
            case 'typeof': return typeof val
            default: return unsupportedExpression(node)
          }

        case 'ArrayExpression':
          var obj = blockContext['Array']();
          for (var i=0;i<node.elements.length;i++){
            obj.push(walk(node.elements[i]));
          }
          return obj

        case 'ObjectExpression':
          var obj = blockContext['Object']();
          for (var i = 0; i < node.properties.length; i++) {
            var prop = node.properties[i];
            var value = (prop.value === null) ? prop.value : walk(prop.value);
            obj[prop.key.value || prop.key.name] = value;
          }
          return obj

        case 'NewExpression':
          var args = node.arguments.map(function(arg){
            return walk(arg)
          });
          var target = walk(node.callee);
          return primitives.applyNew(target, args)


        case 'BinaryExpression':
          var l = walk(node.left);
          var r = walk(node.right);

          switch(node.operator) {
            case '==':  return l === r
            case '===': return l === r
            case '!=':  return l != r
            case '!==': return l !== r
            case '+':   return l + r
            case '-':   return l - r
            case '*':   return l * r
            case '/':   return l / r
            case '%':   return l % r
            case '<':   return l < r
            case '<=':  return l <= r
            case '>':   return l > r
            case '>=':  return l >= r
            case '|':   return l | r
            case '&':   return l & r
            case '^':   return l ^ r
            case 'in':  return l in r
            case 'instanceof': return l instanceof r
            default: return unsupportedExpression(node)
          }

        case 'LogicalExpression':
          switch(node.operator) {
            case '&&':  return walk(node.left) && walk(node.right)
            case '||':  return walk(node.left) || walk(node.right)
            default: return unsupportedExpression(node)
          }

        case 'ThisExpression':
          return blockContext['this']

        case 'Identifier':
          if (node.name === 'undefined'){
            return undefined
          } else if (hasProperty(blockContext, node.name, primitives)){
            return finalValue(blockContext[node.name])
          } else {
            throw new ReferenceError(node.name + ' is not defined')
          }

        case 'CallExpression':

          var args = node.arguments.map(function(arg){
            return walk(arg)
          });
          var object = null;
          var target = walk(node.callee);

          if (node.callee.type === 'MemberExpression'){
            object = walk(node.callee.object);
          }
          return target.apply(object, args)

        case 'MemberExpression':
          var obj = walk(node.object);
          if (node.computed){
            var prop = walk(node.property);
          } else {
            var prop = node.property.name;
          }
          obj = primitives.getPropertyObject(obj, prop);
          return checkValue(obj[prop]);

        case 'ConditionalExpression':
          var val = walk(node.test);
          return val ? walk(node.consequent) : walk(node.alternate)

        case 'EmptyStatement':
          return

        default:
          return unsupportedExpression(node)
      }
    }

    // safely retrieve a value
    function checkValue(value){
      if (value === Function){
        value = safeFunction;
      }
      return finalValue(value)
    }

    // block scope context control
    function enterBlock(){
      blockContext = Object.create(blockContext);
    }
    function leaveBlock(){
      blockContext = Object.getPrototypeOf(blockContext);
    }

    // set a value in the specified context if allowed
    function setValue(object, left, right, operator){
      var name = null;

      if (left.type === 'Identifier'){
        name = left.name;
        // handle parent context shadowing
        object = objectForKey(object, name, primitives);
      } else if (left.type === 'MemberExpression'){
        if (left.computed){
          name = walk(left.property);
        } else {
          name = left.property.name;
        }
        object = walk(left.object);
      }

      // stop built in properties from being able to be changed
      if (canSetProperty(object, name, primitives)){
        switch(operator) {
          case undefined: return object[name] = walk(right)
          case '=':  return object[name] = walk(right)
          case '+=': return object[name] += walk(right)
          case '-=': return object[name] -= walk(right)
          case '++': return object[name]++
          case '--': return object[name]--
        }
      }

    }

  }

  // when an unsupported expression is encountered, throw an error
  function unsupportedExpression(node){
    console.error(node);
    var err = new Error('Unsupported expression: ' + node.type);
    err.node = node;
    throw err
  }

  // walk a provided object's prototypal hierarchy to retrieve an inherited object
  function objectForKey(object, key, primitives){
    var proto = primitives.getPrototypeOf(object);
    if (!proto || hasOwnProperty(object, key)){
      return object
    } else {
      return objectForKey(proto, key, primitives)
    }
  }

  function hasProperty(object, key, primitives){
    var proto = primitives.getPrototypeOf(object);
    var hasOwn = hasOwnProperty(object, key);
    if (object[key] !== undefined){
      return true
    } else if (!proto || hasOwn){
      return hasOwn
    } else {
      return hasProperty(proto, key, primitives)
    }
  }

  function hasOwnProperty(object, key){
    return Object.prototype.hasOwnProperty.call(object, key)
  }

  function propertyIsEnumerable(object, key){
    return Object.prototype.propertyIsEnumerable.call(object, key)
  }


  // determine if we have write access to a property
  function canSetProperty(object, property, primitives){
    if (property === '__proto__' || primitives.isPrimitive(object)){
      return false
    } else if (object != null){

      if (hasOwnProperty(object, property)){
        if (propertyIsEnumerable(object, property)){
          return true
        } else {
          return false
        }
      } else {
        return canSetProperty(primitives.getPrototypeOf(object), property, primitives)
      }

    } else {
      return true
    }
  }

  // generate a function with specified context
  function getFunction(body, params, parentContext){
    return function(){
      var context = Object.create(parentContext),
        g = getGlobal();

      context['window'] = context['global'] = g;

      if (this == g) {
        context['this'] = null;
      } else {
        context['this'] = this;
      }
      // normalize arguments array
      var args = Array.prototype.slice.call(arguments);
      context['arguments'] = arguments;
      args.forEach(function(arg,idx){
        var param = params[idx];
        if (param){
          context[param] = arg;
        }
      });
      var result = evaluateAst(body, context);

      if (result instanceof ReturnValue){
        return result.value
      }
    }
  }

  function finalValue(value){
    if (value instanceof ReturnValue){
      return value.value
    }
    return value
  }

  // get the name of an identifier
  function getName(identifier){
    return identifier.name
  }

  // a ReturnValue struct for differentiating between expression result and return statement
  function ReturnValue(type, value){
    this.type = type;
    this.value = value;
  }

  /**
   * The riot template engine
   * @version v3.0.8
   */

  var skipRegex = (function () { //eslint-disable-line no-unused-vars

    var beforeReChars = '[{(,;:?=|&!^~>%*/';

    var beforeReWords = [
      'case',
      'default',
      'do',
      'else',
      'in',
      'instanceof',
      'prefix',
      'return',
      'typeof',
      'void',
      'yield'
    ];

    var wordsLastChar = beforeReWords.reduce(function (s, w) {
      return s + w.slice(-1)
    }, '');

    var RE_REGEX = /^\/(?=[^*>/])[^[/\\]*(?:(?:\\.|\[(?:\\.|[^\]\\]*)*\])[^[\\/]*)*?\/[gimuy]*/;
    var RE_VN_CHAR = /[$\w]/;

    function prev (code, pos) {
      while (--pos >= 0 && /\s/.test(code[pos])){ }
      return pos
    }

    function _skipRegex (code, start) {

      var re = /.*/g;
      var pos = re.lastIndex = start++;
      var match = re.exec(code)[0].match(RE_REGEX);

      if (match) {
        var next = pos + match[0].length;

        pos = prev(code, pos);
        var c = code[pos];

        if (pos < 0 || ~beforeReChars.indexOf(c)) {
          return next
        }

        if (c === '.') {

          if (code[pos - 1] === '.') {
            start = next;
          }

        } else if (c === '+' || c === '-') {

          if (code[--pos] !== c ||
              (pos = prev(code, pos)) < 0 ||
              !RE_VN_CHAR.test(code[pos])) {
            start = next;
          }

        } else if (~wordsLastChar.indexOf(c)) {

          var end = pos + 1;

          while (--pos >= 0 && RE_VN_CHAR.test(code[pos])){ }
          if (~beforeReWords.indexOf(code.slice(pos + 1, end))) {
            start = next;
          }
        }
      }

      return start
    }

    return _skipRegex

  })();

  /**
   * riot.util.brackets
   *
   * - `brackets    ` - Returns a string or regex based on its parameter
   * - `brackets.set` - Change the current riot brackets
   *
   * @module
   */

  /* global riot */

  var brackets = (function (UNDEF) {

    var
      REGLOB = 'g',

      R_MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,

      R_STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|`[^`\\]*(?:\\[\S\s][^`\\]*)*`/g,

      S_QBLOCKS = R_STRINGS.source + '|' +
        /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' +
        /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?([^<]\/)[gim]*/.source,

      UNSUPPORTED = RegExp('[\\' + 'x00-\\x1F<>a-zA-Z0-9\'",;\\\\]'),

      NEED_ESCAPE = /(?=[[\]()*+?.^$|])/g,

      S_QBLOCK2 = R_STRINGS.source + '|' + /(\/)(?![*\/])/.source,

      FINDBRACES = {
        '(': RegExp('([()])|'   + S_QBLOCK2, REGLOB),
        '[': RegExp('([[\\]])|' + S_QBLOCK2, REGLOB),
        '{': RegExp('([{}])|'   + S_QBLOCK2, REGLOB)
      },

      DEFAULT = '{ }';

    var _pairs = [
      '{', '}',
      '{', '}',
      /{[^}]*}/,
      /\\([{}])/g,
      /\\({)|{/g,
      RegExp('\\\\(})|([[({])|(})|' + S_QBLOCK2, REGLOB),
      DEFAULT,
      /^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/,
      /(^|[^\\]){=[\S\s]*?}/
    ];

    var
      cachedBrackets = UNDEF,
      _regex,
      _cache = [],
      _settings;

    function _loopback (re) { return re }

    function _rewrite (re, bp) {
      if (!bp) { bp = _cache; }
      return new RegExp(
        re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : ''
      )
    }

    function _create (pair) {
      if (pair === DEFAULT) { return _pairs }

      var arr = pair.split(' ');

      if (arr.length !== 2 || UNSUPPORTED.test(pair)) {
        throw new Error('Unsupported brackets "' + pair + '"')
      }
      arr = arr.concat(pair.replace(NEED_ESCAPE, '\\').split(' '));

      arr[4] = _rewrite(arr[1].length > 1 ? /{[\S\s]*?}/ : _pairs[4], arr);
      arr[5] = _rewrite(pair.length > 3 ? /\\({|})/g : _pairs[5], arr);
      arr[6] = _rewrite(_pairs[6], arr);
      arr[7] = RegExp('\\\\(' + arr[3] + ')|([[({])|(' + arr[3] + ')|' + S_QBLOCK2, REGLOB);
      arr[8] = pair;
      return arr
    }

    function _brackets (reOrIdx) {
      return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _cache[reOrIdx]
    }

    _brackets.split = function split (str, tmpl, _bp) {
      // istanbul ignore next: _bp is for the compiler
      if (!_bp) { _bp = _cache; }

      var
        parts = [],
        match,
        isexpr,
        start,
        pos,
        re = _bp[6];

      var qblocks = [];
      var prevStr = '';
      var mark, lastIndex;

      isexpr = start = re.lastIndex = 0;

      while ((match = re.exec(str))) {

        lastIndex = re.lastIndex;
        pos = match.index;

        if (isexpr) {

          if (match[2]) {

            var ch = match[2];
            var rech = FINDBRACES[ch];
            var ix = 1;

            rech.lastIndex = lastIndex;
            while ((match = rech.exec(str))) {
              if (match[1]) {
                if (match[1] === ch) { ++ix; }
                else if (!--ix) { break }
              } else {
                rech.lastIndex = pushQBlock(match.index, rech.lastIndex, match[2]);
              }
            }
            re.lastIndex = ix ? str.length : rech.lastIndex;
            continue
          }

          if (!match[3]) {
            re.lastIndex = pushQBlock(pos, lastIndex, match[4]);
            continue
          }
        }

        if (!match[1]) {
          unescapeStr(str.slice(start, pos));
          start = re.lastIndex;
          re = _bp[6 + (isexpr ^= 1)];
          re.lastIndex = start;
        }
      }

      if (str && start < str.length) {
        unescapeStr(str.slice(start));
      }

      parts.qblocks = qblocks;

      return parts

      function unescapeStr (s) {
        if (prevStr) {
          s = prevStr + s;
          prevStr = '';
        }
        if (tmpl || isexpr) {
          parts.push(s && s.replace(_bp[5], '$1'));
        } else {
          parts.push(s);
        }
      }

      function pushQBlock(_pos, _lastIndex, slash) { //eslint-disable-line
        if (slash) {
          _lastIndex = skipRegex(str, _pos);
        }

        if (tmpl && _lastIndex > _pos + 2) {
          mark = '\u2057' + qblocks.length + '~';
          qblocks.push(str.slice(_pos, _lastIndex));
          prevStr += str.slice(start, _pos) + mark;
          start = _lastIndex;
        }
        return _lastIndex
      }
    };

    _brackets.hasExpr = function hasExpr (str) {
      return _cache[4].test(str)
    };

    _brackets.loopKeys = function loopKeys (expr) {
      var m = expr.match(_cache[9]);

      return m
        ? { key: m[1], pos: m[2], val: _cache[0] + m[3].trim() + _cache[1] }
        : { val: expr.trim() }
    };

    _brackets.array = function array (pair) {
      return pair ? _create(pair) : _cache
    };

    function _reset (pair) {
      if ((pair || (pair = DEFAULT)) !== _cache[8]) {
        _cache = _create(pair);
        _regex = pair === DEFAULT ? _loopback : _rewrite;
        _cache[9] = _regex(_pairs[9]);
      }
      cachedBrackets = pair;
    }

    function _setSettings (o) {
      var b;

      o = o || {};
      b = o.brackets;
      Object.defineProperty(o, 'brackets', {
        set: _reset,
        get: function () { return cachedBrackets },
        enumerable: true
      });
      _settings = o;
      _reset(b);
    }

    Object.defineProperty(_brackets, 'settings', {
      set: _setSettings,
      get: function () { return _settings }
    });

    /* istanbul ignore next: in the browser riot is always in the scope */
    _brackets.settings = typeof riot !== 'undefined' && riot.settings || {};
    _brackets.set = _reset;
    _brackets.skipRegex = skipRegex;

    _brackets.R_STRINGS = R_STRINGS;
    _brackets.R_MLCOMMS = R_MLCOMMS;
    _brackets.S_QBLOCKS = S_QBLOCKS;
    _brackets.S_QBLOCK2 = S_QBLOCK2;

    return _brackets

  })();

  /**
   * @module tmpl
   *
   * tmpl          - Root function, returns the template value, render with data
   * tmpl.hasExpr  - Test the existence of a expression inside a string
   * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
   */

  var tmpl = (function () {

    var _cache = {};

    function _tmpl (str, data) {
      if (!str) { return str }

      return (_cache[str] || (_cache[str] = _create(str))).call(
        data, _logErr.bind({
          data: data,
          tmpl: str
        })
      )
    }

    _tmpl.hasExpr = brackets.hasExpr;

    _tmpl.loopKeys = brackets.loopKeys;

    // istanbul ignore next
    _tmpl.clearCache = function () { _cache = {}; };

    _tmpl.errorHandler = null;

    function _logErr (err, ctx) {

      err.riotData = {
        tagName: ctx && ctx.__ && ctx.__.tagName,
        _riot_id: ctx && ctx._riot_id  //eslint-disable-line camelcase
      };

      if (_tmpl.errorHandler) { _tmpl.errorHandler(err); }
      else if (
        typeof console !== 'undefined' &&
        typeof console.error === 'function'
      ) {
        console.error(err.message);
        console.log('<%s> %s', err.riotData.tagName || 'Unknown tag', this.tmpl); // eslint-disable-line
        console.log(this.data); // eslint-disable-line
      }
    }

    function _create (str) {
      var expr = _getTmpl(str);

      if (expr.slice(0, 11) !== 'try{return ') { expr = 'return ' + expr; }

      return safeEval.func('E', expr + ';')
    }

    var RE_DQUOTE = /\u2057/g;
    var RE_QBMARK = /\u2057(\d+)~/g;

    function _getTmpl (str) {
      var parts = brackets.split(str.replace(RE_DQUOTE, '"'), 1);
      var qstr = parts.qblocks;
      var expr;

      if (parts.length > 2 || parts[0]) {
        var i, j, list = [];

        for (i = j = 0; i < parts.length; ++i) {

          expr = parts[i];

          if (expr && (expr = i & 1

              ? _parseExpr(expr, 1, qstr)

              : '"' + expr
                  .replace(/\\/g, '\\\\')
                  .replace(/\r\n?|\n/g, '\\n')
                  .replace(/"/g, '\\"') +
                '"'

            )) { list[j++] = expr; }

        }

        expr = j < 2 ? list[0]
             : '[' + list.join(',') + '].join("")';

      } else {

        expr = _parseExpr(parts[1], 0, qstr);
      }

      if (qstr.length) {
        expr = expr.replace(RE_QBMARK, function (_, pos) {
          return qstr[pos]
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
        });
      }
      return expr
    }

    var RE_CSNAME = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\u2057(\d+)~):/;
    var
      RE_BREND = {
        '(': /[()]/g,
        '[': /[[\]]/g,
        '{': /[{}]/g
      };

    function _parseExpr (expr, asText, qstr) {

      expr = expr
        .replace(/\s+/g, ' ').trim()
        .replace(/\ ?([[\({},?\.:])\ ?/g, '$1');

      if (expr) {
        var
          list = [],
          cnt = 0,
          match;

        while (expr &&
              (match = expr.match(RE_CSNAME)) &&
              !match.index
          ) {
          var
            key,
            jsb,
            re = /,|([[{(])|$/g;

          expr = RegExp.rightContext;
          key  = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1];

          while (jsb = (match = re.exec(expr))[1]) { skipBraces(jsb, re); }

          jsb  = expr.slice(0, match.index);
          expr = RegExp.rightContext;

          list[cnt++] = _wrapExpr(jsb, 1, key);
        }

        expr = !cnt ? _wrapExpr(expr, asText)
             : cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0];
      }
      return expr

      function skipBraces (ch, re) {
        var
          mm,
          lv = 1,
          ir = RE_BREND[ch];

        ir.lastIndex = re.lastIndex;
        while (mm = ir.exec(expr)) {
          if (mm[0] === ch) { ++lv; }
          else if (!--lv) { break }
        }
        re.lastIndex = lv ? expr.length : ir.lastIndex;
      }
    }

    // istanbul ignore next: not both
    var // eslint-disable-next-line max-len
      JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').',
      JS_VARNAME = /[,{][\$\w]+(?=:)|(^ *|[^$\w\.{])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,
      JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/;

    function _wrapExpr (expr, asText, key) {
      var tb;

      expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
        if (mvar) {
          pos = tb ? 0 : pos + match.length;

          if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
            match = p + '("' + mvar + JS_CONTEXT + mvar;
            if (pos) { tb = (s = s[pos]) === '.' || s === '(' || s === '['; }
          } else if (pos) {
            tb = !JS_NOPROPS.test(s.slice(pos));
          }
        }
        return match
      });

      if (tb) {
        expr = 'try{return ' + expr + '}catch(e){E(e,this)}';
      }

      if (key) {

        expr = (tb
            ? 'function(){' + expr + '}.call(this)' : '(' + expr + ')'
          ) + '?"' + key + '":""';

      } else if (asText) {

        expr = 'function(v){' + (tb
            ? expr.replace('return ', 'v=') : 'v=(' + expr + ')'
          ) + ';return v||v===0?v:""}.call(this)';
      }

      return expr
    }

    _tmpl.version = brackets.version = 'v3.0.8';

    return _tmpl

  })();

  exports.brackets = brackets;
  exports.tmpl = tmpl;

  Object.defineProperty(exports, '__esModule', { value: true });

  })));
  });

  unwrapExports(csp_tmpl);
  var csp_tmpl_1 = csp_tmpl.tmpl;
  var csp_tmpl_2 = csp_tmpl.brackets;

  var observable = function(el) {

    /**
     * Extend the original object or create a new empty one
     * @type { Object }
     */

    el = el || {};

    /**
     * Private variables
     */
    var callbacks = {},
      slice = Array.prototype.slice;

    /**
     * Public Api
     */

    // extend the el object adding the observable methods
    Object.defineProperties(el, {
      /**
       * Listen to the given `event` ands
       * execute the `callback` each time an event is triggered.
       * @param  { String } event - event id
       * @param  { Function } fn - callback function
       * @returns { Object } el
       */
      on: {
        value: function(event, fn) {
          if (typeof fn == 'function')
            { (callbacks[event] = callbacks[event] || []).push(fn); }
          return el
        },
        enumerable: false,
        writable: false,
        configurable: false
      },

      /**
       * Removes the given `event` listeners
       * @param   { String } event - event id
       * @param   { Function } fn - callback function
       * @returns { Object } el
       */
      off: {
        value: function(event, fn) {
          if (event == '*' && !fn) { callbacks = {}; }
          else {
            if (fn) {
              var arr = callbacks[event];
              for (var i = 0, cb; cb = arr && arr[i]; ++i) {
                if (cb == fn) { arr.splice(i--, 1); }
              }
            } else { delete callbacks[event]; }
          }
          return el
        },
        enumerable: false,
        writable: false,
        configurable: false
      },

      /**
       * Listen to the given `event` and
       * execute the `callback` at most once
       * @param   { String } event - event id
       * @param   { Function } fn - callback function
       * @returns { Object } el
       */
      one: {
        value: function(event, fn) {
          function on() {
            el.off(event, on);
            fn.apply(el, arguments);
          }
          return el.on(event, on)
        },
        enumerable: false,
        writable: false,
        configurable: false
      },

      /**
       * Execute all callback functions that listen to
       * the given `event`
       * @param   { String } event - event id
       * @returns { Object } el
       */
      trigger: {
        value: function(event) {
          var arguments$1 = arguments;


          // getting the arguments
          var arglen = arguments.length - 1,
            args = new Array(arglen),
            fns,
            fn,
            i;

          for (i = 0; i < arglen; i++) {
            args[i] = arguments$1[i + 1]; // skip first argument
          }

          fns = slice.call(callbacks[event] || [], 0);

          for (i = 0; fn = fns[i]; ++i) {
            fn.apply(el, args);
          }

          if (callbacks['*'] && event != '*')
            { el.trigger.apply(el, ['*', event].concat(args)); }

          return el
        },
        enumerable: false,
        writable: false,
        configurable: false
      }
    });

    return el

  };

  /**
   * Short alias for Object.getOwnPropertyDescriptor
   */
  function getPropDescriptor (o, k) {
    return Object.getOwnPropertyDescriptor(o, k)
  }

  /**
   * Check if passed argument is undefined
   * @param   { * } value -
   * @returns { Boolean } -
   */
  function isUndefined(value) {
    return typeof value === T_UNDEF
  }

  /**
   * Check whether object's property could be overridden
   * @param   { Object }  obj - source object
   * @param   { String }  key - object property
   * @returns { Boolean } true if writable
   */
  function isWritable(obj, key) {
    var descriptor = getPropDescriptor(obj, key);
    return isUndefined(obj[key]) || descriptor && descriptor.writable
  }

  /**
   * Extend any object with other properties
   * @param   { Object } src - source object
   * @returns { Object } the resulting extended object
   *
   * var obj = { foo: 'baz' }
   * extend(obj, {bar: 'bar', foo: 'bar'})
   * console.log(obj) => {bar: 'bar', foo: 'bar'}
   *
   */
  function extend(src) {
    var obj;
    var i = 1;
    var args = arguments;
    var l = args.length;

    for (; i < l; i++) {
      if (obj = args[i]) {
        for (var key in obj) {
          // check if this property of the source object could be overridden
          if (isWritable(src, key))
            { src[key] = obj[key]; }
        }
      }
    }
    return src
  }

  /**
   * Alias for Object.create
   */
  function create(src) {
    return Object.create(src)
  }

  var settings = extend(create(csp_tmpl_2.settings), {
    skipAnonymousTags: true,
    // the "value" attributes will be preserved
    keepValueAttributes: false,
    // handle the auto updates on any DOM event
    autoUpdate: true
  });

  /**
   * Shorter and fast way to select multiple nodes in the DOM
   * @param   { String } selector - DOM selector
   * @param   { Object } ctx - DOM node where the targets of our search will is located
   * @returns { Object } dom nodes found
   */
  function $$(selector, ctx) {
    return [].slice.call((ctx || document).querySelectorAll(selector))
  }

  /**
   * Create a document text node
   * @returns { Object } create a text node to use as placeholder
   */
  function createDOMPlaceholder() {
    return document.createTextNode('')
  }

  /**
   * Toggle the visibility of any DOM node
   * @param   { Object }  dom - DOM node we want to hide
   * @param   { Boolean } show - do we want to show it?
   */

  function toggleVisibility(dom, show) {
    dom.style.display = show ? '' : 'none';
    dom.hidden = show ? false : true;
  }

  /**
   * Get the value of any DOM attribute on a node
   * @param   { Object } dom - DOM node we want to parse
   * @param   { String } name - name of the attribute we want to get
   * @returns { String | undefined } name of the node attribute whether it exists
   */
  function getAttribute(dom, name) {
    return dom.getAttribute(name)
  }

  /**
   * Remove any DOM attribute from a node
   * @param   { Object } dom - DOM node we want to update
   * @param   { String } name - name of the property we want to remove
   */
  function removeAttribute(dom, name) {
    dom.removeAttribute(name);
  }

  /**
   * Set the inner html of any DOM node SVGs included
   * @param { Object } container - DOM node where we'll inject new html
   * @param { String } html - html to inject
   * @param { Boolean } isSvg - svg tags should be treated a bit differently
   */
  /* istanbul ignore next */
  function setInnerHTML(container, html, isSvg) {
    // innerHTML is not supported on svg tags so we neet to treat them differently
    if (isSvg) {
      var node = container.ownerDocument.importNode(
        new DOMParser()
          .parseFromString(("<svg xmlns=\"" + SVG_NS + "\">" + html + "</svg>"), 'application/xml')
          .documentElement,
        true
      );

      container.appendChild(node);
    } else {
      container.innerHTML = html;
    }
  }

  /**
   * Minimize risk: only zero or one _space_ between attr & value
   * @param   { String }   html - html string we want to parse
   * @param   { Function } fn - callback function to apply on any attribute found
   */
  function walkAttributes(html, fn) {
    if (!html) { return }
    var m;
    while (m = RE_HTML_ATTRS.exec(html))
      { fn(m[1].toLowerCase(), m[2] || m[3] || m[4]); }
  }

  /**
   * Create a document fragment
   * @returns { Object } document fragment
   */
  function createFragment() {
    return document.createDocumentFragment()
  }

  /**
   * Insert safely a tag to fix #1962 #1649
   * @param   { HTMLElement } root - children container
   * @param   { HTMLElement } curr - node to insert
   * @param   { HTMLElement } next - node that should preceed the current node inserted
   */
  function safeInsert(root, curr, next) {
    root.insertBefore(curr, next.parentNode && next);
  }

  /**
   * Convert a style object to a string
   * @param   { Object } style - style object we need to parse
   * @returns { String } resulting css string
   * @example
   * styleObjectToString({ color: 'red', height: '10px'}) // => 'color: red; height: 10px'
   */
  function styleObjectToString(style) {
    return Object.keys(style).reduce(function (acc, prop) {
      return (acc + " " + prop + ": " + (style[prop]) + ";")
    }, '')
  }

  /**
   * Walk down recursively all the children tags starting dom node
   * @param   { Object }   dom - starting node where we will start the recursion
   * @param   { Function } fn - callback to transform the child node just found
   * @param   { Object }   context - fn can optionally return an object, which is passed to children
   */
  function walkNodes(dom, fn, context) {
    if (dom) {
      var res = fn(dom, context);
      var next;
      // stop the recursion
      if (res === false) { return }

      dom = dom.firstChild;

      while (dom) {
        next = dom.nextSibling;
        walkNodes(dom, fn, res);
        dom = next;
      }
    }
  }



  var dom = /*#__PURE__*/Object.freeze({
    $$: $$,
    $: $,
    createDOMPlaceholder: createDOMPlaceholder,
    mkEl: makeElement,
    setAttr: setAttribute,
    toggleVisibility: toggleVisibility,
    getAttr: getAttribute,
    remAttr: removeAttribute,
    setInnerHTML: setInnerHTML,
    walkAttrs: walkAttributes,
    createFrag: createFragment,
    safeInsert: safeInsert,
    styleObjectToString: styleObjectToString,
    walkNodes: walkNodes
  });

  /**
   * Check against the null and undefined values
   * @param   { * }  value -
   * @returns {Boolean} -
   */
  function isNil(value) {
    return isUndefined(value) || value === null
  }

  /**
   * Check if passed argument is empty. Different from falsy, because we dont consider 0 or false to be blank
   * @param { * } value -
   * @returns { Boolean } -
   */
  function isBlank(value) {
    return isNil(value) || value === ''
  }

  /**
   * Check if passed argument is a function
   * @param   { * } value -
   * @returns { Boolean } -
   */
  function isFunction(value) {
    return typeof value === T_FUNCTION
  }

  /**
   * Check if passed argument is an object, exclude null
   * NOTE: use isObject(x) && !isArray(x) to excludes arrays.
   * @param   { * } value -
   * @returns { Boolean } -
   */
  function isObject(value) {
    return value && typeof value === T_OBJECT // typeof null is 'object'
  }

  /**
   * Check if a DOM node is an svg tag or part of an svg
   * @param   { HTMLElement }  el - node we want to test
   * @returns {Boolean} true if it's an svg node
   */
  function isSvg(el) {
    var owner = el.ownerSVGElement;
    return !!owner || owner === null
  }

  /**
   * Check if passed argument is a kind of array
   * @param   { * } value -
   * @returns { Boolean } -
   */
  function isArray(value) {
    return Array.isArray(value) || value instanceof Array
  }

  /**
   * Check if the passed argument is a boolean attribute
   * @param   { String } value -
   * @returns { Boolean } -
   */
  function isBoolAttr(value) {
    return RE_BOOL_ATTRS.test(value)
  }

  /**
   * Check if passed argument is a string
   * @param   { * } value -
   * @returns { Boolean } -
   */
  function isString(value) {
    return typeof value === T_STRING
  }



  var check = /*#__PURE__*/Object.freeze({
    isBlank: isBlank,
    isFunction: isFunction,
    isObject: isObject,
    isSvg: isSvg,
    isWritable: isWritable,
    isArray: isArray,
    isBoolAttr: isBoolAttr,
    isNil: isNil,
    isString: isString,
    isUndefined: isUndefined
  });

  /**
   * Check whether an array contains an item
   * @param   { Array } array - target array
   * @param   { * } item - item to test
   * @returns { Boolean } -
   */
  function contains(array, item) {
    return array.indexOf(item) !== -1
  }

  /**
   * Specialized function for looping an array-like collection with `each={}`
   * @param   { Array } list - collection of items
   * @param   {Function} fn - callback function
   * @returns { Array } the array looped
   */
  function each(list, fn) {
    var len = list ? list.length : 0;
    var i = 0;
    for (; i < len; i++) { fn(list[i], i); }
    return list
  }

  /**
   * Faster String startsWith alternative
   * @param   { String } str - source string
   * @param   { String } value - test string
   * @returns { Boolean } -
   */
  function startsWith(str, value) {
    return str.slice(0, value.length) === value
  }

  /**
   * Function returning always a unique identifier
   * @returns { Number } - number from 0...n
   */
  var uid = (function uid() {
    var i = -1;
    return function () { return ++i; }
  })();

  /**
   * Helper function to set an immutable property
   * @param   { Object } el - object where the new property will be set
   * @param   { String } key - object key where the new property will be stored
   * @param   { * } value - value of the new property
   * @param   { Object } options - set the propery overriding the default options
   * @returns { Object } - the initial object
   */
  function define(el, key, value, options) {
    Object.defineProperty(el, key, extend({
      value: value,
      enumerable: false,
      writable: false,
      configurable: true
    }, options));
    return el
  }

  /**
   * Convert a string containing dashes to camel case
   * @param   { String } str - input string
   * @returns { String } my-string -> myString
   */
  function toCamel(str) {
    return str.replace(/-(\w)/g, function (_, c) { return c.toUpperCase(); })
  }

  /**
   * Warn a message via console
   * @param   {String} message - warning message
   */
  function warn(message) {
    if (console && console.warn) { console.warn(message); }
  }



  var misc = /*#__PURE__*/Object.freeze({
    contains: contains,
    each: each,
    getPropDescriptor: getPropDescriptor,
    startsWith: startsWith,
    uid: uid,
    defineProperty: define,
    objectCreate: create,
    extend: extend,
    toCamel: toCamel,
    warn: warn
  });

  /**
   * Set the property of an object for a given key. If something already
   * exists there, then it becomes an array containing both the old and new value.
   * @param { Object } obj - object on which to set the property
   * @param { String } key - property name
   * @param { Object } value - the value of the property to be set
   * @param { Boolean } ensureArray - ensure that the property remains an array
   * @param { Number } index - add the new item in a certain array position
   */
  function arrayishAdd(obj, key, value, ensureArray, index) {
    var dest = obj[key];
    var isArr = isArray(dest);
    var hasIndex = !isUndefined(index);

    if (dest && dest === value) { return }

    // if the key was never set, set it once
    if (!dest && ensureArray) { obj[key] = [value]; }
    else if (!dest) { obj[key] = value; }
    // if it was an array and not yet set
    else {
      if (isArr) {
        var oldIndex = dest.indexOf(value);
        // this item never changed its position
        if (oldIndex === index) { return }
        // remove the item from its old position
        if (oldIndex !== -1) { dest.splice(oldIndex, 1); }
        // move or add the item
        if (hasIndex) {
          dest.splice(index, 0, value);
        } else {
          dest.push(value);
        }
      } else { obj[key] = [dest, value]; }
    }
  }

  /**
   * Detect the tag implementation by a DOM node
   * @param   { Object } dom - DOM node we need to parse to get its tag implementation
   * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
   */
  function get(dom) {
    return dom.tagName && __TAG_IMPL[getAttribute(dom, IS_DIRECTIVE) ||
      getAttribute(dom, IS_DIRECTIVE) || dom.tagName.toLowerCase()]
  }

  /**
   * Get the tag name of any DOM node
   * @param   { Object } dom - DOM node we want to parse
   * @param   { Boolean } skipDataIs - hack to ignore the data-is attribute when attaching to parent
   * @returns { String } name to identify this dom node in riot
   */
  function getName(dom, skipDataIs) {
    var child = get(dom);
    var namedTag = !skipDataIs && getAttribute(dom, IS_DIRECTIVE);
    return namedTag && !csp_tmpl_1.hasExpr(namedTag) ?
      namedTag : child ? child.name : dom.tagName.toLowerCase()
  }

  /**
   * Return a temporary context containing also the parent properties
   * @this Tag
   * @param { Tag } - temporary tag context containing all the parent properties
   */
  function inheritParentProps() {
    if (this.parent) { return extend(create(this), this.parent) }
    return this
  }

  /*
    Includes hacks needed for the Internet Explorer version 9 and below
    See: http://kangax.github.io/compat-table/es5/#ie8
         http://codeplanet.io/dropping-ie8/
  */

  var
    reHasYield  = /<yield\b/i,
    reYieldAll  = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>|>)/ig,
    reYieldSrc  = /<yield\s+to=['"]([^'">]*)['"]\s*>([\S\s]*?)<\/yield\s*>/ig,
    reYieldDest = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig,
    rootEls = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' },
    tblTags = IE_VERSION && IE_VERSION < 10 ? RE_SPECIAL_TAGS : RE_SPECIAL_TAGS_NO_OPTION,
    GENERIC = 'div',
    SVG = 'svg';


  /*
    Creates the root element for table or select child elements:
    tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
  */
  function specialTags(el, tmpl, tagName) {

    var
      select = tagName[0] === 'o',
      parent = select ? 'select>' : 'table>';

    // trim() is important here, this ensures we don't have artifacts,
    // so we can check if we have only one element inside the parent
    el.innerHTML = '<' + parent + tmpl.trim() + '</' + parent;
    parent = el.firstChild;

    // returns the immediate parent if tr/th/td/col is the only element, if not
    // returns the whole tree, as this can include additional elements
    /* istanbul ignore next */
    if (select) {
      parent.selectedIndex = -1;  // for IE9, compatible w/current riot behavior
    } else {
      // avoids insertion of cointainer inside container (ex: tbody inside tbody)
      var tname = rootEls[tagName];
      if (tname && parent.childElementCount === 1) { parent = $(tname, parent); }
    }
    return parent
  }

  /*
    Replace the yield tag from any tag template with the innerHTML of the
    original tag in the page
  */
  function replaceYield(tmpl, html) {
    // do nothing if no yield
    if (!reHasYield.test(tmpl)) { return tmpl }

    // be careful with #1343 - string on the source having `$1`
    var src = {};

    html = html && html.replace(reYieldSrc, function (_, ref, text) {
      src[ref] = src[ref] || text;   // preserve first definition
      return ''
    }).trim();

    return tmpl
      .replace(reYieldDest, function (_, ref, def) {  // yield with from - to attrs
        return src[ref] || def || ''
      })
      .replace(reYieldAll, function (_, def) {        // yield without any "from"
        return html || def || ''
      })
  }

  /**
   * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
   * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
   *
   * @param   { String } tmpl  - The template coming from the custom tag definition
   * @param   { String } html - HTML content that comes from the DOM element where you
   *           will mount the tag, mostly the original tag in the page
   * @param   { Boolean } isSvg - true if the root node is an svg
   * @returns { HTMLElement } DOM element with _tmpl_ merged through `YIELD` with the _html_.
   */
  function mkdom(tmpl, html, isSvg) {
    var match   = tmpl && tmpl.match(/^\s*<([-\w]+)/);
    var  tagName = match && match[1].toLowerCase();
    var el = makeElement(isSvg ? SVG : GENERIC);

    // replace all the yield tags with the tag inner html
    tmpl = replaceYield(tmpl, html);

    /* istanbul ignore next */
    if (tblTags.test(tagName))
      { el = specialTags(el, tmpl, tagName); }
    else
      { setInnerHTML(el, tmpl, isSvg); }

    return el
  }

  var EVENT_ATTR_RE = /^on/;

  /**
   * True if the event attribute starts with 'on'
   * @param   { String } attribute - event attribute
   * @returns { Boolean }
   */
  function isEventAttribute(attribute) {
    return EVENT_ATTR_RE.test(attribute)
  }

  /**
   * Loop backward all the parents tree to detect the first custom parent tag
   * @param   { Object } tag - a Tag instance
   * @returns { Object } the instance of the first custom parent tag found
   */
  function getImmediateCustomParent(tag) {
    var ptag = tag;
    while (ptag.__.isAnonymous) {
      if (!ptag.parent) { break }
      ptag = ptag.parent;
    }
    return ptag
  }

  /**
   * Trigger DOM events
   * @param   { HTMLElement } dom - dom element target of the event
   * @param   { Function } handler - user function
   * @param   { Object } e - event object
   */
  function handleEvent(dom, handler, e) {
    var ptag = this.__.parent;
    var item = this.__.item;

    if (!item)
      { while (ptag && !item) {
        item = ptag.__.item;
        ptag = ptag.__.parent;
      } }

    // override the event properties
    /* istanbul ignore next */
    if (isWritable(e, 'currentTarget')) { e.currentTarget = dom; }
    /* istanbul ignore next */
    if (isWritable(e, 'target')) { e.target = e.srcElement; }
    /* istanbul ignore next */
    if (isWritable(e, 'which')) { e.which = e.charCode || e.keyCode; }

    e.item = item;

    handler.call(this, e);

    // avoid auto updates
    if (!settings.autoUpdate) { return }

    if (!e.preventUpdate) {
      var p = getImmediateCustomParent(this);
      // fixes #2083
      if (p.isMounted) { p.update(); }
    }
  }

  /**
   * Attach an event to a DOM node
   * @param { String } name - event name
   * @param { Function } handler - event callback
   * @param { Object } dom - dom node
   * @param { Tag } tag - tag instance
   */
  function setEventHandler(name, handler, dom, tag) {
    var eventName;
    var cb = handleEvent.bind(tag, dom, handler);

    // avoid to bind twice the same event
    // possible fix for #2332
    dom[name] = null;

    // normalize event name
    eventName = name.replace(RE_EVENTS_PREFIX, '');

    // cache the listener into the listeners array
    if (!contains(tag.__.listeners, dom)) { tag.__.listeners.push(dom); }
    if (!dom[RIOT_EVENTS_KEY]) { dom[RIOT_EVENTS_KEY] = {}; }
    if (dom[RIOT_EVENTS_KEY][name]) { dom.removeEventListener(eventName, dom[RIOT_EVENTS_KEY][name]); }

    dom[RIOT_EVENTS_KEY][name] = cb;
    dom.addEventListener(eventName, cb, false);
  }

  /**
   * Create a new child tag including it correctly into its parent
   * @param   { Object } child - child tag implementation
   * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
   * @param   { String } innerHTML - inner html of the child node
   * @param   { Object } parent - instance of the parent tag including the child custom tag
   * @returns { Object } instance of the new child tag just created
   */
  function initChild(child, opts, innerHTML, parent) {
    var tag = createTag(child, opts, innerHTML);
    var tagName = opts.tagName || getName(opts.root, true);
    var ptag = getImmediateCustomParent(parent);
    // fix for the parent attribute in the looped elements
    define(tag, 'parent', ptag);
    // store the real parent tag
    // in some cases this could be different from the custom parent tag
    // for example in nested loops
    tag.__.parent = parent;

    // add this tag to the custom parent tag
    arrayishAdd(ptag.tags, tagName, tag);

    // and also to the real parent tag
    if (ptag !== parent)
      { arrayishAdd(parent.tags, tagName, tag); }

    return tag
  }

  /**
   * Removes an item from an object at a given key. If the key points to an array,
   * then the item is just removed from the array.
   * @param { Object } obj - object on which to remove the property
   * @param { String } key - property name
   * @param { Object } value - the value of the property to be removed
   * @param { Boolean } ensureArray - ensure that the property remains an array
  */
  function arrayishRemove(obj, key, value, ensureArray) {
    if (isArray(obj[key])) {
      var index = obj[key].indexOf(value);
      if (index !== -1) { obj[key].splice(index, 1); }
      if (!obj[key].length) { delete obj[key]; }
      else if (obj[key].length === 1 && !ensureArray) { obj[key] = obj[key][0]; }
    } else if (obj[key] === value)
      { delete obj[key]; } // otherwise just delete the key
  }

  /**
   * Adds the elements for a virtual tag
   * @this Tag
   * @param { Node } src - the node that will do the inserting or appending
   * @param { Tag } target - only if inserting, insert before this tag's first child
   */
  function makeVirtual(src, target) {
    var this$1 = this;

    var head = createDOMPlaceholder();
    var tail = createDOMPlaceholder();
    var frag = createFragment();
    var sib;
    var el;

    this.root.insertBefore(head, this.root.firstChild);
    this.root.appendChild(tail);

    this.__.head = el = head;
    this.__.tail = tail;

    while (el) {
      sib = el.nextSibling;
      frag.appendChild(el);
      this$1.__.virts.push(el); // hold for unmounting
      el = sib;
    }

    if (target)
      { src.insertBefore(frag, target.__.head); }
    else
      { src.appendChild(frag); }
  }

  /**
   * makes a tag virtual and replaces a reference in the dom
   * @this Tag
   * @param { tag } the tag to make virtual
   * @param { ref } the dom reference location
   */
  function makeReplaceVirtual(tag, ref) {
    if (!ref.parentNode) { return }
    var frag = createFragment();
    makeVirtual.call(tag, frag);
    ref.parentNode.replaceChild(frag, ref);
  }

  /**
   * Update dynamically created data-is tags with changing expressions
   * @param { Object } expr - expression tag and expression info
   * @param { Tag }    parent - parent for tag creation
   * @param { String } tagName - tag implementation we want to use
   */
  function updateDataIs(expr, parent, tagName) {
    var tag = expr.tag || expr.dom._tag;
    var ref;

    var ref$1 = tag ? tag.__ : {};
    var head = ref$1.head;
    var isVirtual = expr.dom.tagName === 'VIRTUAL';

    if (tag && expr.tagName === tagName) {
      tag.update();
      return
    }

    // sync _parent to accommodate changing tagnames
    if (tag) {
      // need placeholder before unmount
      if(isVirtual) {
        ref = createDOMPlaceholder();
        head.parentNode.insertBefore(ref, head);
      }

      tag.unmount(true);
    }

    // unable to get the tag name
    if (!isString(tagName)) { return }

    expr.impl = __TAG_IMPL[tagName];

    // unknown implementation
    if (!expr.impl) { return }

    expr.tag = tag = initChild(
      expr.impl, {
        root: expr.dom,
        parent: parent,
        tagName: tagName
      },
      expr.dom.innerHTML,
      parent
    );

    each(expr.attrs, function (a) { return setAttribute(tag.root, a.name, a.value); });
    expr.tagName = tagName;
    tag.mount();

    // root exist first time, after use placeholder
    if (isVirtual) { makeReplaceVirtual(tag, ref || tag.root); }

    // parent is the placeholder tag, not the dynamic tag so clean up
    parent.__.onUnmount = function () {
      var delName = tag.opts.dataIs;
      arrayishRemove(tag.parent.tags, delName, tag);
      arrayishRemove(tag.__.parent.tags, delName, tag);
      tag.unmount();
    };
  }

  /**
   * Nomalize any attribute removing the "riot-" prefix
   * @param   { String } attrName - original attribute name
   * @returns { String } valid html attribute name
   */
  function normalizeAttrName(attrName) {
    if (!attrName) { return null }
    attrName = attrName.replace(ATTRS_PREFIX, '');
    if (CASE_SENSITIVE_ATTRIBUTES[attrName]) { attrName = CASE_SENSITIVE_ATTRIBUTES[attrName]; }
    return attrName
  }

  /**
   * Update on single tag expression
   * @this Tag
   * @param { Object } expr - expression logic
   * @returns { undefined }
   */
  function updateExpression(expr) {
    if (this.root && getAttribute(this.root,'virtualized')) { return }

    var dom = expr.dom;
    // remove the riot- prefix
    var attrName = normalizeAttrName(expr.attr);
    var isToggle = contains([SHOW_DIRECTIVE, HIDE_DIRECTIVE], attrName);
    var isVirtual = expr.root && expr.root.tagName === 'VIRTUAL';
    var ref = this.__;
    var isAnonymous = ref.isAnonymous;
    var parent = dom && (expr.parent || dom.parentNode);
    var keepValueAttributes = settings.keepValueAttributes;
    // detect the style attributes
    var isStyleAttr = attrName === 'style';
    var isClassAttr = attrName === 'class';
    var isValueAttr = attrName === 'value';

    var value;

    // if it's a tag we could totally skip the rest
    if (expr._riot_id) {
      if (expr.__.wasCreated) {
        expr.update();
      // if it hasn't been mounted yet, do that now.
      } else {
        expr.mount();
        if (isVirtual) {
          makeReplaceVirtual(expr, expr.root);
        }
      }
      return
    }

    // if this expression has the update method it means it can handle the DOM changes by itself
    if (expr.update) { return expr.update() }

    var context = isToggle && !isAnonymous ? inheritParentProps.call(this) : this;

    // ...it seems to be a simple expression so we try to calculate its value
    value = csp_tmpl_1(expr.expr, context);

    var hasValue = !isBlank(value);
    var isObj = isObject(value);

    // convert the style/class objects to strings
    if (isObj) {
      if (isClassAttr) {
        value = csp_tmpl_1(JSON.stringify(value), this);
      } else if (isStyleAttr) {
        value = styleObjectToString(value);
      }
    }

    // remove original attribute
    if (expr.attr &&
        (
          // the original attribute can be removed only if we are parsing the original expression
          !expr.wasParsedOnce ||
          // or its value is false
          value === false ||
          // or if its value is currently falsy...
          // We will keep the "value" attributes if the "keepValueAttributes"
          // is enabled though
          (!hasValue && (!isValueAttr || isValueAttr && !keepValueAttributes))
        )
    ) {
      // remove either riot-* attributes or just the attribute name
      removeAttribute(dom, getAttribute(dom, expr.attr) ? expr.attr : attrName);
    }

    // for the boolean attributes we don't need the value
    // we can convert it to checked=true to checked=checked
    if (expr.bool) { value = value ? attrName : false; }
    if (expr.isRtag) { return updateDataIs(expr, this, value) }
    if (expr.wasParsedOnce && expr.value === value) { return }

    // update the expression value
    expr.value = value;
    expr.wasParsedOnce = true;

    // if the value is an object (and it's not a style or class attribute) we can not do much more with it
    if (isObj && !isClassAttr && !isStyleAttr && !isToggle) { return }
    // avoid to render undefined/null values
    if (!hasValue) { value = ''; }

    // textarea and text nodes have no attribute name
    if (!attrName) {
      // about #815 w/o replace: the browser converts the value to a string,
      // the comparison by "==" does too, but not in the server
      value += '';
      // test for parent avoids error with invalid assignment to nodeValue
      if (parent) {
        // cache the parent node because somehow it will become null on IE
        // on the next iteration
        expr.parent = parent;
        if (parent.tagName === 'TEXTAREA') {
          parent.value = value;                    // #1113
          if (!IE_VERSION) { dom.nodeValue = value; }  // #1625 IE throws here, nodeValue
        }                                         // will be available on 'updated'
        else { dom.nodeValue = value; }
      }
      return
    }

    switch (true) {
    // handle events binding
    case isFunction(value):
      if (isEventAttribute(attrName)) {
        setEventHandler(attrName, value, dom, this);
      }
      break
    // show / hide
    case isToggle:
      toggleVisibility(dom, attrName === HIDE_DIRECTIVE ? !value : value);
      break
    // handle attributes
    default:
      if (expr.bool) {
        dom[attrName] = value;
      }

      if (isValueAttr && dom.value !== value) {
        dom.value = value;
      } else if (hasValue && value !== false) {
        setAttribute(dom, attrName, value);
      }

      // make sure that in case of style changes
      // the element stays hidden
      if (isStyleAttr && dom.hidden) { toggleVisibility(dom, false); }
    }
  }

  /**
   * Update all the expressions in a Tag instance
   * @this Tag
   * @param { Array } expressions - expression that must be re evaluated
   */
  function update(expressions) {
    each(expressions, updateExpression.bind(this));
  }

  /**
   * We need to update opts for this tag. That requires updating the expressions
   * in any attributes on the tag, and then copying the result onto opts.
   * @this Tag
   * @param   {Boolean} isLoop - is it a loop tag?
   * @param   { Tag }  parent - parent tag node
   * @param   { Boolean }  isAnonymous - is it a tag without any impl? (a tag not registered)
   * @param   { Object }  opts - tag options
   * @param   { Array }  instAttrs - tag attributes array
   */
  function updateOpts(isLoop, parent, isAnonymous, opts, instAttrs) {
    // isAnonymous `each` tags treat `dom` and `root` differently. In this case
    // (and only this case) we don't need to do updateOpts, because the regular parse
    // will update those attrs. Plus, isAnonymous tags don't need opts anyway
    if (isLoop && isAnonymous) { return }
    var ctx = isLoop ? inheritParentProps.call(this) : parent || this;

    each(instAttrs, function (attr) {
      if (attr.expr) { updateExpression.call(ctx, attr.expr); }
      // normalize the attribute names
      opts[toCamel(attr.name).replace(ATTRS_PREFIX, '')] = attr.expr ? attr.expr.value : attr.value;
    });
  }

  /**
   * Update the tag expressions and options
   * @param { Tag } tag - tag object
   * @param { * } data - data we want to use to extend the tag properties
   * @param { Array } expressions - component expressions array
   * @returns { Tag } the current tag instance
   */
  function componentUpdate(tag, data, expressions) {
    var __ = tag.__;
    var nextOpts = {};
    var canTrigger = tag.isMounted && !__.skipAnonymous;

    // inherit properties from the parent tag
    if (__.isAnonymous && __.parent) { extend(tag, __.parent); }
    extend(tag, data);

    updateOpts.apply(tag, [__.isLoop, __.parent, __.isAnonymous, nextOpts, __.instAttrs]);

    if (
      canTrigger &&
      tag.isMounted &&
      isFunction(tag.shouldUpdate) && !tag.shouldUpdate(data, nextOpts)
    ) {
      return tag
    }

    extend(tag.opts, nextOpts);

    if (canTrigger) { tag.trigger('update', data); }
    update.call(tag, expressions);
    if (canTrigger) { tag.trigger('updated'); }

    return tag
  }

  /**
   * Get selectors for tags
   * @param   { Array } tags - tag names to select
   * @returns { String } selector
   */
  function query(tags) {
    // select all tags
    if (!tags) {
      var keys = Object.keys(__TAG_IMPL);
      return keys + query(keys)
    }

    return tags
      .filter(function (t) { return !/[^-\w]/.test(t); })
      .reduce(function (list, t) {
        var name = t.trim().toLowerCase();
        return list + ",[" + IS_DIRECTIVE + "=\"" + name + "\"]"
      }, '')
  }

  /**
   * Another way to create a riot tag a bit more es6 friendly
   * @param { HTMLElement } el - tag DOM selector or DOM node/s
   * @param { Object } opts - tag logic
   * @returns { Tag } new riot tag instance
   */
  function Tag(el, opts) {
    // get the tag properties from the class constructor
    var ref = this;
    var name = ref.name;
    var tmpl = ref.tmpl;
    var css = ref.css;
    var attrs = ref.attrs;
    var onCreate = ref.onCreate;
    // register a new tag and cache the class prototype
    if (!__TAG_IMPL[name]) {
      tag(name, tmpl, css, attrs, onCreate);
      // cache the class constructor
      __TAG_IMPL[name].class = this.constructor;
    }

    // mount the tag using the class instance
    mount$1(el, name, opts, this);
    // inject the component css
    if (css) { styleManager.inject(); }

    return this
  }

  /**
   * Create a new riot tag implementation
   * @param   { String }   name - name/id of the new riot tag
   * @param   { String }   tmpl - tag template
   * @param   { String }   css - custom tag css
   * @param   { String }   attrs - root tag attributes
   * @param   { Function } fn - user function
   * @returns { String } name/id of the tag just created
   */
  function tag(name, tmpl, css, attrs, fn) {
    if (isFunction(attrs)) {
      fn = attrs;

      if (/^[\w-]+\s?=/.test(css)) {
        attrs = css;
        css = '';
      } else
        { attrs = ''; }
    }

    if (css) {
      if (isFunction(css))
        { fn = css; }
      else
        { styleManager.add(css, name); }
    }

    name = name.toLowerCase();
    __TAG_IMPL[name] = { name: name, tmpl: tmpl, attrs: attrs, fn: fn };

    return name
  }

  /**
   * Create a new riot tag implementation (for use by the compiler)
   * @param   { String }   name - name/id of the new riot tag
   * @param   { String }   tmpl - tag template
   * @param   { String }   css - custom tag css
   * @param   { String }   attrs - root tag attributes
   * @param   { Function } fn - user function
   * @returns { String } name/id of the tag just created
   */
  function tag2(name, tmpl, css, attrs, fn) {
    if (css) { styleManager.add(css, name); }

    __TAG_IMPL[name] = { name: name, tmpl: tmpl, attrs: attrs, fn: fn };

    return name
  }

  /**
   * Mount a tag using a specific tag implementation
   * @param   { * } selector - tag DOM selector or DOM node/s
   * @param   { String } tagName - tag implementation name
   * @param   { Object } opts - tag logic
   * @returns { Array } new tags instances
   */
  function mount(selector, tagName, opts) {
    var tags = [];
    var elem, allTags;

    function pushTagsTo(root) {
      if (root.tagName) {
        var riotTag = getAttribute(root, IS_DIRECTIVE), tag;

        // have tagName? force riot-tag to be the same
        if (tagName && riotTag !== tagName) {
          riotTag = tagName;
          setAttribute(root, IS_DIRECTIVE, tagName);
        }

        tag = mount$1(
          root,
          riotTag || root.tagName.toLowerCase(),
          isFunction(opts) ? opts() : opts
        );

        if (tag)
          { tags.push(tag); }
      } else if (root.length)
        { each(root, pushTagsTo); } // assume nodeList
    }

    // inject styles into DOM
    styleManager.inject();

    if (isObject(tagName) || isFunction(tagName)) {
      opts = tagName;
      tagName = 0;
    }

    // crawl the DOM to find the tag
    if (isString(selector)) {
      selector = selector === '*' ?
        // select all registered tags
        // & tags found with the riot-tag attribute set
        allTags = query() :
        // or just the ones named like the selector
        selector + query(selector.split(/, */));

      // make sure to pass always a selector
      // to the querySelectorAll function
      elem = selector ? $$(selector) : [];
    }
    else
      // probably you have passed already a tag or a NodeList
      { elem = selector; }

    // select all the registered and mount them inside their root elements
    if (tagName === '*') {
      // get all custom tags
      tagName = allTags || query();
      // if the root els it's just a single tag
      if (elem.tagName)
        { elem = $$(tagName, elem); }
      else {
        // select all the children for all the different root elements
        var nodeList = [];

        each(elem, function (_el) { return nodeList.push($$(tagName, _el)); });

        elem = nodeList;
      }
      // get rid of the tagName
      tagName = 0;
    }

    pushTagsTo(elem);

    return tags
  }

  // Create a mixin that could be globally shared across all the tags
  var mixins = {};
  var globals = mixins[GLOBAL_MIXIN] = {};
  var mixins_id = 0;

  /**
   * Create/Return a mixin by its name
   * @param   { String }  name - mixin name (global mixin if object)
   * @param   { Object }  mix - mixin logic
   * @param   { Boolean } g - is global?
   * @returns { Object }  the mixin logic
   */
  function mixin(name, mix, g) {
    // Unnamed global
    if (isObject(name)) {
      mixin(("__" + (mixins_id++) + "__"), name, true);
      return
    }

    var store = g ? globals : mixins;

    // Getter
    if (!mix) {
      if (isUndefined(store[name]))
        { throw new Error(("Unregistered mixin: " + name)) }

      return store[name]
    }

    // Setter
    store[name] = isFunction(mix) ?
      extend(mix.prototype, store[name] || {}) && mix :
      extend(store[name] || {}, mix);
  }

  /**
   * Update all the tags instances created
   * @returns { Array } all the tags instances
   */
  function update$1() {
    return each(__TAGS_CACHE, function (tag) { return tag.update(); })
  }

  function unregister(name) {
    styleManager.remove(name);
    return delete __TAG_IMPL[name]
  }

  var version = 'v3.13.2';

  var core = /*#__PURE__*/Object.freeze({
    Tag: Tag,
    tag: tag,
    tag2: tag2,
    mount: mount,
    mixin: mixin,
    update: update$1,
    unregister: unregister,
    version: version
  });

  /**
   * Add a mixin to this tag
   * @returns { Tag } the current tag instance
   */
  function componentMixin(tag$$1) {
    var mixins = [], len = arguments.length - 1;
    while ( len-- > 0 ) mixins[ len ] = arguments[ len + 1 ];

    each(mixins, function (mix) {
      var instance;
      var obj;
      var props = [];

      // properties blacklisted and will not be bound to the tag instance
      var propsBlacklist = ['init', '__proto__'];

      mix = isString(mix) ? mixin(mix) : mix;

      // check if the mixin is a function
      if (isFunction(mix)) {
        // create the new mixin instance
        instance = new mix();
      } else { instance = mix; }

      var proto = Object.getPrototypeOf(instance);

      // build multilevel prototype inheritance chain property list
      do { props = props.concat(Object.getOwnPropertyNames(obj || instance)); }
      while (obj = Object.getPrototypeOf(obj || instance))

      // loop the keys in the function prototype or the all object keys
      each(props, function (key) {
        // bind methods to tag
        // allow mixins to override other properties/parent mixins
        if (!contains(propsBlacklist, key)) {
          // check for getters/setters
          var descriptor = getPropDescriptor(instance, key) || getPropDescriptor(proto, key);
          var hasGetterSetter = descriptor && (descriptor.get || descriptor.set);

          // apply method only if it does not already exist on the instance
          if (!tag$$1.hasOwnProperty(key) && hasGetterSetter) {
            Object.defineProperty(tag$$1, key, descriptor);
          } else {
            tag$$1[key] = isFunction(instance[key]) ?
              instance[key].bind(tag$$1) :
              instance[key];
          }
        }
      });

      // init method will be called automatically
      if (instance.init)
        { instance.init.bind(tag$$1)(tag$$1.opts); }
    });

    return tag$$1
  }

  /**
   * Move the position of a custom tag in its parent tag
   * @this Tag
   * @param   { String } tagName - key where the tag was stored
   * @param   { Number } newPos - index where the new tag will be stored
   */
  function moveChild(tagName, newPos) {
    var parent = this.parent;
    var tags;
    // no parent no move
    if (!parent) { return }

    tags = parent.tags[tagName];

    if (isArray(tags))
      { tags.splice(newPos, 0, tags.splice(tags.indexOf(this), 1)[0]); }
    else { arrayishAdd(parent.tags, tagName, this); }
  }

  /**
   * Move virtual tag and all child nodes
   * @this Tag
   * @param { Node } src  - the node that will do the inserting
   * @param { Tag } target - insert before this tag's first child
   */
  function moveVirtual(src, target) {
    var this$1 = this;

    var el = this.__.head;
    var sib;
    var frag = createFragment();

    while (el) {
      sib = el.nextSibling;
      frag.appendChild(el);
      el = sib;
      if (el === this$1.__.tail) {
        frag.appendChild(el);
        src.insertBefore(frag, target.__.head);
        break
      }
    }
  }

  /**
   * Convert the item looped into an object used to extend the child tag properties
   * @param   { Object } expr - object containing the keys used to extend the children tags
   * @param   { * } key - value to assign to the new object returned
   * @param   { * } val - value containing the position of the item in the array
   * @returns { Object } - new object containing the values of the original item
   *
   * The variables 'key' and 'val' are arbitrary.
   * They depend on the collection type looped (Array, Object)
   * and on the expression used on the each tag
   *
   */
  function mkitem(expr, key, val) {
    var item = {};
    item[expr.key] = key;
    if (expr.pos) { item[expr.pos] = val; }
    return item
  }

  /**
   * Unmount the redundant tags
   * @param   { Array } items - array containing the current items to loop
   * @param   { Array } tags - array containing all the children tags
   */
  function unmountRedundant(items, tags, filteredItemsCount) {
    var i = tags.length;
    var j = items.length - filteredItemsCount;

    while (i > j) {
      i--;
      remove.apply(tags[i], [tags, i]);
    }
  }


  /**
   * Remove a child tag
   * @this Tag
   * @param   { Array } tags - tags collection
   * @param   { Number } i - index of the tag to remove
   */
  function remove(tags, i) {
    tags.splice(i, 1);
    this.unmount();
    arrayishRemove(this.parent, this, this.__.tagName, true);
  }

  /**
   * Move the nested custom tags in non custom loop tags
   * @this Tag
   * @param   { Number } i - current position of the loop tag
   */
  function moveNestedTags(i) {
    var this$1 = this;

    each(Object.keys(this.tags), function (tagName) {
      moveChild.apply(this$1.tags[tagName], [tagName, i]);
    });
  }

  /**
   * Move a child tag
   * @this Tag
   * @param   { HTMLElement } root - dom node containing all the loop children
   * @param   { Tag } nextTag - instance of the next tag preceding the one we want to move
   * @param   { Boolean } isVirtual - is it a virtual tag?
   */
  function move(root, nextTag, isVirtual) {
    if (isVirtual)
      { moveVirtual.apply(this, [root, nextTag]); }
    else
      { safeInsert(root, this.root, nextTag.root); }
  }

  /**
   * Insert and mount a child tag
   * @this Tag
   * @param   { HTMLElement } root - dom node containing all the loop children
   * @param   { Tag } nextTag - instance of the next tag preceding the one we want to insert
   * @param   { Boolean } isVirtual - is it a virtual tag?
   */
  function insert(root, nextTag, isVirtual) {
    if (isVirtual)
      { makeVirtual.apply(this, [root, nextTag]); }
    else
      { safeInsert(root, this.root, nextTag.root); }
  }

  /**
   * Append a new tag into the DOM
   * @this Tag
   * @param   { HTMLElement } root - dom node containing all the loop children
   * @param   { Boolean } isVirtual - is it a virtual tag?
   */
  function append(root, isVirtual) {
    if (isVirtual)
      { makeVirtual.call(this, root); }
    else
      { root.appendChild(this.root); }
  }

  /**
   * Return the value we want to use to lookup the postion of our items in the collection
   * @param   { String }  keyAttr         - lookup string or expression
   * @param   { * }       originalItem    - original item from the collection
   * @param   { Object }  keyedItem       - object created by riot via { item, i in collection }
   * @param   { Boolean } hasKeyAttrExpr  - flag to check whether the key is an expression
   * @returns { * } value that we will use to figure out the item position via collection.indexOf
   */
  function getItemId(keyAttr, originalItem, keyedItem, hasKeyAttrExpr) {
    if (keyAttr) {
      return hasKeyAttrExpr ?  csp_tmpl_1(keyAttr, keyedItem) :  originalItem[keyAttr]
    }

    return originalItem
  }

  /**
   * Manage tags having the 'each'
   * @param   { HTMLElement } dom - DOM node we need to loop
   * @param   { Tag } parent - parent tag instance where the dom node is contained
   * @param   { String } expr - string contained in the 'each' attribute
   * @returns { Object } expression object for this each loop
   */
  function _each(dom, parent, expr) {
    var mustReorder = typeof getAttribute(dom, LOOP_NO_REORDER_DIRECTIVE) !== T_STRING || removeAttribute(dom, LOOP_NO_REORDER_DIRECTIVE);
    var keyAttr = getAttribute(dom, KEY_DIRECTIVE);
    var hasKeyAttrExpr = keyAttr ? csp_tmpl_1.hasExpr(keyAttr) : false;
    var tagName = getName(dom);
    var impl = __TAG_IMPL[tagName];
    var parentNode = dom.parentNode;
    var placeholder = createDOMPlaceholder();
    var child = get(dom);
    var ifExpr = getAttribute(dom, CONDITIONAL_DIRECTIVE);
    var tags = [];
    var isLoop = true;
    var innerHTML = dom.innerHTML;
    var isAnonymous = !__TAG_IMPL[tagName];
    var isVirtual = dom.tagName === 'VIRTUAL';
    var oldItems = [];

    // remove the each property from the original tag
    removeAttribute(dom, LOOP_DIRECTIVE);
    removeAttribute(dom, KEY_DIRECTIVE);

    // parse the each expression
    expr = csp_tmpl_1.loopKeys(expr);
    expr.isLoop = true;

    if (ifExpr) { removeAttribute(dom, CONDITIONAL_DIRECTIVE); }

    // insert a marked where the loop tags will be injected
    parentNode.insertBefore(placeholder, dom);
    parentNode.removeChild(dom);

    expr.update = function updateEach() {
      // get the new items collection
      expr.value = csp_tmpl_1(expr.val, parent);

      var items = expr.value;
      var frag = createFragment();
      var isObject = !isArray(items) && !isString(items);
      var root = placeholder.parentNode;
      var tmpItems = [];
      var hasKeys = isObject && !!items;

      // if this DOM was removed the update here is useless
      // this condition fixes also a weird async issue on IE in our unit test
      if (!root) { return }

      // object loop. any changes cause full redraw
      if (isObject) {
        items = items ? Object.keys(items).map(function (key) { return mkitem(expr, items[key], key); }) : [];
      }

      // store the amount of filtered items
      var filteredItemsCount = 0;

      // loop all the new items
      each(items, function (_item, index) {
        var i = index - filteredItemsCount;
        var item = !hasKeys && expr.key ? mkitem(expr, _item, index) : _item;

        // skip this item because it must be filtered
        if (ifExpr && !csp_tmpl_1(ifExpr, extend(create(parent), item))) {
          filteredItemsCount ++;
          return
        }

        var itemId = getItemId(keyAttr, _item, item, hasKeyAttrExpr);
        // reorder only if the items are not objects
        // or a key attribute has been provided
        var doReorder = !isObject && mustReorder && typeof _item === T_OBJECT || keyAttr;
        var oldPos = oldItems.indexOf(itemId);
        var isNew = oldPos === -1;
        var pos = !isNew && doReorder ? oldPos : i;
        // does a tag exist in this position?
        var tag = tags[pos];
        var mustAppend = i >= oldItems.length;
        var mustCreate = doReorder && isNew || !doReorder && !tag || !tags[i];

        // new tag
        if (mustCreate) {
          tag = createTag(impl, {
            parent: parent,
            isLoop: isLoop,
            isAnonymous: isAnonymous,
            tagName: tagName,
            root: dom.cloneNode(isAnonymous),
            item: item,
            index: i,
          }, innerHTML);

          // mount the tag
          tag.mount();

          if (mustAppend)
            { append.apply(tag, [frag || root, isVirtual]); }
          else
            { insert.apply(tag, [root, tags[i], isVirtual]); }

          if (!mustAppend) { oldItems.splice(i, 0, item); }
          tags.splice(i, 0, tag);
          if (child) { arrayishAdd(parent.tags, tagName, tag, true); }
        } else if (pos !== i && doReorder) {
          // move
          if (keyAttr || contains(items, oldItems[pos])) {
            move.apply(tag, [root, tags[i], isVirtual]);
            // move the old tag instance
            tags.splice(i, 0, tags.splice(pos, 1)[0]);
            // move the old item
            oldItems.splice(i, 0, oldItems.splice(pos, 1)[0]);
          }

          // update the position attribute if it exists
          if (expr.pos) { tag[expr.pos] = i; }

          // if the loop tags are not custom
          // we need to move all their custom tags into the right position
          if (!child && tag.tags) { moveNestedTags.call(tag, i); }
        }

        // cache the original item to use it in the events bound to this node
        // and its children
        extend(tag.__, {
          item: item,
          index: i,
          parent: parent
        });

        tmpItems[i] = itemId;

        if (!mustCreate) { tag.update(item); }
      });

      // remove the redundant tags
      unmountRedundant(items, tags, filteredItemsCount);

      // clone the items array
      oldItems = tmpItems.slice();

      root.insertBefore(frag, placeholder);
    };

    expr.unmount = function () {
      each(tags, function (t) { t.unmount(); });
    };

    return expr
  }

  var RefExpr = {
    init: function init(dom, parent, attrName, attrValue) {
      this.dom = dom;
      this.attr = attrName;
      this.rawValue = attrValue;
      this.parent = parent;
      this.hasExp = csp_tmpl_1.hasExpr(attrValue);
      return this
    },
    update: function update() {
      var old = this.value;
      var customParent = this.parent && getImmediateCustomParent(this.parent);
      // if the referenced element is a custom tag, then we set the tag itself, rather than DOM
      var tagOrDom = this.dom.__ref || this.tag || this.dom;

      this.value = this.hasExp ? csp_tmpl_1(this.rawValue, this.parent) : this.rawValue;

      // the name changed, so we need to remove it from the old key (if present)
      if (!isBlank(old) && customParent) { arrayishRemove(customParent.refs, old, tagOrDom); }
      if (!isBlank(this.value) && isString(this.value)) {
        // add it to the refs of parent tag (this behavior was changed >=3.0)
        if (customParent) { arrayishAdd(
          customParent.refs,
          this.value,
          tagOrDom,
          // use an array if it's a looped node and the ref is not an expression
          null,
          this.parent.__.index
        ); }

        if (this.value !== old) {
          setAttribute(this.dom, this.attr, this.value);
        }
      } else {
        removeAttribute(this.dom, this.attr);
      }

      // cache the ref bound to this dom node
      // to reuse it in future (see also #2329)
      if (!this.dom.__ref) { this.dom.__ref = tagOrDom; }
    },
    unmount: function unmount() {
      var tagOrDom = this.tag || this.dom;
      var customParent = this.parent && getImmediateCustomParent(this.parent);
      if (!isBlank(this.value) && customParent)
        { arrayishRemove(customParent.refs, this.value, tagOrDom); }
    }
  };

  /**
   * Create a new ref directive
   * @param   { HTMLElement } dom - dom node having the ref attribute
   * @param   { Tag } context - tag instance where the DOM node is located
   * @param   { String } attrName - either 'ref' or 'data-ref'
   * @param   { String } attrValue - value of the ref attribute
   * @returns { RefExpr } a new RefExpr object
   */
  function createRefDirective(dom, tag, attrName, attrValue) {
    return create(RefExpr).init(dom, tag, attrName, attrValue)
  }

  /**
   * Trigger the unmount method on all the expressions
   * @param   { Array } expressions - DOM expressions
   */
  function unmountAll(expressions) {
    each(expressions, function (expr) {
      if (expr.unmount) { expr.unmount(true); }
      else if (expr.tagName) { expr.tag.unmount(true); }
      else if (expr.unmount) { expr.unmount(); }
    });
  }

  var IfExpr = {
    init: function init(dom, tag, expr) {
      removeAttribute(dom, CONDITIONAL_DIRECTIVE);
      extend(this, { tag: tag, expr: expr, stub: createDOMPlaceholder(), pristine: dom });
      var p = dom.parentNode;
      p.insertBefore(this.stub, dom);
      p.removeChild(dom);

      return this
    },
    update: function update$$1() {
      this.value = csp_tmpl_1(this.expr, this.tag);

      if (!this.stub.parentNode) { return }

      if (this.value && !this.current) { // insert
        this.current = this.pristine.cloneNode(true);
        this.stub.parentNode.insertBefore(this.current, this.stub);
        this.expressions = parseExpressions.apply(this.tag, [this.current, true]);
      } else if (!this.value && this.current) { // remove
        this.unmount();
        this.current = null;
        this.expressions = [];
      }

      if (this.value) { update.call(this.tag, this.expressions); }
    },
    unmount: function unmount() {
      if (this.current) {
        if (this.current._tag) {
          this.current._tag.unmount();
        } else if (this.current.parentNode) {
          this.current.parentNode.removeChild(this.current);
        }
      }

      unmountAll(this.expressions || []);
    }
  };

  /**
   * Create a new if directive
   * @param   { HTMLElement } dom - if root dom node
   * @param   { Tag } context - tag instance where the DOM node is located
   * @param   { String } attr - if expression
   * @returns { IFExpr } a new IfExpr object
   */
  function createIfDirective(dom, tag, attr) {
    return create(IfExpr).init(dom, tag, attr)
  }

  /**
   * Walk the tag DOM to detect the expressions to evaluate
   * @this Tag
   * @param   { HTMLElement } root - root tag where we will start digging the expressions
   * @param   { Boolean } mustIncludeRoot - flag to decide whether the root must be parsed as well
   * @returns { Array } all the expressions found
   */
  function parseExpressions(root, mustIncludeRoot) {
    var this$1 = this;

    var expressions = [];

    walkNodes(root, function (dom) {
      var type = dom.nodeType;
      var attr;
      var tagImpl;

      if (!mustIncludeRoot && dom === root) { return }

      // text node
      if (type === 3 && dom.parentNode.tagName !== 'STYLE' && csp_tmpl_1.hasExpr(dom.nodeValue))
        { expressions.push({dom: dom, expr: dom.nodeValue}); }

      if (type !== 1) { return }

      var isVirtual = dom.tagName === 'VIRTUAL';

      // loop. each does it's own thing (for now)
      if (attr = getAttribute(dom, LOOP_DIRECTIVE)) {
        if(isVirtual) { setAttribute(dom, 'loopVirtual', true); } // ignore here, handled in _each
        expressions.push(_each(dom, this$1, attr));
        return false
      }

      // if-attrs become the new parent. Any following expressions (either on the current
      // element, or below it) become children of this expression.
      if (attr = getAttribute(dom, CONDITIONAL_DIRECTIVE)) {
        expressions.push(createIfDirective(dom, this$1, attr));
        return false
      }

      if (attr = getAttribute(dom, IS_DIRECTIVE)) {
        if (csp_tmpl_1.hasExpr(attr)) {
          expressions.push({
            isRtag: true,
            expr: attr,
            dom: dom,
            attrs: [].slice.call(dom.attributes)
          });

          return false
        }
      }

      // if this is a tag, stop traversing here.
      // we ignore the root, since parseExpressions is called while we're mounting that root
      tagImpl = get(dom);

      if(isVirtual) {
        if(getAttribute(dom, 'virtualized')) {dom.parentElement.removeChild(dom); } // tag created, remove from dom
        if(!tagImpl && !getAttribute(dom, 'virtualized') && !getAttribute(dom, 'loopVirtual'))  // ok to create virtual tag
          { tagImpl = { tmpl: dom.outerHTML }; }
      }

      if (tagImpl && (dom !== root || mustIncludeRoot)) {
        var hasIsDirective = getAttribute(dom, IS_DIRECTIVE);
        if(isVirtual && !hasIsDirective) { // handled in update
          // can not remove attribute like directives
          // so flag for removal after creation to prevent maximum stack error
          setAttribute(dom, 'virtualized', true);
          var tag = createTag(
            {tmpl: dom.outerHTML},
            {root: dom, parent: this$1},
            dom.innerHTML
          );

          expressions.push(tag); // no return, anonymous tag, keep parsing
        } else {
          if (hasIsDirective && isVirtual)
            { warn(("Virtual tags shouldn't be used together with the \"" + IS_DIRECTIVE + "\" attribute - https://github.com/riot/riot/issues/2511")); }

          expressions.push(
            initChild(
              tagImpl,
              {
                root: dom,
                parent: this$1
              },
              dom.innerHTML,
              this$1
            )
          );
          return false
        }
      }

      // attribute expressions
      parseAttributes.apply(this$1, [dom, dom.attributes, function (attr, expr) {
        if (!expr) { return }
        expressions.push(expr);
      }]);
    });

    return expressions
  }

  /**
   * Calls `fn` for every attribute on an element. If that attr has an expression,
   * it is also passed to fn.
   * @this Tag
   * @param   { HTMLElement } dom - dom node to parse
   * @param   { Array } attrs - array of attributes
   * @param   { Function } fn - callback to exec on any iteration
   */
  function parseAttributes(dom, attrs, fn) {
    var this$1 = this;

    each(attrs, function (attr) {
      if (!attr) { return false }

      var name = attr.name;
      var bool = isBoolAttr(name);
      var expr;

      if (contains(REF_DIRECTIVES, name) && dom.tagName.toLowerCase() !== YIELD_TAG) {
        expr =  createRefDirective(dom, this$1, name, attr.value);
      } else if (csp_tmpl_1.hasExpr(attr.value)) {
        expr = {dom: dom, expr: attr.value, attr: name, bool: bool};
      }

      fn(attr, expr);
    });
  }

  /**
   * Manage the mount state of a tag triggering also the observable events
   * @this Tag
   * @param { Boolean } value - ..of the isMounted flag
   */
  function setMountState(value) {
    var ref = this.__;
    var isAnonymous = ref.isAnonymous;
    var skipAnonymous = ref.skipAnonymous;

    define(this, 'isMounted', value);

    if (!isAnonymous || !skipAnonymous) {
      if (value) { this.trigger('mount'); }
      else {
        this.trigger('unmount');
        this.off('*');
        this.__.wasCreated = false;
      }
    }
  }

  /**
   * Mount the current tag instance
   * @returns { Tag } the current tag instance
   */
  function componentMount(tag$$1, dom, expressions, opts) {
    var __ = tag$$1.__;
    var root = __.root;
    root._tag = tag$$1; // keep a reference to the tag just created

    // Read all the attrs on this instance. This give us the info we need for updateOpts
    parseAttributes.apply(__.parent, [root, root.attributes, function (attr, expr) {
      if (!__.isAnonymous && RefExpr.isPrototypeOf(expr)) { expr.tag = tag$$1; }
      attr.expr = expr;
      __.instAttrs.push(attr);
    }]);

    // update the root adding custom attributes coming from the compiler
    walkAttributes(__.impl.attrs, function (k, v) { __.implAttrs.push({name: k, value: v}); });
    parseAttributes.apply(tag$$1, [root, __.implAttrs, function (attr, expr) {
      if (expr) { expressions.push(expr); }
      else { setAttribute(root, attr.name, attr.value); }
    }]);

    // initialiation
    updateOpts.apply(tag$$1, [__.isLoop, __.parent, __.isAnonymous, opts, __.instAttrs]);

    // add global mixins
    var globalMixin = mixin(GLOBAL_MIXIN);

    if (globalMixin && !__.skipAnonymous) {
      for (var i in globalMixin) {
        if (globalMixin.hasOwnProperty(i)) {
          tag$$1.mixin(globalMixin[i]);
        }
      }
    }

    if (__.impl.fn) { __.impl.fn.call(tag$$1, opts); }

    if (!__.skipAnonymous) { tag$$1.trigger('before-mount'); }

    // parse layout after init. fn may calculate args for nested custom tags
    each(parseExpressions.apply(tag$$1, [dom, __.isAnonymous]), function (e) { return expressions.push(e); });

    tag$$1.update(__.item);

    if (!__.isAnonymous && !__.isInline) {
      while (dom.firstChild) { root.appendChild(dom.firstChild); }
    }

    define(tag$$1, 'root', root);

    // if we need to wait that the parent "mount" or "updated" event gets triggered
    if (!__.skipAnonymous && tag$$1.parent) {
      var p = getImmediateCustomParent(tag$$1.parent);
      p.one(!p.isMounted ? 'mount' : 'updated', function () {
        setMountState.call(tag$$1, true);
      });
    } else {
      // otherwise it's not a child tag we can trigger its mount event
      setMountState.call(tag$$1, true);
    }

    tag$$1.__.wasCreated = true;

    return tag$$1
  }

  /**
   * Unmount the tag instance
   * @param { Boolean } mustKeepRoot - if it's true the root node will not be removed
   * @returns { Tag } the current tag instance
   */
  function tagUnmount(tag, mustKeepRoot, expressions) {
    var __ = tag.__;
    var root = __.root;
    var tagIndex = __TAGS_CACHE.indexOf(tag);
    var p = root.parentNode;

    if (!__.skipAnonymous) { tag.trigger('before-unmount'); }

    // clear all attributes coming from the mounted tag
    walkAttributes(__.impl.attrs, function (name) {
      if (startsWith(name, ATTRS_PREFIX))
        { name = name.slice(ATTRS_PREFIX.length); }

      removeAttribute(root, name);
    });

    // remove all the event listeners
    tag.__.listeners.forEach(function (dom) {
      Object.keys(dom[RIOT_EVENTS_KEY]).forEach(function (eventName) {
        dom.removeEventListener(eventName, dom[RIOT_EVENTS_KEY][eventName]);
      });
    });

    // remove tag instance from the global tags cache collection
    if (tagIndex !== -1) { __TAGS_CACHE.splice(tagIndex, 1); }

    // clean up the parent tags object
    if (__.parent && !__.isAnonymous) {
      var ptag = getImmediateCustomParent(__.parent);

      if (__.isVirtual) {
        Object
          .keys(tag.tags)
          .forEach(function (tagName) { return arrayishRemove(ptag.tags, tagName, tag.tags[tagName]); });
      } else {
        arrayishRemove(ptag.tags, __.tagName, tag);
      }
    }

    // unmount all the virtual directives
    if (tag.__.virts) {
      each(tag.__.virts, function (v) {
        if (v.parentNode) { v.parentNode.removeChild(v); }
      });
    }

    // allow expressions to unmount themselves
    unmountAll(expressions);
    each(__.instAttrs, function (a) { return a.expr && a.expr.unmount && a.expr.unmount(); });

    // clear the tag html if it's necessary
    if (mustKeepRoot) { setInnerHTML(root, ''); }
    // otherwise detach the root tag from the DOM
    else if (p) { p.removeChild(root); }

    // custom internal unmount function to avoid relying on the observable
    if (__.onUnmount) { __.onUnmount(); }

    // weird fix for a weird edge case #2409 and #2436
    // some users might use your software not as you've expected
    // so I need to add these dirty hacks to mitigate unexpected issues
    if (!tag.isMounted) { setMountState.call(tag, true); }

    setMountState.call(tag, false);

    delete root._tag;

    return tag
  }

  /**
   * Tag creation factory function
   * @constructor
   * @param { Object } impl - it contains the tag template, and logic
   * @param { Object } conf - tag options
   * @param { String } innerHTML - html that eventually we need to inject in the tag
   */
  function createTag(impl, conf, innerHTML) {
    if ( impl === void 0 ) impl = {};
    if ( conf === void 0 ) conf = {};

    var tag = conf.context || {};
    var opts = conf.opts || {};
    var parent = conf.parent;
    var isLoop = conf.isLoop;
    var isAnonymous = !!conf.isAnonymous;
    var skipAnonymous = settings.skipAnonymousTags && isAnonymous;
    var item = conf.item;
    // available only for the looped nodes
    var index = conf.index;
    // All attributes on the Tag when it's first parsed
    var instAttrs = [];
    // expressions on this type of Tag
    var implAttrs = [];
    var tmpl = impl.tmpl;
    var expressions = [];
    var root = conf.root;
    var tagName = conf.tagName || getName(root);
    var isVirtual = tagName === 'virtual';
    var isInline = !isVirtual && !tmpl;
    var dom;

    if (isInline || isLoop && isAnonymous) {
      dom = root;
    } else {
      if (!isVirtual) { root.innerHTML = ''; }
      dom = mkdom(tmpl, innerHTML, isSvg(root));
    }

    // make this tag observable
    if (!skipAnonymous) { observable(tag); }

    // only call unmount if we have a valid __TAG_IMPL (has name property)
    if (impl.name && root._tag) { root._tag.unmount(true); }

    define(tag, '__', {
      impl: impl,
      root: root,
      skipAnonymous: skipAnonymous,
      implAttrs: implAttrs,
      isAnonymous: isAnonymous,
      instAttrs: instAttrs,
      innerHTML: innerHTML,
      tagName: tagName,
      index: index,
      isLoop: isLoop,
      isInline: isInline,
      item: item,
      parent: parent,
      // tags having event listeners
      // it would be better to use weak maps here but we can not introduce breaking changes now
      listeners: [],
      // these vars will be needed only for the virtual tags
      virts: [],
      wasCreated: false,
      tail: null,
      head: null
    });

    // tag protected properties
    return [
      ['isMounted', false],
      // create a unique id to this tag
      // it could be handy to use it also to improve the virtual dom rendering speed
      ['_riot_id', uid()],
      ['root', root],
      ['opts', opts, { writable: true, enumerable: true }],
      ['parent', parent || null],
      // protect the "tags" and "refs" property from being overridden
      ['tags', {}],
      ['refs', {}],
      ['update', function (data) { return componentUpdate(tag, data, expressions); }],
      ['mixin', function () {
        var mixins = [], len = arguments.length;
        while ( len-- ) mixins[ len ] = arguments[ len ];

        return componentMixin.apply(void 0, [ tag ].concat( mixins ));
    }],
      ['mount', function () { return componentMount(tag, dom, expressions, opts); }],
      ['unmount', function (mustKeepRoot) { return tagUnmount(tag, mustKeepRoot, expressions); }]
    ].reduce(function (acc, ref) {
      var key = ref[0];
      var value = ref[1];
      var opts = ref[2];

      define(tag, key, value, opts);
      return acc
    }, extend(tag, item))
  }

  /**
   * Mount a tag creating new Tag instance
   * @param   { Object } root - dom node where the tag will be mounted
   * @param   { String } tagName - name of the riot tag we want to mount
   * @param   { Object } opts - options to pass to the Tag instance
   * @param   { Object } ctx - optional context that will be used to extend an existing class ( used in riot.Tag )
   * @returns { Tag } a new Tag instance
   */
  function mount$1(root, tagName, opts, ctx) {
    var impl = __TAG_IMPL[tagName];
    var implClass = __TAG_IMPL[tagName].class;
    var context = ctx || (implClass ? create(implClass.prototype) : {});
    // cache the inner HTML to fix #855
    var innerHTML = root._innerHTML = root._innerHTML || root.innerHTML;
    var conf = extend({ root: root, opts: opts, context: context }, { parent: opts ? opts.parent : null });
    var tag;

    if (impl && root) { tag = createTag(impl, conf, innerHTML); }

    if (tag && tag.mount) {
      tag.mount(true);
      // add this tag to the virtualDom variable
      if (!contains(__TAGS_CACHE, tag)) { __TAGS_CACHE.push(tag); }
    }

    return tag
  }



  var tags = /*#__PURE__*/Object.freeze({
    arrayishAdd: arrayishAdd,
    getTagName: getName,
    inheritParentProps: inheritParentProps,
    mountTo: mount$1,
    selectTags: query,
    arrayishRemove: arrayishRemove,
    getTag: get,
    initChildTag: initChild,
    moveChildTag: moveChild,
    makeReplaceVirtual: makeReplaceVirtual,
    getImmediateCustomParentTag: getImmediateCustomParent,
    makeVirtual: makeVirtual,
    moveVirtual: moveVirtual,
    unmountAll: unmountAll,
    createIfDirective: createIfDirective,
    createRefDirective: createRefDirective
  });

  /**
   * Riot public api
   */
  var settings$1 = settings;
  var util = {
    tmpl: csp_tmpl_1,
    brackets: csp_tmpl_2,
    styleManager: styleManager,
    vdom: __TAGS_CACHE,
    styleNode: styleManager.styleNode,
    // export the riot internal utils as well
    dom: dom,
    check: check,
    misc: misc,
    tags: tags
  };

  // export the core props/methods
  var Tag$1 = Tag;
  var tag$1 = tag;
  var tag2$1 = tag2;
  var mount$2 = mount;
  var mixin$1 = mixin;
  var update$2 = update$1;
  var unregister$1 = unregister;
  var version$1 = version;
  var observable$1 = observable;

  var riot$1 = extend({}, core, {
    observable: observable,
    settings: settings$1,
    util: util,
  });

  exports.settings = settings$1;
  exports.util = util;
  exports.Tag = Tag$1;
  exports.tag = tag$1;
  exports.tag2 = tag2$1;
  exports.mount = mount$2;
  exports.mixin = mixin$1;
  exports.update = update$2;
  exports.unregister = unregister$1;
  exports.version = version$1;
  exports.observable = observable$1;
  exports.default = riot$1;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
