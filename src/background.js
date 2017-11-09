
const BROWSER = browser;
const WILDFIRE = exports.WILDFIRE = require("./wildfire");


WILDFIRE.once("error", function (err) {
    console.error(err);
});


function broadcastForContext (context, message) {
    if (context.url) {
        context.hostname = context.url.replace(/^[^:]+:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1");
    }
    message.to = "message-listener";
    message.context = context;

//console.log("SEND RT MESSAGE", message, JSON.stringify(message.context));

    return BROWSER.runtime.sendMessage(message).catch(function (err) {
        console.log("WARNING", err);
    });
}


WILDFIRE.on("message.firephp", function (message) {
    
//    console.log("RECEIVED FIREPHP MESSAGE!!5555!", message);

broadcastForContext({
    url: message.requestUrl,
    tabId: message.tabId
}, {
        message: {
            sender: message.sender,
            receiver: message.receiver,
            meta: message.meta,
            data: message.data            
        }
    });
});


BROWSER.webNavigation.onBeforeNavigate.addListener(function (details) {

    broadcastForContext({
        url: details.url,
        tabId: details.tabId
    }, {
        event: "onBeforeNavigate"
    });
}, {
    url: [
        {}
    ]
});

BROWSER.webNavigation.onDOMContentLoaded.addListener(function (details) {

    broadcastForContext({
        url: details.url,
        tabId: details.tabId
    }, {
        event: "onDOMContentLoaded"
    });
}, {
    url: [
        {}
    ]
});

browser.tabs.onActivated.addListener(function (info) {

    BROWSER.tabs.get(info.tabId).then(function (tab) {
        return broadcastForContext({
            url: tab.url,
            tabId: info.tabId
        }, {
            event: "tabs.onActivated",
        });
    }).catch(function (err) {
        console.error(err);
    });
});

browser.tabs.onRemoved.addListener(function (tabId) {
    return broadcastForContext({
        tabId: tabId
    }, {
        event: "tabs.onRemoved",
    });
});
