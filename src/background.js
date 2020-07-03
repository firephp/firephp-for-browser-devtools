
const BROWSER = (typeof browser != "undefined") ? browser : chrome;
const WILDFIRE = exports.WILDFIRE = require("./wildfire");

const LIB = require("./lib");


const COMPONENT = require("./component");

const comp = COMPONENT.for({
    browser: WINDOW.crossbrowser,
    getOwnTabId: function () {
        if (!currentContext) {
            return null;
        }
        return currentContext.tabId;
    }
});


const wildfire = new WILDFIRE.Client(comp, {
    verbose: false
});

wildfire.once("error", function (err) {
    console.error(err);
});



function syncDebugSetting () {
    LIB.browser.storage.local.get('verbose').then(function (value) {
        if (typeof value.verbose === 'undefined') {
            LIB.browser.storage.local.set({
                verbose: false
            }).catch(function () {});
        } else
        if (!value.verbose || value.verbose === 'false') {
            wildfire.VERBOSE = false;
        } else
        if (value.verbose) {
            wildfire.VERBOSE = true;
        }
    }).catch(function () {});
}
syncDebugSetting();

LIB.browser.storage.onChanged.addListener(function (changes, area) {
    if (typeof changes.verbose !== 'undefined') {
        syncDebugSetting();
    }
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
//wildfire.emit("destroy");


let serverUrl = null;

function broadcastForContext (context, message) {
    message.context = context;
    message.to = message.forceTo || "message-listener";

    comp.handleBroadcastMessage(message);
    return LIB.browser.runtime.sendMessage(message).catch(function (err) {
        if (wildfire.VERBOSE) console.log("WARNING", err);
    });
}

wildfire.on("message.firephp", function (message) {
    if (wildfire.VERBOSE) console.log("[background] WILDFIRE.on -| message.firephp (message):", message);

    if (message.context.serverUrl) {
        serverUrl = message.context.serverUrl;
    }

    broadcastForContext(message.context, {
        message: {
            sender: message.sender,
            receiver: message.receiver,
            meta: message.meta,
            data: message.data            
        }
    });
});

wildfire.on("message.insight.selective", function (message) {    
    if (wildfire.VERBOSE) console.log("[background] WILDFIRE.on -| message.insight.selective (message):", message);

});

wildfire.on("message.insight.request", function (message) {
    if (wildfire.VERBOSE) console.log("[background] WILDFIRE.on -| message.insight.request (message):", message);

//console.log("REQUEST message:", message);

    broadcastForContext(message.context, {
        forceTo: "protocol",
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
            if (wildfire.VERBOSE) console.log("CLEAR CONTEXT", "reset serverUrl");            

            currentContext = null;
            serverUrl = null;
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
            if (wildfire.VERBOSE) console.log("NEW CONTEXT", "reset serverUrl", currentContext, newCtx);            
            serverUrl = null;

            if (wildfire.VERBOSE) console.log("NEW CONTEXT", newCtx, details);

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
            if (wildfire.VERBOSE) console.log("SEND PREPARE DUE TO NEW CONTEXT", details);
            broadcastForContext(currentContext, {
                event: "prepare"
            });
        }
    }
}

async function runtime_onMessage (message) {

    if (wildfire.VERBOSE) console.log("[background] BROWSER.runtime -| onMessage (message):", message);

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
//console.log("FORWARD in BACKGROUD", message);            
            broadcastForContext(message.context || currentContext || null, message);
        }
    } else
    if (message.to === "background") {
        if (message.event === "reload") {
            LIB.browser.tabs.reload(message.context.tabId, {
                bypassCache: true
            });
        } else
        if (message.event === "load-file") {

            if (wildfire.VERBOSE) console.log("LOAD FILE FROM:::", serverUrl);

            const file = message.file;
            const line = message.line;

            if (!serverUrl) {

                if (wildfire.VERBOSE) console.log("SLIP LOAD FILE FROM::: DUE TO NO serverUrl");

                // TODO: Show error 'Server URL not available!' in UI
                return;
            }

            try {
                const response = await wildfire.callServer(serverUrl, {
                    target: 'Insight_Plugin_FileViewer',
                    action: 'GetFile',
                    args: {
                        path: file
                    }
                });

                if (wildfire.VERBOSE) console.log("SERVER response:", response);

                if (!response) {
                    return;
                }

                broadcastForContext(currentContext || null, {
                    action: "show-file",
                    args: {
                        file: file,
                        line: line,
                        content: response
                    }
                });

            } catch (err) {
                // TODO: Show error message in UI
                console.error("Error calling server:", err);
            }
        }
    }
}
BROWSER.runtime.onMessage.addListener(runtime_onMessage);
wildfire.on("destroy", function () {
    BROWSER.runtime.onMessage.removeListener(runtime_onMessage);
});



function webNavigation_onBeforeNavigate (details) {
    if (wildfire.VERBOSE) console.log("[background] BROWSER.webNavigation -| onBeforeNavigate (details):", details);

    // We only care about the page frame event.
    if (details.parentFrameId !== -1) {
        return;
    }

    if (wildfire.VERBOSE) console.log("ON BEFORE NAVIGATE", details);

    setCurrentContextFromDetails(details);
}
BROWSER.webNavigation.onBeforeNavigate.addListener(webNavigation_onBeforeNavigate, {
    url: [
        {}
    ]
});
wildfire.on("destroy", function () {
    BROWSER.webNavigation.onBeforeNavigate.removeListener(webNavigation_onBeforeNavigate);
});



function webRequest_onBeforeRequest (details) {
    if (wildfire.VERBOSE) console.log("[background] BROWSER.webRequest -| onBeforeRequest (details):", details);

    // We only care about the page frame event so we can reset the console.
    if (
        // Works for FF & Chrome when reloading page.
        // LIMITATION: In Chrome, there is no way to distinguish between a reload, forward navigate or backward navigate
        //             so the console will clear with back button where on FF the event does not fire so the
        //             previous console content for the URL re-appears. This latter behaviour is desired.
        // TODO: Once Chrome provides property to determine type of navigation we can lift the limitation.
        details.type === "main_frame"
    ) {
        if (wildfire.VERBOSE) console.log("ON BEFORE PAGE REQUEST (should clear console)", details);

        setCurrentContextFromDetails(details, true);    
    }

    // if (
    //     (
    //         // Firefox
    //         typeof details.documentUrl !== "undefined" ||
    //         // Google Chrome
    //         typeof details.initiator !== "undefined"
    //     ) ||
    //     details.parentFrameId !== -1
    // ) {
    //     // These are resource or sub-frame events
    //     return;
    // }

    // console.log("ON BEFORE REQUEST", details);

    // setCurrentContextFromDetails(details, true);
}
BROWSER.webRequest.onBeforeRequest.addListener(webRequest_onBeforeRequest, {
    urls: [
        "<all_urls>"
    ]
});
wildfire.on("destroy", function () {
    BROWSER.webRequest.onBeforeRequest.removeListener(webRequest_onBeforeRequest);
});


function tabs_onRemoved (tabId) {
    if (wildfire.VERBOSE) console.log("[background] BROWSER.tabs -| onRemoved (tabId):", tabId);
    
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
wildfire.on("destroy", function () {
    BROWSER.tabs.onRemoved.removeListener(tabs_onRemoved);
});






/*
function webNavigation_onCommitted (details) {
    if (wildfire.VERBOSE) console.log("[background] BROWSER.webNavigation -| onCommitted (details):", details);

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
wildfire.on("destroy", function () {
    BROWSER.webNavigation.onCommitted.removeListener(webNavigation_onCommitted);
});
*/



/*
function tabs_onActivated (details) {
    if (wildfire.VERBOSE) console.log("[background] BROWSER.tabs -| onActivated (details):", details);

console.log("TABS on ACTIVATE", details);

    setCurrentContextFromDetails(lastDetailsForTabId[details.tabId] || null);
}
BROWSER.tabs.onActivated.addListener(tabs_onActivated);
wildfire.on("destroy", function () {
    BROWSER.tabs.onActivated.removeListener(tabs_onActivated);
});
*/

/*
function webNavigation_onBeforeNavigate (details) {

    if (!broadcastCurrentContext) {
        return;
    }

    if (wildfire.VERBOSE) console.log("[background] BROWSER.webNavigation -| onBeforeNavigate (details):", details);

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
wildfire.on("destroy", function () {
    BROWSER.webNavigation.onBeforeNavigate.removeListener(webNavigation_onBeforeNavigate);
});

function webNavigation_onDOMContentLoaded (details) {

    if (!broadcastCurrentContext) {
        return;        
    }
    
    if (wildfire.VERBOSE) console.log("[background] BROWSER.webNavigation -| onDOMContentLoaded (details):", details);

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
wildfire.on("destroy", function () {
    BROWSER.webNavigation.onDOMContentLoaded.removeListener(webNavigation_onDOMContentLoaded);
});
*/