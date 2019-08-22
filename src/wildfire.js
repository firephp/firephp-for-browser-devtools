    
const EVENTS = require("eventemitter2");


var API = module.exports = new EVENTS();

const BROWSER = (typeof browser != "undefined") ? browser : chrome;


API.console = console;
API.BROWSER = BROWSER;
API.WILDFIRE = require("wildfire-for-js");


const REQUEST_OBSERVER = require("./adapters/http-request-observer").for(API);
const RESPONSE_OBSERVER = require("./adapters/http-response-observer").for(API);


const ENCODER = require("insight-for-js/lib/encoder/default");


var encoder = ENCODER.Encoder();
encoder.setOption("maxObjectDepth", 1000);
encoder.setOption("maxArrayDepth", 1000);
encoder.setOption("maxOverallDepth", 1000);


const SETTINGS = require("./settings");


var forceEnabled = false;
API.forcedEnable = function (oo) {
    forceEnabled = oo;
}


API.on.chromeLoggerMessage = function (message, context) {
    try {
        let i,ic,j,jc;
        for (i=0,ic=message.rows.length ; i<ic ; i++) {
            let log = {};
            for (j=0,jc=message.columns.length ; j<jc ; j++) {
                log[message.columns[j]] = message.rows[i][j];        
            }
            const meta = {
                "msg.preprocessor": "FirePHPCoreCompatibility",
                "lang.id" : "registry.pinf.org/cadorn.org/github/renderers/packages/php/master",
                "priority": log.type
            };
            if (log.backtrace) {
                let m = log.backtrace.match(/^([^:]+?)(\s*:\s*(\d+))?$/);
                if (m) {
                    meta.file = m[1];
                    if (m[3] !== '') {
                        meta.line = parseInt(m[3]);
                    }
                }
            }
            if (log.log.length === 1) {
                log.log = log.log[0];
            }
            let dataNode = encoder.encode(log.log, {
                "lang": "php"
            }, {
                "jsonEncode": false
            });
            let node = dataNode.origin;
            Object.keys(meta).forEach(function (name) {
                node.meta[name] = meta[name];
            });
            let msg = {
                "context": context,
                "sender": "https://github.com/ccampbell/chromelogger",
                "receiver": "https://gi0.FireConsole.org/rep.js/InsightTree/0.1",
                "meta": "{}",
                "data": node
            };
            API.emit("message.firephp", msg);
        }
    } catch (err) {
        console.error("Error formatting chromelogger message:", err);
    }
}
    
API.on.insightMessage = function (message) {

//    console.log("LOG MESSAGE to insightMessage ::", message);

    API.emit("message.insight", message);
    
//		console.log("DECODED", JSON.parse(message.getMeta()), message.getData());
//consoleWidget1.loader.callApi("console.log.firephp", [JSON.parse(message.getMeta()), message.getData()]);
}
API.on.firePHPMessage = function (message) {

//    console.log("LOG MESSAGE to firePHPMessage ::", message);

//    console.log("DECODED", message.getMeta(), message.getData());

    API.emit("message.firephp", message);

    //console.log("DECODED", JSON.parse(message.getMeta() || "{}"), message.getData());

        
//var encoder = ENCODER.Encoder();
//var og = encoder.encode(message.getData(), {}, {});
//consoleWidget1.loader.callApi("console.log.firephp", [JSON.parse(message.getMeta()), og]);
}
API.on.transport = function (info) {

    API.emit("message.transport", info);
    
//console.log("make backend request", JSON.stringify(info, null, 4));

/*
var jqxhr = JQUERY.ajax({
"method": "POST",
"url": info.url,
crossDomain: true,
headers: info.headers,
data: {
payload: JSON.stringify(info.payload)
}
}).done(function (data) {

//console.log("SUCCESS DATA", data);

RECEIVERS_EXPORTS.parseReceived(data);


}).fail(function (jqXHR, textStatus) {

console.error("REQUEST ERROR", jqXHR, textStatus);
});
*/
}



function isEnabled () {
    return true;
}


var httpHeaderChannel = API.httpHeaderChannel = API.WILDFIRE.HttpHeaderChannel({
    "enableTransport": false,
    onError: function (err) {
        console.error("HttpHeaderChannel error:", err);
        API.emit("error", err);
    }
});
httpHeaderChannel.setNoReceiverCallback(function(id) {
    API.console.error("trying to log to unknown receiver (extension): " + id);
});


httpHeaderChannel.addListener({
    afterChannelOpen: function (context) {

        if (API.VERBOSE) console.log("[wildfire] httpHeaderChannel -| afterChannelOpen (context):", context);

        API.emit("response", {
            context: context.context
        });
    }
});


// TODO: Load dynamically
require("./receivers/firephp").for(API);
require("./receivers/insight").for(API);


var announceDispatcher = API.WILDFIRE.Dispatcher();
announceDispatcher.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/announce/0.1.0');
announceDispatcher.setChannel(httpHeaderChannel);

function getAnnounceMessageForRequest (request) {

    if (!getAnnounceMessageForRequest._forHostnames) {
        getAnnounceMessageForRequest._forHostnames = {};
    }
    var cache = getAnnounceMessageForRequest._forHostnames;

    // TODO: Don't just use `request.hostname` for cache.
    // TODO: If config changes this announceMessage needs to be reset

    if (cache[request.hostname]) {
        return cache[request.hostname];
    }

    cache[request.hostname] = new API.WILDFIRE.Message();
    cache[request.hostname].setData(JSON.stringify({
        // TODO: Populate crypto-based key
        "authkey": "mykey",
        "receivers": httpHeaderChannel.receivers.map(function (receiver) {
            return receiver.getId();
        })
    }));

    return cache[request.hostname];
}



var hostnameSettings = {};

API.hostnameSettings = hostnameSettings;

REQUEST_OBSERVER.register(function (request) {
    // Firefox allows returning a promise since version 52
    // @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest
    // Chrome requires a sync return
    // @see https://developer.chrome.com/extensions/webRequest#event-onBeforeSendHeaders

    if (!isEnabled()) {

        if (API.VERBOSE) console.log("[wildfire] REQUEST_OBSERVER handler: not enabled");

        return null;
    }

    const settings = SETTINGS.getDomainSettingsForRequestSync(request);

    if (API.VERBOSE) console.log("[wildfire] forceEnabled:", forceEnabled);
    if (API.VERBOSE) console.log("[wildfire] request domain settings for '" + request.hostname + "':", settings);

    hostnameSettings[request.hostname] = settings;
    
    if (
        !forceEnabled &&
        !settings.enabled
    ) {
        return {};
    }

    if (
        forceEnabled ||
        settings.enableUserAgentHeader
    ) {
        if (!request.headers["User-Agent"].match(/\sFirePHP\/([\.|\d]*)\s?/)) {
            request.headers["User-Agent"] = request.headers["User-Agent"] + " FirePHP/0.5";
        }
    }

    if (
        forceEnabled ||
        settings.enableFirePHPHeader
    ) {
        request.headers["X-FirePHP-Version"] = "0.4";
    }

    if (API.VERBOSE) console.log("[wildfire] updated request headers:", request.headers);

    return {
        requestHeaders: request.headers
    };


/*
// TODO: Implement wildfire messaging
    var announceMessage = getAnnounceMessageForRequest(request);
    if (announceMessage) {
        // dispatch announce message
        announceDispatcher.dispatch(announceMessage);

        // flush channel
        httpHeaderChannel.flush({
            setMessagePart: function(name, value) {
                request.httpChannel.setRequestHeader(name, value, false);
            },
            getMessagePart: function(name) {
                if (request.httpChannel.getRequestHeader) {
                    return null;
                }
                // HACK: Do not use exception for flow control
                try {
                    return request.httpChannel.getRequestHeader(name);
                } catch (err) {
                    return null;
                }
            }
        });
    } else {
        // TODO: Use a proper unique ID + counter.
        request.httpChannel.setRequestHeader("x-request-id", ""+(new Date().getTime()) + "" + Math.floor(Math.random()*1000+1), false);
    }

    // API.console.log("REQUEST", request);
*/
});

API.on("http.response", function (response) {
    if (!isEnabled()) {
        return;
    }

    var settings = hostnameSettings[response.request.context.hostname];

    if (
        !settings ||
        (
            !forceEnabled &&
            !settings.enabled
        )
    ) {
        return;
    }

    if (API.VERBOSE) console.log("[wildfire] response domain settings for '" + response.request.context.hostname + "':", settings);

    var chromeLoggerMessage = response.headers.filter(function (header) {
        return (header.name === "X-ChromeLogger-Data");
    });
    if (chromeLoggerMessage.length > 0) {
        chromeLoggerMessage.forEach(function (header) {
            try {
                // @see https://craig.is/writing/chrome-logger/techspecs
                var message = decodeURIComponent(escape(atob(header.value)));
                message = JSON.parse(message);

                API.on.chromeLoggerMessage(message, response.request.context);
            } catch (err) {
                console.error("header", header);
                console.error("Error processing message:", err);
            }
        });
    }

    //dump("RESPONSE IN EXTENSION2", response);
    //console.log("RESPONSE IN EXTENSION4", response);
    httpHeaderChannel.parseReceived(response.headers, {
        "id": response.request.id,
        "url": response.request.url,
        "hostname": response.request.hostname,
        "context": response.request.context,
        "port": response.request.port,
        "method": response.request.method,
        "status": response.status,
        "contentType": response.contentType,
        "requestHeaders": response.request.headers
    });

});
