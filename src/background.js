
const BROWSER = browser;
const WILDFIRE = exports.WILDFIRE = require("./wildfire");

WILDFIRE.VERBOSE = true;

const ENABLE_PAGE_BRIDGE = false;


WILDFIRE.once("error", function (err) {
    console.error(err);
});


// TODO: Emit destroy when unloaded to proactively cleanup. Do we need to do that?
//WILDFIRE.emit("destroy");


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


    if (ENABLE_PAGE_BRIDGE) {
        var tabId = (
            message.tabId ||
            (
                context &&
                context.tabId
            )
        );
        if (tabId) {
            BROWSER.tabs.sendMessage(tabId, message).catch(function (err) {
                if (WILDFIRE.VERBOSE) console.log("WARNING", err);
            });
        }
    }


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


function webRequest_onBeforeSendHeaders (message) {

    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.runtime -| onMessage (message):", message);

    if (message.to === "broadcast") {
        if (message.event === "currentContext") {
            broadcastForContext(currentContext, message);
        } else {
            broadcastForContext(message.context || null, message);
        }
    } else
    if (message.to === "background") {
        if (message.event === "reload") {
            browser.tabs.reload(message.context.tabId, {
                bypassCache: true
            });
        }
    }
}
BROWSER.runtime.onMessage.addListener(webRequest_onBeforeSendHeaders);
WILDFIRE.on("destroy", function () {
    BROWSER.runtime.onMessage.removeListener(webRequest_onBeforeSendHeaders);
});


function webNavigation_onBeforeNavigate (details) {

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
}
BROWSER.webNavigation.onBeforeNavigate.addListener(webNavigation_onBeforeNavigate, {
    url: [
        {}
    ]
});
WILDFIRE.on("destroy", function () {
    BROWSER.webNavigation.onBeforeNavigate.removeListener(webNavigation_onBeforeNavigate);
});



function webNavigation_onDOMContentLoaded (details) {

    if (!broadcastCurrentContext) {
        return;        
    }
    
    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.webNavigation -| onDOMContentLoaded (details):", details);

    if (details.parentFrameId !== -1) {
        return;
    }

    currentContext = {
        windowId: details.windowId,
        frameId: details.frameId,
        tabId: details.tabId,
        url: details.url
    };
    
    broadcastForContext(currentContext, {
        event: "currentContext"
    });
}
BROWSER.webNavigation.onDOMContentLoaded.addListener(webNavigation_onDOMContentLoaded, {
    url: [
        {}
    ]
});
WILDFIRE.on("destroy", function () {
    BROWSER.webNavigation.onDOMContentLoaded.removeListener(webNavigation_onDOMContentLoaded);
});



function webNavigation_onCommitted (details) {

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
}
BROWSER.webNavigation.onCommitted.addListener(webNavigation_onCommitted, {
    url: [
        {}
    ]
});
WILDFIRE.on("destroy", function () {
    BROWSER.webNavigation.onCommitted.removeListener(webNavigation_onCommitted);
});


function tabs_onActivated (details) {

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
}
BROWSER.tabs.onActivated.addListener(tabs_onActivated);
WILDFIRE.on("destroy", function () {
    BROWSER.tabs.onActivated.removeListener(tabs_onActivated);
});


function tabs_onRemoved (tabId) {

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
}
BROWSER.tabs.onRemoved.addListener(tabs_onRemoved);
WILDFIRE.on("destroy", function () {
    BROWSER.tabs.onRemoved.removeListener(tabs_onRemoved);
});
