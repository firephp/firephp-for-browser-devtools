PINF.bundle("", function(require) {
	require.memoize("/main.js", function (require, exports, module) {
       var pmodule = module;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

((function() {

    var EVAL = require("./explicit-unsafe-eval");

    function Domplate(exports) {

/**
 * Original source by Joe Hewitt (http://joehewitt.com/).
 * @see http://code.google.com/p/fbug/source/browse/branches/firebug1.4/content/firebug/domplate.js
 */

/**
 * Modifications by Christoph Dorn <christoph@christophdorn.com>:
 * 
 * Sep  7, 2008: Added DomplateDebug logging
 * Sep 10, 2008: Added support for multiple function arguments
 * Sep 16, 2008: Removed calls to FBTrace as DomplateDebug does that now
 *               Removed requirement for FBL
 *               Removed use of top. scope
 *               Started work on IF support
 * 
 * 
 */

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

exports.tags = {};
exports.tags._domplate_ = exports;


var DomplateTag = exports.DomplateTag = function DomplateTag(tagName)
{
    this.tagName = tagName;
}

function DomplateEmbed()
{
}

function DomplateLoop()
{
}

function DomplateIf()
{
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *



function copyArray(oldArray)
{
    var ary = [];
    if (oldArray)
        for (var i = 0; i < oldArray.length; ++i)
            ary.push(oldArray[i]);
   return ary;
}

function copyObject(l, r)
{
    var m = {};
    extend(m, l);
    extend(m, r);
    return m;
}

function extend(l, r)
{
    for (var n in r)
        l[n] = r[n];
}


// * DEBUG * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var DomplateDebug
DomplateDebug = exports.DomplateDebug = {
  
  enabled: false,
  console: null,
  
  replaceInstance: function(instance) {
      DomplateDebug = instance;
  },
  
  setEnabled: function(enabled)
  {
      this.enabled = enabled;
  },
  
  setConsole: function(console)
  {
      this.console = console;
  },
  
  log: function(label, value)
  {
      if(!this.enabled) return;
      if(arguments.length==2) {
        this.console.log(label+': ',value);
      } else {
        this.console.log(label);
      }
  },
  logVar: function(label, value)
  {
      if(!this.enabled) return;
      this.console.log(label+': ',[value]);
  },
  logInfo: function(message)
  {
      if(!this.enabled) return;
      this.console.info(message);
  },
  logWarn: function(message)
  {
      if(!this.enabled) return;
      this.console.warn(message);
  },
  logJs: function(label, value)
  {
      if(!this.enabled) return;
      value = value.replace(/;/g,';\n');
      value = value.replace(/{/g,'{\n');
      this.console.info(value);
  },
  reformatArguments: function(args)
  {
      if(!this.enabled) return;
      var returnVar = new Array();
      for (var i = 0; i < args.length; ++i)
      {
          var index = args[i];
          returnVar.push([index]);
      }
      return {'arguments':returnVar}; 
  },
  startGroup: function(label,args)
  {
      if(!this.enabled) return;
      if(this.isArray(label)) {
        label.splice(1,0,' - ');
        this.console.group.apply(this,label);
      }  else {
        this.console.group(label);
      } 
      if(args!=null) {
          this.logVar('ARGUMENTS',DomplateDebug.reformatArguments(args));
      }  
  },
  endGroup: function()
  {
      if(!this.enabled) return;
      this.console.groupEnd();
  },
  isArray: function(obj) {
      if (obj.constructor.toString().indexOf("Array") != -1) {
          return true;
      }
      return false;
  }
}
// * DEBUG * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *






var womb = null;

var domplate = exports.domplate = function()
{
    var lastSubject;
    for (var i = 0; i < arguments.length; ++i)
        lastSubject = lastSubject ? copyObject(lastSubject, arguments[i]) : arguments[i];

    for (var name in lastSubject)
    {
        var val = lastSubject[name];
        if (isTag(val))
            val.tag.subject = lastSubject;
    }

    return lastSubject;
};


domplate.context = function(context, fn)
{
    var lastContext = domplate.lastContext;
    domplate.topContext = context;
    fn.apply(context);
    domplate.topContext = lastContext;
};

exports.tags.TAG = function()
//domplate.TAG = function()
{
    var embed = new DomplateEmbed();
    return embed.merge(arguments);
};

exports.tags.FOR = domplate.FOR = function()
{
    var loop = new DomplateLoop();
    return loop.merge(arguments);
};

exports.tags.IF = domplate.IF = function()
{
    var loop = new DomplateIf();
    return loop.merge(arguments);
};

DomplateTag.prototype =
{
    merge: function(args, oldTag)
    {
        if (oldTag)
            this.tagName = oldTag.tagName;

        this.context = oldTag ? oldTag.context : null;
        this.subject = oldTag ? oldTag.subject : null;
        this.attrs = oldTag ? copyObject(oldTag.attrs) : {};
        this.classes = oldTag ? copyObject(oldTag.classes) : {};
        this.props = oldTag ? copyObject(oldTag.props) : null;
        this.listeners = oldTag ? copyArray(oldTag.listeners) : null;
        this.children = oldTag ? copyArray(oldTag.children) : [];
        this.vars = oldTag ? copyArray(oldTag.vars) : [];

        var attrs = args.length ? args[0] : null;
        var hasAttrs = typeof(attrs) == "object" && !isTag(attrs);

        this.resources = {};
        this.children = [];

        if (domplate.topContext)
            this.context = domplate.topContext;

        if (args.length)
            parseChildren(args, hasAttrs ? 1 : 0, this.vars, this.children);

        if (hasAttrs)
            this.parseAttrs(attrs);

        return creator(this, DomplateTag);
    },

    parseAttrs: function(args)
    {
        DomplateDebug.startGroup('DomplateTag.parseAttrs',arguments);

        for (var name in args)
        {
            DomplateDebug.logVar('name',name);
            DomplateDebug.logVar('args[name]',args[name]);

            var val = parseValue(args[name]);
            readPartNames(val, this.vars);

            if (name.indexOf("on") == 0)
            {
                var eventName = name.substr(2);
                if (!this.listeners)
                    this.listeners = [];
                this.listeners.push(eventName, val);
            }
            else if (name[0] == "_")
            {
                var propName = name.substr(1);
                if (!this.props)
                    this.props = {};
                this.props[propName] = val;
            }
            else if (name[0] == "$")
            {
                var className = name.substr(1);
                if (!this.classes)
                    this.classes = {};
                this.classes[className] = val;
            }
            else
            {
                if (name == "class" && this.attrs.hasOwnProperty(name) )
                    this.attrs[name] += " " + val;
                else
                    this.attrs[name] = val;
            }
        }

        DomplateDebug.endGroup();
    },

    compile: function()
    {
        DomplateDebug.startGroup(['DomplateTag.compile',this.tagName]);

        if (this.renderMarkup) {
    
            DomplateDebug.log('ALREADY COMPILED');

            DomplateDebug.endGroup();
            return;
        }

        if(this.subject._resources) {
            this.resources = this.subject._resources();     
        }

        this.compileMarkup();
        this.compileDOM();

        DomplateDebug.endGroup();
    },

    compileMarkup: function()
    {
        DomplateDebug.startGroup('DomplateTag.compileMarkup');

        this.markupArgs = [];
        var topBlock = [], topOuts = [], blocks = [], info = {args: this.markupArgs, argIndex: 0};
         
        this.generateMarkup(topBlock, topOuts, blocks, info);
        this.addCode(topBlock, topOuts, blocks);

        var fnBlock = ['(function (__code__, __context__, __in__, __out__'];
        for (var i = 0; i < info.argIndex; ++i)
            fnBlock.push(', s', i);
        fnBlock.push(') {');

        fnBlock.push('  DomplateDebug.startGroup([\' .. Run Markup .. \',\''+this.tagName+'\'],arguments);');
        fnBlock.push('  DomplateDebug.logJs(\'js\',\'__SELF__JS__\');');

        if (this.subject)
            fnBlock.push('  with (this) {');
        if (this.context) 
            fnBlock.push('  with (__context__) {');
        fnBlock.push('  with (__in__) {');

        fnBlock.push.apply(fnBlock, blocks);

        if (this.subject)
            fnBlock.push('  }');
        if (this.context)
            fnBlock.push('  }');

        fnBlock.push('DomplateDebug.endGroup();');

        fnBlock.push('}})');

        var self = this;
        function __link__(tag, code, outputs, args)
        {
            if (!tag) {
                DomplateDebug.logWarn('tag not defined');
                return;
            }
            if (!tag.tag) {
                DomplateDebug.logVar('tag', tag);
                DomplateDebug.logWarn('tag.tag not defined');
                return;
            }

            tag.tag.compile();

            // merge resources from sub-tags
            if(self.resources && tag.tag.resources && tag.tag.resources!==self.resources) {
                for( var key in tag.tag.resources ) {
                    self.resources[key] = tag.tag.resources[key];
                }
            }

            var tagOutputs = [];
            var markupArgs = [code, (tag.tag.context)?tag.tag.context:null, args, tagOutputs];
            markupArgs.push.apply(markupArgs, tag.tag.markupArgs);
            tag.tag.renderMarkup.apply(tag.tag.subject, markupArgs);

            outputs.push(tag);
            outputs.push(tagOutputs);
        }

        function __escape__(value)
        {
            function replaceChars(ch)
            {
                switch (ch)
                {
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
            };
            return String(value).replace(/[<>&"']/g, replaceChars);
        }

        function __loop__(iter, outputs, fn)
        {
            var iterOuts = [];
            outputs.push(iterOuts);

            if (iter instanceof Array || typeof iter === "array" || Array.isArray(iter))
            {
                iter = new ArrayIterator(iter);
            }

            try
            {
                if (!iter || !iter.next) {
                    console.error("Cannot iterate loop", iter, typeof iter, outputs, fn);
                    throw new Exception("Cannot iterate loop as iter.next() method is not defined");
                }
                while (1)
                {
                    var value = iter.next();
                    var itemOuts = [0,0];
                    iterOuts.push(itemOuts);
                    fn.apply(this, [value, itemOuts]);
                }
            }
            catch (exc)
            {
                if (exc != StopIteration)
                    throw exc;
            }
        }

        function __if__(booleanVar, outputs, fn)
        {
            // "outputs" is what gets passed to the compiled DOM when it runs.
            // It is used by the dom to make decisions as to how many times to
            // run children for FOR loops etc ...
            // For the IF feature we set a 1 or 0 depending on whether
            // the sub template ran or not. If it did not run then no HTML
            // markup was generated and accordingly the DOM elements should and
            // can not be traversed.
          
            var ifControl = [];
            outputs.push(ifControl);


            DomplateDebug.logVar('j  .. booleanVar',booleanVar);

            if(booleanVar) {
              ifControl.push(1);
              fn.apply(this, [ifControl]);
            } else {
              ifControl.push(0);
            }
        }

        var js = fnBlock.join("");
        
        DomplateDebug.logVar('js',js);

        // Inject the compiled JS so we can view it later in the console when the code runs     
        js = js.replace('__SELF__JS__',js.replace(/\'/g,'\\\''));
        
//system.print(js,'JS');
        
        this.renderMarkup = EVAL.compileMarkup(js, {
            DomplateDebug: DomplateDebug,
            __escape__: __escape__,
            __if__: __if__,
            __loop__: __loop__,
            __link__: __link__
        });

        DomplateDebug.endGroup();
    },

    getVarNames: function(args)
    {
        if (this.vars)
            args.push.apply(args, this.vars);

        for (var i = 0; i < this.children.length; ++i)
        {
            var child = this.children[i];
            if (isTag(child))
                child.tag.getVarNames(args);
            else if (child instanceof Parts)
            {
                for (var i = 0; i < child.parts.length; ++i)
                {
                    if (child.parts[i] instanceof Variables)
                    {
                        var name = child.parts[i].names[0];
                        var names = name.split(".");
                        args.push(names[0]);
                    }
                }
            }
        }
    },

    generateMarkup: function(topBlock, topOuts, blocks, info)
    {
        topBlock.push(',"<', this.tagName, '"');

        for (var name in this.attrs)
        {
            if (name != "class")
            {
                var val = this.attrs[name];
                topBlock.push(', " ', name, '=\\""');
                addParts(val, ',', topBlock, info, true);
                topBlock.push(', "\\""');
            }
        }

        if (this.listeners)
        {
            for (var i = 0; i < this.listeners.length; i += 2)
                readPartNames(this.listeners[i+1], topOuts);
        }

        if (this.props)
        {
            for (var name in this.props)
                readPartNames(this.props[name], topOuts);
        }

        if ( this.attrs.hasOwnProperty("class") || this.classes)
        {
            topBlock.push(', " class=\\""');
            if (this.attrs.hasOwnProperty("class"))
                addParts(this.attrs["class"], ',', topBlock, info, true);
              topBlock.push(', " "');
            for (var name in this.classes)
            {
                topBlock.push(', (');
                addParts(this.classes[name], '', topBlock, info);
                topBlock.push(' ? "', name, '" + " " : "")');
            }
            topBlock.push(', "\\""');
        }
        if(this.tagName=="br") {
            topBlock.push(',"/>"');
        } else {
            topBlock.push(',">"');
            this.generateChildMarkup(topBlock, topOuts, blocks, info);
    
            topBlock.push(',"</', this.tagName, '>"');
        }
    },

    generateChildMarkup: function(topBlock, topOuts, blocks, info)
    {
        for (var i = 0; i < this.children.length; ++i)
        {
            var child = this.children[i];
            if (isTag(child))
                child.tag.generateMarkup(topBlock, topOuts, blocks, info);
            else
                addParts(child, ',', topBlock, info, true);
        }
    },

    addCode: function(topBlock, topOuts, blocks)
    {
        if (topBlock.length)
            blocks.push('    __code__.push(""', topBlock.join(""), ');');
        if (topOuts.length)
            blocks.push('__out__.push(', topOuts.join(","), ');');
        topBlock.splice(0, topBlock.length);
        topOuts.splice(0, topOuts.length);
    },

    addLocals: function(blocks)
    {
        var varNames = [];
        this.getVarNames(varNames);

        var map = {};
        for (var i = 0; i < varNames.length; ++i)
        {
            var name = varNames[i];
            if ( map.hasOwnProperty(name) )
                continue;

            map[name] = 1;
            var names = name.split(".");
            blocks.push('var ', names[0] + ' = ' + '__in__.' + names[0] + ';');
        }
    },

    compileDOM: function()
    {
        DomplateDebug.startGroup('DomplateTag.compileDOM');
      
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
        for (var i = 0; i < path.staticIndex; ++i)
            fnBlock.push(', ', 's'+i);
        for (var i = 0; i < path.renderIndex; ++i)
            fnBlock.push(', ', 'd'+i);
        fnBlock.push(') {');

        fnBlock.push('  DomplateDebug.startGroup([\' .. Run DOM .. \',\''+this.tagName+'\'],arguments);');

        fnBlock.push('  DomplateDebug.logJs(\'js\',\'__SELF__JS__\');');

        
        for (var i = 0; i < path.loopIndex; ++i)
            fnBlock.push('  var l', i, ' = 0;');
        for (var i = 0; i < path.ifIndex; ++i)
            fnBlock.push('  var if_', i, ' = 0;');
        for (var i = 0; i < path.embedIndex; ++i)
            fnBlock.push('  var e', i, ' = 0;');

        if (this.subject) {
            fnBlock.push('  with (this) {');
        }
        if (this.context) {
            fnBlock.push('    with (context) {');
            fnBlock.push('      DomplateDebug.logVar(\'context\',context);');
        }

        fnBlock.push(blocks.join(""));

        if (this.context)
            fnBlock.push('    }');
        if (this.subject)
            fnBlock.push('  }');

        fnBlock.push('  DomplateDebug.endGroup();');

        fnBlock.push('  return ', nodeCount, ';');
        fnBlock.push('})');

        function __bind__(object, fn)
        {
            return function(event) { return fn.apply(object, [event]); }
        }

        function __link__(node, tag, args)
        {
            DomplateDebug.startGroup('__link__',arguments);

            if (!tag) {
                DomplateDebug.logWarn('tag not defined');
                return;
            }
            if (!tag.tag) {
                DomplateDebug.logVar('tag', tag);
                DomplateDebug.logWarn('tag.tag not defined');
                return;
            }
            
            tag.tag.compile();

            var domArgs = [node, (tag.tag.context)?tag.tag.context:null, 0];
            domArgs.push.apply(domArgs, tag.tag.domArgs);
            domArgs.push.apply(domArgs, args);

            var oo =tag.tag.renderDOM.apply(tag.tag.subject, domArgs);
            
            DomplateDebug.endGroup();
            
            return oo;
        }

        var self = this;
        function __loop__(iter, fn)
        {
            DomplateDebug.startGroup('__loop__',arguments);
            DomplateDebug.logVar('iter',iter);
            DomplateDebug.logVar('fn',fn);

            var nodeCount = 0;
            for (var i = 0; i < iter.length; ++i)
            {
                iter[i][0] = i;
                iter[i][1] = nodeCount;
                nodeCount += fn.apply(this, iter[i]);
    
                DomplateDebug.logVar(' .. nodeCount',nodeCount);
            }

            DomplateDebug.logVar('iter',iter);

            DomplateDebug.endGroup();
            
            return nodeCount;
        }

        function __if__(control, fn)
        {
            DomplateDebug.startGroup('__if__',arguments);

            DomplateDebug.logVar('control', control);
            DomplateDebug.logVar('fn',fn);

            // Check the control structure to see if we should run the IF
            if(control && control[0]) {
              // Lets run it
              // TODO: If in debug mode add info about the IF expression that caused the running
              DomplateDebug.logInfo('Running IF');
              fn.apply(this, [0,control[1]]);
            } else {
              // We need to skip it
              // TODO: If in debug mode add info about the IF expression that caused the skip
              DomplateDebug.logInfo('Skipping IF');
            }
    
            DomplateDebug.endGroup();
        }

        function __path__(parent, offset)
        {
            DomplateDebug.startGroup('__path__',arguments);
            DomplateDebug.logVar('parent',parent);

            var root = parent;

            for (var i = 2; i < arguments.length; ++i)
            {
                var index = arguments[i];

                if (i == 3)
                    index += offset;

                if (index == -1) {
                    parent = parent.parentNode;
                } else {
                    // NOTE: If `DIV(IF(...), FOR(...))` then `parent` is null because of an offset issue with IF(). Cannot figure it out.
                    // WORKAROUND: `DIV(DIV(IF(...)), FOR(...))`
                    parent = parent.childNodes[index];
                }    
            }

            DomplateDebug.endGroup();

            return parent;
        }

        var js = fnBlock.join("");
        
        DomplateDebug.logVar('js',js);
        
        // Inject the compiled JS so we can view it later in the console when the code runs     
        js = js.replace('__SELF__JS__',js.replace(/\'/g,'\\\''));

        this.renderDOM = EVAL.compileDOM(js, {
            DomplateDebug: DomplateDebug,
            __path__: __path__,
            __bind__: __bind__,
            __if__: __if__,
            __link__:__link__,
            __loop__: __loop__
        });
        
        DomplateDebug.endGroup();
    },

    generateDOM: function(path, blocks, args)
    {
        DomplateDebug.startGroup(['DomplateTag.generateDOM',this.tagName],arguments);

        if (this.listeners || this.props)
            this.generateNodePath(path, blocks);

        if (this.listeners)
        {
            for (var i = 0; i < this.listeners.length; i += 2)
            {
                var val = this.listeners[i+1];
                var arg = generateArg(val, path, args);
                blocks.push('node.addEventListener("', this.listeners[i], '", __bind__(this, ', arg, '), false);');
            }
        }

        if (this.props)
        {
            for (var name in this.props)
            {
                var val = this.props[name];
                var arg = generateArg(val, path, args);
                blocks.push('node.', name, ' = ', arg, ';');
            }
        }

        this.generateChildDOM(path, blocks, args);
        DomplateDebug.endGroup();        
        return 1;
    },

    generateNodePath: function(path, blocks)
    {
        DomplateDebug.startGroup('DomplateTag.generateNodePath',arguments);

        blocks.push("        node = __path__(root, o");
        for (var i = 0; i < path.length; ++i)
            blocks.push(",", path[i]);
        blocks.push(");");
        
        DomplateDebug.endGroup();
    },

    generateChildDOM: function(path, blocks, args)
    {
        path.push(0);
        for (var i = 0; i < this.children.length; ++i)
        {
            var child = this.children[i];
            if (isTag(child))
                path[path.length-1] += '+' + child.tag.generateDOM(path, blocks, args);
            else
                path[path.length-1] += '+1';
        }
        path.pop();
    }
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

DomplateEmbed.prototype = copyObject(DomplateTag.prototype,
{
    merge: function(args, oldTag)
    {
        DomplateDebug.startGroup('DomplateEmbed.merge',arguments);

        this.value = oldTag ? oldTag.value : parseValue(args[0]);
        this.attrs = oldTag ? oldTag.attrs : {};
        this.vars = oldTag ? copyArray(oldTag.vars) : [];

        var attrs = args[1];
        for (var name in attrs)
        {
            var val = parseValue(attrs[name]);
            this.attrs[name] = val;
            readPartNames(val, this.vars);
        }

        var retval = creator(this, DomplateEmbed);
        
        DomplateDebug.endGroup();

        return retval;        
    },

    // Used for locales only
    getVarNames: function(names)
    {
        if (this.value instanceof Parts)
            names.push(this.value.parts[0].name);

        if (this.vars)
            names.push.apply(names, this.vars);
    },

    generateMarkup: function(topBlock, topOuts, blocks, info)
    {
        DomplateDebug.startGroup('DomplateEmbed.generateMarkup',arguments);

        this.addCode(topBlock, topOuts, blocks);

        blocks.push('__link__(');
        addParts(this.value, '', blocks, info);
        blocks.push(', __code__, __out__, {');

        var lastName = null;
        for (var name in this.attrs)
        {
            if (lastName)
                blocks.push(',');
            lastName = name;

            var val = this.attrs[name];
            blocks.push('"', name, '":');
            addParts(val, '', blocks, info);
        }

        blocks.push('});');
        //this.generateChildMarkup(topBlock, topOuts, blocks, info);

        DomplateDebug.endGroup();
    },

    generateDOM: function(path, blocks, args)
    {
        DomplateDebug.startGroup('DomplateEmbed.generateDOM',arguments);

        var embedName = 'e'+path.embedIndex++;

        this.generateNodePath(path, blocks);

        var valueName = 'd' + path.renderIndex++;
        var argsName = 'd' + path.renderIndex++;
        
        blocks.push('        ',embedName + ' = __link__(node, ', valueName, ', ', argsName, ');');
        
        DomplateDebug.endGroup();

        return embedName;
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

DomplateLoop.prototype = copyObject(DomplateTag.prototype,
{
    merge: function(args, oldTag)
    {
        DomplateDebug.startGroup('DomplateLoop.merge',arguments);

        this.varName = oldTag ? oldTag.varName : args[0];
        this.iter = oldTag ? oldTag.iter : parseValue(args[1]);
        this.vars = [];

        this.children = oldTag ? copyArray(oldTag.children) : [];

        var offset = Math.min(args.length, 2);
        parseChildren(args, offset, this.vars, this.children);

        var retval = creator(this, DomplateLoop);

        DomplateDebug.endGroup();
        
        return retval;
    },

    // Used for locales only
    getVarNames: function(names)
    {
        if (this.iter instanceof Parts)
            names.push(this.iter.parts[0].name);

        DomplateTag.prototype.getVarNames.apply(this, [names]);
    },

    generateMarkup: function(topBlock, topOuts, blocks, info)
    {
        DomplateDebug.startGroup('DomplateLoop.generateMarkup',arguments);

        this.addCode(topBlock, topOuts, blocks);

        DomplateDebug.logVar('this.iter',this.iter);

        // We are in a FOR loop and our this.iter property contains
        // either a simple function name as a string or a Parts object
        // with only ONE Variables object. There is only one variables object
        // as the FOR argument can contain only ONE valid function callback
        // with optional arguments or just one variable. Allowed arguments are
        // func or $var or $var.sub or $var|func or $var1,$var2|func or $var|func1|func2 or $var1,$var2|func1|func2
        var iterName;
        if (this.iter instanceof Parts)
        {
            // We have a function with optional aruments or just one variable
            var part = this.iter.parts[0];
            
            // Join our function arguments or variables
            // If the user has supplied multiple variables without a function
            // this will create an invalid result and we should probably add an
            // error message here or just take the first variable
            iterName = part.names.join(',');

            // Nest our functions
            if (part.format)
            {
                DomplateDebug.logVar('part.format',part.format);
        
                for (var i = 0; i < part.format.length; ++i)
                    iterName = part.format[i] + "(" + iterName + ")";
            }
        } else {
            // We have just a simple function name without any arguments
            iterName = this.iter;
        }
        
        DomplateDebug.logVar('iterName',iterName);

        blocks.push('    __loop__.apply(this, [', iterName, ', __out__, function(', this.varName, ', __out__) {');
        this.generateChildMarkup(topBlock, topOuts, blocks, info);
        this.addCode(topBlock, topOuts, blocks);
        blocks.push('    }]);');

        DomplateDebug.endGroup();
    },

    generateDOM: function(path, blocks, args)
    {
        DomplateDebug.startGroup('DomplateLoop.generateDOM',arguments);

        var iterName = 'd'+path.renderIndex++;
        var counterName = 'i'+path.loopIndex;
        var loopName = 'l'+path.loopIndex++;

        if (!path.length)
            path.push(-1, 0);

        var preIndex = path.renderIndex;
        path.renderIndex = 0;

        var nodeCount = 0;

        var subBlocks = [];
        var basePath = path[path.length-1];
        for (var i = 0; i < this.children.length; ++i)
        {
            path[path.length-1] = basePath+'+'+loopName+'+'+nodeCount;

            var child = this.children[i];
            if (isTag(child))
                nodeCount += '+' + child.tag.generateDOM(path, subBlocks, args);
            else
                nodeCount += '+1';
        }

        path[path.length-1] = basePath+'+'+loopName;

        blocks.push('      ',loopName,' = __loop__.apply(this, [', iterName, ', function(', counterName,',',loopName);
        for (var i = 0; i < path.renderIndex; ++i)
            blocks.push(',d'+i);
        blocks.push(') {');
        
        blocks.push('       DomplateDebug.logVar(\'  .. '+counterName+' (counterName)\','+counterName+');');
        blocks.push('       DomplateDebug.logVar(\'  .. '+loopName+' (loopName)\','+loopName+');');
        
        blocks.push(subBlocks.join(""));
        blocks.push('        return ', nodeCount, ';');
        blocks.push('      }]);');

        path.renderIndex = preIndex;

        DomplateDebug.endGroup();

        return loopName;
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

DomplateIf.prototype = copyObject(DomplateTag.prototype,
{
    merge: function(args, oldTag)
    {
        DomplateDebug.startGroup('DomplateIf.merge',arguments);

        // This is the first argument to IF() which needs to evaluate to TRUE or FALSE
        // It can be a plain variable or a variable with formatters chained to it
        this.booleanVar = oldTag ? oldTag.booleanVar : parseValue(args[0]);
        this.vars = [];

        this.children = oldTag ? copyArray(oldTag.children) : [];

        var offset = Math.min(args.length, 1);
        parseChildren(args, offset, this.vars, this.children);

        var retval = creator(this, DomplateIf);

        DomplateDebug.endGroup();
        
        return retval;
    },

    // Used for locales only
    getVarNames: function(names)
    {
        if (this.booleanVar instanceof Parts)
            names.push(this.booleanVar.parts[0].name);

        DomplateTag.prototype.getVarNames.apply(this, [names]);
    },

    generateMarkup: function(topBlock, topOuts, blocks, info)
    {
        DomplateDebug.startGroup('DomplateIf.generateMarkup',arguments);

        this.addCode(topBlock, topOuts, blocks);

        DomplateDebug.logVar('this.booleanVar',this.booleanVar);


        // Generate the expression to be used for the if(expr) { ... }
        var expr;
        if (this.booleanVar instanceof Parts)
        {
            // We have a function with optional aruments or just one variable
            var part = this.booleanVar.parts[0];
            
            // Join our function arguments or variables
            // If the user has supplied multiple variables without a function
            // this will create an invalid result and we should probably add an
            // error message here or just take the first variable
            expr = part.names.join(',');

            // Nest our functions
            if (part.format)
            {
                DomplateDebug.logVar('part.format',part.format);
        
                for (var i = 0; i < part.format.length; ++i)
                    expr = part.format[i] + "(" + expr + ")";
            }
        } else {
            // We have just a simple function name without any arguments
            expr = this.booleanVar;
        }
        
        DomplateDebug.logVar('expr',expr);

        blocks.push('__if__.apply(this, [', expr, ', __out__, function(__out__) {');
        this.generateChildMarkup(topBlock, topOuts, blocks, info);
        this.addCode(topBlock, topOuts, blocks);
        blocks.push('}]);');

        DomplateDebug.endGroup();
    },

    generateDOM: function(path, blocks, args)
    {
        DomplateDebug.startGroup('DomplateIf.generateDOM',arguments);

        var controlName = 'd'+path.renderIndex++;
        var ifName = 'if_'+path.ifIndex++;

        if (!path.length)
            path.push(-1, 0);

        var preIndex = path.renderIndex;
        path.renderIndex = 0;

        var nodeCount = 0;

        var subBlocks = [];
//        var basePath = path[path.length-1];

        for (var i = 0; i < this.children.length; ++i)
        {
//            path[path.length-1] = basePath+'+'+ifName+'+'+nodeCount;

            var child = this.children[i];
            if (isTag(child))
                nodeCount += '+' + child.tag.generateDOM(path, subBlocks, args);
            else
                nodeCount += '+1';
        }

//        path[path.length-1] = basePath+'+'+ifName;

        blocks.push('      ',ifName,' = __if__.apply(this, [', controlName, ', function(',ifName);
        for (var i = 0; i < path.renderIndex; ++i)
            blocks.push(',d'+i);
        blocks.push(') {');
        
        blocks.push('       DomplateDebug.logVar(\'  .. d0\',d0);');
        blocks.push('       DomplateDebug.logVar(\'  .. '+ifName+' (ifName)\','+ifName+');');
        
        blocks.push(subBlocks.join(""));
//        blocks.push('        return ', nodeCount, ';');
        blocks.push('      }]);');

        path.renderIndex = preIndex;

        DomplateDebug.endGroup();

        return controlName;
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Variables(names,format)
{
    this.names = names;
    this.format = format;
}

function Parts(parts)
{
    this.parts = parts;
}

// ************************************************************************************************

function parseParts(str)
{
    DomplateDebug.startGroup('parseParts',arguments);
    
    var index = 0;
    var parts = [];
    var m;

    // Match $var or $var.sub or $var|func or $var1,$var2|func or $var|func1|func2 or $var1,$var2|func1|func2
    var re = /\$([_A-Za-z][$_A-Za-z0-9.,|]*)/g;
    while (m = re.exec(str))
    {
        DomplateDebug.logVar('m',m);

        var pre = str.substr(index, (re.lastIndex-m[0].length)-index);
        if (pre)
            parts.push(pre);

        var segs = m[1].split("|");
        var vars = segs[0].split(",$");

        // Assemble the variables object and append to buffer
        parts.push(new Variables(vars,segs.splice(1)));
        
        index = re.lastIndex;
    }

    // No matches found at all so we return the whole string
    if (!index) {

        DomplateDebug.logVar('str',str);
        
        DomplateDebug.endGroup();
    
        return str;
    }

    // If we have data after our last matched index we append it here as the final step
    var post = str.substr(index);
    if (post)
        parts.push(post);


    var retval = new Parts(parts);
    
    DomplateDebug.logVar('retval',retval);
    
    DomplateDebug.endGroup();
    
    return retval;
}

function parseValue(val)
{
    return typeof(val) == 'string' ? parseParts(val) : val;
}

function parseChildren(args, offset, vars, children)
{
    DomplateDebug.startGroup('parseChildren',arguments);

    for (var i = offset; i < args.length; ++i)
    {
        var val = parseValue(args[i]);
        children.push(val);
        readPartNames(val, vars);
    }
    DomplateDebug.endGroup();
}

function readPartNames(val, vars)
{
    if (val instanceof Parts)
    {
        for (var i = 0; i < val.parts.length; ++i)
        {
            var part = val.parts[i];
            if (part instanceof Variables)
                vars.push(part.names[0]);
        }
    }
}

function generateArg(val, path, args)
{
    if (val instanceof Parts)
    {
        var vals = [];
        for (var i = 0; i < val.parts.length; ++i)
        {
            var part = val.parts[i];
            if (part instanceof Variables)
            {
                var varName = 'd'+path.renderIndex++;
                if (part.format)
                {
                    for (var j = 0; j < part.format.length; ++j)
                        varName = part.format[j] + '(' + varName + ')';
                }

                vals.push(varName);
            }
            else
                vals.push('"'+part.replace(/"/g, '\\"')+'"');
        }

        return vals.join('+');
    }
    else
    {
        args.push(val);
        return 's' + path.staticIndex++;
    }
}

function addParts(val, delim, block, info, escapeIt)
{
    var vals = [];
    if (val instanceof Parts)
    {
        for (var i = 0; i < val.parts.length; ++i)
        {
            var part = val.parts[i];
            if (part instanceof Variables)
            {
                var partName = part.names.join(",");
                if (part.format)
                {
                    for (var j = 0; j < part.format.length; ++j)
                        partName = part.format[j] + "(" + partName + ")";
                }

                if (escapeIt)
                    vals.push("__escape__(" + partName + ")");
                else
                    vals.push(partName);
            }
            else
                vals.push('"'+ part + '"');
        }
    }
    else if (isTag(val))
    {
        info.args.push(val);
        vals.push('s'+info.argIndex++);
    }
    else
        vals.push('"'+ val + '"');

    var parts = vals.join(delim);
    if (parts)
        block.push(delim, parts);
}

function isTag(obj)
{
    return (typeof(obj) == "function" || obj instanceof Function) && !!obj.tag;
}

function creator(tag, cons)
{
    var fn = new Function(
        "var tag = arguments.callee.tag;" +
        "var cons = arguments.callee.cons;" +
        "var newTag = new cons();" +
        "return newTag.merge(arguments, tag);");

    fn.tag = tag;
    fn.cons = cons;
    extend(fn, Renderer);

    return fn;
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *


// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function ArrayIterator(array)
{
    var index = -1;

    this.next = function()
    {
        if (++index >= array.length)
            throw StopIteration;

        return array[index];
    };
}

function StopIteration() {}

domplate.$break = function()
{
    throw StopIteration;
};

// ************************************************************************************************

var Renderer =
{
    checkDebug: function()
    {
        DomplateDebug.enabled = this.tag.subject._debug || false;
    },
    
    renderHTML: function(args, outputs, self)
    {
        this.checkDebug();
        
        DomplateDebug.startGroup('Renderer.renderHTML',arguments);

        var code = [];
        var markupArgs = [code, (this.tag.context)?this.tag.context:null, args, outputs];
        markupArgs.push.apply(markupArgs, this.tag.markupArgs);
        this.tag.renderMarkup.apply(self ? self : this.tag.subject, markupArgs);

        if(this.tag.resources && this.tag.subject._resourceListener) {
            this.tag.subject._resourceListener.register(this.tag.resources);
        }

        DomplateDebug.endGroup();
        return code.join("");
    },

    insertRows: function(args, before, self)
    {
        this.checkDebug();

        DomplateDebug.startGroup('Renderer.insertRows',arguments);

        this.tag.compile();

        var outputs = [];
        var html = this.renderHTML(args, outputs, self);

        var doc = before.ownerDocument;
        var table = doc.createElement("table");
        table.innerHTML = html;

        var tbody = table.firstChild;
        var parent = before.localName == "TR" ? before.parentNode : before;
        var after = before.localName == "TR" ? before.nextSibling : null;

        var firstRow = tbody.firstChild, lastRow;
        while (tbody.firstChild)
        {
            lastRow = tbody.firstChild;
            if (after)
                parent.insertBefore(lastRow, after);
            else
                parent.appendChild(lastRow);
        }

        var offset = 0;
        if (before.localName == "TR")
        {
            var node = firstRow.parentNode.firstChild;
            for (; node && node != firstRow; node = node.nextSibling)
                ++offset;
        }

        var domArgs = [firstRow, this.tag.context, offset];
        domArgs.push.apply(domArgs, this.tag.domArgs);
        domArgs.push.apply(domArgs, outputs);

        this.tag.renderDOM.apply(self ? self : this.tag.subject, domArgs);

        DomplateDebug.endGroup();
        return [firstRow, lastRow];
    },

    insertAfter: function(args, before, self)
    {
        this.checkDebug();

        DomplateDebug.startGroup('Renderer.insertAfter',arguments);

        this.tag.compile();

        var outputs = [];
        var html = this.renderHTML(args, outputs, self);

        var doc = before.ownerDocument;
        var range = doc.createRange();
        range.selectNode(doc.body);
        var frag = range.createContextualFragment(html);

        var root = frag.firstChild;
        if (before.nextSibling)
            before.parentNode.insertBefore(frag, before.nextSibling);
        else
            before.parentNode.appendChild(frag);

        var domArgs = [root, this.tag.context, 0];
        domArgs.push.apply(domArgs, this.tag.domArgs);
        domArgs.push.apply(domArgs, outputs);

        this.tag.renderDOM.apply(self ? self : (this.tag.subject ? this.tag.subject : null),
            domArgs);

        DomplateDebug.endGroup();

        return root;
    },

    replace: function(args, parent, self)
    {
        this.checkDebug();

        DomplateDebug.startGroup('Renderer.replace',arguments);

        this.tag.compile();

        var outputs = [];
        var html = this.renderHTML(args, outputs, self);

        var root;
        if (parent.nodeType == 1)
        {
            parent.innerHTML = html;
            root = parent.firstChild;
        }
        else
        {
            if (!parent || parent.nodeType != 9)
                parent = document;

            if (!womb || womb.ownerDocument != parent)
                womb = parent.createElement("div");
            womb.innerHTML = html;

            root = womb.firstChild;
            //womb.removeChild(root);
        }

        var domArgs = [root, (this.tag.context)?this.tag.context:null, 0];
        domArgs.push.apply(domArgs, this.tag.domArgs);
        domArgs.push.apply(domArgs, outputs);
        this.tag.renderDOM.apply(self ? self : this.tag.subject, domArgs);

        DomplateDebug.endGroup();

        return root;
    },

    append: function(args, parent, self)
    {
        this.checkDebug();

        DomplateDebug.startGroup('Renderer.append',arguments);

        this.tag.compile();

        var outputs = [];
        var html = this.renderHTML(args, outputs, self);

        DomplateDebug.logVar('outputs',outputs);

        DomplateDebug.logVar('html',html);
        
        if (!womb || womb.ownerDocument != parent.ownerDocument)
            womb = parent.ownerDocument.createElement("div");

        DomplateDebug.logVar('womb',womb);
        womb.innerHTML = html;

        root = womb.firstChild;
        while (womb.firstChild)
            parent.appendChild(womb.firstChild);

        var domArgs = [root, this.tag.context, 0];
        domArgs.push.apply(domArgs, this.tag.domArgs);
        domArgs.push.apply(domArgs, outputs);

        DomplateDebug.logVar('this.tag.subject',this.tag.subject);
        DomplateDebug.logVar('self',self);
        DomplateDebug.logVar('domArgs',domArgs);
        
        this.tag.renderDOM.apply(self ? self : this.tag.subject, domArgs);

        DomplateDebug.endGroup();

        return root;
    },

    render: function(args, self)
    {
        this.checkDebug();

        DomplateDebug.startGroup('Renderer.render',arguments);

        this.tag.compile();

        var outputs = [];
        var html = this.renderHTML(args, outputs, self);

        DomplateDebug.endGroup();

        return html;
    }  
};

// ************************************************************************************************


function defineTags()
{
        
    for (var i = 0; i < arguments.length; ++i)
    {
        var tagName = arguments[i];
        var fn = new Function("var newTag = new this._domplate_.DomplateTag('"+tagName+"'); return newTag.merge(arguments);");

        var fnName = tagName.toUpperCase();
        exports.tags[fnName] = fn;
    }
}

defineTags(
    "a", "button", "br", "canvas", "col", "colgroup", "div", "fieldset", "form", "h1", "h2", "h3", "hr",
     "img", "input", "label", "legend", "li", "ol", "optgroup", "option", "p", "pre", "select",
    "span", "strong", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "tr", "tt", "ul"
);

    }

    // Check for AMD
    if (typeof define === "function") {
        define(function() {
            var exports = {};
            Domplate(exports);
            return exports;
        });
    } else
    // Assume NodeJS
    if (typeof exports === "object") {
        Domplate(exports);
    }

})());


},{"./explicit-unsafe-eval":2}],2:[function(require,module,exports){

exports.compileMarkup = function (code, context) {
    var DomplateDebug = context.DomplateDebug;
    var __escape__ = context.__escape__;
    var __if__ = context.__if__;
    var __loop__ = context.__loop__;
    var __link__ = context.__link__;

    return eval(code);
};

exports.compileDOM = function (code, context) {
    var DomplateDebug = context.DomplateDebug;
    var __path__ = context.__path__;
    var __bind__ = context.__bind__;
    var __if__ = context.__if__;
    var __link__ = context.__link__;
    var __loop__ = context.__loop__;

    return eval(code);
};

},{}],3:[function(require,module,exports){

/*
 * The functions below are taken from Firebug as-is and should be kept in-sync.
 * 
 * @see http://code.google.com/p/fbug/source/browse/branches/firebug1.5/content/firebug/lib.js
 */

var FBTrace = {};
var FBL = exports;

(function() {

// ************************************************************************************************
// String

this.escapeNewLines = function(value)
{
    return value.replace(/\r/gm, "\\r").replace(/\n/gm, "\\n");
};

this.stripNewLines = function(value)
{
    return typeof(value) == "string" ? value.replace(/[\r\n]/gm, " ") : value;
};

this.escapeJS = function(value)
{
    return value.replace(/\r/gm, "\\r").replace(/\n/gm, "\\n").replace('"', '\\"', "g");
};

this.cropString = function(text, limit, alterText)
{
    if (!alterText)
        alterText = "..."; //…

    text = text + "";

    if (!limit)
        limit = 50;
    var halfLimit = (limit / 2);
    halfLimit -= 2; // adjustment for alterText's increase in size

    if (text.length > limit)
        return text.substr(0, halfLimit) + alterText + text.substr(text.length-halfLimit);
    else
        return text;
};

this.cropStringLeft = function(text, limit, alterText)
{
    if (!alterText)
        alterText = "..."; //…

    text = text + "";

    if (!limit)
        limit = 50;
    limit -= alterText.length;

    if (text.length > limit)
        return alterText + text.substr(text.length-limit);
    else
        return text;
};


// ************************************************************************************************
// CSS classes

this.hasClass = function(node, name) // className, className, ...
{
    if (!node || node.nodeType != 1)
        return false;
    else
    {
        for (var i=1; i<arguments.length; ++i)
        {
            var name = arguments[i];
            var re = new RegExp("(^|\\s)"+name+"($|\\s)");
            if (!re.exec(node.getAttribute("class")))
                return false;
        }

        return true;
    }
};

this.setClass = function(node, name)
{
    if (node && !this.hasClass(node, name))
        node.className += " " + name;
};

this.getClassValue = function(node, name)
{
    var re = new RegExp(name+"-([^ ]+)");
    var m = re.exec(node.className);
    return m ? m[1] : "";
};

this.removeClass = function(node, name)
{
    if (node && node.className)
    {
        var index = node.className.indexOf(name);
        if (index >= 0)
        {
            var size = name.length;
            node.className = node.className.substr(0,index-1) + node.className.substr(index+size);
        }
    }
};

this.toggleClass = function(elt, name)
{
    if (this.hasClass(elt, name))
        this.removeClass(elt, name);
    else
        this.setClass(elt, name);
};

this.setClassTimed = function(elt, name, context, timeout)
{
    if (!timeout)
        timeout = 1300;

    if (elt.__setClassTimeout)
        context.clearTimeout(elt.__setClassTimeout);
    else
        this.setClass(elt, name);

    if (!this.isVisible(elt))
    {
        if (elt.__invisibleAtSetPoint)
            elt.__invisibleAtSetPoint--;
        else
            elt.__invisibleAtSetPoint = 5;
    }
    else
    {
        delete elt.__invisibleAtSetPoint;
    }

    elt.__setClassTimeout = context.setTimeout(function()
    {
        delete elt.__setClassTimeout;

        if (elt.__invisibleAtSetPoint)
            FBL.setClassTimed(elt, name, context, timeout);
        else
        {
            delete elt.__invisibleAtSetPoint;
            FBL.removeClass(elt, name);
        }
    }, timeout);
};

this.cancelClassTimed = function(elt, name, context)
{
    if (elt.__setClassTimeout)
    {
        FBL.removeClass(elt, name);
        context.clearTimeout(elt.__setClassTimeout);
        delete elt.__setClassTimeout;
    }
};


// ************************************************************************************************
// DOM queries

this.$ = function(id, doc)
{
    if (doc)
        return doc.getElementById(id);
    else
        return document.getElementById(id);
};

this.getChildByClass = function(node) // ,classname, classname, classname...
{
    for (var i = 1; i < arguments.length; ++i)
    {
        var className = arguments[i];
        var child = node.firstChild;
        node = null;
        for (; child; child = child.nextSibling)
        {
            if (this.hasClass(child, className))
            {
                node = child;
                break;
            }
        }
    }

    return node;
};

this.getAncestorByClass = function(node, className)
{
    for (var parent = node; parent; parent = parent.parentNode)
    {
        if (this.hasClass(parent, className))
            return parent;
    }

    return null;
};

this.getElementByClass = function(node, className)  // className, className, ...
{
    var args = cloneArray(arguments); args.splice(0, 1);
    var className = args.join(" ");

    var elements = node.getElementsByClassName(className);
    return elements[0];
};

this.getElementsByClass = function(node, className)  // className, className, ...
{
    var args = cloneArray(arguments); args.splice(0, 1);
    var className = args.join(" ");
    return node.getElementsByClassName(className);
};

this.getElementsByAttribute = function(node, attrName, attrValue)
{
    function iteratorHelper(node, attrName, attrValue, result)
    {
        for (var child = node.firstChild; child; child = child.nextSibling)
        {
            if (child.getAttribute(attrName) == attrValue)
                result.push(child);

            iteratorHelper(child, attrName, attrValue, result);
        }
    }

    var result = [];
    iteratorHelper(node, attrName, attrValue, result);
    return result;
}

this.isAncestor = function(node, potentialAncestor)
{
    for (var parent = node; parent; parent = parent.parentNode)
    {
        if (parent == potentialAncestor)
            return true;
    }

    return false;
};

this.getNextElement = function(node)
{
    while (node && node.nodeType != 1)
        node = node.nextSibling;

    return node;
};

this.getPreviousElement = function(node)
{
    while (node && node.nodeType != 1)
        node = node.previousSibling;

    return node;
};

this.getBody = function(doc)
{
    if (doc.body)
        return doc.body;

    var body = doc.getElementsByTagName("body")[0];
    if (body)
        return body;

    return doc.documentElement;  // For non-HTML docs
};

this.findNextDown = function(node, criteria)
{
    if (!node)
        return null;

    for (var child = node.firstChild; child; child = child.nextSibling)
    {
        if (criteria(child))
            return child;

        var next = this.findNextDown(child, criteria);
        if (next)
            return next;
    }
};

this.findPreviousUp = function(node, criteria)
{
    if (!node)
        return null;

    for (var child = node.lastChild; child; child = child.previousSibling)
    {
        var next = this.findPreviousUp(child, criteria);
        if (next)
            return next;

        if (criteria(child))
            return child;
    }
};

this.findNext = function(node, criteria, upOnly, maxRoot)
{
    if (!node)
        return null;

    if (!upOnly)
    {
        var next = this.findNextDown(node, criteria);
        if (next)
            return next;
    }

    for (var sib = node.nextSibling; sib; sib = sib.nextSibling)
    {
        if (criteria(sib))
            return sib;

        var next = this.findNextDown(sib, criteria);
        if (next)
            return next;
    }

    if (node.parentNode && node.parentNode != maxRoot)
        return this.findNext(node.parentNode, criteria, true);
};

this.findPrevious = function(node, criteria, downOnly, maxRoot)
{
    if (!node)
        return null;

    for (var sib = node.previousSibling; sib; sib = sib.previousSibling)
    {
        var prev = this.findPreviousUp(sib, criteria);
        if (prev)
            return prev;

        if (criteria(sib))
            return sib;
    }

    if (!downOnly)
    {
        var next = this.findPreviousUp(node, criteria);
        if (next)
            return next;
    }

    if (node.parentNode && node.parentNode != maxRoot)
    {
        if (criteria(node.parentNode))
            return node.parentNode;

        return this.findPrevious(node.parentNode, criteria, true);
    }
};

this.getNextByClass = function(root, state)
{
    function iter(node) { return node.nodeType == 1 && FBL.hasClass(node, state); }
    return this.findNext(root, iter);
};

this.getPreviousByClass = function(root, state)
{
    function iter(node) { return node.nodeType == 1 && FBL.hasClass(node, state); }
    return this.findPrevious(root, iter);
};

this.hasChildElements = function(node)
{
    if (node.contentDocument) // iframes
        return true;

    for (var child = node.firstChild; child; child = child.nextSibling)
    {
        if (child.nodeType == 1)
            return true;
    }

    return false;
};

this.isElement = function(o)
{
    try {
        return o && o instanceof Element;
    }
    catch (ex) {
        return false;
    }
};

this.isNode = function(o)
{
    try {
        return o && o instanceof Node;
    }
    catch (ex) {
        return false;
    }
};


// ************************************************************************************************
// Events

this.cancelEvent = function(event)
{
    event.stopPropagation();
    event.preventDefault();
};

this.isLeftClick = function(event)
{
    return event.button == 0 && this.noKeyModifiers(event);
};

this.isMiddleClick = function(event)
{
    return event.button == 1 && this.noKeyModifiers(event);
};

this.isRightClick = function(event)
{
    return event.button == 2 && this.noKeyModifiers(event);
};

this.noKeyModifiers = function(event)
{
    return !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;
};

this.isControlClick = function(event)
{
    return event.button == 0 && this.isControl(event);
};

this.isShiftClick = function(event)
{
    return event.button == 0 && this.isShift(event);
};

this.isControl = function(event)
{
    return (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey;
};

this.isControlShift = function(event)
{
    return (event.metaKey || event.ctrlKey) && event.shiftKey && !event.altKey;
};

this.isShift = function(event)
{
    return event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey;
};


// ************************************************************************************************
// Basics

this.bind = function()  // fn, thisObject, args => thisObject.fn(args, arguments);
{
   var args = cloneArray(arguments), fn = args.shift(), object = args.shift();
   return function() { return fn.apply(object, arrayInsert(cloneArray(args), 0, arguments)); }
};

this.bindFixed = function() // fn, thisObject, args => thisObject.fn(args);
{
    var args = cloneArray(arguments), fn = args.shift(), object = args.shift();
    return function() { return fn.apply(object, args); }
};

this.extend = function(l, r)
{
    var newOb = {};
    for (var n in l)
        newOb[n] = l[n];
    for (var n in r)
        newOb[n] = r[n];
    return newOb;
};

this.keys = function(map)  // At least sometimes the keys will be on user-level window objects
{
    var keys = [];
    try
    {
        for (var name in map)  // enumeration is safe
            keys.push(name);   // name is string, safe
    }
    catch (exc)
    {
        // Sometimes we get exceptions trying to iterate properties
    }

    return keys;  // return is safe
};

this.values = function(map)
{
    var values = [];
    try
    {
        for (var name in map)
        {
            try
            {
                values.push(map[name]);
            }
            catch (exc)
            {
                // Sometimes we get exceptions trying to access properties
                if (FBTrace.DBG_ERRORS)
                    FBTrace.dumpPropreties("lib.values FAILED ", exc);
            }

        }
    }
    catch (exc)
    {
        // Sometimes we get exceptions trying to iterate properties
        if (FBTrace.DBG_ERRORS)
            FBTrace.dumpPropreties("lib.values FAILED ", exc);
    }

    return values;
};

this.remove = function(list, item)
{
    for (var i = 0; i < list.length; ++i)
    {
        if (list[i] == item)
        {
            list.splice(i, 1);
            break;
        }
    }
};

this.sliceArray = function(array, index)
{
    var slice = [];
    for (var i = index; i < array.length; ++i)
        slice.push(array[i]);

    return slice;
};

function cloneArray(array, fn)
{
   var newArray = [];

   if (fn)
       for (var i = 0; i < array.length; ++i)
           newArray.push(fn(array[i]));
   else
       for (var i = 0; i < array.length; ++i)
           newArray.push(array[i]);

   return newArray;
}

function extendArray(array, array2)
{
   var newArray = [];
   newArray.push.apply(newArray, array);
   newArray.push.apply(newArray, array2);
   return newArray;
}

this.extendArray = extendArray;
this.cloneArray = cloneArray;

function arrayInsert(array, index, other)
{
   for (var i = 0; i < other.length; ++i)
       array.splice(i+index, 0, other[i]);

   return array;
}

this.arrayInsert = arrayInsert;


this.isArrayLike = function(object) {
    return (Object.prototype.toString.call(object) == "[object Array]") || this.isArguments(object);
}

// from http://code.google.com/p/google-caja/wiki/NiceNeighbor
// by "kangax"
//
// Mark Miller posted a solution that will work in ES5 compliant
// implementations, that may provide future insight:
// (http://groups.google.com/group/narwhaljs/msg/116097568bae41c6)
this.isArguments = function (object) {
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
}


}).apply(exports);
    
},{}],4:[function(require,module,exports){

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
                "type": "text",
                "text": meta["group.title"]
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
    self.parentNode = parentNode || null;
    self.type = data.type;
    self.value = data[data.type];
    self.meta = {};
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
    self.getObjectGraph = function() {
        return objectGraph;
    }
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

},{"../encoder/default":7,"fp-modules-for-nodejs/lib/json":4,"fp-modules-for-nodejs/lib/util":5}],7:[function(require,module,exports){

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
            graph["origin"] = this.encodeVariable(this.origin);
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

Encoder.prototype.encodeVariable = function(variable, objectDepth, arrayDepth, overallDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    overallDepth = overallDepth || 1;
    
    if(variable===null) {
        var ret = {"type": "constant", "constant": "null"};
        if(this.options["includeLanguageMeta"]) {
            ret["lang.type"] = "null";
        }
        return ret;
    } else
    if(variable===true || variable===false) {
        var ret = {"type": "constant", "constant": (variable===true)?"true":"false"};
        if(this.options["includeLanguageMeta"]) {
            ret["lang.type"] = "boolean";
        }
        return ret;
    }

    var type = typeof variable;
    if(type=="undefined") {
        var ret = {"type": "constant", "constant": "undefined"};
        if(this.options["includeLanguageMeta"]) {
            ret["lang.type"] = "undefined";
        }
        return ret;
    } else
    if(type=="number") {
        if(Math.round(variable)==variable) {
            var ret = {"type": "text", "text": ""+variable};
            if(this.options["includeLanguageMeta"]) {
                ret["lang.type"] = "integer";
            }
            return ret;
        } else {
            var ret = {"type": "text", "text": ""+variable};
            if(this.options["includeLanguageMeta"]) {
                ret["lang.type"] = "float";
            }
            return ret;
        }
    } else
    if(type=="string") {
        // HACK: This should be done via an option
        // FirePHPCore compatibility: Detect resource string
        if(variable=="** Excluded by Filter **") {
            var ret = {"type": "text", "text": variable};
            ret["encoder.notice"] = "Excluded by Filter";
            ret["encoder.trimmed"] = true;
            if(this.options["includeLanguageMeta"]) {
                ret["lang.type"] = "string";
            }
            return ret;
        } else
        if(variable.match(/^\*\*\sRecursion\s\([^\(]*\)\s\*\*$/)) {
            var ret = {"type": "text", "text": variable};
            ret["encoder.notice"] = "Recursion";
            ret["encoder.trimmed"] = true;
            if(this.options["includeLanguageMeta"]) {
                ret["lang.type"] = "string";
            }
            return ret;
        } else
        if(variable.match(/^\*\*\sResource\sid\s#\d*\s\*\*$/)) {
            var ret = {"type": "text", "text": variable.substring(3, variable.length-3)};
            if(this.options["includeLanguageMeta"]) {
                ret["lang.type"] = "resource";
            }
            return ret;
        } else {
            var ret = {"type": "text", "text": variable};
            if(this.options["includeLanguageMeta"]) {
                ret["lang.type"] = "string";
            }
            return ret;
        }
    }

    if (variable && variable.__no_serialize === true) {
        var ret = {"type": "text", "text": "Object"};
        ret["encoder.notice"] = "Excluded by __no_serialize";
        ret["encoder.trimmed"] = true;
        return ret;
    }

    if(type=="function") {
        var ret = {"type": "text", "text": ""+variable};
        if(this.options["includeLanguageMeta"]) {
            ret["lang.type"] = "function";
        }
        return ret;
    } else
    if(type=="object") {

        try {
            if(UTIL.isArrayLike(variable)) {
                var ret = {
                    "type": "array",
                    "array": this.encodeArray(variable, objectDepth, arrayDepth, overallDepth)
                };
                if(this.options["includeLanguageMeta"]) {
                    ret["lang.type"] = "array";
                }
                return ret;
            }
        } catch (err) {
// TODO: Find a better way to encode variables that cause security exceptions when accessed etc...
            var ret = {"type": "text", "text": "Cannot serialize"};
            ret["encoder.notice"] = "Cannot serialize";
            ret["encoder.trimmed"] = true;
            return ret;
        }
        // HACK: This should be done via an option
        // FirePHPCore compatibility: we only have an object if a class name is present

        if(typeof variable["__className"] != "undefined"  ) {
            var ret = {
                "type": "reference",
                "reference": this.encodeInstance(variable, objectDepth, arrayDepth, overallDepth)
            };
            return ret;
        } else {
            var ret;
            if (/^\[Exception\.\.\.\s/.test(variable)) {
                ret = {
                    "type": "map",
                    "map": this.encodeException(variable, objectDepth, arrayDepth, overallDepth)
                };
            } else {
                ret = {
                    "type": "map",
                    "map": this.encodeAssociativeArray(variable, objectDepth, arrayDepth, overallDepth)
                };
            }
            if(this.options["includeLanguageMeta"]) {
                ret["lang.type"] = "array";
            }
            return ret;
        }
    }

    var ret = {"type": "text", "text": "Variable with type '" + type + "' unknown: "+variable};
    if(this.options["includeLanguageMeta"]) {
        ret["lang.type"] = "unknown";
    }
    return ret;
//    return "["+(typeof variable)+"]["+variable+"]";    
}

Encoder.prototype.encodeArray = function(variable, objectDepth, arrayDepth, overallDepth) {
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
        items.push(self.encodeVariable(item, 1, arrayDepth + 1, overallDepth + 1));
    });
    return items;
}


Encoder.prototype.encodeAssociativeArray = function(variable, objectDepth, arrayDepth, overallDepth) {
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
            self.encodeVariable(key, 1, arrayDepth + 1, overallDepth + 1),
            self.encodeVariable(variable[key], 1, arrayDepth + 1, overallDepth + 1)
        ]);
    }
    return items;
}


Encoder.prototype.encodeException = function(variable, objectDepth, arrayDepth, overallDepth) {
    var self = this,
        items = [];
    items.push([
        self.encodeVariable("message", 1, arrayDepth + 1, overallDepth + 1),
        self.encodeVariable((""+variable), 1, arrayDepth + 1, overallDepth + 1)
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

Encoder.prototype.encodeInstance = function(object, objectDepth, arrayDepth, overallDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    overallDepth = overallDepth || 1;
    var id = this.getInstanceId(object);
    if(id!=null) {
        return id;
    }
    this.instances.push([
        object,
        this.encodeObject(object, objectDepth, arrayDepth, overallDepth)
    ]);
    return UTIL.len(this.instances)-1;
}

Encoder.prototype.encodeObject = function(object, objectDepth, arrayDepth, overallDepth) {
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
        ret["lang.class"] = object["__className"];
        delete(object["__className"]);
        if(this.options["includeLanguageMeta"]) {
            ret["lang.type"] = "object";
        }
    }

    // HACK: This should be done via an option
    // FirePHPCore compatibility: we have an exception if a class name is present
    if(typeof object["__isException"] != "undefined" && object["__isException"]) {
        ret["lang.type"] = "exception";
    }

    UTIL.forEach(object, function(item) {
        try {
            if(item[0]=="__fc_tpl_id") {
                ret['fc.tpl.id'] = item[1];
                return;
            }
            if(isPHPClass) {
                var val = self.encodeVariable(item[1], objectDepth + 1, 1, overallDepth + 1),
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
                ret["dictionary"][item[0]] = self.encodeVariable(item[1], objectDepth + 1, 1, overallDepth + 1);
            }
        } catch(e) {
            console.warn(e);
            ret["dictionary"]["__oops__"] = {"notice": "Error encoding member (" + e + ")"};
        }
    });
    
    return ret;
}
},{"fp-modules-for-nodejs/lib/json":4,"fp-modules-for-nodejs/lib/util":5}],8:[function(require,module,exports){

module.exports = function () {/*

///*######################################################################
//#   primitives/text
//#####################################################################

SPAN.__NS__text {
}



///*######################################################################
//#   primitives/constant
//#####################################################################

SPAN.__NS__constant {
  color: #0000FF;
}



///*######################################################################
//#   primitives/array
//#####################################################################

SPAN.__NS__array > SPAN {
    color: #9C9C9C;
    font-weight: bold;
}

SPAN.__NS__array > SPAN.collapsed {
    color: #0000FF;
    font-weight: normal;
    padding-left: 5px;
    padding-right: 5px;
}

SPAN.__NS__array > SPAN.summary {
    color: #0000FF;
    font-weight: normal;
    padding-left: 5px;
    padding-right: 5px;
}

SPAN.__NS__array > DIV.element {
    display: block;
    padding-left: 20px;
}

SPAN.__NS__array > SPAN.element {
    padding-left: 2px;
}

SPAN.__NS__array > DIV.element.expandable {
    background-image: url(__RESOURCE__images/twisty-closed.png);
    background-repeat: no-repeat;
    background-position: 6px 2px;
    cursor: pointer;
}
SPAN.__NS__array > DIV.element.expandable.expanded {
    background-image: url(__RESOURCE__images/twisty-open.png);
}

SPAN.__NS__array > .element > SPAN.value {
}

SPAN.__NS__array > .element > SPAN.separator {
    color: #9C9C9C;
}



///*######################################################################
//#   primitives/map
//#####################################################################

SPAN.__NS__map > SPAN {
    color: #9C9C9C;
    font-weight: bold;
}

SPAN.__NS__map > DIV.pair {
    display: block;
    padding-left: 20px;
}

SPAN.__NS__map > SPAN.pair {
    padding-left: 2px;
}

SPAN.__NS__map > .pair > SPAN.delimiter,
SPAN.__NS__map > .pair > SPAN.separator {
    color: #9C9C9C;
    padding-left: 2px;
    padding-right: 2px;
}




///*######################################################################
//#   primitives/reference
//#####################################################################

SPAN.__NS__reference {
}



///*######################################################################
//#   primitives/dictionary
//#####################################################################


SPAN.__NS__dictionary > SPAN {
    color: #9C9C9C;
}

SPAN.__NS__dictionary > SPAN.collapsed {
    color: #0000FF;
    font-weight: normal;
    padding-left: 5px;
    padding-right: 5px;
}

SPAN.__NS__dictionary > SPAN.summary {
    color: #0000FF;
    font-weight: normal;
    padding-left: 5px;
    padding-right: 5px;
}

SPAN.__NS__dictionary > SPAN.member {
    color: #9C9C9C;
}

SPAN.__NS__dictionary > DIV.member {
    display: block;
    padding-left: 20px;
}
SPAN.__NS__dictionary > DIV.member.expandable {
    background-image: url(__RESOURCE__images/twisty-closed.png);
    background-repeat: no-repeat;
    background-position: 6px 2px;
    cursor: pointer;
}
SPAN.__NS__dictionary > DIV.member.expandable.expanded {
    background-image: url(__RESOURCE__images/twisty-open.png);
}

SPAN.__NS__dictionary > .member > SPAN.name {
    color: #E59D07;
    font-weight: normal;
}

SPAN.__NS__dictionary > .member > SPAN.value {
    font-weight: normal;
}

SPAN.__NS__dictionary > .member > SPAN.delimiter,
SPAN.__NS__dictionary > .member > SPAN.separator,
SPAN.__NS__dictionary > .member SPAN.more {
    color: #9C9C9C;
    padding-left: 2px;
    padding-right: 2px;
}


///*######################################################################
//#   primitives/unknown
//#####################################################################


SPAN.__NS__unknown {
    color: #FFFFFF;
    background-color: red;
}


///*######################################################################
//#   structures/trace
//#####################################################################

SPAN.__NS__structures-trace {
    background-image: url(__RESOURCE__images/edit-rule.png);
    background-repeat: no-repeat;
    background-position: 4px 1px;
    padding-left: 25px;
    font-weight: bold;
}

DIV.__NS__structures-trace {
    padding: 0px;
    margin: 0px;
}

DIV.__NS__structures-trace TABLE {
  border-bottom: 1px solid #D7D7D7;
}

DIV.__NS__structures-trace TABLE TBODY TR TH,
DIV.__NS__structures-trace TABLE TBODY TR TD {
    padding: 3px;
    padding-left: 10px;
    padding-right: 10px;
}

DIV.__NS__structures-trace TABLE TBODY TR TH.header-file {
  white-space:nowrap;
  font-weight: bold;
  text-align: left;
}

DIV.__NS__structures-trace TABLE TBODY TR TH.header-line {
  white-space:nowrap;
  font-weight: bold;
  text-align: right;
}
DIV.__NS__structures-trace TABLE TBODY TR TH.header-inst {
  white-space:nowrap;
  font-weight: bold;
  text-align: left;
}

DIV.__NS__structures-trace TABLE TBODY TR TD.cell-file {
  vertical-align: top;
  border: 1px solid #D7D7D7;
  border-bottom: 0px;
  border-right: 0px;
}
DIV.__NS__structures-trace TABLE TBODY TR TD.cell-line {
  white-space:nowrap;
  vertical-align: top;
  text-align: right;
  border:1px solid #D7D7D7;
  border-bottom: 0px;
  border-right: 0px;
}
DIV.__NS__structures-trace TABLE TBODY TR TD.cell-line:hover,
DIV.__NS__structures-trace TABLE TBODY TR TD.cell-file:hover {
    background-color: #ffc73d;
    cursor: pointer;    
}
DIV.__NS__structures-trace TABLE TBODY TR TD.cell-inst {
  vertical-align: top;
  padding-left: 10px;
  font-weight: bold;
  border:1px solid #D7D7D7;
  border-bottom: 0px;
}

DIV.__NS__structures-trace TABLE TBODY TR TD.cell-inst DIV.arg {
  font-weight: normal;
  padding-left: 3px;
  padding-right: 3px;
  display: inline-block;
}
DIV.__NS__structures-trace TABLE TBODY TR TD.cell-inst DIV.arg:hover {
    background-color: #ffc73d;
    cursor: pointer;    
}

DIV.__NS__structures-trace TABLE TBODY TR TD.cell-inst .separator {
    padding-left: 1px;
    padding-right: 3px;
}


///*######################################################################
//#   structures/table
//#####################################################################

SPAN.__NS__structures-table {
    background-image: url(__RESOURCE__images/table.png);
    background-repeat: no-repeat;
    background-position: 4px -1px;
    padding-left: 25px;
}

DIV.__NS__structures-table {
    padding: 0px;
    margin: 0px;
}

DIV.__NS__structures-table TABLE {
  border-bottom: 1px solid #D7D7D7;
  border-right: 1px solid #D7D7D7;
}

DIV.__NS__structures-table TABLE TBODY TR.hide {
  display: none;
}

DIV.__NS__structures-table TABLE TBODY TR TH.header {
  vertical-align: top;
  font-weight: bold;
  text-align: center;
  border: 1px solid #D7D7D7;
  border-bottom: 0px;
  border-right: 0px;
  background-color: #ececec;
  padding: 2px;
  padding-left: 10px;
  padding-right: 10px;
}

DIV.__NS__structures-table TABLE TBODY TR TD.cell {
  vertical-align: top;
  padding-right: 10px;
  border: 1px solid #D7D7D7;
  border-bottom: 0px;
  border-right: 0px;
  padding: 2px;
  padding-left: 10px;
  padding-right: 10px;
}

DIV.__NS__structures-table TABLE TBODY TR TD.cell:hover {
    background-color: #ffc73d;
    cursor: pointer;    
}


///*######################################################################
//#   util/trimmed
//#####################################################################

SPAN.__NS__util-trimmed {
    color: #FFFFFF;
    background-color: blue;
    padding-left: 5px;
    padding-right: 5px;
}



///*######################################################################
//#   @anchor wrappers/console
//#####################################################################

DIV.__NS__console-message {
    position: relative;
    margin: 0;
    border-bottom: 1px solid #D7D7D7;
    padding: 0px;
    background-color: #FFFFFF;
}
DIV.__NS__console-message.selected {
    background-color: #35FC03 !important;
}

DIV.__NS__console-message-group[expanded=true] {
    background-color: #77CDD9;
}

DIV.__NS__console-message > DIV.header {
    position: relative;
    padding-left: 34px;
    padding-right: 10px;
    padding-top: 3px;
    padding-bottom: 4px;
    cursor: pointer;
}

DIV.__NS__console-message[expanded=true] > DIV.header {
    text-align: right;
    min-height: 16px;
}

DIV.__NS__console-message[expanded=false] > DIV.header:hover {
    background-color: #ffc73d;
}

DIV.__NS__console-message-group > DIV.header {
    background: url(__RESOURCE__images/document_page_next.png) no-repeat;
    background-position: 2px 3px;
    font-weight: bold;
    background-color: #77CDD9;
}

DIV.__NS__console-message > DIV.header-priority-info {
    background: url(__RESOURCE__images/information.png) no-repeat;
    background-position: 2px 3px;
    background-color: #c6eeff;
}

DIV.__NS__console-message > DIV.header-priority-warn {
    background: url(__RESOURCE__images/exclamation-diamond.png) no-repeat;
    background-position: 2px 3px;
    background-color: #ffe68d;
}

DIV.__NS__console-message > DIV.header-priority-error {
    background: url(__RESOURCE__images/exclamation-red.png) no-repeat;
    background-position: 2px 3px;
    background-color: #ffa7a7;
}

DIV.__NS__console-message > DIV.header > DIV.expander {
    background-color: black;
    width: 18px;
    height: 18px;
    display: inline-block;
    float: left;
    position: relative;
    top: -1px;
    margin-left: -14px;
}

DIV.__NS__console-message > DIV.header > DIV.expander:hover {
    cursor: pointer;
}

DIV.__NS__console-message[expanded=false] > DIV.header > DIV.expander {
    background: url(__RESOURCE__images/plus-small-white.png) no-repeat;
    background-position: 0px 1px;
}

DIV.__NS__console-message[expanded=true] > DIV.header > DIV.expander {
    background: url(__RESOURCE__images/minus-small-white.png) no-repeat;
    background-position: 0px 1px;
}

DIV.__NS__console-message > DIV.header > SPAN.summary > SPAN.label > SPAN,
DIV.__NS__console-message > DIV.header > SPAN.fileline > DIV > DIV.label {
    margin-right: 5px;
    background-color: rgba(69,68,60,1);
    padding-left: 5px;
    padding-right: 5px;
    color: white;
    vertical-align: top;
    margin-top: 1px;
}
DIV.__NS__console-message > DIV.header > SPAN.fileline > DIV > DIV.label {
    float: left;
    margin-top: 0px;
}

DIV.__NS__console-message > DIV.header > SPAN.summary > SPAN > SPAN.count {
    color: #8c8c8c;
}

DIV.__NS__console-message > DIV.header > SPAN.fileline {
    color: #8c8c8c;
    word-wrap: break-word;
}

DIV.__NS__console-message[expanded=true] > DIV.header > SPAN.summary {
    display: none;
}

DIV.__NS__console-message[keeptitle=true] > DIV.header,
DIV.__NS__console-message-group > DIV.header {
    text-align: left !important;
}
DIV.__NS__console-message[keeptitle=true] > DIV.header > SPAN.fileline,
DIV.__NS__console-message-group > DIV.header > SPAN.fileline {
    display: none !important;
}
DIV.__NS__console-message[keeptitle=true] > DIV.header > SPAN.summary,
DIV.__NS__console-message-group > DIV.header > SPAN.summary {
    display: inline !important;
}
DIV.__NS__console-message-group > DIV.header > DIV.actions {
    display: none !important;
}
DIV.__NS__console-message-group > DIV.header > SPAN.summary > SPAN > SPAN.count {
    color: #ffffff !important;
}


DIV.__NS__console-message[expanded=false] > DIV.header > SPAN.fileline {
    display: none;
}

DIV.__NS__console-message > DIV.header > DIV.actions {
    display: inline-block;
    position: relative;
    top: 0px;
    left: 10px;
    float: right;
    margin-left: 0px;
    margin-right: 5px;
}

DIV.__NS__console-message > DIV.header > DIV.actions DIV.inspect {
    display: inline-block;
    background: url(__RESOURCE__images/node-magnifier.png) no-repeat;
    width: 16px;
    height: 16px;
    margin-right: 4px;
}
DIV.__NS__console-message > DIV.header > DIV.actions > DIV.file {
    display: inline-block;
    background: url(__RESOURCE__images/document-binary.png) no-repeat;
    width: 16px;
    height: 16px;
    margin-right: 4px;
}

DIV.__NS__console-message > DIV.header > DIV.actions > DIV.inspect:hover,
DIV.__NS__console-message > DIV.header > DIV.actions > DIV.file:hover {
    cursor: pointer;
}

DIV.__NS__console-message > DIV.body {
    padding: 6px;
    margin: 3px;
    margin-top: 0px;
}

DIV.__NS__console-message[expanded=false] > DIV.body {
    display: none;
}

DIV.__NS__console-message-group > DIV.body {
    padding: 0px;
    margin: 0px;
    margin-left: 20px;
    border-top: 1px solid #000000;
    border-left: 1px solid #000000;
    margin-bottom: -1px;
}

DIV.__NS__console-message > DIV.body-priority-info {
    border: 3px solid #c6eeff;
    margin: 0px;
    border-top: 0px;
}

DIV.__NS__console-message > DIV.body-priority-warn {
    border: 3px solid #ffe68d;
    margin: 0px;
    border-top: 0px;
}

DIV.__NS__console-message > DIV.body-priority-error {
    border: 3px solid #ffa7a7;
    margin: 0px;
    border-top: 0px;
}

DIV.__NS__console-message > DIV.body > DIV.group-no-messages {
    background-color: white;
    padding-left: 4px;
    padding-right: 4px;
    padding-top: 3px;
    padding-bottom: 3px;
    color: gray;
}

DIV.__NS__console-message .hidden {
    display: none !important;
}


///*######################################################################
//#   wrappers/viewer
//#####################################################################

DIV.__NS__viewer-harness {
    padding: 2px 4px 1px 6px;
    font-family: Lucida Grande, Tahoma, sans-serif;
    font-size: 11px;
}


///*######################################################################
//#   firebug console
//#####################################################################

DIV.devcomp-request-group {
  background: url(__RESOURCE__images/firebug_request_group_bg.png) repeat-x #FFFFFF;
}

DIV.devcomp-request-group > DIV.logGroupLabel {
  min-height: 16px !important;
  background: url(__RESOURCE__images/devcomp_16.png) !important;
  background-repeat: no-repeat !important;
  background-position: 3px 1px !important;
  padding-left: 24px !important;
}

DIV.devcomp-request-group > DIV.logGroupLabel > SPAN.objectBox {
  color: #445777;
  font-family: Lucida Grande, Tahoma, sans-serif;
  font-size: 11px;
}

DIV.devcomp-request-group > DIV.logGroupBody > DIV > DIV.title > DIV.actions > DIV {
    display: none !important;
}


*/}

},{}],9:[function(require,module,exports){

module.id = module.id || "insight_pack";

require("../pack-helper").init(exports, module, {
    css: require("./pack.css.js").toString().split("\n").slice(1, -1).filter(function (line) {
        if (/^\/\//.test(line)) {
            return false;
        }
        return true;
    }).join("\n"),
    getTemplates: function()
    {
        require("./wrappers/console");
        require("./wrappers/viewer");

        return [
            // First: Match by node.meta.renderer
            require("./structures/trace"),
            require("./structures/table"),

            // Second: Utility messages matched by various specific criteria
            require("./util/trimmed"),

            // Third: Match by node.type
            require("./primitives/text"),
            require("./primitives/constant"),
            require("./primitives/array"),
            require("./primitives/map"),
            require("./primitives/reference"),
            require("./primitives/dictionary"),

            // Last: Catch any nodes that did not match above
            require("./primitives/unknown")
        ];
    }
});

},{"../pack-helper":22,"./pack.css.js":8,"./primitives/array":10,"./primitives/constant":11,"./primitives/dictionary":12,"./primitives/map":13,"./primitives/reference":14,"./primitives/text":15,"./primitives/unknown":16,"./structures/table":17,"./structures/trace":18,"./util/trimmed":19,"./wrappers/console":20,"./wrappers/viewer":21}],10:[function(require,module,exports){

var PACK = require("../pack");

PACK.initTemplate(require, exports, module, {

    type: "array",

    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;

        return DOMPLATE.domplate({

            VAR_label: "array",

            CONST_Normal: "tag",
            CONST_Short: "shortTag",
            CONST_Collapsed: "collapsedTag",
    
            tag:
                T.SPAN({"class": PACK.__NS__+"array"}, T.SPAN("$VAR_label("),
                    T.FOR("element", "$node,$CONST_Normal|elementIterator",
                        T.DIV({"class": "element", "$expandable":"$element.expandable", "_elementObject": "$element", "onclick": "$onClick"},
                            T.SPAN({"class": "value"},
                                T.TAG("$element.tag", {"element": "$element", "node": "$element.node"})
                            ),
                            T.IF("$element.more", T.SPAN({"class": "separator"}, ","))
                        )
                    ),
                T.SPAN(")")),
    
            collapsedTag:
                T.SPAN({"class": PACK.__NS__+"array"}, T.SPAN("$VAR_label("),
                    T.SPAN({"class": "collapsed"}, "... $node|getElementCount ..."),
                T.SPAN(")")),
    
            shortTag:
                T.SPAN({"class": PACK.__NS__+"array"}, T.SPAN("$VAR_label("),
                    T.FOR("element", "$node,$CONST_Short|elementIterator",
                        T.SPAN({"class": "element"},
                            T.SPAN({"class": "value"},
                                T.TAG("$element.tag", {"element": "$element", "node": "$element.node"})
                            ),
                            T.IF("$element.more", T.SPAN({"class": "separator"}, ","))
                        )
                    ),
                T.SPAN(")")),
    
            expandableStub:
                T.TAG("$element,$CONST_Collapsed|getTag", {"node": "$element.node"}),
                
            expandedStub:
                T.TAG("$tag", {"node": "$node", "element": "$element"}),
    
            moreTag:
                T.SPAN(" ... "),
    
            getElementCount: function(node) {
                if(!node.value) return 0;
                return node.value.length || 0;
            },
    
            getTag: function(element, type) {
                if(type===this.CONST_Short) {
                    return helpers.getTemplateForNode(element.node).shortTag;
                } else
                if(type===this.CONST_Normal) {
                    if(element.expandable) {
                        return this.expandableStub;
                    } else {
                        return helpers.getTemplateForNode(element.node).tag;
                    }
                } else
                if(type===this.CONST_Collapsed) {
                    var rep = helpers.getTemplateForNode(element.node);
                    if(!rep.collapsedTag) {
                        throw "no 'collapsedTag' property in rep: " + rep.toString();
                    }
                    return rep.collapsedTag;
                }
            },
    
            elementIterator: function(node, type) {
                var elements = [];
                if(!node.value) return elements;
                for( var i=0 ; i<node.value.length ; i++ ) {
                    
                    var element = {
                        "node": helpers.util.merge(node.value[i], {"wrapped": true}),
                        "more": (i<node.value.length-1),
                        "expandable": this.isExpandable(node.value[i])
                    };
    
                    if(i>2 && type==this.CONST_Short) {
                        element["tag"] = this.moreTag;
                    } else {
                        element["tag"] = this.getTag(element, type);
                    }
    
                    elements.push(element);
    
                    if(i>2 && type==this.CONST_Short) {
                        elements[elements.length-1].more = false;
                        break;
                    }
                }
                return elements;
            },
    
            isExpandable: function(node) {
                return (node.type=="reference" ||
                        node.type=="dictionary" ||
                        node.type=="map" ||
                        node.type=="array");
            },
            
            onClick: function(event) {
                if (!helpers.util.isLeftClick(event)) {
                    return;
                }
                var row = helpers.util.getAncestorByClass(event.target, "element");
                if(helpers.util.hasClass(row, "expandable")) {
                    this.toggleRow(row);
                }
                event.stopPropagation();
            },
            
            toggleRow: function(row)
            {
                var valueElement = helpers.util.getElementByClass(row, "value");
                if (helpers.util.hasClass(row, "expanded"))
                {
                    helpers.util.removeClass(row, "expanded");
                    this.expandedStub.replace({
                        "tag": this.expandableStub,
                        "element": row.elementObject,
                        "node": row.elementObject.node
                    }, valueElement);
                } else {
                    helpers.util.setClass(row, "expanded");
                    this.expandedStub.replace({
                        "tag": helpers.getTemplateForNode(row.elementObject.node).tag,
                        "element": row.elementObject,
                        "node": row.elementObject.node
                    }, valueElement);
                }
            }        
        });
    }
});

},{"../pack":9}],11:[function(require,module,exports){

var PACK = require("../pack");

PACK.initTemplate(require, exports, module, {

    type: "constant",

    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({

            tag: T.SPAN({"class": PACK.__NS__+"constant"},
                        "$node.value"),

            shortTag: T.SPAN({"class": PACK.__NS__+"constant"},
                            "$node.value")
        });
    }
});

},{"../pack":9}],12:[function(require,module,exports){

var PACK = require("../pack");

PACK.initTemplate(require, exports, module, {

    type: "dictionary",

    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({
    
            CONST_Normal: "tag",
            CONST_Short: "shortTag",
            CONST_Collapsed: "collapsedTag",
    
            tag:
                T.SPAN({"class": PACK.__NS__+"dictionary"}, T.SPAN("$node|getLabel("),
                    T.FOR("member", "$node,$CONST_Normal|dictionaryIterator",
                        T.DIV({"class": "member", "$expandable":"$member.expandable", "_memberObject": "$member", "onclick": "$onClick"},
                            T.SPAN({"class": "name", "decorator": "$member|getMemberNameDecorator"}, "$member.name"),
                            T.SPAN({"class": "delimiter"}, ":"),
                            T.SPAN({"class": "value"},
                                T.TAG("$member.tag", {"member": "$member", "node": "$member.node"})
                            ),
                            T.IF("$member.more", T.SPAN({"class": "separator"}, ","))
                        )
                    ),
                T.SPAN(")")),
    
            shortTag:
                T.SPAN({"class": PACK.__NS__+"dictionary"}, T.SPAN("$node|getLabel("),
                    T.FOR("member", "$node,$CONST_Short|dictionaryIterator",
                        T.SPAN({"class": "member"},
                            T.SPAN({"class": "name"}, "$member.name"),
                            T.SPAN({"class": "delimiter"}, ":"),
                            T.SPAN({"class": "value"},
                                T.TAG("$member.tag", {"member": "$member", "node": "$member.node"})
                            ),
                            T.IF("$member.more", T.SPAN({"class": "separator"}, ","))
                        )
                    ),
                T.SPAN(")")),
    
            collapsedTag:
                T.SPAN({"class": PACK.__NS__+"dictionary"}, T.SPAN("$node|getLabel("),
                    T.SPAN({"class": "collapsed"}, "... $node|getMemberCount ..."),
                T.SPAN(")")),
    
            expandableStub:
                T.TAG("$member,$CONST_Collapsed|getTag", {"node": "$member.node"}),
                
            expandedStub:
                T.TAG("$tag", {"node": "$node", "member": "$member"}),
    
            moreTag:
                T.SPAN({"class": "more"}, " ... "),
            
            getLabel: function(node) {
                return "dictionary";
            },
            
            getMemberNameDecorator: function(member) {
                return "";
            },
            
            getMemberCount: function(node) {
                if(!node.value) return 0;
                var count = 0;
                for( var name in node.value ) {
                    count++;
                }
                return count;
            },
            
            getTag: function(member, type) {
                if(type===this.CONST_Short) {
                    return helpers.getTemplateForNode(member.node).shortTag;
                } else
                if(type===this.CONST_Normal) {
                    if(member.expandable) {
                        return this.expandableStub;
                    } else {
                        return helpers.getTemplateForNode(member.node).tag;
                    }
                } else
                if(type===this.CONST_Collapsed) {
                    var rep = helpers.getTemplateForNode(member.node);
                    if(!rep.collapsedTag) {
                        throw "no 'collapsedTag' property in rep: " + rep.toString();
                    }
                    return rep.collapsedTag;
                }
            },
            
            dictionaryIterator: function(node, type) {
                var members = [];
                if(!node.value || node.value.length==0) return members;
                for( var name in node.value ) {
    
                    var member = {
                        "name": name,
                        "node": helpers.util.merge(node.value[name], {"wrapped": true}),
                        "more": true,
                        "expandable": this.isExpandable(node.value[name])
                    };
    
                    if(members.length>1 && type==this.CONST_Short) {
                        member["tag"] = this.moreTag;
                    } else {
                        member["tag"] = this.getTag(member, type);
                    }
                    
                    members.push(member);
    
                    if(members.length>2 && type==this.CONST_Short) {
                        break;
                    }
                }
                if(members.length>0) {
                    members[members.length-1]["more"] = false;
                }
                
                return members;
            },
            
            isExpandable: function(node) {
                return (node.type=="reference" ||
                        node.type=="dictionary" ||
                        node.type=="map" ||
                        node.type=="array");
            },
            
            onClick: function(event) {
                if (!helpers.util.isLeftClick(event)) {
                    return;
                }
                var row = helpers.util.getAncestorByClass(event.target, "member");
                if(helpers.util.hasClass(row, "expandable")) {
                    this.toggleRow(row);
                }
                event.stopPropagation();
            },
            
            toggleRow: function(row)
            {
                var valueElement = helpers.util.getElementByClass(row, "value");
                if (helpers.util.hasClass(row, "expanded"))
                {
                    helpers.util.removeClass(row, "expanded");
                    this.expandedStub.replace({
                        "tag": this.expandableStub,
                        "member": row.memberObject,
                        "node": row.memberObject.node
                    }, valueElement);
                } else {
                    helpers.util.setClass(row, "expanded");
                    this.expandedStub.replace({
                        "tag": helpers.getTemplateForNode(row.memberObject.node).tag,
                        "member": row.memberObject,
                        "node": row.memberObject.node
                    }, valueElement);
                }
            }
        });
    }
});

},{"../pack":9}],13:[function(require,module,exports){

var PACK = require("../pack");

PACK.initTemplate(require, exports, module, {

    type: "map",

    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({
            
            VAR_label: "map",
    
            CONST_Normal: "tag",
            CONST_Short: "shortTag",
    
            tag:
                T.SPAN({"class": PACK.__NS__+"map", "_nodeObject": "$node"}, T.SPAN("$VAR_label("),
                    T.FOR("pair", "$node,$CONST_Normal|mapIterator",
                        T.DIV({"class": "pair"},
                            T.TAG("$pair.key.tag", {"node": "$pair.key.node"}),
                            T.SPAN({"class": "delimiter"}, "=>"),
                            T.SPAN({
                                    "class": "value",
                                    "onclick": "$onClick",
                                    "_nodeObject": "$pair.value.node",
                                    "_expandable": "$pair.value.expandable"
                                },
                                T.TAG("$pair.value.tag", {"node": "$pair.value.node"})
                                ),
                            T.IF("$pair.more", T.SPAN({"class": "separator"}, ","))
                        )
                    ),
                T.SPAN(")")),
    
            shortTag:
                T.SPAN({"class": PACK.__NS__+"map", "_nodeObject": "$node"}, T.SPAN("$VAR_label("),
                    T.FOR("pair", "$node,$CONST_Short|mapIterator",
                        T.SPAN({"class": "pair"},
                            T.TAG("$pair.key.tag", {"node": "$pair.key.node"}),
                            T.SPAN({"class": "delimiter"}, "=>"),
                            T.SPAN({
                                    "class": "value",
                                    "onclick": "$onClick",
                                    "_nodeObject": "$pair.value.node",
                                    "_expandable": "$pair.value.expandable"
                                },
                                T.TAG("$pair.value.tag", {"node": "$pair.value.node"})
                                ),
                            T.IF("$pair.more", T.SPAN({"class": "separator"}, ","))
                        )
                    ),
                T.SPAN(")")),
    
            collapsedTag: 
                T.SPAN({"class": PACK.__NS__+"map"}, T.SPAN("$VAR_label("),
                    T.SPAN({"class": "collapsed"}, "... $node|getItemCount ..."),
                T.SPAN(")")),
    
            moreTag:
                T.SPAN(" ... "),   
            
            getItemCount: function(node) {
                if(!node.value) return 0;
                return node.value.length;
            },

            onClick: function(event) {
                var row = helpers.util.getAncestorByClass(event.target, "value");
                if(row.expandable) {
                    this.toggleRow(row);
                }
                event.stopPropagation();
            },
            
            toggleRow: function(row)
            {
                var node = null;
                if (helpers.util.hasClass(row, "expanded")) {
                    node = this.collapsedTag.replace({
                        "node": row.nodeObject
                    }, row);
                    helpers.util.removeClass(row, "expanded");
                } else {
                    var valueRep = helpers.getTemplateForNode(row.nodeObject).tag;
                    node = valueRep.replace({
                        "node": row.nodeObject
                    }, row);
                    helpers.util.setClass(row, "expanded");
                }
            },
    
            mapIterator: function(node, type) {
                var pairs = [];
                if(!node.value) return pairs;
                for( var i=0 ; i<node.value.length ; i++ ) {

                    var valueRep = getTag(helpers.getTemplateForNode(node.value[i][1]), type, node.value[i][1]);
    
                    if(i>2 && type==this.CONST_Short) {
                        valueRep = this.moreTag;
                    }

                    pairs.push({
                        "key": {
                            "tag": getTag(helpers.getTemplateForNode(node.value[i][0]), type, node.value[i][0]),
                            "node": helpers.util.merge(node.value[i][0], {"wrapped": true})
                        },
                        "value": {
                            "tag": valueRep,
                            "node": helpers.util.merge(node.value[i][1], {"wrapped": true}),
                            "expandable": isCollapsible(node.value[i][1])
                        },
                        "more": (i<node.value.length-1)
                    });
    
                    if(i>2 && type==this.CONST_Short) {
                        pairs[pairs.length-1].more = false;
                        break;
                    }
                }
                return pairs;
            }
        });
    }
});

function isCollapsible (node) {
    return (node.type=="reference" ||
            node.type=="dictionary" ||
            node.type=="map" ||
            node.type=="array");
}    

function getTag (rep, type, node) {
    if (node.meta.collapsed) {
        if (isCollapsible(node)) {
            type = "collapsedTag";
        } else {
            type = "shortTag";
        }
    }
    if(!rep[type]) {
        if(type=="shortTag") {
            return rep.tag;
        }
        throw new Error("Rep does not have tag of type: " + type);
    }
    return rep[type];
}

},{"../pack":9}],14:[function(require,module,exports){

var PACK = require("../pack");

PACK.initTemplate(require, exports, module, {

    type: "reference",

    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({
    
            CONST_Normal: "tag",
            CONST_Short: "shortTag",
            CONST_Collapsed: "collapsedTag",
    
            tag:
                T.SPAN({"class": PACK.__NS__+"reference"},
                T.TAG("$node,$CONST_Normal|getTag", {"node": "$node|getInstanceNode"})),
            
            shortTag:
                T.SPAN({"class": PACK.__NS__+"reference"},
                T.TAG("$node,$CONST_Collapsed|getTag", {"node": "$node|getInstanceNode"})),
    
            collapsedTag:
                T.SPAN({"class": PACK.__NS__+"reference"},
                T.TAG("$node,$CONST_Collapsed|getTag", {"node": "$node|getInstanceNode"})),
                
            getTag: function(node, type) {
                return helpers.getTemplateForNode(this.getInstanceNode(node))[type];
            },

            getInstanceNode: function(node) {
                return node.getInstance();
            }
        });
    }
});

},{"../pack":9}],15:[function(require,module,exports){

var PACK = require("../pack");

PACK.initTemplate(require, exports, module, {

    type: "text",

    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({
    
            tag: T.SPAN({"class": PACK.__NS__+"text"},
                        T.FOR("line", "$node.value|lineIterator", "$line.value",
                            T.IF("$line.more", T.BR())
                        )
                    ),
            
            shortTag: T.SPAN({"class": PACK.__NS__+"text"}, "$node|getValue"),
    

            getValue: function(node) {
                if (!node.parentNode || (node.meta && typeof node.meta["string.trim.enabled"] !== "undefined" && node.meta["string.trim.enabled"]===false))
                    return node.value;
                else
                    return this.cropString(node.value);
            },

            cropString: function(text, limit){
                text = text + "";
                limit = limit || 50;
                var halfLimit = limit / 2;
                if (text.length > limit) {
                    return this.escapeNewLines(text.substr(0, halfLimit) + "..." + text.substr(text.length - halfLimit));
                } else {
                    return this.escapeNewLines(text);
                }
            },
            
            escapeNewLines: function(value) {
                return value.replace(/\r/g, "\\r").replace(/\n/g, "\\n");
            },
            
            lineIterator: function(value) {
                var parts = (""+value).replace(/\r/g, "\\r").split("\n");
                var lines = [];
                for( var i=0 ; i<parts.length ; i++ ) {
                    lines.push({"value": parts[i], "more": (i<parts.length-1)});
                }
                return lines;
            }
        });
    }
});

},{"../pack":9}],16:[function(require,module,exports){

var PACK = require("../pack");

exports.supportsObjectGraphNode = function(node)
{
    return true;
};

PACK.initTemplate(require, exports, module, {

    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({
    
            tag: T.SPAN({"class": PACK.__NS__+"unknown"},
                        "$node.value"),
            
            shortTag: T.SPAN({"class": PACK.__NS__+"unknown"},
                            "$node.value")

        });
    }
});

},{"../pack":9}],17:[function(require,module,exports){

var PACK = require("../pack");

exports.supportsObjectGraphNode = function(node)
{
    return (node.meta && typeof node.meta.renderer !== "undefined" && node.meta.renderer === "structures/table")?true:false;
};

PACK.initTemplate(require, exports, module, {
    __name: "table",
    
    VAR_hideShortTagOnExpand: false,
    
    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({

            VAR_hideShortTagOnExpand: false,

            tag:
                T.DIV({"class": PACK.__NS__+"structures-table"},
                    T.TABLE({"cellpadding": 3, "cellspacing": 0},
                        T.TBODY(
                            T.TR({"class":"$node|getHeaderClass"},
                                T.FOR("column", "$node|getHeaders",
                                    T.TH({"class": "header"}, T.TAG("$column.tag", {"node": "$column.node"}))
                                ),
                                T.IF("$node|hasNoHeader",
                                    T.TH()    // needed to fix gecko bug that does not render table border if empty <tr/> in table
                                )
                            ),
                            T.FOR("row", "$node|getRows",
                                T.TR(
                                    T.FOR("cell", "$row|getCells",
                                        T.TD({"class": "cell", "_cellNodeObj": "$cell.node", "onclick":"$onCellClick"},
                                            T.TAG("$cell.tag", {"node": "$cell.node"}))
                                    )
                                )
                            )
                        )
                    )
                ),

            shortTag:
                T.SPAN({"class": PACK.__NS__+"structures-table"}, T.TAG("$node|getTitleTag", {"node": "$node|getTitleNode"})),

            getTitleTag: function(node) {
                var rep = helpers.getTemplateForNode(this.getTitleNode(node));
                return rep.shortTag || rep.tag;
            },

            getTitleNode: function(node) {
                return helpers.util.merge(node.compact().title, {"wrapped": false});
            },
            
            getHeaderClass: function(node)
            {
                if (this.hasNoHeader(node)) {
                    return "hide";
                } else {
                    return "";
                }
            },

            hasNoHeader: function(node) {
                var header = node.compact().header;
                if(!header || header.type!="array") {
                    return true;
                }
                return false;
            },

            getHeaders: function(node) {
                var header = node.compact().header;
                if(!header || header.type!="array") {
                    return [];
                }
                var items = [];
                for (var i = 0; i < header.value.length; i++) {
                    var rep = helpers.getTemplateForNode(header.value[i]);
                    items.push({
                        "node": helpers.util.merge(header.value[i], {"wrapped": false}),
                        "tag": rep.shortTag || rep.tag
                    });
                }
                return items;
            },
    
            getRows: function(node) {
                var data = node.compact().data;
                if(!data || data.type!="array") {
                    return [];
                }
                return data.value;
            },
    
            getCells: function(node) {
                var items = [];
                if(node.value) {
                    for (var i = 0; i < node.value.length; i++) {
                        var rep = helpers.getTemplateForNode(node.value[i]);
                        items.push({
                            "node": helpers.util.merge(node.value[i], {"wrapped": false}),
                            "tag": rep.shortTag || rep.tag
                        });
                    }
                } else
                if(node.meta && node.meta['encoder.trimmed']) {
                    var rep = helpers.getTemplateForNode(node);
                    items.push({
                        "node": helpers.util.merge(node, {"wrapped": false}),
                        "tag": rep.shortTag || rep.tag
                    });
                }
                return items;
            },
    
            onCellClick: function(event) {
                event.stopPropagation();

                //var masterRow = this._getMasterRow(event.target);
                //masterRow.messageObject

                var tag = event.target;
                while(tag.parentNode) {
                    if (tag.cellNodeObj) {
                        break;
                    }
                    tag = tag.parentNode;
                }
                helpers.dispatchEvent('inspectNode', [event, {
                    //"message": masterRow.messageObject,
                    "args": {"node": tag.cellNodeObj}
                }]);
            },

            _getMasterRow: function(row)
            {
                while(true) {
                    if(!row.parentNode) {
                        return null;
                    }
                    if(helpers.util.hasClass(row, PACK.__NS__ + "console-message")) {
                        break;
                    }
                    row = row.parentNode;
                }
                return row;
            }                
        });
    }
});

},{"../pack":9}],18:[function(require,module,exports){

var PACK = require("../pack");

exports.supportsObjectGraphNode = function(node)
{
    return (node.meta && typeof node.meta.renderer !== "undefined" && node.meta.renderer === "structures/trace")?true:false;
};

PACK.initTemplate(require, exports, module, {
    __name: "trace",

    VAR_hideShortTagOnExpand: false,

    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({

            VAR_hideShortTagOnExpand: false,
            
            tag:
                T.DIV({"class": PACK.__NS__+"structures-trace"},
                    T.TABLE({"cellpadding": 3, "cellspacing": 0},
                        T.TBODY(
                            T.TR(
                                T.TH({"class": "header-file"}, "File"),
                                T.TH({"class": "header-line"}, "Line"),
                                T.TH({"class": "header-inst"}, "Instruction")
                            ),
                            T.FOR("frame", "$node|getCallList",
                                T.TR({"_frameNodeObj": "$frame.node"},
                                    T.TD({"class": "cell-file", "onclick":"$onFileClick"}, "$frame.file"),
                                    T.TD({"class": "cell-line", "onclick":"$onFileClick"}, "$frame.line"),
                                    T.TD({"class": "cell-inst"},
                                        T.DIV("$frame|getFrameLabel(",
                                            T.FOR("arg", "$frame|argIterator",
                                                T.DIV({"class": "arg", "_argNodeObj": "$arg.node", "onclick":"$onArgClick"},
                                                    T.TAG("$arg.tag", {"node": "$arg.node"}),
                                                    T.IF("$arg.more", T.SPAN({"class": "separator"}, ","))
                                                )
                                            ),
                                        ")")
                                    )
                                )
                            )
                        )
                    )
                ),
    
            shortTag:
                T.SPAN({"class": PACK.__NS__+"structures-trace"}, T.TAG("$node|getCaptionTag", {"node": "$node|getCaptionNode"})),
    
    
            onFileClick: function(event) {
                event.stopPropagation();
                var node = event.target.parentNode.frameNodeObj,
                    frame = node.compact();
                if(!frame.file || !frame.line) {
                    return;
                }
                var args = {
                    "file": frame.file.value,
                    "line": frame.line.value
                };
                if(args["file"] && args["line"]) {
                    helpers.dispatchEvent('inspectFile', [event, {
                        "message": node.getObjectGraph().message,
                        "args": args
                    }]);
                }
            },
    
            onArgClick: function(event) {
                event.stopPropagation();
                var tag = event.target;
                while(tag.parentNode) {
                    if(tag.argNodeObj) {
                        break;
                    }
                    tag = tag.parentNode;
                }
                helpers.dispatchEvent('inspectNode', [event, {
                    "message": tag.argNodeObj.getObjectGraph().message,
                    "args": {"node": tag.argNodeObj}
                }]);
            },
    
            getCaptionTag: function(node) {
                var rep = helpers.getTemplateForNode(this.getCaptionNode(node));
                return rep.shortTag || rep.tag;
            },
    
            getCaptionNode: function(node) {
                if (node.type == "map")
                    return helpers.util.merge(node.compact().title, {"wrapped": false});
                if (node.type == "dictionary")
                    return helpers.util.merge(node.value.title, {"wrapped": false});
            },

            getTrace: function(node) {
                if (node.type == "map")
                    return node.compact().trace.value;
                if (node.type == "dictionary")
                    return node.value.trace.value;
                helpers.logger.error("Cannot get trace from node", node);
            },

            postRender: function(node)
            {
;debugger;                    
/*                    
                var node = this._getMasterRow(node);
                if (node.messageObject && typeof node.messageObject.postRender == "object")
                {
                    if (typeof node.messageObject.postRender.keeptitle !== "undefined")
                    {
                        node.setAttribute("keeptitle", node.messageObject.postRender.keeptitle?"true":"false");
                    }
                }
*/                    
            },

            getCallList: function(node) {

                // TODO: Do this in an init method
/*
                if (node.messageObject && typeof node.messageObject.postRender == "object") {
                    if (typeof node.messageObject.postRender.keeptitle !== "undefined") {
                        node.setAttribute("keeptitle", "true");
                    }
                }                    
*/
                try {
                    var list = [];
                    this.getTrace(node).forEach(function(node) {
                        frame = node.compact();
                        list.push({
                            'node': node,
                            'file': (frame.file)?frame.file.value:"",
                            'line': (frame.line)?frame.line.value:"",
                            'class': (frame["class"])?frame["class"].value:"",
                            'function': (frame["function"])?frame["function"].value:"",
                            'type': (frame.type)?frame.type.value:"",
                            'args': (frame.args)?frame.args.value:false
                        });
                    });
    
                    // Now that we have all call events, lets see if we can shorten the filenames.
                    // This only works for unix filepaths for now.
                    // TODO: Get this working for windows filepaths as well.
                    try {
                        if (list[0].file.substr(0, 1) == '/') {
                            var file_shortest = list[0].file.split('/');
                            var file_original_length = file_shortest.length;
                            for (var i = 1; i < list.length; i++) {
                                var file = list[i].file.split('/');
                                for (var j = 0; j < file_shortest.length; j++) {
                                    if (file_shortest[j] != file[j]) {
                                        file_shortest.splice(j, file_shortest.length - j);
                                        break;
                                    }
                                }
                            }
                            if (file_shortest.length > 2) {
                                if (file_shortest.length == file_original_length) {
                                    file_shortest.pop();
                                }
                                file_shortest = file_shortest.join('/');
                                for (var i = 0; i < list.length; i++) {
                                    list[i].file = '...' + list[i].file.substr(file_shortest.length);
                                }
                            }
                        }
                    } catch (e) {}
    
                    return list;
                } catch(e) {
                    helpers.logger.error(e);
                }
            },
    
            getFrameLabel: function(frame)
            {
                try {
                    if (frame['class']) {
                        if (frame['type'] == 'throw') {
                            return 'throw ' + frame['class'];
                        } else
                        if (frame['type'] == 'trigger') {
                            return 'trigger_error';
                        } else {
                            return frame['class'] + frame['type'] + frame['function'];
                        }
                    }
                    return frame['function'];
                } catch(e) {
                    helpers.logger.error(e);
                }
            },
    
            argIterator: function(frame)
            {
                try {
                    if(!frame.args) {
                        return [];
                    }
                    var items = [];
                    for (var i = 0; i < frame.args.length; i++) {
                        items.push({
                            "node": helpers.util.merge(frame.args[i], {"wrapped": true}),
                            "tag": helpers.getTemplateForNode(frame.args[i]).shortTag,
                            "more": (i < frame.args.length-1)
                        });
                    }
                    return items;
                } catch(e) {
                    helpers.logger.error(e);
                }
            }
        });
    }
});

},{"../pack":9}],19:[function(require,module,exports){

var PACK = require("../pack");

exports.supportsObjectGraphNode = function(node)
{
    return (node.meta && node.meta["encoder.trimmed"] && !node.meta["encoder.trimmed.partial"]);
};

PACK.initTemplate(require, exports, module, {

    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({
    
            tag:
                T.SPAN({"class": PACK.__NS__+"util-trimmed"},
                    "$node|getNotice"
                ),

            collapsedTag: 
                T.SPAN({"class": PACK.__NS__+"util-trimmed"},
                    "$node|getNotice"
                ),

            getNotice: function(node) {
                return node.meta["encoder.notice"];
            }
        });
    }
});

},{"../pack":9}],20:[function(require,module,exports){

var PACK = require("../pack");

exports.supportsObjectGraphNode = function(node)
{
    return false;
};

PACK.initTemplate(require, exports, module, {
    __name: "console",
    
    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({

            CONST_Normal: "tag",
            CONST_Short: "shortTag",
    
            tag:
                T.DIV(
                    {
                        "class": "$message|_getMessageClass",
                        "_messageObject": "$message",
                        "onmouseover":"$onMouseOver",
                        "onmousemove":"$onMouseMove",
                        "onmouseout":"$onMouseOut",
                        "onclick":"$onClick",
                        "expandable": "$message|_isExpandable",
                        "expanded": "false",
                        "_templateObject": "$message|_getTemplateObject"
                    },
                    T.DIV(
                        {
                            "class": "$message|_getHeaderClass",
                            "hideOnExpand": "$message|_getHideShortTagOnExpand"
                        },
                        T.DIV({"class": "expander"}),
                        T.DIV({"class": "actions"},
                            T.DIV({"class": "inspect", "onclick":"$onClick"}),
                            T.DIV({"class": "file $message|_getFileActionClass", "onclick":"$onClick"})
                        ),
                        T.SPAN(
                            {"class": "summary"},
                            T.SPAN({"class": "label"},    // WORKAROUND: T.IF does not work at top level due to a bug
                                T.IF("$message|_hasLabel", T.SPAN("$message|_getLabel"))
                            ),
                            T.TAG("$message,$CONST_Short|_getTag", {
                                "node": "$message|_getValue",
                                "message": "$message"
                            })
                        ),
                        T.SPAN({"class": "fileline"}, 
                            T.DIV(  // WORKAROUND: T.IF does not work at top level due to a bug
                                T.IF("$message|_hasLabel", T.DIV({"class": "label"}, "$message|_getLabel"))
                            ),
                            T.DIV("$message|_getFileLine"))
                    ),
                    T.DIV({"class": "$message|_getBodyClass"})
                ),

                groupNoMessagesTag:
                T.DIV({"class": "group-no-messages"}, "No Messages"),    

            _getTemplateObject: function() {
                return this;
            },
    
            _getMessageClass: function(message) {

                // TODO: Move this into more of an 'init' method
                message.postRender = {};
                
                if(typeof message.meta["group.start"] != "undefined") {
                    return PACK.__NS__ + "console-message " + PACK.__NS__ + "console-message-group";
                } else {
                    return PACK.__NS__ + "console-message";
                }
            },
    
            _getHeaderClass: function(message) {
                if(!message.meta || !message.meta["priority"]) {
                    return "header";
                }
                return "header header-priority-" + message.meta["priority"];
            },
    
            _getBodyClass: function(message) {
                if(!message.meta || !message.meta["priority"]) {
                    return "body";
                }
                return "body body-priority-" + message.meta["priority"];
            },
            
            _getFileLine: function(message) {
                if(!message.meta) {
                    return "";
                }
                var str = [];
                if(message.meta["file"]) {
                    str.push(helpers.util.cropStringLeft(message.meta["file"], 75));
                }
                if(message.meta["line"]) {
                    str.push("@");
                    str.push(message.meta["line"]);
                }
                return str.join(" ");
            },
    
            // TODO: Need better way to set/determine if tag should be hidden
            _getHideShortTagOnExpand: function(message) {
                if(typeof message.meta["group.start"] != "undefined") {
                    return "false";
                }
                var rep = this._getRep(message);
                if(rep.VAR_hideShortTagOnExpand===false) {
                    return "false";
                    
                }
                var node = message.og.getOrigin();
                if(node.type=="reference") {
                    node = node.getInstance();
                    if(node.meta["lang.type"]=="exception") {
                        return "false";
                    }
                }
                return "true";
            },
    
            _isExpandable: function(message) {
    /*
                switch(message.getObjectGraph().getOrigin().type) {
                    case "array":
                    case "reference":
                    case "dictionary":
                    case "map":
                    case "text":
                        break;
                }
    */            
                return true;
            },
            
            _getFileActionClass: function(message) {
                if(message.meta["file"]) return "";
                return "hidden";
            },
    
            _getTag: function(message, type)
            {
                var rep = this._getRep(message);
                if(type==this.CONST_Short) {
                    if(rep.shortTag) {
                        return rep.shortTag;
                    }
                }
                return rep.tag;
            },
            
            _getRep: function(message)
            {
                return message.template;
/*
                var rep;
                
                if(message.meta && message.meta["renderer"]) {
                    rep = helpers.getTemplateForId(message.meta["renderer"]);
                } else {
                    rep = helpers.getTemplateForNode(message.getObjectGraph().getOrigin());
                }
                return rep;
*/
            },
    
            _hasLabel: function(message)
            {
                if(message.meta && typeof message.meta["label"] != "undefined") {
                    return true;
                } else {
                    return false;
                }
            },
    
            _getLabel: function(message)
            {
                if(this._hasLabel(message)) {
                    return message.meta["label"];
                } else {
                    return "";
                }
            },
    
            _getValue: function(message)
            {
                if(typeof message.meta["group.start"] != "undefined") {
                    var node = message.og.getOrigin();
                    node.meta["string.trim.enabled"] = false;
                    return node;
                }
                else
                    return message.og.getOrigin();
            },
    
            onMouseMove: function(event)
            {
    /*            
                if(activeInfoTip) {
                    var x = event.clientX, y = event.clientY;
                    infoTipModule.showInfoTip(activeInfoTip, {
                        showInfoTip: function() {
                            return true;
                        }
                    }, event.target, x, y, event.rangeParent, event.rangeOffset);
                }
    */            
            },
        
            onMouseOver: function(event)
            {
                // set a class on our logRow parent identifying this log row as fireconsole controlled
                // this is used for hover and selected styling
                //helpers.util.setClass(this._getMasterRow(event.target).parentNode, "logRow-" + PACK.__NS__ + "console-message");
    
                if(helpers.util.getChildByClass(this._getMasterRow(event.target), "__no_inspect")) {
                    return;
                }
    
                // populate file/line info tip
    /*            
                var meta = this._getMasterRow(event.target).repObject.meta;
                if(meta && (meta["fc.msg.file"] || meta["fc.msg.line"])) {
                    activeInfoTip = event.target.ownerDocument.getElementsByClassName('infoTip')[0];
                    this.fileLineInfoTipTag.replace({
                        "file": meta["fc.msg.file"] || "?",
                        "line": meta["fc.msg.line"] || "?"
                    }, activeInfoTip);
                } else {
                    activeInfoTip = null;
                }
    */            
            },
        
            onMouseOut: function(event)
            {
    //            if(activeInfoTip) {
    //                infoTipModule.hideInfoTip(activeInfoTip);
    //            }
            },
            
            onClick: function(event)
            {
    //            if(this.util.getChildByClass(this._getMasterRow(event.target), "__no_inspect")) {
    //                return;
    //            }
                try {
                    var masterRow = this._getMasterRow(event.target),
                        headerTag = helpers.util.getChildByClass(masterRow, "header"),
                        actionsTag = helpers.util.getChildByClass(headerTag, "actions"),
                        summaryTag = helpers.util.getChildByClass(headerTag, "summary"),
                        bodyTag = helpers.util.getChildByClass(masterRow, "body");

                    var pointer = {
                        x: event.clientX,
                        y: event.clientY
                    };
                    var masterRect = {
                        "left": headerTag.getBoundingClientRect().left-2,
                        "top": headerTag.getBoundingClientRect().top-2,
                        // actionsTag.getBoundingClientRect().left is 0 if actions tag not showing
                        "right": actionsTag.getBoundingClientRect().left || headerTag.getBoundingClientRect().right,
                        "bottom": headerTag.getBoundingClientRect().bottom+1
                    };
        
                    if(pointer.x >= masterRect.left && pointer.x <= masterRect.right && pointer.y >= masterRect.top && pointer.y <= masterRect.bottom) {
                        event.stopPropagation();
                        
                        if(masterRow.getAttribute("expanded")=="true") {
        
                            masterRow.setAttribute("expanded", "false");
        
                            helpers.dispatchEvent('contract', [event, {
                                "message": masterRow.messageObject,
                                "masterTag": masterRow,
                                "summaryTag": summaryTag,
                                "bodyTag": bodyTag
                            }]);
        
                        } else {

                            masterRow.setAttribute("expanded", "true");

                            helpers.dispatchEvent('expand', [event, {
                                "message": masterRow.messageObject,
                                "masterTag": masterRow,
                                "summaryTag": summaryTag,
                                "bodyTag": bodyTag
                            }]);

                            if(!bodyTag.innerHTML) {
                                if(typeof masterRow.messageObject.meta["group.start"] != "undefined") {                                            
                                    this.groupNoMessagesTag.replace({}, bodyTag, this);
                                } else {
                                    this.expandForMasterRow(masterRow, bodyTag);
                                }
                                this.postRender(bodyTag);
                            }
                        }
                    } else
                    if(helpers.util.hasClass(event.target, "inspect")) {
                        event.stopPropagation();
                        helpers.dispatchEvent('inspectMessage', [event, {
                            "message": masterRow.messageObject,
                            "masterTag": masterRow,
                            "summaryTag": summaryTag,
                            "bodyTag": bodyTag,
                            "args": {
                                "node": masterRow.messageObject.og.getOrigin()
                            }
                        }]);
                    } else
                    if(helpers.util.hasClass(event.target, "file")) {
                        event.stopPropagation();
                        var args = {
                            "file": masterRow.messageObject.meta.file,
                            "line": masterRow.messageObject.meta.line
                        };
                        if(args["file"] && args["line"]) {
                            helpers.dispatchEvent('inspectFile', [event, {
                                "message": masterRow.messageObject,
                                "masterTag": masterRow,
                                "summaryTag": summaryTag,
                                "bodyTag": bodyTag,
                                "args": args
                            }]);
                        }
        /*                
                    } else {
                        event.stopPropagation();
                        helpers.dispatchEvent('click', [event, {
                            "message": masterRow.messageObject,
                            "masterTag": masterRow,
                            "valueTag": valueTag,
                            "bodyTag": bodyTag
                        }]);
        */
                    }
                } catch(e) {
                    helpers.logger.error(e);
                }
            },

            setCount: function(node, count)
            {
                try {
                    var masterRow = this._getMasterRow(node),
                        headerTag = helpers.util.getChildByClass(masterRow, "header"),
                        summaryTag = helpers.util.getChildByClass(headerTag, "summary");

                    summaryTag.children[1].innerHTML += ' <span class="count">(' + count + ')</span>';

                } catch(e) {
                    helpers.logger.error("Error setting count for node!: " + e);
                }                                                
            },
        
            postRender: function(node)
            {
                var node = this._getMasterRow(node);
                if (node.messageObject && typeof node.messageObject.postRender == "object")
                {
                    if (typeof node.messageObject.postRender.keeptitle !== "undefined")
                    {
                        node.setAttribute("keeptitle", node.messageObject.postRender.keeptitle?"true":"false");
                    }
                }
            },

            expandForMasterRow: function(masterRow, bodyTag) {
                masterRow.setAttribute("expanded", "true");

                masterRow.messageObject.render(bodyTag, "detail", masterRow.messageObject);

/*
                var rep = this._getRep(masterRow.messageObject, this.CONST_Normal);
                rep.tag.replace({
                    "node": masterRow.messageObject.getObjectGraph().getOrigin(),
                    "message": masterRow.messageObject
                }, bodyTag, rep);
*/
            },
    
            _getMasterRow: function(row)
            {
                while(true) {
                    if(!row.parentNode) {
                        return null;
                    }
                    if(helpers.util.hasClass(row, PACK.__NS__ + "console-message")) {
                        break;
                    }
                    row = row.parentNode;
                }
                return row;
            }
        });
    }
});

exports.renderMessage = function(message, node, options, helpers)
{
    exports.getTemplate(helpers).tag.replace({"message": message}, node);
}

},{"../pack":9}],21:[function(require,module,exports){

var PACK = require("../pack");

exports.supportsObjectGraphNode = function(node)
{
    return false;
};

PACK.initTemplate(require, exports, module, {
    __name: "viewer",
    
    initRep: function(DOMPLATE, helpers)
    {
        var T = DOMPLATE.tags;
        
        return DOMPLATE.domplate({

            tag:
                T.DIV({
                    "class": PACK.__NS__ + "viewer-harness"
                }, T.TAG("$message|_getTag", {
                    "node": "$message|_getValue",
                    "message": "$message"
                })),

            _getTag: function(message)
            {
                return message.template.tag;
            },

            _getValue: function(message)
            {
                if (typeof message.og != "undefined")
                    return message.og.getOrigin();
                else
                if (typeof message.node != "undefined")
                {
                    return message.node;
                }
                else
                    helpers.logger.error("Unknown message format in " + module.id);
            }
        });
    }
});

exports.renderMessage = function(message, node, options, helpers)
{
    exports.getTemplate(helpers).tag.replace({"message": message}, node);
}

},{"../pack":9}],22:[function(require,module,exports){

var DOMPLATE = require("domplate/lib/domplate");


exports.init = function(packExports, packModule, packOptions) {
    var templates;

    packExports.__NS__ = "__" + packModule.id.replace(/[\.-\/~]/g, "_") + "__";
    packExports.getTemplateForNode = function(node) {
        if (!templates) {
            templates = packOptions.getTemplates();
        }

        var found;
        templates.forEach(function(template) {
            if (found)
                return;
            if (template.supportsObjectGraphNode(node))
                found = template;
        });
        if (!found)
            return false;
        return found;
    }

    var cssImported = false;
    function importCss(helpers) {
        if (!cssImported) {
            cssImported = true;

            var css = packOptions.css;

            css = css.replace(/__NS__/g, packExports.__NS__);
            css = css.replace(/__RESOURCE__/g, helpers.getResourceBaseUrl(packModule));

            helpers.importCssString(packModule.id, css, helpers.document);
        }
    }

    // The wrapper for a template
    packExports.initTemplate = function(require, exports, module, template) {

        exports.getTemplatePack = function() {
            return packExports;
        };
        exports.getTemplateLocator = function() {
            var m = module.id.split("/");
            return {
                id: "github.com/insight/insight.renderers.default/",
                module: m.splice(m.length-3,3).join("/")
            };
        };
        if (typeof exports.supportsObjectGraphNode == "undefined") {
            exports.supportsObjectGraphNode = function(node) {
                return (node.type == template.type);
            };
        }

        exports.getTemplateDeclaration = function () {
            return template;
        }

        exports.getTemplate = function(helpers, subclass) {

            if (helpers.debug) {
                DOMPLATE.DomplateDebug.console = window.console;
                DOMPLATE.DomplateDebug.setEnabled(true);
            }

            var rep;
// NOTE: This needs to go as this gets called multiple times with different 'subclass'
//            if (typeof rep == "undefined")
//            {
                importCss(helpers);
                rep = template.initRep({
                    tags: DOMPLATE.tags,
                    domplate: function(tpl) {
                        if (subclass) {
                            tpl = helpers.util.merge(tpl, subclass);
                        }
                        if (tpl.inherits) {
                            var inherits = tpl.inherits;
                            delete tpl.inherits;
                            return inherits.getTemplate(helpers, tpl);
                        } else {
                            return DOMPLATE.domplate(tpl);
                        }
                    }
                }, helpers);
                rep.getTemplate = function() {
                    return exports;
                };
//            }
            return rep;
        }

        exports.renderObjectGraphToNode = function(ogNode, domNode, options, helpers) {
            var tpl = exports.getTemplate(helpers);
            for (var i=0, ic=options.view.length ; i<ic ; i++) {
                var tag;
                switch(options.view[i]) {
                    case "detail":
                        tag = "tag";
                        break;
                    default:
                    case "summary":
                        tag = "shortTag";
                        break;
                }
                if (typeof tpl[tag] != "undefined") {
                    tpl[tag].replace({"node": ogNode}, domNode);
                    return;
                }
            }
        };
    }
}

},{"domplate/lib/domplate":1}],23:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

module.exports = DataView;

},{"./_getNative":84,"./_root":122}],24:[function(require,module,exports){
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

},{"./_hashClear":91,"./_hashDelete":92,"./_hashGet":93,"./_hashHas":94,"./_hashSet":95}],25:[function(require,module,exports){
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

},{"./_listCacheClear":104,"./_listCacheDelete":105,"./_listCacheGet":106,"./_listCacheHas":107,"./_listCacheSet":108}],26:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;

},{"./_getNative":84,"./_root":122}],27:[function(require,module,exports){
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

},{"./_mapCacheClear":109,"./_mapCacheDelete":110,"./_mapCacheGet":111,"./_mapCacheHas":112,"./_mapCacheSet":113}],28:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Promise = getNative(root, 'Promise');

module.exports = Promise;

},{"./_getNative":84,"./_root":122}],29:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;

},{"./_getNative":84,"./_root":122}],30:[function(require,module,exports){
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

},{"./_ListCache":25,"./_stackClear":126,"./_stackDelete":127,"./_stackGet":128,"./_stackHas":129,"./_stackSet":130}],31:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":122}],32:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;

},{"./_root":122}],33:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

module.exports = WeakMap;

},{"./_getNative":84,"./_root":122}],34:[function(require,module,exports){
/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

module.exports = addMapEntry;

},{}],35:[function(require,module,exports){
/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

module.exports = addSetEntry;

},{}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],38:[function(require,module,exports){
/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;

},{}],39:[function(require,module,exports){
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

},{"./_baseTimes":62,"./_isIndex":99,"./isArguments":136,"./isArray":137,"./isBuffer":140,"./isTypedArray":146}],40:[function(require,module,exports){
/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;

},{}],41:[function(require,module,exports){
/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array == null ? 0 : array.length;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

module.exports = arrayReduce;

},{}],42:[function(require,module,exports){
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

},{"./_baseAssignValue":47,"./eq":134}],43:[function(require,module,exports){
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

},{"./_baseAssignValue":47,"./eq":134}],44:[function(require,module,exports){
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

},{"./eq":134}],45:[function(require,module,exports){
var copyObject = require('./_copyObject'),
    keys = require('./keys');

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

module.exports = baseAssign;

},{"./_copyObject":73,"./keys":147}],46:[function(require,module,exports){
var copyObject = require('./_copyObject'),
    keysIn = require('./keysIn');

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

module.exports = baseAssignIn;

},{"./_copyObject":73,"./keysIn":148}],47:[function(require,module,exports){
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

},{"./_defineProperty":79}],48:[function(require,module,exports){
var Stack = require('./_Stack'),
    arrayEach = require('./_arrayEach'),
    assignValue = require('./_assignValue'),
    baseAssign = require('./_baseAssign'),
    baseAssignIn = require('./_baseAssignIn'),
    cloneBuffer = require('./_cloneBuffer'),
    copyArray = require('./_copyArray'),
    copySymbols = require('./_copySymbols'),
    copySymbolsIn = require('./_copySymbolsIn'),
    getAllKeys = require('./_getAllKeys'),
    getAllKeysIn = require('./_getAllKeysIn'),
    getTag = require('./_getTag'),
    initCloneArray = require('./_initCloneArray'),
    initCloneByTag = require('./_initCloneByTag'),
    initCloneObject = require('./_initCloneObject'),
    isArray = require('./isArray'),
    isBuffer = require('./isBuffer'),
    isObject = require('./isObject'),
    keys = require('./keys');

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
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

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

module.exports = baseClone;

},{"./_Stack":30,"./_arrayEach":37,"./_assignValue":43,"./_baseAssign":45,"./_baseAssignIn":46,"./_cloneBuffer":65,"./_copyArray":72,"./_copySymbols":74,"./_copySymbolsIn":75,"./_getAllKeys":81,"./_getAllKeysIn":82,"./_getTag":89,"./_initCloneArray":96,"./_initCloneByTag":97,"./_initCloneObject":98,"./isArray":137,"./isBuffer":140,"./isObject":143,"./keys":147}],49:[function(require,module,exports){
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

},{"./isObject":143}],50:[function(require,module,exports){
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

},{"./_createBaseFor":78}],51:[function(require,module,exports){
var arrayPush = require('./_arrayPush'),
    isArray = require('./isArray');

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;

},{"./_arrayPush":40,"./isArray":137}],52:[function(require,module,exports){
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

},{"./_Symbol":31,"./_getRawTag":86,"./_objectToString":119}],53:[function(require,module,exports){
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

},{"./_baseGetTag":52,"./isObjectLike":144}],54:[function(require,module,exports){
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

},{"./_isMasked":102,"./_toSource":131,"./isFunction":141,"./isObject":143}],55:[function(require,module,exports){
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

},{"./_baseGetTag":52,"./isLength":142,"./isObjectLike":144}],56:[function(require,module,exports){
var isPrototype = require('./_isPrototype'),
    nativeKeys = require('./_nativeKeys');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;

},{"./_isPrototype":103,"./_nativeKeys":116}],57:[function(require,module,exports){
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

},{"./_isPrototype":103,"./_nativeKeysIn":117,"./isObject":143}],58:[function(require,module,exports){
var Stack = require('./_Stack'),
    assignMergeValue = require('./_assignMergeValue'),
    baseFor = require('./_baseFor'),
    baseMergeDeep = require('./_baseMergeDeep'),
    isObject = require('./isObject'),
    keysIn = require('./keysIn');

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
        ? customizer(object[key], srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

module.exports = baseMerge;

},{"./_Stack":30,"./_assignMergeValue":42,"./_baseFor":50,"./_baseMergeDeep":59,"./isObject":143,"./keysIn":148}],59:[function(require,module,exports){
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
  var objValue = object[key],
      srcValue = source[key],
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
      else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
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

},{"./_assignMergeValue":42,"./_cloneBuffer":65,"./_cloneTypedArray":71,"./_copyArray":72,"./_initCloneObject":98,"./isArguments":136,"./isArray":137,"./isArrayLikeObject":139,"./isBuffer":140,"./isFunction":141,"./isObject":143,"./isPlainObject":145,"./isTypedArray":146,"./toPlainObject":152}],60:[function(require,module,exports){
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

},{"./_overRest":121,"./_setToString":124,"./identity":135}],61:[function(require,module,exports){
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

},{"./_defineProperty":79,"./constant":133,"./identity":135}],62:[function(require,module,exports){
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

},{}],63:[function(require,module,exports){
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

},{}],64:[function(require,module,exports){
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

},{"./_Uint8Array":32}],65:[function(require,module,exports){
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

},{"./_root":122}],66:[function(require,module,exports){
var cloneArrayBuffer = require('./_cloneArrayBuffer');

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

module.exports = cloneDataView;

},{"./_cloneArrayBuffer":64}],67:[function(require,module,exports){
var addMapEntry = require('./_addMapEntry'),
    arrayReduce = require('./_arrayReduce'),
    mapToArray = require('./_mapToArray');

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1;

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), CLONE_DEEP_FLAG) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
}

module.exports = cloneMap;

},{"./_addMapEntry":34,"./_arrayReduce":41,"./_mapToArray":114}],68:[function(require,module,exports){
/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

module.exports = cloneRegExp;

},{}],69:[function(require,module,exports){
var addSetEntry = require('./_addSetEntry'),
    arrayReduce = require('./_arrayReduce'),
    setToArray = require('./_setToArray');

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1;

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), CLONE_DEEP_FLAG) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
}

module.exports = cloneSet;

},{"./_addSetEntry":35,"./_arrayReduce":41,"./_setToArray":123}],70:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

module.exports = cloneSymbol;

},{"./_Symbol":31}],71:[function(require,module,exports){
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

},{"./_cloneArrayBuffer":64}],72:[function(require,module,exports){
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

},{}],73:[function(require,module,exports){
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

},{"./_assignValue":43,"./_baseAssignValue":47}],74:[function(require,module,exports){
var copyObject = require('./_copyObject'),
    getSymbols = require('./_getSymbols');

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

module.exports = copySymbols;

},{"./_copyObject":73,"./_getSymbols":87}],75:[function(require,module,exports){
var copyObject = require('./_copyObject'),
    getSymbolsIn = require('./_getSymbolsIn');

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

module.exports = copySymbolsIn;

},{"./_copyObject":73,"./_getSymbolsIn":88}],76:[function(require,module,exports){
var root = require('./_root');

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;

},{"./_root":122}],77:[function(require,module,exports){
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

},{"./_baseRest":60,"./_isIterateeCall":100}],78:[function(require,module,exports){
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

},{}],79:[function(require,module,exports){
var getNative = require('./_getNative');

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;

},{"./_getNative":84}],80:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],81:[function(require,module,exports){
var baseGetAllKeys = require('./_baseGetAllKeys'),
    getSymbols = require('./_getSymbols'),
    keys = require('./keys');

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;

},{"./_baseGetAllKeys":51,"./_getSymbols":87,"./keys":147}],82:[function(require,module,exports){
var baseGetAllKeys = require('./_baseGetAllKeys'),
    getSymbolsIn = require('./_getSymbolsIn'),
    keysIn = require('./keysIn');

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

module.exports = getAllKeysIn;

},{"./_baseGetAllKeys":51,"./_getSymbolsIn":88,"./keysIn":148}],83:[function(require,module,exports){
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

},{"./_isKeyable":101}],84:[function(require,module,exports){
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

},{"./_baseIsNative":54,"./_getValue":90}],85:[function(require,module,exports){
var overArg = require('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":120}],86:[function(require,module,exports){
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

},{"./_Symbol":31}],87:[function(require,module,exports){
var arrayFilter = require('./_arrayFilter'),
    stubArray = require('./stubArray');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

module.exports = getSymbols;

},{"./_arrayFilter":38,"./stubArray":150}],88:[function(require,module,exports){
var arrayPush = require('./_arrayPush'),
    getPrototype = require('./_getPrototype'),
    getSymbols = require('./_getSymbols'),
    stubArray = require('./stubArray');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

module.exports = getSymbolsIn;

},{"./_arrayPush":40,"./_getPrototype":85,"./_getSymbols":87,"./stubArray":150}],89:[function(require,module,exports){
var DataView = require('./_DataView'),
    Map = require('./_Map'),
    Promise = require('./_Promise'),
    Set = require('./_Set'),
    WeakMap = require('./_WeakMap'),
    baseGetTag = require('./_baseGetTag'),
    toSource = require('./_toSource');

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

module.exports = getTag;

},{"./_DataView":23,"./_Map":26,"./_Promise":28,"./_Set":29,"./_WeakMap":33,"./_baseGetTag":52,"./_toSource":131}],90:[function(require,module,exports){
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

},{}],91:[function(require,module,exports){
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

},{"./_nativeCreate":115}],92:[function(require,module,exports){
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

},{}],93:[function(require,module,exports){
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

},{"./_nativeCreate":115}],94:[function(require,module,exports){
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

},{"./_nativeCreate":115}],95:[function(require,module,exports){
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

},{"./_nativeCreate":115}],96:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

module.exports = initCloneArray;

},{}],97:[function(require,module,exports){
var cloneArrayBuffer = require('./_cloneArrayBuffer'),
    cloneDataView = require('./_cloneDataView'),
    cloneMap = require('./_cloneMap'),
    cloneRegExp = require('./_cloneRegExp'),
    cloneSet = require('./_cloneSet'),
    cloneSymbol = require('./_cloneSymbol'),
    cloneTypedArray = require('./_cloneTypedArray');

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

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

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

module.exports = initCloneByTag;

},{"./_cloneArrayBuffer":64,"./_cloneDataView":66,"./_cloneMap":67,"./_cloneRegExp":68,"./_cloneSet":69,"./_cloneSymbol":70,"./_cloneTypedArray":71}],98:[function(require,module,exports){
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

},{"./_baseCreate":49,"./_getPrototype":85,"./_isPrototype":103}],99:[function(require,module,exports){
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
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;

},{}],100:[function(require,module,exports){
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

},{"./_isIndex":99,"./eq":134,"./isArrayLike":138,"./isObject":143}],101:[function(require,module,exports){
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

},{}],102:[function(require,module,exports){
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

},{"./_coreJsData":76}],103:[function(require,module,exports){
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

},{}],104:[function(require,module,exports){
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

},{}],105:[function(require,module,exports){
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

},{"./_assocIndexOf":44}],106:[function(require,module,exports){
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

},{"./_assocIndexOf":44}],107:[function(require,module,exports){
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

},{"./_assocIndexOf":44}],108:[function(require,module,exports){
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

},{"./_assocIndexOf":44}],109:[function(require,module,exports){
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

},{"./_Hash":24,"./_ListCache":25,"./_Map":26}],110:[function(require,module,exports){
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

},{"./_getMapData":83}],111:[function(require,module,exports){
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

},{"./_getMapData":83}],112:[function(require,module,exports){
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

},{"./_getMapData":83}],113:[function(require,module,exports){
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

},{"./_getMapData":83}],114:[function(require,module,exports){
/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;

},{}],115:[function(require,module,exports){
var getNative = require('./_getNative');

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;

},{"./_getNative":84}],116:[function(require,module,exports){
var overArg = require('./_overArg');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;

},{"./_overArg":120}],117:[function(require,module,exports){
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

},{}],118:[function(require,module,exports){
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
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

},{"./_freeGlobal":80}],119:[function(require,module,exports){
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

},{}],120:[function(require,module,exports){
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

},{}],121:[function(require,module,exports){
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

},{"./_apply":36}],122:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":80}],123:[function(require,module,exports){
/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;

},{}],124:[function(require,module,exports){
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

},{"./_baseSetToString":61,"./_shortOut":125}],125:[function(require,module,exports){
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

},{}],126:[function(require,module,exports){
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

},{"./_ListCache":25}],127:[function(require,module,exports){
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

},{}],128:[function(require,module,exports){
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

},{}],129:[function(require,module,exports){
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

},{}],130:[function(require,module,exports){
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

},{"./_ListCache":25,"./_Map":26,"./_MapCache":27}],131:[function(require,module,exports){
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

},{}],132:[function(require,module,exports){
var baseClone = require('./_baseClone');

/** Used to compose bitmasks for cloning. */
var CLONE_SYMBOLS_FLAG = 4;

/**
 * Creates a shallow clone of `value`.
 *
 * **Note:** This method is loosely based on the
 * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
 * and supports cloning arrays, array buffers, booleans, date objects, maps,
 * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
 * arrays. The own enumerable properties of `arguments` objects are cloned
 * as plain objects. An empty object is returned for uncloneable values such
 * as error objects, functions, DOM nodes, and WeakMaps.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to clone.
 * @returns {*} Returns the cloned value.
 * @see _.cloneDeep
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var shallow = _.clone(objects);
 * console.log(shallow[0] === objects[0]);
 * // => true
 */
function clone(value) {
  return baseClone(value, CLONE_SYMBOLS_FLAG);
}

module.exports = clone;

},{"./_baseClone":48}],133:[function(require,module,exports){
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

},{}],134:[function(require,module,exports){
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

},{}],135:[function(require,module,exports){
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

},{}],136:[function(require,module,exports){
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

},{"./_baseIsArguments":53,"./isObjectLike":144}],137:[function(require,module,exports){
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

},{}],138:[function(require,module,exports){
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

},{"./isFunction":141,"./isLength":142}],139:[function(require,module,exports){
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

},{"./isArrayLike":138,"./isObjectLike":144}],140:[function(require,module,exports){
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

},{"./_root":122,"./stubFalse":151}],141:[function(require,module,exports){
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

},{"./_baseGetTag":52,"./isObject":143}],142:[function(require,module,exports){
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

},{}],143:[function(require,module,exports){
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

},{}],144:[function(require,module,exports){
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

},{}],145:[function(require,module,exports){
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

},{"./_baseGetTag":52,"./_getPrototype":85,"./isObjectLike":144}],146:[function(require,module,exports){
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

},{"./_baseIsTypedArray":55,"./_baseUnary":63,"./_nodeUtil":118}],147:[function(require,module,exports){
var arrayLikeKeys = require('./_arrayLikeKeys'),
    baseKeys = require('./_baseKeys'),
    isArrayLike = require('./isArrayLike');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
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
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;

},{"./_arrayLikeKeys":39,"./_baseKeys":56,"./isArrayLike":138}],148:[function(require,module,exports){
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

},{"./_arrayLikeKeys":39,"./_baseKeysIn":57,"./isArrayLike":138}],149:[function(require,module,exports){
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

},{"./_baseMerge":58,"./_createAssigner":77}],150:[function(require,module,exports){
/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;

},{}],151:[function(require,module,exports){
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

},{}],152:[function(require,module,exports){
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

},{"./_copyObject":73,"./keysIn":148}],153:[function(require,module,exports){
"use strict";

var RENDERERS = require("insight.renderers.default/lib/insight/pack");
var ENCODER = require("insight-for-js/lib/encoder/default");
var DECODER = require("insight-for-js/lib/decoder/default");
var DOMPLATE_UTIL = require("domplate/lib/util");
var UTIL = {
    copy: require("lodash/clone"),
    merge: require("lodash/merge"),
    importCssString: function importCssString(cssText, doc, id) {
        doc = doc || document;

        if (typeof id !== "undefined") {
            if (doc.getElementById(id)) {
                return;
            }
        }

        if (doc.createStyleSheet) {
            var sheet = doc.createStyleSheet();
            sheet.cssText = cssText;
        } else {
            var style = doc.createElementNS ? doc.createElementNS("http://www.w3.org/1999/xhtml", "style") : doc.createElement("style");
            if (typeof id !== "undefined") {
                style.setAttribute("id", id);
            }
            style.appendChild(doc.createTextNode(cssText));

            var head = doc.getElementsByTagName("head")[0] || doc.documentElement;
            head.appendChild(style);
        }
    }
};

var commonHelpers = {
    helpers: null,
    // NOTE: This should only be called once or with an ID to replace existing
    importCssString: function importCssString(id, css, document) {
        UTIL.importCssString(['[renderer="jsonrep"] {', '   font-family: Lucida Grande, Tahoma, sans-serif;', '   font-size: 11px;', '}', css].join("\n"), document, "devcomp-insight-css-" + id);
    },
    util: UTIL.copy(DOMPLATE_UTIL),
    getTemplateForId: function getTemplateForId(id) {
        throw new Error("NYI - commonHelpers.getTemplateForid (in " + module.id + ")");
    },
    getTemplateForNode: function getTemplateForNode(node) {
        if (!node) {
            throw new Error("No node specified!");
        }
        var template = RENDERERS.getTemplateForNode(node).getTemplate(this.helpers);
        return template;
    },
    getResourceBaseUrl: function getResourceBaseUrl(module) {

        // TODO: Optionally specify different URL
        return "dist/resources/insight.renderers.default/";
    },
    document: window.document,
    logger: window.console
};
commonHelpers.util.merge = UTIL.merge;

var encoder = ENCODER.Encoder();

exports.main = function (JSONREP, node) {

    var og = DECODER.generateFromMessage({
        meta: {},
        data: encoder.encode(node, {}, {})
    }, DECODER.EXTENDED);

    var helpers = Object.create(commonHelpers);
    helpers.helpers = helpers;
    helpers.debug = JSONREP.debug || false;
    helpers.dispatchEvent = function (name, args) {
        throw new Error("STOP");
        if (typeof options.on[name] != "undefined") options.on[name](args[1].message, args[1].args);
    };

    var node = og.getOrigin();

    var template = RENDERERS.getTemplateForNode(node);

    return JSONREP.makeRep('<div></div>', {
        on: {
            mount: function mount(el) {

                template.renderObjectGraphToNode(node, el, {
                    view: ["detail"]
                }, helpers);
            }
        }
    });
};
},{"domplate/lib/util":3,"insight-for-js/lib/decoder/default":6,"insight-for-js/lib/encoder/default":7,"insight.renderers.default/lib/insight/pack":9,"lodash/clone":132,"lodash/merge":149}]},{},[153])(153)
});
	});
});