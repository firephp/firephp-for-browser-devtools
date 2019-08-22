
const BROWSER = (typeof browser != "undefined") ? browser : chrome;
const WILDFIRE = exports.WILDFIRE = require("./wildfire");

const LIB = require("./lib");

WILDFIRE.VERBOSE = true;


WILDFIRE.once("error", function (err) {
    console.error(err);
});


async function initCurrentContext () {
    if (currentContext) {
        // Already initialized
        return;
    }
    try {
        const searchResult = (await LIB.browser.tabs.query({
            currentWindow: true,
            active: true
        }));
        if (searchResult.length === 1) {
            const tabDetails = searchResult[0];

            if (tabDetails.url) {
                setCurrentContextFromDetails({
                    tabId: tabDetails.id,
                    url: tabDetails.url
                }, true);
            }
        }
    } catch (err) {
        console.error(err.stack || err.message || err);
    }
}

// Initialize
setImmediate(initCurrentContext);



// TODO: Emit destroy when unloaded to proactively cleanup. Do we need to do that?
//WILDFIRE.emit("destroy");


function broadcastForContext (context, message) {
    message.context = context;
    message.to = "message-listener";

    return LIB.browser.runtime.sendMessage(message).catch(function (err) {
        if (WILDFIRE.VERBOSE) console.log("WARNING", err);
    });
}

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


let currentContext = null;
//let broadcastCurrentContext = false;

let lastDetailsForTabId = {};

function setCurrentContextFromDetails (details, clearIfNew) {
    if (!details) {
        if (currentContext) {
            currentContext = null;
            broadcastForContext(currentContext, {
                event: "currentContext"
            });
        }
    } else {
        let newCtx = {
            url: details.url,
            tabId: details.tabId
        };
        newCtx.pageUid = JSON.stringify(newCtx);
        newCtx.hostname = details.url.replace(/^[^:]+:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1");
        if (
            newCtx !== currentContext &&
            (
                !newCtx ||
                !currentContext ||
                newCtx.pageUid !== currentContext.pageUid
            )
        ) {

//console.log("NEW CONTEXT", newCtx, details);

            currentContext = newCtx;
            lastDetailsForTabId[currentContext.tabId] = details;

            broadcastForContext(currentContext, {
                event: "currentContext"
            });
        } else {
            broadcastForContext(currentContext, {
                event: "currentContext"
            });
        }

        if (clearIfNew) {
//console.log("SEND PREPARE DUE TO NEW CONTEXT", details);
            broadcastForContext(currentContext, {
                event: "prepare"
            });
        }
    }
}

async function runtime_onMessage (message) {

    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.runtime -| onMessage (message):", message);

    if (message.to === "broadcast") {
        if (message.event === "currentContext") {
            if (!currentContext) {
                await initCurrentContext();
            }
            broadcastForContext(currentContext, message);
        } else {
            if (
                !message.context &&
                !currentContext
            ) {
                await initCurrentContext();
            }
            broadcastForContext(message.context || currentContext || null, message);
        }
    } else
    if (message.to === "background") {
        if (message.event === "reload") {
            LIB.browser.tabs.reload(message.context.tabId, {
                bypassCache: true
            });
        }
    }
}
BROWSER.runtime.onMessage.addListener(runtime_onMessage);
WILDFIRE.on("destroy", function () {
    BROWSER.runtime.onMessage.removeListener(runtime_onMessage);
});



function webNavigation_onBeforeNavigate (details) {
    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.webNavigation -| onBeforeNavigate (details):", details);

    // We only care about the page frame event.
    if (details.parentFrameId !== -1) {
        return;
    }

//console.log("ON BEFORE NAVIGATE", details);

    setCurrentContextFromDetails(details);
}
BROWSER.webNavigation.onBeforeNavigate.addListener(webNavigation_onBeforeNavigate, {
    url: [
        {}
    ]
});
WILDFIRE.on("destroy", function () {
    BROWSER.webNavigation.onBeforeNavigate.removeListener(webNavigation_onBeforeNavigate);
});


function webRequest_onBeforeRequest (details) {
    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.webRequest -| onBeforeRequest (details):", details);

    // We only care about the page frame event.
    if (
        (
            // Firefox
            typeof details.documentUrl !== "undefined" ||
            // Google Chrome
            typeof details.initiator !== "undefined"
        ) ||
        details.parentFrameId !== -1
    ) {
        // These are resource or sub-frame events
        return;
    }

//console.log("ON BEFORE REQUEST", details);

    setCurrentContextFromDetails(details, true);
}
BROWSER.webRequest.onBeforeRequest.addListener(webRequest_onBeforeRequest, {
    urls: [
        "<all_urls>"
    ]
});
WILDFIRE.on("destroy", function () {
    BROWSER.webRequest.onBeforeRequest.removeListener(webRequest_onBeforeRequest);
});


/*
function webNavigation_onCommitted (details) {
    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.webNavigation -| onCommitted (details):", details);

    // We only care about the page frame event.
    if (details.parentFrameId !== -1) {
        return;
    }

console.log("ON COMITTED", details);

    setCurrentContextFromDetails(details, true);
}
BROWSER.webNavigation.onCommitted.addListener(webNavigation_onCommitted, {
    url: [
        {}
    ]
});
WILDFIRE.on("destroy", function () {
    BROWSER.webNavigation.onCommitted.removeListener(webNavigation_onCommitted);
});
*/



/*
function tabs_onActivated (details) {
    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.tabs -| onActivated (details):", details);

console.log("TABS on ACTIVATE", details);

    setCurrentContextFromDetails(lastDetailsForTabId[details.tabId] || null);
}
BROWSER.tabs.onActivated.addListener(tabs_onActivated);
WILDFIRE.on("destroy", function () {
    BROWSER.tabs.onActivated.removeListener(tabs_onActivated);
});
*/


function tabs_onRemoved (tabId) {
    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.tabs -| onRemoved (tabId):", tabId);
    
    if (
        currentContext &&
        currentContext.tabId == tabId
    ) {
        setCurrentContextFromDetails(null);
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



/*
function webNavigation_onBeforeNavigate (details) {

    if (!broadcastCurrentContext) {
        return;
    }

    if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.webNavigation -| onBeforeNavigate (details):", details);

    // We only care about the page frame event.
    if (details.parentFrameId !== -1) {
        return;
    }

console.log("ON BEFORE NAVIGATE", details);

    setCurrentContextFromDetails(details);

    // broadcastForContext(currentContext, {
    //     event: "currentContext"
    // });
    // if (details.frameId === 0) {
    //     broadcastForContext(currentContext, {
    //         event: "prepare"
    //     });
    // }
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

    // We only care about the page frame event.
    if (details.parentFrameId !== -1) {
        return;
    }
    
console.log("ON DOM CONTENT LOADED");

    setCurrentContextFromDetails(details);

//    broadcastForContext(currentContext, {
//        event: "currentContext"
//    });
}
BROWSER.webNavigation.onDOMContentLoaded.addListener(webNavigation_onDOMContentLoaded, {
    url: [
        {}
    ]
});
WILDFIRE.on("destroy", function () {
    BROWSER.webNavigation.onDOMContentLoaded.removeListener(webNavigation_onDOMContentLoaded);
});
*/