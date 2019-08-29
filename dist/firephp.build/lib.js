
(function (WINDOW) {

    const BROWSER = (typeof browser != "undefined") ? browser : chrome;
    const IS_FIREFOX = (typeof browser !== "undefined");

    function promisify (method, instance) {
        return function (args) {
            return new Promise (function (resolve, reject) {
                try {
                    args = Array.from(args);
                    args.push(function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result);
                    });
                    method.apply(instance, args);
                } catch (err) {
                    reject(err);
                }
            });
        }
    }

    function promisifyNoErr (method, instance) {
        return function (args) {
            return new Promise (function (resolve, reject) {
                try {
                    args = Array.from(args);
                    args.push(function (result) {
                        resolve(result);
                    });
                    method.apply(instance, args);
                } catch (err) {
                    reject(err);
                }
            });
        }
    }

    WINDOW.crossbrowser = {
        runtime: {
            getURL: BROWSER.runtime.getURL,
            onMessage: BROWSER.runtime.onMessage,
            sendMessage: async function () {
                if (IS_FIREFOX) {
                    return BROWSER.runtime.sendMessage.apply(BROWSER.runtime, arguments);
                }
                const result = await promisifyNoErr(BROWSER.runtime.sendMessage, BROWSER.runtime)(arguments);
                if (!result) {
                    throw Error(BROWSER.runtime.lastError.message || BROWSER.runtime.lastError);
                }
                return result;
            },
            getManifest: function () {
                return BROWSER.runtime.getManifest();
            }            
        }
    };

    if (BROWSER.webRequest) {
        WINDOW.crossbrowser.webRequest = {
            onBeforeSendHeaders: BROWSER.webRequest.onBeforeSendHeaders,
            onHeadersReceived: BROWSER.webRequest.onHeadersReceived
        };
    }

    if (BROWSER.devtools) {
        WINDOW.crossbrowser.devtools = {
            inspectedWindow: {},
            panels: {
                create: async function () {
                    if (IS_FIREFOX) {
                        return BROWSER.devtools.panels.create.apply(BROWSER.devtools.panels, arguments);
                    }
                    return promisifyNoErr(BROWSER.devtools.panels.create, BROWSER.devtools.panels)(arguments);
                }
            }
        };
        Object.defineProperty(WINDOW.crossbrowser.devtools.inspectedWindow, 'tabId', {
            get: function() {
                return BROWSER.devtools.inspectedWindow.tabId;
            }
        });
    }

    if (BROWSER.tabs) {
        WINDOW.crossbrowser.tabs = {
            query: async function () {
                if (IS_FIREFOX) {
                    return BROWSER.tabs.query.apply(BROWSER.tabs, arguments);
                }
                return promisifyNoErr(BROWSER.tabs.query, BROWSER.tabs)(arguments);
            },
            sendMessage: async function () {
                if (IS_FIREFOX) {
                    return BROWSER.tabs.sendMessage.apply(BROWSER.tabs, arguments);
                }
                return promisifyNoErr(BROWSER.tabs.sendMessage, BROWSER.tabs)(arguments);
            },
            reload: async function () {
                if (IS_FIREFOX) {
                    return BROWSER.tabs.reload.apply(BROWSER.tabs, arguments);
                }
                return promisifyNoErr(BROWSER.tabs.reload, BROWSER.tabs)(arguments);
            }
        };
    }

    if (BROWSER.storage) {
        WINDOW.crossbrowser.storage = {
            onChanged: BROWSER.storage.onChanged,
            local: {
                get: async function () {
                    if (IS_FIREFOX) {
                        return BROWSER.storage.local.get.apply(BROWSER.storage.local, arguments);
                    }
                    return promisifyNoErr(BROWSER.storage.local.get, BROWSER.storage.local)(arguments);
                },
                set: async function () {
                    if (IS_FIREFOX) {
                        return BROWSER.storage.local.set.apply(BROWSER.storage.local, arguments);
                    }
                    return promisifyNoErr(BROWSER.storage.local.set, BROWSER.storage.local)(arguments);
                }
            }
        };
    };

})(window);
