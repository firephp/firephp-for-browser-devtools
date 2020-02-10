
const EVENTS = require("events");
const DEBOUNCE = require('lodash/debounce');

exports.for = function (ctx) {

    const events = new EVENTS.EventEmitter();
    events.browser = ctx.browser;

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

    events.handleBroadcastMessage = function (message) {
        try {
            if (
                message.context &&
                (
                    (
                        ctx.getOwnTabId &&
                        message.context.tabId === ctx.getOwnTabId()
                    ) ||
                    (
                        ctx.browser &&
                        ctx.browser.devtools &&
                        ctx.browser.devtools.inspectedWindow &&
                        message.context.tabId === ctx.browser.devtools.inspectedWindow.tabId
                    )
                )
            ) {
                if (message.to === "message-listener") {
                    if (
                        message.event === "currentContext" &&
                        typeof message.context !== "undefined"
                    ) {
                        onContextMessage(message.context);
                    }
                    events.emit("message", message);
                } else
                if (message.to === "protocol") {
                    if (
                        ctx.handlers &&
                        ctx.handlers[message.message.receiver]
                    ) {
                        message.message.meta = JSON.parse(message.message.meta);
                        message.message.data = JSON.parse(message.message.data);
                        ctx.handlers[message.message.receiver](message.message);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
    ctx.browser.runtime.onMessage.addListener(events.handleBroadcastMessage);

    const globalSettings = {};
    const domainSettings = {};

    ctx.browser.storage.onChanged.addListener(function (changes, area) {
        try {
            if (!events.currentContext) {
                return;
            }

            const prefix = `hostname[${events.currentContext.hostname}].`;
            for (var item of Object.keys(changes)) {
                if (!/^hostname\[.+\]\..+$/.test(item)) {
                    globalSettings[item] = changes[item].newValue;
                    continue;
                }

                if (item.substring(0, prefix.length) === prefix) {
    //console.log("[component] Updated domain settings '" + item + "':", events.settings[name]);

                    const name = item.substring(prefix.length);
    //                if (events.settings[name] !== changes[item].newValue) {
    //                    events.settings[name] = changes[item].newValue;

                        domainSettings[events.currentContext.hostname] = domainSettings[events.currentContext.hostname] || {};
                        domainSettings[events.currentContext.hostname][name] = (changes[item].newValue || false);

                        delete events._getHostnameSettingsForSync._cache[events.currentContext.hostname];                        

                        events.emit("setting." + name, domainSettings[events.currentContext.hostname][name]);
                        events.emit("changed.setting", name, domainSettings[events.currentContext.hostname][name]);
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

    // Get a setting for the current context's hostname
    events.getSetting = async function (name) {
        if (!events.currentContext) {
            return Promise.resolve(null);
        }
        return events._getSettingForHostname(events.currentContext.hostname, name);
    }
    events._getSettingForHostname = async function (hostname, name, defaultValue) {
        if (typeof defaultValue === "undefined") {
            defaultValue = false;
        }
        if (typeof ctx.browser === "undefined") {
            return Promise.resolve(null);
        }
        var key = "hostname[" + hostname + "]." + name;
        return ctx.browser.storage.local.get(key).then(function (value) {
            if (
                value[key] === null ||
                typeof value[key] === "undefined"
            ) {
                return defaultValue;
            }
            return value[key];
        }).then(function (value) {
            domainSettings[hostname] = domainSettings[hostname] || {};
            domainSettings[hostname][name] = value;
            return value;            
        }).catch(function (err) {
            console.error(err);
            throw err;
        });
    }

    events._getSettingForHostnameSync = function (hostname, name, defaultValue) {
        if (typeof defaultValue === "undefined") {
            defaultValue = false;
        }
        if (
            !domainSettings[hostname] ||
            typeof domainSettings[hostname][name] === "undefined"
        ) {
            events._getSettingForHostname(hostname, name, defaultValue);
            return defaultValue;
        }
        return domainSettings[hostname][name];
    }

    events.setSetting = async function (name, value) {
        if (!events.currentContext) {
            throw new Error(`Cannot set setting for name '${name}' due to no 'currentContext'!`);
        }
        return events._setSettingForHostname(events.currentContext.hostname, name, value);
    }
    events._setSettingForHostname = async function (hostname, name, value) {
        if (typeof ctx.browser === "undefined") {
            return Promise.resolve(null);
        }
        return events._getSettingForHostname(hostname, name).then(function (existingValue) {
            if (value === existingValue) {
                // No change
                return;
            }
            var obj = {};
            obj["hostname[" + hostname + "]." + name] = value;
            domainSettings[hostname] = domainSettings[hostname] || {};
            domainSettings[hostname][name] = value;
            return ctx.browser.storage.local.set(obj).then(broadcastCurrentContext);
        }).catch(function (err) {
            console.error(err);
            throw err;
        });
    }

    events.getGlobalSetting = async function (name) {
        if (typeof ctx.browser === "undefined") {
            return null;
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
        }).then(function (value) {
            globalSettings[name] = value;
            return value;
        }).catch(function (err) {
            console.error(err);
            throw err;
        });
    }
    events.setGlobalSetting = async function (name, value) {
        if (typeof ctx.browser === "undefined") {
            return null;
        }
        return events.getGlobalSetting(name).then(function (existingValue) {
            if (value === existingValue) {
                // No change
                return;
            }
            var obj = {};
            obj[name] = value;
            globalSettings[name] = value;
            return ctx.browser.storage.local.set(obj).then(broadcastCurrentContext);
        }).catch(function (err) {
            console.error(err);
            throw err;
        });
    }

    events.isConfigured = async function () {
        if (!events.currentContext) {
            throw new Error(`Cannot get settings due to no 'currentContext'!`);
        }
        const settings = await events._getHostnameSettingsFor(events.currentContext.hostname);
        return settings._configured;
    }

    events._getHostnameSettingsFor = async function (hostname) {
        const settings = {
            enabled: await events._getSettingForHostname(hostname, "enabled", false),
            enableUserAgentHeader: await events._getSettingForHostname(hostname, "enableUserAgentHeader", false),
            enableFirePHPHeader: await events._getSettingForHostname(hostname, "enableFirePHPHeader", false),
            enableChromeLoggerData: await events._getSettingForHostname(hostname, "enableChromeLoggerData", false)
        };

        settings._configured = (
            settings.enableUserAgentHeader ||
            settings.enableFirePHPHeader ||
            settings.enableChromeLoggerData
        );

        return settings;
    }

    // Callable in high volume.
    events._getHostnameSettingsForSync = function (hostname) {
        if (!events._getHostnameSettingsForSync._cache[hostname]) {
            const settings = {
                enabled: events._getSettingForHostnameSync(hostname, "enabled", false),
                enableUserAgentHeader: events._getSettingForHostnameSync(hostname, "enableUserAgentHeader", false),
                enableFirePHPHeader: events._getSettingForHostnameSync(hostname, "enableFirePHPHeader", false),
                enableChromeLoggerData: events._getSettingForHostnameSync(hostname, "enableChromeLoggerData", false)
            };
            settings._configured = (
                settings.enableUserAgentHeader ||
                settings.enableFirePHPHeader ||
                settings.enableChromeLoggerData
            );
            events._getHostnameSettingsForSync._cache[hostname] = settings;
        }
        return events._getHostnameSettingsForSync._cache[hostname];
    }
    events._getHostnameSettingsForSync._cache = {};

    events.isEnabled = async function () {
        if (!events.currentContext) {
            return false;
        }
        return events._isEnabledForHostname(events.currentContext.hostname);
    }

    events._isEnabledForHostname = async function (hostname) {
        const settings = await events._getHostnameSettingsFor(hostname);
        return (
            settings.enabled &&
            settings._configured
        );
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

    events.showView = function (name, args) {
        if (name === "manage") {
            ctx.browser.runtime.sendMessage({
                to: "broadcast",
                event: "manage"/*,
                context: {
                    tabId: ctx.browser.devtools.inspectedWindow.tabId
                }*/
            });
        } else
        if (name === "editor") {
            ctx.browser.runtime.sendMessage({
                to: "broadcast",
                event: "editor",
                args: args
            });
        }
    }

    events.hideView = function (name) {
        if (name === "editor") {
console.log("broadcast hide view: editor");            
            ctx.browser.runtime.sendMessage({
                to: "broadcast",
                event: "editor",
                value: false
            });
        }
    }

    events.loadFile = function (file, line) {
        ctx.browser.runtime.sendMessage({
            to: "background",
            event: "load-file",
            file: file,
            line: line
        });
    }

    return events;
}
