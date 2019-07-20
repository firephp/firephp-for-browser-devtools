((function (require, exports, module) {
var bundle = { require: require, exports: exports, module: module };

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function makeExports(exports) {
  var reps = {};
  var repIndex = 0;

  exports.getRepForId = function (id) {
    return reps[id] || null;
  };

  exports.makeRep = function (html, rep, options) {
    if (_typeof(html) === "object" && typeof html.html !== "undefined" && typeof rep === "undefined") {
      rep = html;
      html = rep.html;
      delete rep.html;
    } else if (_typeof(html) === "object" && typeof html.code !== "undefined" && typeof rep === "undefined") {
      rep = html.code;

      if (typeof rep === "function") {
        rep = rep.call(exports, html, options);
      }

      html = rep.html;
      delete rep.html;
    }

    return exports._makeRep(html, rep);
  };

  exports.makeRep2 = function (html, options) {
    var rep = undefined;

    if (_typeof(html) === "object" && typeof html.html !== "undefined") {
      rep = html;
      html = rep.html;
      delete rep.html;
    } else if (_typeof(html) === "object" && typeof html.code !== "undefined") {
        rep = html.code;

        if (typeof rep === "function") {
          rep = rep.call(exports, html, options);
        }

        html = rep.html;
        delete rep.html;
      }

    return exports._makeRep(html, rep);
  };

  exports._makeRep = function (html, rep) {
    if (_typeof(html) === "object" && html[".@"] === "github.com~0ink~codeblock/codeblock:Codeblock") {
      html = exports.Codeblock.FromJSON(html).compile(rep).getCode().replace(/^\n|\n$/g, "");
    }

    html = html.split("\n");
    var match = html[0].match(/^(<\w+)(.+)$/);

    if (!match) {
      throw new Error("The 'html' for a rep must begin with a HTML tag!");
    }

    html[0] = match[1] + ' _repid="' + ++repIndex + '" ' + match[2];
    reps["" + repIndex] = rep;
    return html.join("\n");
  };

  exports.markupNode = function (node) {
    if (typeof node === "string" && /^\{/.test(node)) {
      try {
        node = JSON.parse(node);
      } catch (err) {
        console.error("This should be JSON:", node);
        return Promise.reject(new Error("Error parsing node from string! (" + err.message + ")"));
      }
    }

    var uri = null;
    var keys = Object.keys(node);

    if (keys.length === 1 && /^@/.test(keys[0])) {
      uri = keys[0].replace(/^@/, "") + ".rep";
      node = node[keys[0]];
    } else {
      if (exports.options.defaultRenderer) {
        return new Promise(function (resolve, reject) {
          try {
            var ret = exports.options.defaultRenderer(exports, node);

            if (typeof ret.then === "function") {
              ret.then(resolve, reject);
            } else {
              resolve(ret);
            }
          } catch (err) {
            reject(err);
          }
        });
      } else {
        uri = "dist/insight.rep.js";
      }
    }

    if (/^dist\//.test(uri) && exports.options.ourBaseUri) {
      uri = exports.options.ourBaseUri + "/" + uri;
    }

    return exports.loadRenderer(uri).then(function (renderer) {
      return renderer.main(exports, node, {
        renderer: {
          uri: uri
        }
      });
    });
  };
}

(function (WINDOW) {
  function init(exports) {
    exports.options = exports.options || {};
    exports.Codeblock = require("codeblock/codeblock.rt0").Codeblock;

    if (WINDOW) {
      if (typeof WINDOW.PINF === "undefined") {
        WINDOW.PINF = exports.PINF = require("pinf-loader-js").Loader(WINDOW);
      } else {
        exports.PINF = WINDOW.PINF;
      }

      if (WINDOW.document) {
        if (!exports.options.ourBaseUri) {
          var ourBaseUri = Array.from(WINDOW.document.querySelectorAll('SCRIPT[src]')).filter(function (tag) {
            return /\/jsonrep(\.min)?\.js$/.test(tag.getAttribute("src"));
          });

          if (!ourBaseUri.length) {
            exports.options.ourBaseUri = "";
          } else {
            exports.options.ourBaseUri = ourBaseUri[0].getAttribute("src").split("/").slice(0, -2).join("/");
          }
        }
      }
    }

    exports.loadStyle = function (uri) {
      if (WINDOW && typeof WINDOW.pmodule !== "undefined" && !/^\//.test(uri)) {
        uri = [WINDOW.pmodule.filename.replace(/\/([^\/]*)\/([^\/]*)$/, ""), uri].join("/").replace(/\/\.?\//g, "/");
      }

      return new Promise(function (resolve, reject) {
        console.log("[jsonrep] Load style:", uri);
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

    exports.loadRenderer = function (uri) {
      if (WINDOW && typeof WINDOW.pmodule !== "undefined" && !/^\//.test(uri)) {
        uri = [WINDOW.pmodule.filename.replace(/\/([^\/]*)\/([^\/]*)$/, ""), uri].join("/").replace(/\/\.?\//g, "/");
      }

      return new Promise(function (resolve, reject) {
        exports.PINF.sandbox(uri, resolve, reject);
      });
    };

    makeExports(exports);

    if (!WINDOW || !WINDOW.document) {
      return exports;
    }

    exports.mountElement = function (el) {
      var allCss = [];
      Array.from(el.querySelectorAll('[_repid]')).forEach(function (el) {
        var rep = exports.getRepForId(el.getAttribute("_repid"));

        if (rep.css) {
          var css = null;

          if (typeof rep.css === 'string') {
            css = rep.css;
          } else {
            var block = exports.Codeblock.FromJSON(rep.css);

            if (block._format === 'json') {
              var cssConfig = JSON.parse(block.getCode());
              el.setAttribute("_cssid", cssConfig._cssid);
              exports.loadStyle(cssConfig.repUri + '.rep.css');
            } else if (block._format === 'css') {
              css = block.getCode();
            }
          }

          if (css && css.length) {
            css = css.replace(/:scope/g, '[_repid="' + el.getAttribute("_repid") + '"]');
            allCss.push(css);
          }
        }

        if (rep && rep.on && rep.on.mount) {
          rep.on.mount(el);
        }
      });

      if (allCss.length > 0) {
        var style = WINDOW.document.createElement('style');
        style.innerHTML = allCss.join("\n");
        WINDOW.document.body.appendChild(style);
      }

      el.style.visibility = "unset";
    };

    exports.markupElement = function (el) {
      return exports.markupNode(el.innerHTML).then(function (htmlCode) {
        el.innerHTML = htmlCode;
        exports.mountElement(el);
        return null;
      });
    };

    exports.markupDocument = function () {
      return Promise.all(Array.from(WINDOW.document.querySelectorAll('[renderer="jsonrep"]')).map(exports.markupElement));
    };

    function markupDocument() {
      exports.markupDocument().catch(console.error);
    }

    if (!WINDOW.jsonrep_options || WINDOW.jsonrep_options.markupDocument !== false) {
      if (WINDOW.document.readyState === "loading") {
        if (typeof WINDOW.addEventListener !== "undefined") {
          WINDOW.addEventListener("DOMContentLoaded", markupDocument, false);
        } else {
          WINDOW.attachEvent("onload", markupDocument);
        }
      } else {
        setTimeout(markupDocument, 0);
      }
    }

    return exports;
  }

  if (typeof sandbox !== "undefined") {
    init(sandbox);
  } else if (WINDOW) {
    WINDOW.jsonrep = init({});
  } else if (typeof exports !== "undefined") {
    init(exports);
  } else {
    throw new Error("Cannot detect environment!");
  }
})(typeof window !== "undefined" ? window : null);
},{"codeblock/codeblock.rt0":2,"pinf-loader-js":3}],2:[function(require,module,exports){

const REGEXP_ESCAPE = function (str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
};

function linesForEscapedNewline (rawCode) {
    var lines = [];
    var segments = rawCode.split(/([\\]*\\n)/);
    for (var i=0; i<segments.length ; i++) {
        if (i % 2 === 0) {
            lines.push(segments[i]);
        } else
        if (segments[i] !== "\\n") {
            lines[lines.length - 1] += segments[i].replace(/\\\\/g, "\\") + segments[i + 1];
            i++;
        }
    }
    lines = lines.map(function (line) {
        return line.replace(/\\\n/g, "\\n");        
    });
    return lines;
}

const Codeblock = exports.Codeblock = function (code, format, args) {
    if (
        typeof code === "object" &&
        code.hasOwnProperty("raw") &&
        Object.keys(code).length === 1
    ) {
        this._code = code.raw;
    } else {
        if (code) {
            this.setCode(code);
        } else {
            this._code = "";
        }
    }
    this._format = format;
    this._args = args;
    this._compiled = false;
}
Codeblock.prototype.setCode = function (code) {
    this._code = ("" + code).replace(/\\n/g, "___NeWlInE_KeEp_OrIgInAl___")
        .replace(/\n/g, "\\n")
        .replace(/(___NeWlInE_KeEp_OrIgInAl___)/g, "\\$1");
}
Codeblock.FromJSON = function (doc) {
    if (typeof doc === "string") {
        try {
            doc = JSON.parse(doc);
        } catch (err) {
            console.error("doc", doc);
            throw new Error("Error parsing JSON!");
        }
    }
    if (doc[".@"] !== "github.com~0ink~codeblock/codeblock:Codeblock") {
        throw new Error("JSON is not a frozen codeblock!");
    }
    var codeblock = new Codeblock({
        raw: doc._code
    }, doc._format, doc._args);
    codeblock._compiled = doc._compiled;
    return codeblock;
}
Codeblock.prototype.compile = function (variables) {
    variables = variables || {};
    var code = this.getCode();

    // TODO: Use common helper
    var re = /(?:^|\n)(.*?)(["']?)(%%%([^%]+)%%%)(["']?)/;
    var match = null;
    while ( true ) {
        match = code.match(re);
        if (!match) break;
        var varParts = match[4].split(".");
        var val = variables;
        while (varParts.length > 0) {
            val = val[varParts.shift()];
            if (typeof val === "undefined") {
                console.error("variables", variables);
                throw new Error("Variable '" + match[4] + "' not found while processing code section!");
            }
        }
        val = val.toString().split("\n").map(function (line, i) {
            if (i > 0) {
                line = match[1] + line;
            }
            return line;
        }).join("\n");

        var searchString = match[3];
        if (match[2] === "'" && match[5] === "'") {
            val = "'" + val.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
            searchString = "'" + searchString + "'";
        } else
        if (match[2] === '"' && match[5] === '"') {
            val = '"' + val.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + '"';
            searchString = '"' + searchString + '"';
        }
        code = code.replace(new RegExp(REGEXP_ESCAPE(searchString), "g"), val);
    }

    var codeblock = new Codeblock(code, this._format, this._args);
    codeblock._compiled = true;
    return codeblock;
}
Codeblock.prototype.getCode = function () {
    return linesForEscapedNewline(this._code).join("\n");
}

},{}],3:[function(require,module,exports){
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
					//       into the bundle structure without modification. If this is not done, a module doing a relative require
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
	// If relative, the `programIdentifier` is resolved against the URI of the owning page (this is only for the global require).
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

},{}]},{},[1]);

})((typeof require !== "undefined" && require) || undefined, (typeof exports !== "undefined" && exports) || undefined, (typeof module !== "undefined" && module) || undefined))