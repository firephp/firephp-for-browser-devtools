
const EVENTS = require("events");
const DEBOUNCE = require('lodash/debounce');

exports.for = function (ctx) {

    const events = new EVENTS.EventEmitter();

    events.currentContext = null;
//    events.settings = {};

    setImmediate(function () {
        onContextMessage(null);
        broadcastCurrentContext();
    });

    let contextChangeAcknowledged = false;
    events.contextChangeAcknowledged = function () {
        contextChangeAcknowledged = true;
    }

    function onContextMessage (context) {
        if (
            context !== events.currentContext &&
            (
                !events.currentContext ||
                !context ||
                context.pageUid !== events.currentContext.pageUid
            )
        ) {
            events.currentContext = context;
//            events.settings = {};
            contextChangeAcknowledged = false;
        }

        if (!contextChangeAcknowledged) {
            events.emit("changed.context", events.currentContext);
        }
    }

    ctx.browser.runtime.onMessage.addListener(function (message) {
        try {
            if (
                typeof ctx.browser !== "undefined" &&
                message.context &&
                message.context.tabId != ctx.browser.devtools.inspectedWindow.tabId
            ) {
                return;
            }
            if (message.to === "message-listener") {
                if (
                    message.event === "currentContext" &&
                    typeof message.context !== "undefined"
                ) {
                    onContextMessage(message.context);
                }
                events.emit("message", message);
            }
        } catch (err) {
            console.error(err);
        }
    });

    ctx.browser.storage.onChanged.addListener(function (changes, area) {
        try {
            if (!events.currentContext) {
                return;
            }

            const prefix = `domain[${events.currentContext.hostname}].`;
            for (var item of Object.keys(changes)) {
                if (!/^domain\[.+\]\..+$/.test(item)) continue;

                if (item.substring(0, prefix.length) === prefix) {
    //console.log("[component] Updated domain settings '" + item + "':", events.settings[name]);

                    const name = item.substring(prefix.length);
    //                if (events.settings[name] !== changes[item].newValue) {
    //                    events.settings[name] = changes[item].newValue;

                        events.emit("setting." + name, changes[item].newValue);
                        events.emit("changed.setting", name, changes[item].newValue);
    //                }
                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    const broadcastCurrentContext = DEBOUNCE(function () {
        ctx.browser.runtime.sendMessage({
            to: "broadcast",
            event: "currentContext"
        });
    }, 250);

    events.getSetting = function (name) {
        if (!events.currentContext) {
            return Promise.resolve(null);
        }
        return events._getSettingForHostname(events.currentContext.hostname, name);
    }
    events._getSettingForHostname = function (hostname, name) {
        if (typeof ctx.browser === "undefined") {
            return Promise.resolve(null);
        }
        var key = "domain[" + hostname + "]." + name;
        return ctx.browser.storage.local.get(key).then(function (value) {
            return (value[key] || false);
        }).catch(function (err) {
            console.error(err);
            throw err;
        });
    }    
    events.setSetting = function (name, value) {
        if (!events.currentContext) {
            throw new Error(`Cannot set setting for name '${name}' due to no 'currentContext'!`);
        }
        return events._setSettingForHostname(events.currentContext.hostname, name, value);
    }
    events._setSettingForHostname = function (hostname, name, value) {
        if (typeof ctx.browser === "undefined") {
            return Promise.resolve(null);
        }
        return events._getSettingForHostname(hostname, name).then(function (existingValue) {
            if (value === existingValue) {
                // No change
                return;
            }
            var obj = {};
            obj["domain[" + hostname + "]." + name] = value;
            return ctx.browser.storage.local.set(obj).then(broadcastCurrentContext);
        }).catch(function (err) {
            console.error(err);
            throw err;
        });
    }

    events.getGlobalSetting = function (name) {
        if (typeof ctx.browser === "undefined") {
            return Promise.resolve(null);
        }
        var defaultValue;
        if (name === "reloadOnEnable") {
            defaultValue = true;
        }
        return ctx.browser.storage.local.get(name).then(function (value) {
            if (typeof value[name] === "undefined") {
                if (typeof defaultValue !== "undefined") {
                    return defaultValue;
                }
                return null;
            }
            return value[name];
        }).catch(function (err) {
            console.error(err);
            throw err;
        });
    }
    events.setGlobalSetting = function (name, value) {
        if (typeof ctx.browser === "undefined") {
            return Promise.resolve(null);
        }
        return events.getGlobalSetting(name).then(function (existingValue) {
            if (value === existingValue) {
                // No change
                return;
            }
            var obj = {};
            obj[name] = value;
            return ctx.browser.storage.local.set(obj).then(broadcastCurrentContext);
        }).catch(function (err) {
            console.error(err);
            throw err;
        });
    }

    events.isConfigured = function () {
        return events.getSetting("enableUserAgentHeader").then(function (enableUserAgentHeader) {
            return events.getSetting("enableFirePHPHeader").then(function (enableFirePHPHeader) {
                return events.getSetting("enableChromeLoggerData").then(function (enableChromeLoggerData) {
                    return (
                        enableUserAgentHeader ||
                        enableFirePHPHeader ||
                        enableChromeLoggerData
                    );
                });                            
            });                            
        });                            
    }

    events.reloadBrowser = function () {
        ctx.browser.runtime.sendMessage({
            to: "background",
            event: "reload",
            context: {
                tabId: ctx.browser.devtools.inspectedWindow.tabId
            }
        });
    }

    events.clearConsole = function () {
        ctx.browser.runtime.sendMessage({
            to: "broadcast",
            event: "clear"/*,
            context: {
                tabId: ctx.browser.devtools.inspectedWindow.tabId
            }*/
        });
    }

    events.showView = function (name) {
        if (name === "manage") {
            ctx.browser.runtime.sendMessage({
                to: "broadcast",
                event: "manage"/*,
                context: {
                    tabId: ctx.browser.devtools.inspectedWindow.tabId
                }*/
            });
        }
    }

    return events;
}
