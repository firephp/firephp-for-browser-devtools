

var domainSettingsCache = {};
BROWSER.storage.onChanged.addListener(function (changes, area) {
    for (var item of Object.keys(changes)) {
        if (!/^domain\[.+\]\.settings\..+$/.test(item)) continue;
        domainSettingsCache[item] = changes[item].newValue;
    }    
});
function getSetting (name) {
    if (typeof domainSettingsCache[name] === "undefined") {
        return Promise.resolve(false);
    }
    return browser.storage.local.get(name).then(function (value) {
        console.log("get value from STORAGE", value);
        return (domainSettingsCache[name] = value[name] || false);
    });
}

exports.getDomainSettingsForDomain = function (domain) {
    return getSetting("domain[" + domain + "].settings.enableUserAgentHeader").then(function (enableUserAgentHeader) {
        return getSetting("domain[" + domain + "].settings.enableFirePHPHeader").then(function (enableFirePHPHeader) {            
            return Promise.resolve({
                "enableUserAgentHeader": enableUserAgentHeader,
                "enableFirePHPHeader": enableFirePHPHeader
            });
        });
    });
}

exports.isEnabledForDomain = function (domain) {
    return exports.getDomainSettingsForDomain(domain).then(function (settings) {
        return (
            settings.enableUserAgentHeader ||
            settings.enableFirePHPHeader
        );
    });
}    

exports.getDomainSettingsForRequest = function (request) {
    return exports.getDomainSettingsForDomain(request.hostname);
}

