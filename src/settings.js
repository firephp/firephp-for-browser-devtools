
const BROWSER = browser;

var domainSettingsCache = {};
BROWSER.storage.onChanged.addListener(function (changes, area) {
    for (var item of Object.keys(changes)) {
        if (!/^domain\[.+\]\.settings\..+$/.test(item)) continue;
        domainSettingsCache[item] = changes[item].newValue;

//console.log("[background] Updated domain settings '" + item + "':", domainSettingsCache[item]);
        
    }
});
function getSetting (name) {
    if (typeof domainSettingsCache[name] === "undefined") {
        return Promise.resolve(false);
    }
    return BROWSER.storage.local.get(name).then(function (value) {
        return (domainSettingsCache[name] = value[name] || false);
    });
}

// TODO: Speed this up by removing promises as much as possible

exports.getDomainSettingsForDomain = function (domain) {
    return getSetting("domain[" + domain + "].settings.enabled").then(function (enabled) {
        return getSetting("domain[" + domain + "].settings.enableUserAgentHeader").then(function (enableUserAgentHeader) {            
            return getSetting("domain[" + domain + "].settings.enableFirePHPHeader").then(function (enableFirePHPHeader) {            
                return Promise.resolve({
                    "enabled": enabled,
                    "enableUserAgentHeader": enableUserAgentHeader,
                    "enableFirePHPHeader": enableFirePHPHeader
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
                settings.enableFirePHPHeader
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

