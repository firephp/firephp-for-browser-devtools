(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

},{}],2:[function(require,module,exports){
/**
 * Author: Christoph Dorn <christoph@christophdorn.com>
 * [Free Public License 1.0.0](https://opensource.org/licenses/FPL-1.0.0)
 */

// NOTE: Remove lines marked /*DEBUG*/ when compiling loader for 'min' release!

// Combat pollution when used via <script> tag.
// Don't touch any globals except for `exports` and `PINF`.
(function (global) {

	if (!global || typeof global !== "object") {
		throw new Error("No root object scope provided!");
	}

	// If `PINF` gloabl already exists, don't do anything to change it.
	if (typeof global.PINF !== "undefined") {
		return;
	}

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

	function normalizeSandboxArguments(implementation) {
		return function(programIdentifier, options, loadedCallback, errorCallback) {
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
			var document = global.document || PINF.document;
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
			element.onload = element.onreadystatechange = function(ev) {
				ev = ev || global.event;
				if (ev.type === "load" || readyStates[this.readyState]) {
					this.onload = this.onreadystatechange = this.onerror = null;
					loadedCallback(null, function() {
						element.parentNode.removeChild(element);
					});
				}
			}
			element.onerror = function(err) {
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

		function load(bundleIdentifier, packageIdentifier, bundleSubPath, loadedCallback) {
			try {
	            if (packageIdentifier !== "") {
	                bundleIdentifier = ("/" + packageIdentifier + "/" + bundleIdentifier).replace(/\/+/g, "/");
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
						bundleIdentifier = sandboxIdentifier + bundleSubPath + bundleIdentifier;
						// Default to our script-injection browser loader.
						(sandboxOptions.rootBundleLoader || sandboxOptions.load || loadInBrowser)(
							rebaseUri(bundleIdentifier),
							function(err, cleanupCallback) {
								if (err) return loadedCallback(err);
								// The rootBundleLoader is only applicable for the first load.
								delete sandboxOptions.rootBundleLoader;
								finalizeLoad(bundleIdentifier, function () {
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
		function finalizeLoad(bundleIdentifier, loadFinalized)
		{

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
			var key;
			for (key in loadedBundles[0][1]) {
				// If we have a package descriptor add it or merge it on top.
				if (/^[^\/]*\/package.json$/.test(key)) {

					// Load all dependent resources
					if (loadedBundles[0][1][key][0].mappings) {
						for (var alias in loadedBundles[0][1][key][0].mappings) {
							if (!/^\/\//.test(loadedBundles[0][1][key][0].mappings[alias])) {
								continue;
							}
							pending += 1;
							loadInBrowser(
								rebaseUri(loadedBundles[0][1][key][0].mappings[alias]),
								function () {
									pending -= 1;
									finalize();
								}
							);
						}
					}

					// NOTE: Not quite sure if we should allow agumenting package descriptors.
					//       When doing nested requires using same package we can either add all
					//		 mappings (included mappings not needed until further down the tree) to
					//       the first encounter of the package descriptor or add more mappings as
					//       needed down the road. We currently support both.

					if (moduleInitializers[key]) {
						// TODO: Keep array of bundle identifiers instead of overwriting existing one?
						//		 Overwriting may change subsequent bundeling behaviour?
						moduleInitializers[key][0] = bundleIdentifier;
						// Only augment (instead of replace existing values).
						if (typeof moduleInitializers[key][1].main === "undefined") {
							moduleInitializers[key][1].main = loadedBundles[0][1][key][0].main;
						}
						if (loadedBundles[0][1][key][0].mappings) {
							if (!moduleInitializers[key][1].mappings) {
								moduleInitializers[key][1].mappings = {};
							}
							for (var alias in loadedBundles[0][1][key][0].mappings) {
								if (typeof moduleInitializers[key][1].mappings[alias] === "undefined") {
									moduleInitializers[key][1].mappings[alias] = loadedBundles[0][1][key][0].mappings[alias];
								}
							}
						}
					} else {
						moduleInitializers[key] = [bundleIdentifier, loadedBundles[0][1][key][0], loadedBundles[0][1][key][1]];
					}
					// Now that we have a [updated] package descriptor, re-initialize it if we have it already in cache.
					var packageIdentifier = key.split("/").shift();
					if (packages[packageIdentifier]) {
						packages[packageIdentifier].init();
					}
				}
				// Only add modules that don't already exist!
				// TODO: Log warning in debug mode if module already exists.
				if (typeof moduleInitializers[key] === "undefined") {
					moduleInitializers[key] = [bundleIdentifier, loadedBundles[0][1][key][0], loadedBundles[0][1][key][1]];
				}
			}
			loadedBundles.shift();

			pending -= 1;
			finalize();

			return;
		}

		var Package = function(packageIdentifier) {
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

			pkg.init = function() {
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

			function normalizeIdentifier(identifier) {
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

			var Module = function(moduleIdentifier, parentModule) {

				var moduleIdentifierSegment = moduleIdentifier.replace(/\/[^\/]*$/, "").split("/"),
					module = {
						id: moduleIdentifier,
						exports: {},
						parentModule: parentModule,
						bundle: null,
						pkg: packageIdentifier
					};

				function resolveIdentifier(identifier) {
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
				module.require = function(identifier) {
					identifier = resolveIdentifier(identifier);
					return identifier[0].require(identifier[1]).exports;
				};

				module.require.supports = [
		            "ucjs-pinf-0"
		        ];

				module.require.id = function(identifier) {
					identifier = resolveIdentifier(identifier);
					return identifier[0].require.id(identifier[1]);
				};

				module.require.async = function(identifier, loadedCallback, errorCallback) {
					identifier = resolveIdentifier(identifier);
					identifier[0].load(identifier[1], moduleInitializers[moduleIdentifier][0], function(err, moduleAPI) {
						if (err) {
							if (errorCallback) return errorCallback(err);
							throw err;
						}
						loadedCallback(moduleAPI);
					});
				};

				module.require.sandbox = normalizeSandboxArguments(function(programIdentifier, options, loadedCallback, errorCallback) {
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

				module.load = function() {
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

						var exports = moduleInitializers[moduleIdentifier][1].call(global, module.require, module.exports, moduleInterface);
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

				/*DEBUG*/ module.getReport = function() {
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

			pkg.load = function(moduleIdentifier, bundleIdentifier, loadedCallback) {
				// If module/bundle to be loaded asynchronously is already memoized we skip the load.
				if (moduleInitializers[packageIdentifier + moduleIdentifier]) {
					return loadedCallback(null, pkg.require(moduleIdentifier).exports);
				}
				var bundleSubPath = bundleIdentifier.substring(sandboxIdentifier.length);
                load(
                	((!/^\//.test(moduleIdentifier))?"/"+pkg.libPath:"") + moduleIdentifier,
                	packageIdentifier,
                	bundleSubPath.replace(/\.js$/g, ""),
                	function(err) {
	                	if (err) return loadedCallback(err);
	                    loadedCallback(null, pkg.require(moduleIdentifier).exports);
	                }
	            );
			}

			pkg.require = function(moduleIdentifier) {

				var plugin = moduleIdentifier.plugin;

				if (moduleIdentifier) {
	                if (!/^\//.test(moduleIdentifier)) {
	                    moduleIdentifier = ("/" + ((moduleIdentifier.substring(0, pkg.libPath.length)===pkg.libPath)?"":pkg.libPath)).replace(/\/\.\//, "/") + moduleIdentifier;
	                }
					moduleIdentifier = packageIdentifier + moduleIdentifier;
				} else {
					moduleIdentifier = pkg.main;
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
				var moduleInfo = Object.create(initializedModules[moduleIdentifier]);
				// RequireJS/AMD international strings plugin using root by default.
				if (plugin === "i18n") {
					moduleInfo.exports = moduleInfo.exports.root;
				}

				return moduleInfo;
			}

            pkg.require.id = function(moduleIdentifier) {
                if (!/^\//.test(moduleIdentifier)) {
                    moduleIdentifier = "/" + pkg.libPath + moduleIdentifier;
                }
                return (((packageIdentifier !== "")?"/"+packageIdentifier+"/":"") + moduleIdentifier).replace(/\/+/g, "/");
            }

			/*DEBUG*/ pkg.getReport = function() {
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
		sandbox.require = function(moduleIdentifier) {
			return Package("").require(moduleIdentifier).exports;
		}

		// Call the 'main' module of the program
		sandbox.boot = function() {
			/*DEBUG*/ if (typeof Package("").main !== "string") {
			/*DEBUG*/ 	throw new Error("No 'main' property declared in '/package.json' in sandbox '" + sandbox.id + "'!");
			/*DEBUG*/ }
			return sandbox.require(Package("").main);
		};

		// Call the 'main' exported function of the main' module of the program
		sandbox.main = function() {
			var exports = sandbox.boot();
			return ((exports.main)?exports.main.apply(null, arguments):exports);
		};

		/*DEBUG*/ sandbox.getReport = function() {
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
		/*DEBUG*/ sandbox.reset = function() {
		/*DEBUG*/   moduleInitializers = {};
		/*DEBUG*/   initializedModules = {};
		/*DEBUG*/   bundleIdentifiers = {};
		/*DEBUG*/   packages = {};
		/*DEBUG*/   loadingBundles = {};
		/*DEBUG*/ }

		load((sandboxIdentifier.indexOf("?") === -1) ? ".js" : "", "", "", loadedCallback);

		return sandbox;
	};


	// The global `require` for the 'external' (to the loader) environment.
	var Loader = function (bundleGlobal) {

		var
			/*DEBUG*/ bundleIdentifiers = {},
			sandboxes = {};

		var Require = function(bundle) {

			// Address a specific sandbox or currently loading sandbox if initial load.
			var bundleHandler = function(uid, callback) {
				/*DEBUG*/ if (uid && bundleIdentifiers[uid]) {
				/*DEBUG*/ 	throw new Error("You cannot split require.bundle(UID) calls where UID is constant!");
				/*DEBUG*/ }
				/*DEBUG*/ bundleIdentifiers[uid] = true;
				var moduleInitializers = {},
					req = new Require(uid);
				delete req.bundle;
				// Store raw module in loading bundle
				req.memoize = function(moduleIdentifier, moduleInitializer, moduleMeta) {
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
				callback(req, bundleGlobal || null);
				loadedBundles.push([uid, moduleInitializers]);
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

		var require = new Require();

		// TODO: @see URL_TO_SPEC
		require.supports = [
			"ucjs-pinf-0"
		];

		// Create a new environment to memoize modules to.
		// If relative, the `programIdentifier` is resolved against the URI of the owning page (this is only for the global require).
		require.sandbox = normalizeSandboxArguments(function(programIdentifier, options, loadedCallback, errorCallback) {
			if (typeof programIdentifier === "function") {
				options = options || {};
				var bundle = programIdentifier;
				var fallbackLoad = options.load || loadInBrowser;
				options.load = function (uri, loadedCallback) {
					if (uri === (programIdentifier + ".js")) {
						require.bundle("", bundle);
						loadedCallback(null);
						return;
					}
					return fallbackLoad(uri, loadedCallback);
				}
				programIdentifier = "#pinf:" + Math.random().toString(36).substr(2, 9);
			}
			var sandboxIdentifier = programIdentifier.replace(/\.js$/, "");
			return sandboxes[sandboxIdentifier] = Sandbox(sandboxIdentifier, options, function(err, sandbox) {
				if (err) {
					if (errorCallback) return errorCallback(err);
					throw err;
				}
				loadedCallback(sandbox);
			});
		});

		require.Loader = Loader;

		/*DEBUG*/ require.getReport = function() {
		/*DEBUG*/ 	var report = {
		/*DEBUG*/ 			sandboxes: {}
		/*DEBUG*/ 		};
		/*DEBUG*/ 	for (var key in sandboxes) {
		/*DEBUG*/ 		report.sandboxes[key] = sandboxes[key].getReport();
		/*DEBUG*/ 	}
		/*DEBUG*/ 	return report;
		/*DEBUG*/ }
		/*DEBUG*/ require.reset = function() {
		/*DEBUG*/ 	for (var key in sandboxes) {
		/*DEBUG*/ 		sandboxes[key].reset();
		/*DEBUG*/ 	}
		/*DEBUG*/ 	sandboxes = {};
		/*DEBUG*/ 	bundleIdentifiers = {};
		/*DEBUG*/ 	loadedBundles = [];
		/*DEBUG*/ }

		return require;
	}

	// Set `PINF` gloabl.
	var PINF = global.PINF = Loader(global);

	// Export `require` for CommonJS if `module` and `exports` globals exists.
	if (typeof module === "object" && typeof exports === "object") {
		PINF.document = global.document;
		module.exports = global = PINF;
	}

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
				/^\//.test(m)
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

}(
	typeof exports !== "undefined" ?
		// Used on the server
		exports :
		typeof window !== "undefined" ?
			// Used in the browser
			window :
			// No root scope variable found
			undefined
));

},{}],3:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function makeExports(exports) {

    var reps = {};
    var repIndex = 0;

    exports.getRepForId = function (id) {
        return reps[id] || null;
    };

    exports.makeRep = function (html, rep) {
        // TODO: Speed this up.
        if ((typeof html === "undefined" ? "undefined" : _typeof(html)) === "object" && typeof html.html !== "undefined" && typeof rep === "undefined") {
            rep = html;
            html = rep.html;
            delete rep.html;
        } else if ((typeof html === "undefined" ? "undefined" : _typeof(html)) === "object" && typeof html.code !== "undefined" &&
        //typeof html.code.html !== "undefined" &&
        typeof rep === "undefined") {
            // TODO: Replace variables
            rep = html.code;
            if (typeof rep === "function") {
                rep = rep(html);
            }
            html = rep.html;
            delete rep.html;
        }

        if ((typeof html === "undefined" ? "undefined" : _typeof(html)) === "object" && html[".@"] === "github.com~0ink~codeblock/codeblock:Codeblock") {
            html = exports.Codeblock.FromJSON(html).compile(rep).getCode().replace(/^\n|\n$/g, "");
        }

        html = html.split("\n");
        // Inject a reference attribute into the HTML so we can attach the event listeners after injection.
        var match = html[0].match(/^(<\w+)(.+)$/);
        if (!match) {
            throw new Error("The 'html' for a rep must begin with a HTML tag!");
        }
        html[0] = match[1] + ' _repid="' + ++repIndex + '" ' + match[2];
        // TODO: Garbage collect old reps when they are re-rendered.
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

            return renderer.main(exports, node);
        });
    };
}

(function (WINDOW) {

    function init(exports) {

        exports.options = exports.options || {};

        // TODO: Only re-inject loader if not already present (build two versions of JS file).
        exports.PINF = require("pinf-loader-js");
        exports.Codeblock = require("codeblock/codeblock.rt0").Codeblock;

        if (WINDOW) {

            if (typeof WINDOW.PINF === "undefined") {
                WINDOW.PINF = exports.PINF;
            } else {
                // TODO: Instead of re-using loader here allow attachment
                //       if a sub loader to the parent loader?
                exports.PINF = WINDOW.PINF;
            }

            if (!exports.PINF.document) {
                exports.PINF.document = WINDOW.document;
            }

            if (!exports.options.ourBaseUri) {
                var ourBaseUri = Array.from(WINDOW.document.querySelectorAll('SCRIPT[src]')).filter(function (tag) {
                    return (/\/jsonrep(\.min)?\.js$/.test(tag.getAttribute("src"))
                    );
                });
                if (!ourBaseUri.length) {
                    exports.options.ourBaseUri = "";
                } else {
                    exports.options.ourBaseUri = ourBaseUri[0].getAttribute("src").split("/").slice(0, -2).join("/");
                }
            }
        }

        exports.loadRenderer = function (uri) {

            // Adjust base path depending on the environment.
            if (WINDOW && typeof WINDOW.pmodule !== "undefined" && !/^\//.test(uri)) {
                uri = [WINDOW.pmodule.filename.replace(/\/([^\/]*)$/, ""), uri].join("/").replace(/\/\.?\//g, "/");
            }

            return new Promise(function (resolve, reject) {
                exports.PINF.sandbox(uri, resolve, reject);
            });
        };

        makeExports(exports);

        if (!WINDOW) {
            return null;
        }

        // ############################################################
        // # Browser/DOM Environment
        // ############################################################

        exports.mountElement = function (el) {

            var allCss = [];
            Array.from(el.querySelectorAll('[_repid]')).forEach(function (el) {

                var rep = exports.getRepForId(el.getAttribute("_repid"));

                if (rep.css) {

                    var css = exports.Codeblock.FromJSON(rep.css).getCode();

                    // TODO: Optionally warn if no ':scope' keywords are found to remind user to scope css.
                    css = css.replace(/:scope/g, '[_repid="' + el.getAttribute("_repid") + '"]');

                    allCss.push(css);
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
            // TODO: Optionally direct to custom error handler.
            exports.markupDocument().catch(console.error);
        }

        if (WINDOW.document.readyState === "loading") {
            if (typeof WINDOW.addEventListener !== "undefined") {
                WINDOW.addEventListener("DOMContentLoaded", markupDocument, false);
            } else {
                WINDOW.attachEvent("onload", markupDocument);
            }
        } else {
            setTimeout(markupDocument, 0);
        }

        return exports;
    }

    // Detect environemnt
    var isCommonJS = typeof exports !== "undefined";
    if (isCommonJS) {
        init(exports);
    } else {
        WINDOW.jsonrep = init({});
    }
})(typeof window !== "undefined" ? window : null);
},{"codeblock/codeblock.rt0":1,"pinf-loader-js":2}]},{},[3]);
