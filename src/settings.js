
const LIB = require("./lib");



var domainSettingsCache = {};
var settingsByHostnameCache = {};
if (LIB.browser) {
    LIB.browser.storage.onChanged.addListener(function (changes, area) {
        for (var item of Object.keys(changes)) {
            if (!/^domain\[.+\]\..+$/.test(item)) continue;
            domainSettingsCache[item] = changes[item].newValue;

            const m = item.match(/^domain\[([^\]]+)\]\.(.+)$/);
            if (m) {
                if (!settingsByHostnameCache[m[1]]) {
                    settingsByHostnameCache[m[1]] = {
                        "enabled": false,
                        "enableUserAgentHeader": false,
                        "enableFirePHPHeader": false,
                        "enableChromeLoggerData": false
                    };
                }
                settingsByHostnameCache[m[1]][m[2]] = changes[item].newValue;
            }

    //console.log("[background] Updated domain settings '" + item + "':", domainSettingsCache[item]);
            
        }
    });
}
exports.getSetting = function (name) {
    function get () {
        if (!LIB.browser) return Promise.resolve(null);
        return LIB.browser.storage.local.get(name).then(function (value) {

            const m = name.match(/^domain\[([^\]]+)\]\.(.+)$/);
            
            if (m) {
                if (!settingsByHostnameCache[m[1]]) {
                    settingsByHostnameCache[m[1]] = {
                        "enabled": false,
                        "enableUserAgentHeader": false,
                        "enableFirePHPHeader": false,
                        "enableChromeLoggerData": false
                    };
                }
                settingsByHostnameCache[m[1]][m[2]] = value[name] || false;
            }

            return (domainSettingsCache[name] = value[name]);
        });
    }
    if (typeof domainSettingsCache[name] === "undefined") {
        get();
        return Promise.resolve(false);
    }
    return get();
}
exports.setSetting = function (name, value) {
    if (!LIB.browser) return Promise.resolve(null);
    return LIB.browser.storage.local.set(name, value);
}


// TODO: Speed this up by removing promises as much as possible

exports.getDomainSettingsForDomain = function (domain) {
    return exports.getSetting("domain[" + domain + "].enabled").then(function (enabled) {
        return exports.getSetting("domain[" + domain + "].enableUserAgentHeader").then(function (enableUserAgentHeader) {            
            return exports.getSetting("domain[" + domain + "].enableFirePHPHeader").then(function (enableFirePHPHeader) {            
                return exports.getSetting("domain[" + domain + "].enableChromeLoggerData").then(function (enableChromeLoggerData) {            

                    return Promise.resolve({
                        "enabled": enabled,
                        "enableUserAgentHeader": enableUserAgentHeader,
                        "enableFirePHPHeader": enableFirePHPHeader,
                        "enableChromeLoggerData": enableChromeLoggerData
                    });
                });
            });
        });
    });
}

exports.isEnabledForDomain = function (domain) {
    return exports.getDomainSettingsForDomain(domain).then(function (settings) {
        return (
            settings.enabled &&
            (
                settings.enableUserAgentHeader ||
                settings.enableFirePHPHeader ||
                settings.enableChromeLoggerData
            )
        );
    });
}    


exports.getDomainSettingsForRequest = function (request) {
    return exports.getDomainSettingsForDomain(request.hostname).then(function (settings) {
//        console.log("Domain settings for '" + request.hostname + "':", settings);
        return settings;
    });
}

exports.getDomainSettingsForRequestSync = function (request) {
    if (!exports.getDomainSettingsForRequestSync._fetchedOnce) {
        exports.getDomainSettingsForRequestSync._fetchedOnce = {};
    }
    if (!exports.getDomainSettingsForRequestSync._fetchedOnce[request.hostname]) {
        exports.getDomainSettingsForRequestSync._fetchedOnce[request.hostname] = true;
        // kick off settings fetch
        exports.getDomainSettingsForRequest(request);
    }
    // use last cached settings
    if (!settingsByHostnameCache[request.hostname]) {
        settingsByHostnameCache[request.hostname] = {
            "enabled": false,
            "enableUserAgentHeader": false,
            "enableFirePHPHeader": false,
            "enableChromeLoggerData": false
        };
    }

    return settingsByHostnameCache[request.hostname];
}
