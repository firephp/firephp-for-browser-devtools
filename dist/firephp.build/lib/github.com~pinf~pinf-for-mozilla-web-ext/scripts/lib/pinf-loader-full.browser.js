((function (_require, _exports, _module) {
var bundle = { require: _require, exports: _exports, module: _module };
var exports = undefined;
var module = undefined;
var define = function (deps, init) {
var exports = init();
[["PINF","PINF"]].forEach(function (expose) {
if (typeof window !== "undefined") {
window[expose[0]] = exports[expose[1]];
} else if (typeof self !== "undefined") {
self[expose[0]] = exports[expose[1]];
}
});
}; define.amd = true;

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

exports.PINF = function (global) {
  if (!global || _typeof(global) !== "object") {
    throw new Error("No root object scope provided!");
  }

  if (typeof global.PINF !== "undefined") {
    return global.PINF;
  }

  var LOADER = require('./loader');

  var PINF = LOADER.Loader({
    document: global.document
  });
  global.PINF = PINF;

  if (typeof global.addEventListener === "function") {
    global.addEventListener("message", function (event) {
      var m = null;

      if (typeof event.data === "string" && (m = event.data.match(/^notify:\/\/pinf-loader-js\/sandbox\/load\?uri=(.+)$/)) && (m = decodeURIComponent(m[1])) && /^\/[^\/]/.test(m)) {
        return PINF.sandbox(m, function (sandbox) {
          sandbox.main();

          if (typeof global.postMessage === "function") {
            global.postMessage(event.data.replace("/load?", "/loaded?"));
          }
        }, function (err) {
          throw err;
        });
      }
    }, false);
  }

  return global.PINF;
}(typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : null);
},{"./loader":2}],2:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (exports) {
  var Loader = function Loader(global) {
    var loadedBundles = [],
        readyStates = {
      'loaded': 1,
      'interactive': 1,
      'complete': 1
    },
        lastModule = null,
        headTag = null;

    function keys(obj) {
      var keys = [];

      for (var key in obj) {
        keys.push(key);
      }

      return keys;
    }

    function create(proto) {
      function F() {}

      F.prototype = proto;
      return new F();
    }

    ;

    function normalizeSandboxArguments(implementation) {
      return function (programIdentifier, options, loadedCallback, errorCallback) {
        if (typeof options === "function" && _typeof(loadedCallback) === "object") {
          throw new Error("Callback before options for `require.sandbox(programIdentifier, options, loadedCallback)`");
        }

        if (typeof options === "function" && !loadedCallback && !errorCallback) {
          loadedCallback = options;
          options = {};
        } else if (typeof options === "function" && typeof loadedCallback === "function" && !errorCallback) {
          errorCallback = loadedCallback;
          loadedCallback = options;
          options = {};
        } else {
          options = options || {};
        }

        implementation(programIdentifier, options, loadedCallback, errorCallback);
      };
    }

    function loadInBrowser(uri, loadedCallback) {
      try {
        if (typeof importScripts !== "undefined") {
          importScripts(uri.replace(/^\/?\{host\}/, ""));
          return loadedCallback(null);
        }

        var document = global.document;

        if (!document) {
          throw new Error("Unable to get reference to 'document'!");
        }

        var location = document.location;

        if (/^\/?\{host\}\//.test(uri)) {
          uri = location.protocol + "//" + location.host + uri.replace(/^\/?\{host\}/, "");
        } else if (/^\/\//.test(uri)) {
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
        };

        element.onerror = function (err) {
          console.error(err);
          return loadedCallback(new Error("Error loading '" + uri + "'"));
        };

        element.charset = "utf-8";
        element.async = true;
        element.src = uri;
        element = headTag.insertBefore(element, headTag.firstChild);
      } catch (err) {
        loadedCallback(err);
      }
    }

    var Sandbox = function Sandbox(sandboxIdentifier, sandboxOptions, loadedCallback) {
      var moduleInitializers = {},
          initializedModules = {},
          bundleIdentifiers = {},
          packages = {},
          loadingBundles = {};
      var sandbox = {
        id: sandboxIdentifier
      };

      function logDebug() {
        if (sandboxOptions.debug !== true) return;

        if (arguments.length === 1) {
          console.log(arguments[0]);
        } else if (arguments.length === 2) {
            console.log(arguments[0], arguments[1]);
          } else if (arguments.length === 3) {
              console.log(arguments[0], arguments[1], arguments[2]);
            } else if (arguments.length === 4) {
                console.log(arguments[0], arguments[1], arguments[2], arguments[3]);
              }
      }

      function rebaseUri(uri) {
        if (!sandboxOptions.baseUrl) {
          return uri;
        }

        return sandboxOptions.baseUrl + "/" + uri;
      }

      function load(bundleIdentifier, packageIdentifier, bundleSubPath, loadedCallback) {
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
            loadedCallback(null, sandbox);
          } else {
            if (loadingBundles[bundleIdentifier]) {
              loadingBundles[bundleIdentifier].push(loadedCallback);
            } else {
              loadingBundles[bundleIdentifier] = [];
              bundleIdentifier = (loadSandboxIdentifier + bundleSubPath + bundleIdentifier).replace(/\/$/, ".js");
              bundleIdentifier = bundleIdentifier.replace(/\.php\.js$/, ".php");

              if (!finalBundleIdentifier) {
                finalBundleIdentifier = bundleIdentifier;
              }

              (sandboxOptions.rootBundleLoader || sandboxOptions.load || loadInBrowser)(rebaseUri(bundleIdentifier), function (err, cleanupCallback) {
                if (err) return loadedCallback(err);
                delete sandboxOptions.rootBundleLoader;
                finalizeLoad(moduleIdentifierPrefix, finalBundleIdentifier, finalPackageIdentifier, function () {
                  loadedCallback(null, sandbox);

                  if (cleanupCallback) {
                    cleanupCallback();
                  }
                });
              });
            }
          }
        } catch (err) {
          loadedCallback(err);
        }
      }

      function finalizeLoad(moduleIdentifierPrefix, bundleIdentifier, packageIdentifier, loadFinalized) {
        var pending = 0;

        function finalize() {
          if (pending !== 0) {
            return;
          }

          if (loadFinalized) loadFinalized();
        }

        pending += 1;

        if (!loadedBundles[0]) {
          throw new Error("No bundle memoized for '" + bundleIdentifier + "'! Check the file to ensure it contains JavaScript and that a bundle is memoized against the correct loader instance.");
        }

        bundleIdentifiers[bundleIdentifier] = loadedBundles[0][0];
        var loadedModuleInitializers = loadedBundles[0][1]({
          id: sandboxIdentifier
        });
        var key;

        for (key in loadedModuleInitializers) {
          var memoizeKey = moduleIdentifierPrefix + key;

          if (/^[^\/]*\/package.json$/.test(key)) {
            if (sandboxOptions.rewritePackageDescriptor) {
              loadedModuleInitializers[key][0] = sandboxOptions.rewritePackageDescriptor(loadedModuleInitializers[key][0], memoizeKey);
            }

            if (loadedModuleInitializers[key][0].mappings) {
              for (var alias in loadedModuleInitializers[key][0].mappings) {
                if (/^@script:\/\//.test(loadedModuleInitializers[key][0].mappings[alias])) {
                  pending += 1;
                  loadInBrowser(rebaseUri(loadedModuleInitializers[key][0].mappings[alias].replace(/^@script:/, "")), function () {
                    pending -= 1;
                    finalize();
                  });
                }
              }
            }

            if (moduleInitializers[memoizeKey]) {
              moduleInitializers[memoizeKey][0] = bundleIdentifier;

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

            var packageIdentifier = packageIdentifier || key.split("/").shift();

            if (packages[packageIdentifier]) {
              packages[packageIdentifier].init();
            }
          }

          if (typeof moduleInitializers[memoizeKey] === "undefined") {
            moduleInitializers[memoizeKey] = [bundleIdentifier, loadedModuleInitializers[key][0], loadedModuleInitializers[key][1]];
          }
        }

        loadedBundles.shift();
        pending -= 1;
        finalize();
        return;
      }

      var Package = function Package(packageIdentifier) {
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
          var descriptor = moduleInitializers[packageIdentifier + "/package.json"] && moduleInitializers[packageIdentifier + "/package.json"][1] || {};

          if (descriptor) {
            pkg.descriptor = descriptor;

            if (typeof descriptor.main === "string") {
              pkg.main = descriptor.main;
            }

            pkg.mappings = descriptor.mappings || pkg.mappings;
            pkg.directories = descriptor.directories || pkg.directories;
            pkg.libPath = typeof pkg.directories.lib !== "undefined" && pkg.directories.lib != "" ? pkg.directories.lib + "/" : pkg.libPath;
          }
        };

        pkg.init();

        function normalizeIdentifier(identifier) {
          if (identifier.split("/").pop().indexOf(".") === -1) {
            identifier = identifier + ".js";
          } else if (!/^\//.test(identifier)) {
            identifier = "/" + identifier;
          }

          return identifier;
        }

        var Module = function Module(moduleIdentifier, parentModule) {
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

          function resolveIdentifier(identifier) {
            if (/\/$/.test(identifier)) {
              identifier += "index";
            }

            lastModule = module;
            var plugin = null;

            if (/^[^!]*!/.test(identifier)) {
              var m = identifier.match(/^([^!]*)!(.+)$/);
              identifier = m[2];
              plugin = m[1];
            }

            function pluginify(id) {
              if (!plugin) return id;
              id = new String(id);
              id.plugin = plugin;
              return id;
            }

            if (/^\./.test(identifier)) {
              var segments = identifier.replace(/^\.\//, "").split("../");
              identifier = "/" + moduleIdentifierSegment.slice(1, moduleIdentifierSegment.length - segments.length + 1).concat(segments[segments.length - 1]).join("/");

              if (identifier === "/.") {
                return [pkg, pluginify("")];
              }

              return [pkg, pluginify(normalizeIdentifier(identifier.replace(/\/\.$/, "/")))];
            }

            var splitIdentifier = identifier.split("/");

            if (typeof pkg.mappings[splitIdentifier[0]] !== "undefined") {
              return [Package(pkg.mappings[splitIdentifier[0]]), pluginify(splitIdentifier.length > 1 ? normalizeIdentifier(splitIdentifier.slice(1).join("/")) : "")];
            }

            if (!moduleInitializers["/" + normalizeIdentifier(identifier)]) {
              throw new Error("Descriptor for package '" + pkg.id + "' in sandbox '" + sandbox.id + "' does not declare 'mappings[\"" + splitIdentifier[0] + "\"]' property nor does sandbox have module memoized at '" + "/" + normalizeIdentifier(identifier) + "' needed to satisfy module path '" + identifier + "' in module '" + moduleIdentifier + "'!");
            }

            return [Package(""), pluginify("/" + normalizeIdentifier(identifier))];
          }

          module.require = function (identifier) {
            identifier = resolveIdentifier(identifier);
            return identifier[0].require(identifier[1]).exports;
          };

          module.require.supports = ["ucjs-pinf-0"];

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

          module.require.sandbox = normalizeSandboxArguments(function (programIdentifier, options, loadedCallback, errorCallback) {
            options.load = options.load || sandboxOptions.load;

            if (/^\./.test(programIdentifier)) {
              programIdentifier = sandboxIdentifier + "/" + programIdentifier;
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
                filename: moduleInitializers[moduleIdentifier][2].filename || (module.bundle.replace(/\.js$/, "") + "/" + module.id).replace(/\/+/g, "/"),
                exports: {}
              };

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

              if (typeof moduleInterface.exports !== "undefined" && (_typeof(moduleInterface.exports) !== "object" || keys(moduleInterface.exports).length !== 0)) {
                module.exports = moduleInterface.exports;
              } else if (typeof exports !== "undefined") {
                module.exports = exports;
              }
            } else if (typeof moduleInitializers[moduleIdentifier][1] === "string") {
              module.exports = decodeURIComponent(moduleInitializers[moduleIdentifier][1]);
            } else {
              module.exports = moduleInitializers[moduleIdentifier][1];
            }
          };

          module.getReport = function () {
            var exportsCount = 0,
                key;

            for (key in module.exports) {
              exportsCount++;
            }

            return {
              exports: exportsCount
            };
          };

          return module;
        };

        pkg.load = function (moduleIdentifier, bundleIdentifier, loadedCallback) {
          if (moduleInitializers[packageIdentifier + (moduleIdentifier || pkg.main)]) {
            return loadedCallback(null, pkg.require(moduleIdentifier).exports);
          }

          var bundleSubPath = bundleIdentifier.substring(sandboxIdentifier.length);
          load((!/^\//.test(moduleIdentifier) ? "/" + pkg.libPath : "") + moduleIdentifier, packageIdentifier, bundleSubPath.replace(/\.js$/g, ""), function (err) {
            if (err) return loadedCallback(err);
            loadedCallback(null, pkg.require(moduleIdentifier).exports);
          });
        };

        pkg.require = function (moduleIdentifier) {
          var plugin = moduleIdentifier.plugin;

          if (moduleIdentifier) {
            if (!/^\//.test(moduleIdentifier)) {
              moduleIdentifier = ("/" + (moduleIdentifier.substring(0, pkg.libPath.length) === pkg.libPath ? "" : pkg.libPath)).replace(/\/\.\//, "/") + moduleIdentifier;
            }

            moduleIdentifier = packageIdentifier + moduleIdentifier;
          } else {
            moduleIdentifier = packageIdentifier + pkg.main;
          }

          if (!moduleInitializers[moduleIdentifier] && moduleInitializers[moduleIdentifier.replace(/\.js$/, "/index.js")]) {
            moduleIdentifier = moduleIdentifier.replace(/\.js$/, "/index.js");
          }

          if (plugin && moduleInitializers[moduleIdentifier + ":" + plugin]) {
            moduleIdentifier += ":" + plugin;
          }

          if (!initializedModules[moduleIdentifier]) {
            if (!moduleInitializers[moduleIdentifier]) {
              console.error("[pinf-loader-js]", "moduleInitializers", moduleInitializers);
              throw new Error("Module '" + moduleIdentifier + "' " + (plugin ? "for format '" + plugin + "' " : "") + "not found in sandbox '" + sandbox.id + "'!");
            }

            (initializedModules[moduleIdentifier] = Module(moduleIdentifier, lastModule)).load();
          }

          var loadingBundlesCallbacks;

          if (loadingBundles[moduleIdentifier]) {
            loadingBundlesCallbacks = loadingBundles[moduleIdentifier];
            delete loadingBundles[moduleIdentifier];

            for (var i = 0; i < loadingBundlesCallbacks.length; i++) {
              loadingBundlesCallbacks[i](null, sandbox);
            }
          }

          var moduleInfo = create(initializedModules[moduleIdentifier]);

          if (plugin === "i18n") {
            moduleInfo.exports = moduleInfo.exports.root;
          }

          return moduleInfo;
        };

        pkg.require.id = function (moduleIdentifier) {
          if (!/^\//.test(moduleIdentifier)) {
            moduleIdentifier = "/" + pkg.libPath + moduleIdentifier;
          }

          return ((packageIdentifier !== "" ? "/" + packageIdentifier + "/" : "") + moduleIdentifier).replace(/\/+/g, "/");
        };

        pkg.getReport = function () {
          return {
            main: pkg.main,
            mappings: pkg.mappings,
            directories: pkg.directories,
            libPath: pkg.libPath
          };
        };

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
      };

      sandbox.require = function (moduleIdentifier) {
        return Package("").require(moduleIdentifier).exports;
      };

      sandbox.boot = function () {
        if (typeof Package("").main !== "string") {
          throw new Error("No 'main' property declared in '/package.json' in sandbox '" + sandbox.id + "'!");
        }

        return sandbox.require(Package("").main);
      };

      sandbox.main = function () {
        var exports = sandbox.boot();
        return exports.main ? exports.main.apply(null, arguments) : exports;
      };

      sandbox.getReport = function () {
        var report = {
          bundles: {},
          packages: {},
          modules: {}
        },
            key;

        for (key in bundleIdentifiers) {
          report.bundles[key] = bundleIdentifiers[key];
        }

        for (key in packages) {
          report.packages[key] = packages[key].getReport();
        }

        for (key in moduleInitializers) {
          if (initializedModules[key]) {
            report.modules[key] = initializedModules[key].getReport();
          } else {
            report.modules[key] = {};
          }
        }

        return report;
      };

      sandbox.reset = function () {
        moduleInitializers = {};
        initializedModules = {};
        bundleIdentifiers = {};
        packages = {};
        loadingBundles = {};
      };

      load(sandboxIdentifier.indexOf("?") === -1 ? ".js" : "", "", "", loadedCallback);
      return sandbox;
    };

    var bundleIdentifiers = {},
        sandboxes = {};

    var Require = function Require(bundle) {
      var self = this;

      var bundleHandler = function bundleHandler(uid, callback) {
        if (uid && bundleIdentifiers[uid]) {
          throw new Error("You cannot split require.bundle(UID) calls where UID is constant!");
        }

        bundleIdentifiers[uid] = true;
        loadedBundles.push([uid, function (sandbox) {
          var moduleInitializers = {},
              req = new Require(uid);
          delete req.bundle;
          req.sandbox = sandbox;

          req.memoize = function (moduleIdentifier, moduleInitializer, moduleMeta) {
            moduleInitializers[moduleIdentifier + (moduleMeta && moduleMeta.variation ? ":" + moduleMeta.variation : "")] = [moduleInitializer, moduleMeta || {}];
          };

          callback(req, global || null);
          return moduleInitializers;
        }]);
      };

      var activeBundleHandler = bundleHandler;

      this.bundle = function () {
        return activeBundleHandler.apply(null, arguments);
      };

      this.setActiveBundleHandler = function (handler) {
        var oldHandler = activeBundleHandler;
        activeBundleHandler = handler;
        return oldHandler;
      };
    };

    var PINF = new Require();
    PINF.supports = ["ucjs-pinf-0"];
    PINF.sandbox = normalizeSandboxArguments(function (programIdentifier, options, loadedCallback, errorCallback) {
      if (typeof programIdentifier === "function") {
        options = options || {};
        var bundle = programIdentifier;
        var fallbackLoad = options.load || loadInBrowser;

        options.load = function (uri, loadedCallback) {
          if (uri === programIdentifier + ".js") {
            PINF.bundle("", bundle);
            loadedCallback(null);
            return;
          }

          return fallbackLoad(uri, loadedCallback);
        };

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

    PINF.getReport = function () {
      var report = {
        sandboxes: {}
      };

      for (var key in sandboxes) {
        report.sandboxes[key] = sandboxes[key].getReport();
      }

      return report;
    };

    PINF.reset = function () {
      for (var key in sandboxes) {
        sandboxes[key].reset();
      }

      sandboxes = {};
      bundleIdentifiers = {};
      loadedBundles = [];
    };

    return PINF;
  };

  if (exports) exports.Loader = Loader;
})(typeof exports !== "undefined" ? exports : null);
},{}]},{},[1])(1)
});

})((typeof require !== "undefined" && require) || undefined, (typeof exports !== "undefined" && exports) || undefined, (typeof module !== "undefined" && module) || undefined))