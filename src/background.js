
const BROWSER = browser;
const WILDFIRE = exports.WILDFIRE = require("./wildfire");


WILDFIRE.once("error", function (err) {
    console.error(err);
});


function broadcastForUrl (url, message) {
    return broadcastForHostname(url.replace(/^[^:]+:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1"), message);
}

function broadcastForHostname (hostname, message) {
    message.to = "message-listener";
    message.hostname = hostname;
    return BROWSER.runtime.sendMessage(message).catch(function (err) {
        console.log("WARNING", err);
    });
}


WILDFIRE.on("message.firephp", function (message) {
    
//    console.log("RECEIVED FIREPHP MESSAGE!!5555!", message);

    broadcastForUrl(message.requestUrl, {
        message: {
            sender: message.sender,
            receiver: message.receiver,
            meta: message.meta,
            data: message.data            
        }
    });
});


BROWSER.webNavigation.onBeforeNavigate.addListener(function (details) {

    broadcastForUrl(details.url, {
        event: "onBeforeNavigate"
    });
}, {
    url: [
        {}
    ]
});

BROWSER.webNavigation.onDOMContentLoaded.addListener(function (details) {

    broadcastForUrl(details.url, {
        event: "onDOMContentLoaded"
    });
}, {
    url: [
        {}
    ]
});

browser.tabs.onActivated.addListener(function (info) {

    BROWSER.tabs.get(info.tabId).then(function (tab) {

        return broadcastForUrl(tab.url, {
            event: "tabs.onActivated",
        });
    }).catch(function (err) {
        console.error(err);
    });
});