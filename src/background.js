
const BROWSER = browser;
const WILDFIRE = exports.WILDFIRE = require("./wildfire");

WILDFIRE.VERBOSE = true;


WILDFIRE.once("error", function (err) {
    console.error(err);
});


var windowIdByFrameId = {};

function broadcastForContext (context, message) {
    if (context) {
        if (
            context.url &&
            !context.hostname
        ) {
            context.hostname = context.url.replace(/^[^:]+:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1");
        }
        if (
            typeof context.windowId === "undefined" &&
            typeof context.frameId !== "undefined" &&
            typeof windowIdByFrameId["" + context.frameId] !== "undefined"
        ) {
            context.windowId = windowIdByFrameId["" + context.frameId];
        }
        message.context = context;
    }
    message.to = "message-listener";
    //console.log("SEND RT MESSAGE", message, JSON.stringify(message.context));

    return BROWSER.runtime.sendMessage(message).catch(function (err) {
        if (WILDFIRE.VERBOSE) console.log("WARNING", err);
    });
}


WILDFIRE.on("response", function (response) {

    if (WILDFIRE.VERBOSE) console.log("[background] WILDFIRE.on -| response (response):", response);

    broadcastForContext(response.context, {
        // TODO: Pass along specific properties
        response: {}
    });
});


WILDFIRE.on("message.firephp", function (message) {
    
    if (WILDFIRE.VERBOSE) console.log("[background] WILDFIRE.on -| message.firephp (message):", message);

    broadcastForContext(message.context, {
        message: {
            sender: message.sender,
            receiver: message.receiver,
            meta: message.meta,
            data: message.data            
        }
    });
});


var currentContext = null;
var broadcastCurrentContext = false;


BROWSER.runtime.onMessage.addListener(function (message) {

    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.runtime -| onMessage (message):", message);

    if (message.to === "broadcast") {
        if (message.event === "currentContext") {
            broadcastForContext(message.context || currentContext, message);
        } else {
            broadcastForContext(message.context || null, message);
        }
    }
});

BROWSER.webNavigation.onBeforeNavigate.addListener(function (details) {

    if (!broadcastCurrentContext) {
        return;
    }

    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.webNavigation -| onBeforeNavigate (details):", details);
    
    currentContext = {
        windowId: details.windowId,
        frameId: details.frameId,
        tabId: details.tabId,
        url: details.url
    };

    broadcastForContext(currentContext, {
        event: "currentContext"
    });
}, {
    url: [
        {}
    ]
});

BROWSER.webNavigation.onDOMContentLoaded.addListener(function (details) {

    if (!broadcastCurrentContext) {
        return;        
    }
    
    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.webNavigation -| onDOMContentLoaded (details):", details);
    
    currentContext = {
        windowId: details.windowId,
        frameId: details.frameId,
        tabId: details.tabId,
        url: details.url
    };
    
    broadcastForContext(currentContext, {
        event: "currentContext"
    });
}, {
    url: [
        {}
    ]
});

BROWSER.webNavigation.onCommitted.addListener(function (details) {

    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.webNavigation -| onCommitted (details):", details);
    
    broadcastCurrentContext = true;
    
    currentContext = {
        windowId: details.windowId,
        frameId: details.frameId,
        tabId: details.tabId,        
        url: details.url
    };
    
    broadcastForContext(currentContext, {
        event: "currentContext"
    });
}, {
    url: [
        {}
    ]
});

BROWSER.tabs.onActivated.addListener(function (details) {

    if (!broadcastCurrentContext) {
        return;        
    }

    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.tabs -| onActivated (details):", details);
    
    BROWSER.tabs.get(details.tabId).then(function (tab) {

        currentContext = {
            windowId: details.windowId,
            tabId: details.tabId,
            url: tab.url
        };
        
        return broadcastForContext(currentContext, {
            event: "currentContext"
        });
    }).catch(function (err) {
        if (WILDFIRE.VERBOSE) console.error(err);
    });
});

BROWSER.tabs.onRemoved.addListener(function (tabId) {

    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.tabs -| onRemoved (tabId):", tabId);
    
    if (
        currentContext &&
        currentContext.tabId == tabId
    ) {
        currentContext = null;
    }

    return broadcastForContext({
        tabId: tabId
    }, {
        event: "destroyContext"
    });
});
