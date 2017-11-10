
const BROWSER = browser;
const WILDFIRE = exports.WILDFIRE = require("./wildfire");


WILDFIRE.once("error", function (err) {
    console.error(err);
});


function broadcastForContext (context, message) {
    if (context) {
        if (
            context.url &&
            !context.hostname
        ) {
            context.hostname = context.url.replace(/^[^:]+:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1");
        }
        message.context = context;
    }
    message.to = "message-listener";
    //console.log("SEND RT MESSAGE", message, JSON.stringify(message.context));

    return BROWSER.runtime.sendMessage(message).catch(function (err) {
        console.log("WARNING", err);
    });
}


WILDFIRE.on("response", function (response) {
    
//    console.log("RECEIVED FIREPHP MESSAGE!!5555!", message);

    broadcastForContext(response.context, {
        // TODO: Pass along specific properties
        response: {}
    });
});


WILDFIRE.on("message.firephp", function (message) {
    
//    console.log("RECEIVED FIREPHP MESSAGE!!5555!", message);

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

    console.log("BACKGROUND MESSAGE", message);

    if (message.to === "broadcast") {
        broadcastForContext(null, message);    
    }

/*
    
    if (message.to === "background") {
        if (message.event === "broadcastCurrentContext") {

            if (!broadcastCurrentContext) {

            }

            broadcastForContext(currentContext, {
                event: "currentContext"
            });
        }
    }
*/
});

BROWSER.webNavigation.onBeforeNavigate.addListener(function (details) {

    if (!broadcastCurrentContext) {
        return;
    }

    currentContext = {
        url: details.url,
        tabId: details.tabId
    };

    console.log("onBeforeNavigate", currentContext, details);

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
    
    currentContext = {
        url: details.url,
        tabId: details.tabId
    };

    console.log("onDOMContentLoaded", currentContext);
    
    broadcastForContext(currentContext, {
        event: "currentContext"
    });
}, {
    url: [
        {}
    ]
});

browser.webNavigation.onCommitted.addListener(function (details) {

    broadcastCurrentContext = true;

    currentContext = {
        url: details.url,
        tabId: details.tabId
    };

    console.log("onCommitted", currentContext);
    
    broadcastForContext(currentContext, {
        event: "currentContext"
    });
}, {
    url: [
        {}
    ]
});

browser.tabs.onActivated.addListener(function (info) {

    if (!broadcastCurrentContext) {
        return;        
    }
    
    BROWSER.tabs.get(info.tabId).then(function (tab) {

        currentContext = {
            url: tab.url,
            tabId: info.tabId
        };

        console.log("tabs.onActivated", currentContext);
        
        return broadcastForContext(currentContext, {
            event: "currentContext"
        });
    }).catch(function (err) {
        console.error(err);
    });
});

browser.tabs.onRemoved.addListener(function (tabId) {

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
