
const BROWSER = (typeof browser !== "undefined" && browser) || null;

var domainSettingsCache = {};
if (BROWSER) {
    BROWSER.storage.onChanged.addListener(function (changes, area) {
        for (var item of Object.keys(changes)) {
            if (!/^domain\[.+\]\..+$/.test(item)) continue;
            domainSettingsCache[item] = changes[item].newValue;

    //console.log("[background] Updated domain settings '" + item + "':", domainSettingsCache[item]);
            
        }
    });
}
exports.getSetting = function (name) {
    function get () {
        if (!BROWSER) return Promise.resolve(null);
        return BROWSER.storage.local.get(name).then(function (value) {
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
    if (!BROWSER) return Promise.resolve(null);
    return BROWSER.storage.local.set(name, value);
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

