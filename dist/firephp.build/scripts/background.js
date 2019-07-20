PINF.bundle("", function(__require) {
	__require.memoize("/main.js", function (_require, _exports, _module) {
var bundle = { require: _require, exports: _exports, module: _module };
var exports = undefined;
var module = undefined;
var define = function (deps, init) {
_module.exports = init();
}; define.amd = true;
       var pmodule = bundle.module;

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){


var CHANNEL = require("./channel");

const HEADER_PREFIX = 'x-wf-';

var requestIndex = 0;


var HttpHeaderChannel = exports.HttpHeaderChannel = function(options) {
    if (!(this instanceof exports.HttpHeaderChannel))
        return new exports.HttpHeaderChannel(options);

    this.__construct(options);

    this.HEADER_PREFIX = HEADER_PREFIX;
}

HttpHeaderChannel.prototype = CHANNEL.Channel();

HttpHeaderChannel.prototype.getFirebugNetMonitorListener = function() {
    if(!this.firebugNetMonitorListener) {
        var self = this;
        this.firebugNetMonitorListener = {
            onResponseBody: function(context, file)
            {
                if(file) {
                    try {
                        
                        var requestId = false;
                        for( var i=file.requestHeaders.length-1 ; i>=0 ; i-- ) {
                            if(file.requestHeaders[i].name=="x-request-id") {
                                requestId = file.requestHeaders[i].value;
                                break;
                            }
                        }

                        self.parseReceived(file.responseHeaders, {
                            "FirebugNetMonitorListener": {
                                "context": context,
                                "file": file
                            },
                            "id": requestId || "id:" + file.href + ":" + requestIndex++,
                            "url": file.href,
                            // TODO: add "hostname" (file.request.URI.host?)
                            // TODO: add "port" (file.request.URI.port?)
                            "method": file.method,
                            "requestHeaders": file.requestHeaders
                        });
                    } catch(e) {
                        console.error(e);
                    }
                }
            }
        }
    }
    return this.firebugNetMonitorListener;
}

HttpHeaderChannel.prototype.getMozillaRequestObserverListener = function(globals) {
    if(!this.mozillaRequestObserverListener) {
        var self = this;
        this.mozillaRequestObserverListener = {
            observe: function(subject, topic, data)
            {
                if (topic == "http-on-examine-response") {

                    var httpChannel = subject.QueryInterface(globals.Ci.nsIHttpChannel);

                    try {
                        var requestHeaders = [];
                        var requestId;
                        httpChannel.visitRequestHeaders({
                            visitHeader: function(name, value)
                            {
                                requestHeaders.push({name: name, value: value});
                                if(name.toLowerCase()=="x-request-id") {
                                    requestId = value;
                                }
                            }
                        });
                        var responseHeaders = [],
                            contentType = false;
                        httpChannel.visitResponseHeaders({
                            visitHeader: function(name, value)
                            {
                                responseHeaders.push({name: name, value: value});
                                if (name.toLowerCase() == "content-type")
                                    contentType = value;
                            }
                        });
                        self.parseReceived(responseHeaders, {
                            "MozillaRequestObserverListener": {
                                "httpChannel": httpChannel
                            },
                            "id": requestId || "id:" + httpChannel.URI.spec + ":" + requestIndex++,
                            "url": httpChannel.URI.spec,
                            "hostname": httpChannel.URI.host,
                            "port": httpChannel.URI.port,
                            "method": httpChannel.requestMethod,
                            "status": httpChannel.responseStatus,
                            "contentType": contentType,
                            "requestHeaders": requestHeaders
                        });
                    } catch(e) {
                        console.error(e);
                    }
                }
            }                
        }
    }
    return this.mozillaRequestObserverListener;
}

},{"./channel":4}],2:[function(require,module,exports){

var CHANNEL = require("./channel"),
    UTIL = require("fp-modules-for-nodejs/lib/util");

const HEADER_PREFIX = 'x-wf-';

var PostMessageChannel = exports.PostMessageChannel = function () {
    if (!(this instanceof exports.PostMessageChannel))
        return new exports.PostMessageChannel();
    
    this.__construct();

    this.HEADER_PREFIX = HEADER_PREFIX;
    
    this.postMessageSender = null;
}

PostMessageChannel.prototype = CHANNEL.Channel();

PostMessageChannel.prototype.enqueueOutgoing = function(message, bypassReceivers)
{
    var ret = this._enqueueOutgoing(message, bypassReceivers);

    var parts = {};
    this.flush({
        setMessagePart: function(key, value) {
            parts[key] = value;
        },
        getMessagePart: function(key) {
            if (typeof parts[key] == "undefined")
                return null;
            return parts[key];
        }
    });

    var self = this;

    var payload = [];
    UTIL.forEach(parts, function(part)
    {
        payload.push(part[0] + ": " + part[1]);
    });
    self.postMessageSender(payload.join("\n"));
    
    return ret;
}

PostMessageChannel.prototype.setPostMessageSender = function(postMessage)
{
    this.postMessageSender = postMessage;
}

PostMessageChannel.prototype.parseReceivedPostMessage = function(msg)
{
    if (this.status != "open")
        this.open();
    this.parseReceived(msg, null, {
        skipChannelOpen: true,
        skipChannelClose: true,
        enableContinuousParsing: true
    });
}

},{"./channel":4,"fp-modules-for-nodejs/lib/util":21}],3:[function(require,module,exports){

var CHANNEL = require("./channel");

const HEADER_PREFIX = '#x-wf-';

var ShellCommandChannel = exports.ShellCommandChannel = function () {
    if (!(this instanceof exports.ShellCommandChannel))
        return new exports.ShellCommandChannel();
    
    this.__construct();
    
    this.HEADER_PREFIX = HEADER_PREFIX;
}

ShellCommandChannel.prototype = CHANNEL.Channel();

},{"./channel":4}],4:[function(require,module,exports){

var UTIL = require("fp-modules-for-nodejs/lib/util");
var PROTOCOL = require("./protocol");
var TRANSPORT = require("./transport");

var Channel = exports.Channel = function () {
    if (!(this instanceof exports.Channel))
        return new exports.Channel();
}

Channel.prototype.__construct = function(options) {
    options = options || {};
    this.status = "closed";
    this.receivers = [];
    this.listeners = [];
    this.options = {
        "messagePartMaxLength": 5000
    }
    this.outgoingQueue = [];

    this.onError = options.onError || null;

    if(typeof options.enableTransport != "undefined" && options.enableTransport===false) {
        // do not add transport
    } else {
        this.addReceiver(TRANSPORT.newReceiver(this));
    }
}

Channel.prototype.enqueueOutgoing = function(message, bypassReceivers) {
    return this._enqueueOutgoing(message, bypassReceivers);
}

Channel.prototype._enqueueOutgoing = function(message, bypassReceivers) {
    if(!bypassReceivers) {
        // If a receiver with a matching ID is present on the channel we don't
        // enqueue the message if receiver.onMessageReceived returns FALSE.
        var enqueue = true;
        for( var i=0 ; i<this.receivers.length ; i++ ) {
            if(this.receivers[i].hasId(message.getReceiver())) {
                if(!this.receivers[i].onMessageReceived(null, message)) enqueue = false;
            }
        }
        if(!enqueue) return true;
    }
    this.outgoingQueue.push(this.encode(message));
    return true;
}

Channel.prototype.getOutgoing = function() {
    return this.outgoingQueue;
}

Channel.prototype.clearOutgoing = function() {
    this.outgoingQueue = [];
}

Channel.prototype.setMessagePartMaxLength = function(length) {
    this.options.messagePartMaxLength = length;
}

Channel.prototype.flush = function(applicator, bypassTransport) {
    return this._flush(applicator, bypassTransport);
}

Channel.prototype._flush = function(applicator, bypassTransport) {
    // set request ID if not set
    if(!applicator.getMessagePart("x-request-id")) {
        applicator.setMessagePart("x-request-id", ""+(new Date().getTime()) + "" + Math.floor(Math.random()*1000+1) );
    }

    var messages = this.getOutgoing();
    if(messages.length==0) {
        return 0;
    }

    var util = {
        "applicator": applicator,
        "HEADER_PREFIX": this.HEADER_PREFIX
    };

    if(this.transport && !bypassTransport) {
        util.applicator = this.transport.newApplicator(applicator);
    }

    for( var i=0 ; i<messages.length ; i++ ) {
        var headers = messages[i];
        for( var j=0 ; j<headers.length ; j++ ) {
            util.applicator.setMessagePart(
                PROTOCOL.factory(headers[j][0]).encodeKey(util, headers[j][1], headers[j][2]),
                headers[j][3]
            );
        }
    }
    
    var count = messages.length;

    this.clearOutgoing();

    if(util.applicator.flush) {
        util.applicator.flush(this);
    }

    return count;
}


Channel.prototype.setMessagePart = function(key, value) {
    // overwrite in subclass
}

Channel.prototype.getMessagePart = function(key) {
    // overwrite in subclass
    return null;
}

Channel.prototype.encode = function(message) {
    var protocol_id = message.getProtocol();
    if(!protocol_id) {
        var err = new Error("Protocol not set for message");
        if (this.onError) {
            this.onError(err);
        } else {
            throw err;
        }
    }
    return PROTOCOL.factory(protocol_id).encodeMessage(this.options, message);
}

Channel.prototype.setNoReceiverCallback = function(callback) {
    this.noReceiverCallback = callback;
}

Channel.prototype.addReceiver = function(receiver) {
    // avoid duplicates
    for( var i=0 ; i<this.receivers.length ; i++ ) {
        if(this.receivers[i]==receiver) {
            return;
        }
    }
    this.receivers.push(receiver);
}

Channel.prototype.addListener = function(listener) {
    // avoid duplicates
    for( var i=0 ; i<this.listeners.length ; i++ ) {
        if(this.listeners[i]==listener) {
            return;
        }
    }
    this.listeners.push(listener);
}

function dispatch(channel, method, args)
{
    args = args || [];
    for( var i=0 ; i<channel.listeners.length ; i++ ) {
        if(typeof channel.listeners[i][method] === "function") {
            channel.listeners[i][method].apply(null, args);
        }
    }    
}

Channel.prototype.open = function(context) {
    this.status = "open";
    
    dispatch(this, "beforeChannelOpen", [context]);
    
    for( var i=0 ; i<this.receivers.length ; i++ ) {
        if(this.receivers[i]["onChannelOpen"]) {
            this.receivers[i].onChannelOpen(context);
        }
    }
    this.sinks = {
        protocolBuffers: {},
        buffers: {},
        protocols: {},
        receivers: {},
        senders: {},
        messages: {}
    }
    dispatch(this, "afterChannelOpen", [context]);
}

Channel.prototype.close = function(context) {
    this.status = "close";
    dispatch(this, "beforeChannelClose", [context]);
    for( var i=0 ; i<this.receivers.length ; i++ ) {
        if(this.receivers[i]["onChannelClose"]) {
            this.receivers[i].onChannelClose(context);
        }
    }
    dispatch(this, "afterChannelClose", [context]);
}

var parsing = false;

Channel.prototype.parseReceived = function(rawHeaders, context, options) {
    var self = this;

    if (parsing)
    {
        var err = new Error("Already parsing!");
        if (self.onError) {
            self.onError(err);
        } else {
            throw err;
        }        
    }

    options = options || {};
    options.skipChannelOpen = options.skipChannelOpen || false;
    options.skipChannelClose = options.skipChannelClose || false;
    options.enableContinuousParsing = options.enableContinuousParsing || false;

    if (
        typeof rawHeaders != "object" ||
        (
            Array.isArray(rawHeaders) &&
            typeof rawHeaders[0] === "string"
        )
    ) {
        rawHeaders = text_header_to_object(rawHeaders);
    }

    var headersFound = false;
    rawHeaders.forEach(function (header) {
        if (/x-wf-/i.test(header.name)) {
            headersFound = true;
        }
    });
    if (!headersFound) {
        return;
    }

    if(!options.skipChannelOpen) {

        // Include 'x-request-id' in context

        self.open(context);
    }

    parsing = true;
    
    // protocol related
    var protocolBuffers = (options.enableContinuousParsing)?this.sinks.protocolBuffers:{};

    // message related
    var buffers = (options.enableContinuousParsing)?this.sinks.buffers:{};
    var protocols = (options.enableContinuousParsing)?this.sinks.protocols:{};
    var receivers = (options.enableContinuousParsing)?this.sinks.receivers:{};
    var senders = (options.enableContinuousParsing)?this.sinks.senders:{};
    var messages = (options.enableContinuousParsing)?this.sinks.messages:{};

    try {
        // parse the raw headers into messages
        for( var i in rawHeaders ) {
            parseHeader(rawHeaders[i].name.toLowerCase(), rawHeaders[i].value);
        }
    
        // empty any remaining buffers in case protocol header was last
        if(protocolBuffers) {
            UTIL.forEach(protocolBuffers, function(item) {
                if(protocols[item[0]]) {
                    if(typeof buffers[item[0]] == "undefined") {
                        buffers[item[0]] = {};
                    }
                    if(typeof receivers[item[0]] == "undefined") {
                        receivers[item[0]] = {};
                    }
                    if(typeof senders[item[0]] == "undefined") {
                        senders[item[0]] = {};
                    }
                    if(typeof messages[item[0]] == "undefined") {
                        messages[item[0]] = {};
                    }
                    item[1].forEach(function(info) {
                        protocols[item[0]].parse(buffers[item[0]], receivers[item[0]], senders[item[0]], messages[item[0]], info[0], info[1]);
                    });
                    delete protocolBuffers[item[0]];
                }
            });
        }
    } catch(e) {
//        dump("Error parsing raw data: " + e);
        // clean up no matter what - a try/catch wrapper above this needs to recover from this properly
        parsing = false;
        buffers = {};
        protocols = {};
        receivers = {};
        senders = {};
        messages = {};
        console.error("Error parsing raw data", e);
        if (self.onError) {
            self.onError(e);
        } else {
            throw e;
        }
    }

    // deliver the messages to the appropriate receivers
    var deliveries = [];
    var messageCount = 0;
    for( var protocolId in protocols ) {

        for( var receiverKey in messages[protocolId] ) {

            // sort messages by index
            messages[protocolId][receiverKey].sort(function(a, b) {
                if(parseInt(a[0])>parseInt(b[0])) return 1;
                if(parseInt(a[0])<parseInt(b[0])) return -1;
                return 0;
            });

            // determine receiver
            var receiverId = receivers[protocolId][receiverKey];
            // fetch receivers that support ID
            var targetReceivers = [];
            for( var i=0 ; i<this.receivers.length ; i++ ) {
                if(this.receivers[i].hasId(receiverId)) {
                    if(this.receivers[i]["onMessageGroupStart"]) {
                        this.receivers[i].onMessageGroupStart(context);
                    }
                    targetReceivers.push(this.receivers[i]);
                }
            }
            
            messageCount += messages[protocolId][receiverKey].length;
            
            if(targetReceivers.length>0) {
                for( var j=0 ; j<messages[protocolId][receiverKey].length ; j++ ) {
                    // re-write sender and receiver keys to IDs
                    messages[protocolId][receiverKey][j][1].setSender(senders[protocolId][receiverKey+":"+messages[protocolId][receiverKey][j][1].getSender()]);
                    messages[protocolId][receiverKey][j][1].setReceiver(receiverId);
                    for( var k=0 ; k<targetReceivers.length ; k++ ) {
                        deliveries.push([targetReceivers[k], messages[protocolId][receiverKey][j][1]]);
                    }
                }
                for( var k=0 ; k<targetReceivers.length ; k++ ) {
                    if(targetReceivers[k]["onMessageGroupEnd"]) {
                        targetReceivers[k].onMessageGroupEnd(context);
                    }
                }
                if (options.enableContinuousParsing)
                    delete messages[protocolId][receiverKey];
            } else
            if(this.noReceiverCallback) {
                this.noReceiverCallback(receiverId);
            }
        }
    }

    if (options.enableContinuousParsing)
    {
        // TODO: Partial cleanup here or above for things we do not need any more
    }
    else
    {
        // cleanup - does this help with gc?
        buffers = {};
        protocols = {};
        receivers = {};
        senders = {};
        messages = {};
    }

    parsing = false;

    var onMessageReceivedOptions;

    deliveries.forEach(function(delivery)
    {
        try {
            onMessageReceivedOptions = delivery[0].onMessageReceived(context, delivery[1]);
        } catch(e) {
            console.error("Error delivering message: " + e, e.stack);
            if (self.onError) {
                self.onError(e);
            } else {
                throw e;
            }
        }
        if(onMessageReceivedOptions) {
            if(onMessageReceivedOptions.skipChannelClose) {
                options.skipChannelClose = true;
            }
        }
    });

    if(!options.skipChannelClose) {
        this.close(context);
    }

    return messageCount;

 
    function parseHeader(name, value)
    {
        if (name.substr(0, self.HEADER_PREFIX.length) == self.HEADER_PREFIX) {
            if (name.substring(0,self.HEADER_PREFIX.length + 9) == self.HEADER_PREFIX + 'protocol-') {
                var id = parseInt(name.substr(self.HEADER_PREFIX.length + 9));
                protocols[id] = PROTOCOL.factory(value);
            } else {
                var index = name.indexOf('-',self.HEADER_PREFIX.length);
                var id = parseInt(name.substr(self.HEADER_PREFIX.length,index-self.HEADER_PREFIX.length));

                if(protocols[id]) {

                    if(typeof buffers[id] == "undefined") {
                        buffers[id] = {};
                    }
                    if(typeof receivers[id] == "undefined") {
                        receivers[id] = {};
                    }
                    if(typeof senders[id] == "undefined") {
                        senders[id] = {};
                    }
                    if(typeof messages[id] == "undefined") {
                        messages[id] = {};
                    }

                    if(protocolBuffers[id]) {
                        protocolBuffers[id].forEach(function(info) {
                            protocols[id].parse(buffers[id], receivers[id], senders[id], messages[id], info[0], info[1]);
                        });
                        delete protocolBuffers[id];
                    }
                    protocols[id].parse(buffers[id], receivers[id], senders[id], messages[id], name.substr(index+1), value);
                } else {
                    if(!protocolBuffers[id]) {
                        protocolBuffers[id] = [];
                    }
                    protocolBuffers[id].push([name.substr(index+1), value]);
                }
            }
        }
    }
    
    function text_header_to_object(text) {
        // trim escape sequences \[...m
//        text = text.replace(/\x1B\x5B[^\x6D]*\x6D/g, "");

        if (Array.isArray(text)) {
            text = text.join("\n");
        }

        if(text.charCodeAt(0)==27 && text.charCodeAt(3)==109) {
            text = text.substring(4);
        }
        
        var headers = [];
        var lines = text.replace().split("\n");

        var expression = new RegExp("^.{0,2}("+self.HEADER_PREFIX+"[^:]*): (.*)$", "i");
        var m, offset, len, fuzzy = false;

        for( var i=0 ; i<lines.length ; i++ ) {
            if (lines[i])
            {
                if(m = expression.exec(lines[i])) {
                    if (m[1].toLowerCase() === "x-request-id")
                        context.id = m[2];

                    headers.push({
                        "name": m[1],
                        // prefixing value with '~' indicates approximate message length matching
                        // the message length has changed due to the newlines being replaced with &!10;
                        "value": m[2]
                    });
                }
            }
        }

        // This fudges lines together that should not have been split.
        // This happens if the payload inadvertantly included newline characters that
        // were not encoded with &!10;
/*
        for( var i=0 ; i<lines.length ; i++ ) {
            if (lines[i])
            {
                offset = lines[i].indexOf(self.HEADER_PREFIX);
                if (offset >=0 && offset <=3)
                {
                    len = lines[i].length;
                    if (i+1 == lines.length) offset = 0;
                    else offset = lines[i+1].indexOf(self.HEADER_PREFIX);
                    if (
                        (offset >=0 && offset <=3) ||
                        lines[i].charAt(len-1) === "|" ||
                        (lines[i].charAt(len-2) === "|" && lines[i].charAt(len-1) === "\\")
                    )
                    {
                        if(m = expression.exec(lines[i])) {
                            headers.push({
                                "name": m[1],
                                // prefixing value with '~' indicates approximate message length matching
                                // the message length has changed due to the newlines being replaced with &!10;
                                "value": ((true || fuzzy)?"~":"") + m[2]
                            });
                            fuzzy = false;
                        }
                    }
                    else
                    {
                        lines[i] = lines[i] + "&!10;" + lines[i+1];
                        lines.splice(i+1, 1);
                        i--;
                        fuzzy = true;
                    }
                } else
                if(m = expression.exec(lines[i])) {
                    headers.push({
                        "name": m[1],
                        "value": m[2]
                    });
                    fuzzy = false;
                }
            }
        }
*/
        return headers;
    }
}

Channel.prototype.setTransport = function(transport) {
    this.transport = transport;
}


},{"./protocol":8,"./transport":11,"fp-modules-for-nodejs/lib/util":21}],5:[function(require,module,exports){

var CHANNEL = require("../channel"),
    UTIL = require("fp-modules-for-nodejs/lib/util"),
    HTTP_CLIENT = require("fp-modules-for-nodejs/lib/http-client"),
    JSON = require("fp-modules-for-nodejs/lib/json");

// TODO: Make this configurable
var HOST = "localhost";
var PORT = 8099;

const HEADER_PREFIX = 'x-wf-';

var HttpClientChannel = exports.HttpClientChannel = function () {
    if (!(this instanceof exports.HttpClientChannel))
        return new exports.HttpClientChannel();

    this.__construct();

    this.HEADER_PREFIX = HEADER_PREFIX;
}

HttpClientChannel.prototype = CHANNEL.Channel();

HttpClientChannel.prototype.flush = function(applicator, bypassTransport)
{
    var self = this;
    if (typeof applicator === "undefined")
    {
        var parts = {};

        applicator = {
            setMessagePart: function(key, value)
            {
                parts[key] = value;
            },
            getMessagePart: function(key)
            {
                if (typeof parts[key] === "undefined")
                    return null;
                return parts[key];
            },
            flush: function(clannel)
            {
                if (UTIL.len(parts)==0)
                    return false;

                var data = [];
                UTIL.forEach(parts, function(part)
                {
                    data.push(part[0] + ": " + part[1]);
                });
                data = data.join("\n");

                HTTP_CLIENT.request({
                    host: HOST,
                    port: PORT,
                    path: "/wildfire-server",
                    method: "POST",
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        "content-length": data.length,
                        "connection": "close"
                    },
                    data: data
                }, function(response)
                {
                    if (response.status == 200)
                    {
                        try {
                            var data = JSON.decode(response.data);
                            if (data.success === true)
                            {
                                // success!!
                            }
                            else
                                console.error("ERROR Got error from wildfire server: " + data.error);                    
                        } catch(e) {
                            console.error("ERROR parsing JSON response from wildfire server (error: " + e + "): " + response.data);                    
                        }
                    }
                    else
                        console.error("ERROR from wildfire server (status: " + response.status + "): " + response.data);                    
                }, function(e)
                {
                    if (!/ECONNREFUSED/.test(e))
                        console.error("ERROR sending message to wildfire server: " + e);                    
//                    else
//                        module.print("\0red([Wildfire: Not Connected]\0)\n");                    
                });
                return true;
            }
        };
    }
    return self._flush(applicator);
}

},{"../channel":4,"fp-modules-for-nodejs/lib/http-client":14,"fp-modules-for-nodejs/lib/json":15,"fp-modules-for-nodejs/lib/util":21}],6:[function(require,module,exports){

var Dispatcher = exports.Dispatcher = function () {
    if (!(this instanceof exports.Dispatcher))
        return new exports.Dispatcher();
    this.channel = null;
}

Dispatcher.prototype.setChannel = function(channel) {
    return this._setChannel(channel);
}

Dispatcher.prototype._setChannel = function(channel) {
    this.channel = channel;
}

Dispatcher.prototype.setProtocol = function(protocol) {
    this.protocol = protocol;
}

Dispatcher.prototype.setSender = function(sender) {
    this.sender = sender;
}

Dispatcher.prototype.setReceiver = function(receiver) {
    this.receiver = receiver;
}

Dispatcher.prototype.dispatch = function(message, bypassReceivers) {
    return this._dispatch(message, bypassReceivers);
}
    
Dispatcher.prototype._dispatch = function(message, bypassReceivers) {
    if(!message.getProtocol()) message.setProtocol(this.protocol);
    if(!message.getSender()) message.setSender(this.sender);
    if(!message.getReceiver()) message.setReceiver(this.receiver);
    this.channel.enqueueOutgoing(message, bypassReceivers);
}

},{}],7:[function(require,module,exports){

var Message = exports.Message = function (dispatcher) {
    if (!(this instanceof exports.Message))
        return new exports.Message(dispatcher);
    
    this.meta = null;
    this.data = null;

    var self = this;
    self.dispatch = function() {
        if(!dispatcher) {
            throw new Error("dispatcher not set");
        }
        return dispatcher.dispatch(self);
    }
}

Message.prototype.setProtocol = function(protocol) {
    this.protocol = protocol;
}

Message.prototype.getProtocol = function() {
    return this.protocol;
}

Message.prototype.setSender = function(sender) {
    this.sender = sender;
}

Message.prototype.getSender = function() {
    return this.sender;
}

Message.prototype.setReceiver = function(receiver) {
    this.receiver = receiver;
}

Message.prototype.getReceiver = function() {
    return this.receiver;
}

Message.prototype.setMeta = function(meta) {
    this.meta = meta;
}

Message.prototype.getMeta = function() {
    return this.meta;
}

Message.prototype.setData = function(data) {
    this.data = data;
}

Message.prototype.getData = function() {
    return this.data;
}

},{}],8:[function(require,module,exports){

var MESSAGE = require("./message");
var JSON = require("fp-modules-for-nodejs/lib/json");
var UTIL = require("fp-modules-for-nodejs/lib/util");

// Tolerance within which messages must match the declared length
// This is used to compensate for length differences when messages are put back together
// because of newlines that were not encoded by sender
const FUZZY_MESSAGE_LENGTH_TOLERANCE = 200;

var instances = {};
var protocols = {};

exports.factory = function(uri) {
    if(instances[uri]) {
        return instances[uri];
    }
    if(protocols[uri]) {
        return (instances[uri] = protocols[uri](uri));
    }
    return null;
}


protocols["http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0"] =
protocols["__TEST__"] = function(uri) {

    return {
        parse: function(buffers, receivers, senders, messages, key, value) {

            var parts = key.split('-');
            // parts[0] - receiver
            // parts[1] - sender
            // parts[2] - message id/index

            if(parts[0]=='index') {
                // ignore the index header
                return;
            } else
            if(parts[1]=='receiver') {
                receivers[parts[0]] = value;
                return;
            } else
            if(parts[2]=='sender') {
                senders[parts[0] + ':' + parts[1]] = value;
                return;
            }

            // 62|...|\
            // @previous Did not allow for '|' in meta or data
            // @  var m = value.match(/^(\d*)?\|(.*)\|(\\)?$/);
            // @  if(!m) throw new Error("Error parsing message: " + value);
            var m = [], i, j;
            // TIP: fuzzy matching is not currently used
            m.push((value.charAt(0)=="~")?true:false);
            i = value.indexOf("|");
            // TODO: Check for \ before | and skip to next if present
    if (value.charAt(i-1) === "\\")
        throw new Error("Found \\ before |! in module " + module.id);
            m.push(value.substring((m[0])?1:0, i));
            if (value.charAt(value.length-1) === "|") {    // end in |
                m.push(value.substring(i+1, value.length-1));
                m.push("");
            } else if (value.charAt(value.length-1) === "\\") {    // end in |\ (i.e. a continuation)
                m.push(value.substring(i+1, value.length-2));
                m.push("\\");
            } else throw new Error("Error parsing for trailing '|' in message part: " + value);

//            m[2] = m[2].replace(/\\{2}/g, "\\");

            // length present and message matches length - complete message
            if(m[1] &&
               (
                 (m[0] && Math.abs(m[1]-m[2].length)<FUZZY_MESSAGE_LENGTH_TOLERANCE ) ||
                 (!m[0] && m[1]==m[2].length)
               ) && !m[3]) {
                enqueueMessage(parts[2], parts[0], parts[1], m[2]);
            } else
            // message continuation present - message part
            if( m[3] ) {
                enqueueBuffer(parts[2], parts[0], parts[1], m[2], (m[1])?'first':'part', m[1], m[0]);
            } else
            // no length and no message continuation - last message part
            if( !m[1] && !m[3] ) {
                enqueueBuffer(parts[2], parts[0], parts[1], m[2], 'last', void 0, m[0]);
            } else {
                throw new Error('Error parsing message: ' + value);
            }

            // this supports message parts arriving in any order as fast as possible
            function enqueueBuffer(index, receiver, sender, value, position, length, fuzzy) {
                if(!buffers[receiver]) {
                    buffers[receiver] = {"firsts": 0, "lasts": 0, "messages": []};
                }
                if(position=="first") buffers[receiver].firsts += 1;
                else if(position=="last") buffers[receiver].lasts += 1;
                buffers[receiver].messages.push([index, value, position, length, fuzzy]);

                // if we have a mathching number of first and last parts we assume we have
                // a complete message so we try and join it
                if(buffers[receiver].firsts>0 && buffers[receiver].firsts==buffers[receiver].lasts) {
                    // first we sort all messages
                    buffers[receiver].messages.sort(
                        function (a, b) {
                            return a[0] - b[0];
                        }
                    );
                    // find the first "first" part and start collecting parts
                    // until "last" is found
                    var startIndex = null;
                    var buffer = null;
                    fuzzy = false;
                    for( i=0 ; i<buffers[receiver].messages.length ; i++ ) {
                        if(buffers[receiver].messages[i][4])
                            fuzzy = true;
                        if(buffers[receiver].messages[i][2]=="first") {
                            startIndex = i;
                            buffer = buffers[receiver].messages[i][1];
                        } else
                        if(startIndex!==null) {
                            buffer += buffers[receiver].messages[i][1];
                            if(buffers[receiver].messages[i][2]=="last") {
                                // if our buffer matches the message length
                                // we have a complete message
                                if(
                                     (fuzzy && Math.abs(buffers[receiver].messages[startIndex][3]-buffer.length)<FUZZY_MESSAGE_LENGTH_TOLERANCE ) ||
                                     (!fuzzy && buffer.length==buffers[receiver].messages[startIndex][3])
                                ) {
                                    // message is complete
                                    enqueueMessage(buffers[receiver].messages[startIndex][0], receiver, sender, buffer);
                                    buffers[receiver].messages.splice(startIndex, i-startIndex+1);
                                    buffers[receiver].firsts -= 1;
                                    buffers[receiver].lasts -= 1;
                                    startIndex = null;
                                    buffer = null;
                                    fuzzy = false;
                                } else {
                                    // message is not complete
                                }
                            }
                        }
                    }
                }
            }

            function enqueueMessage(index, receiver, sender, value) {

                if(!messages[receiver]) {
                    messages[receiver] = [];
                }

                // Split "...\|...|...|.......
                // by ------------^
                var m = [ value ], i = 0;
                while(true) {
                    i = value.indexOf("|", i);
                    if (i===-1) throw new Error("Error parsing for '|' in message part: " + value);
                    if (value.charAt(i-1) != "\\") break;
                }
                m.push(value.substring(0, i));
                m.push(value.substring(i+1, value.length));

                var message = MESSAGE.Message();
                message.setReceiver(receiver);
                message.setSender(sender);
                // @previous
                // @  message.setMeta((m[1])?m[1].replace(/&#124;/g, "|").replace(/&#10;/g, "\n"):null);
                // @  message.setData(m[2].replace(/&#124;/g, "|").replace(/&#10;/g, "\n"));
                message.setMeta((m[1])?m[1].replace(/\\\|/g, "|").replace(/&!10;/g, "\n"):null);
                message.setData(m[2].replace(/&!10;/g, "\\n"));
                message.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');

                messages[receiver].push([index, message]);
            }
        },

        encodeMessage: function(options, message) {

            var protocol_id = message.getProtocol();
            if(!protocol_id) {
                throw new Error("Protocol not set for message");
            }
            var receiver_id = message.getReceiver();
            if(!receiver_id) {
                throw new Error("Receiver not set for message");
            }
            var sender_id = message.getSender();
            if(!sender_id) {
                throw new Error("Sender not set for message");
            }

            var headers = [];

            var meta = message.getMeta();
            if(!meta)
                meta = "";

            var data = message.getData() || "";
            if (typeof data != "string")
                throw new Error("Data in wildfire message is not a string!");

            data = meta.replace(/\|/g, "\\|").replace(/\n|\u000a|\\u000a/g, "&!10;") + '|' + data.replace(/\n|\u000a|\\u000a/g, "&!10;");
//            var data = meta.replace(/\|/g, "&#124;").replace(/\n|\u000a/g, "&#10;") + '|' + message.getData().replace(/\|/g, "&#124;").replace(/\n|\u000a/g, "&#10;");

            var parts = chunk_split(data, options.messagePartMaxLength);

            var part,
                msg;

            for( var i=0 ; i<parts.length ; i++) {
                if (part = parts[i]) {
                    msg = "";

                    // escape backslashes
                    // NOTE: This should probably be done during JSON encoding to ensure we do not double-escape
                    //       with different encoders, but not sure how different encoders behave yet.
//                    part = part.replace(/\\/g, "\\\\");

                    if (parts.length>1) {
                        msg = ((i==0)?data.length:'') +
                              '|' + part + '|' +
                              ((i<parts.length-1)?"\\":"");
                    } else {
                        msg = part.length + '|' + part + '|';
                    }

                    headers.push([
                        protocol_id,
                        receiver_id,
                        sender_id,
                        msg
                    ]);
                }
            }
            return headers;
        },

        encodeKey: function(util, receiverId, senderId) {

            if(!util["protocols"]) util["protocols"] = {};
            if(!util["messageIndexes"]) util["messageIndexes"] = {};
            if(!util["receivers"]) util["receivers"] = {};
            if(!util["senders"]) util["senders"] = {};

            var protocol = getProtocolIndex(uri);
            var messageIndex = getMessageIndex(protocol);
            var receiver = getReceiverIndex(protocol, receiverId);
            var sender = getSenderIndex(protocol, receiver, senderId);

            return util.HEADER_PREFIX + protocol + "-" + receiver + "-" + sender + "-" + messageIndex;

            function getProtocolIndex(protocolId) {
                if(util["protocols"][protocolId]) return util["protocols"][protocolId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + "protocol-" + i);
                    if(!value) {
                        util["protocols"][protocolId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + "protocol-" + i, protocolId);
                        return i;
                    } else
                    if(value==protocolId) {
                        util["protocols"][protocolId] = i;
                        return i;
                    }
                }
            }

            function getMessageIndex(protocolIndex) {
                var value = util["messageIndexes"][protocolIndex] || util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-index");
                if(!value) {
                    value = 0;
                }
                value++;
                util["messageIndexes"][protocolIndex] = value;
                util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-index", value);
                return value;
            }

            function getReceiverIndex(protocolIndex, receiverId) {
                if(util["receivers"][protocolIndex + ":" + receiverId]) return util["receivers"][protocolIndex + ":" + receiverId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + i + "-receiver");
                    if(!value) {
                        util["receivers"][protocolIndex + ":" + receiverId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + i + "-receiver", receiverId);
                        return i;
                    } else
                    if(value==receiverId) {
                        util["receivers"][protocolIndex + ":" + receiverId] = i;
                        return i;
                    }
                }
            }

            function getSenderIndex(protocolIndex, receiverIndex, senderId) {
                if(util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId]) return util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + receiverIndex + "-" + i + "-sender");
                    if(!value) {
                        util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + receiverIndex + "-" + i + "-sender", senderId);
                        return i;
                    } else
                    if(value==senderId) {
                        util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId] = i;
                        return i;
                    }
                }
            }
        }
    };
};


// @see http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/json-stream/0.2.0
protocols["http://meta.wildfirehq.org/Protocol/JsonStream/0.2"] = function(uri) {

    var groupStack = [];
    var groupIndex = 0;

    return {
        parse: function(buffers, receivers, senders, messages, key, value) {

            var parts = key.split('-');
            // parts[0] - receiver
            // parts[1] - sender
            // parts[2] - message id/index

            if(parts[0]=='index') {
                // ignore the index header
                return;
            } else
            if(parts[0]=='structure') {
/*
                if(value=="http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1") {
                    value = "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/page/0";
                } else
                if(value=="http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1") {
                    value = "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/page/0";
//                    value = "http://pinf.org/cadorn.org/fireconsole/meta/Receiver/NetServer/0.1"
                }
*/
                receivers[parts[1]] = value;

                // NOTE: The old protocol specifies senders independent from receivers so we need to add senders for every receiver if senders are already known
                if(UTIL.len(senders)>0) {
                    var newSenders = {};
                    for( var senderKey in senders ) {
                        var senderParts = senderKey.split(":");
                        newSenders[parts[1] + ":" + senderParts[1]] = senders[senderKey];
                    }
                    UTIL.complete(senders, newSenders);
                }
                return;
            } else
            if(parts[0]=='plugin') {

                // NOTE: The old protocol specifies senders independent from receivers so we need to add senders for every receiver
                //       If no receiver is known yet we assume a receiver key of "1"
                if(UTIL.len(receivers)==0) {
                    senders["1" + ":" + parts[1]] = value;
                } else {
                    for( var receiverKey in receivers ) {
                        senders[receiverKey + ":" + parts[1]] = value;
                    }
                }
                return;
            }

            // 62|...|\
            var m = value.match(/^(\d*)?\|(.*)\|(\\)?$/);
            if(!m) {
                throw new Error("Error parsing message: " + value);
            }

            // length present and message matches length - complete message
            if (m[1] && m[1] == m[2].length && !m[3]) {
                enqueueMessage(parts[2], parts[0], parts[1], m[2]);
            } else
            // message continuation present - message part
            if( m[3] ) {
                enqueueBuffer(parts[2], parts[0], parts[1], m[2], (m[1])?'first':'part', m[1]);
            } else
            // no length and no message continuation - last message part
            if( !m[1] && !m[3] ) {
                enqueueBuffer(parts[2], parts[0], parts[1], m[2], 'last');
            } else {
                console.error("m", m);
                console.error("m[1]", m[1]);
                console.error("m[2].length", m[2].length);
                throw new Error('Error parsing message parts: ' + value);
            }

            // this supports message parts arriving in any order as fast as possible
            function enqueueBuffer(index, receiver, sender, value, position, length) {
                if(!buffers[receiver]) {
                    buffers[receiver] = {"firsts": 0, "lasts": 0, "messages": []};
                }
                if(position=="first") buffers[receiver].firsts += 1;
                else if(position=="last") buffers[receiver].lasts += 1;
                buffers[receiver].messages.push([index, value, position, length]);

                // if we have a mathching number of first and last parts we assume we have
                // a complete message so we try and join it
                if(buffers[receiver].firsts>0 && buffers[receiver].firsts==buffers[receiver].lasts) {
                    // first we sort all messages
                    buffers[receiver].messages.sort(
                        function (a, b) {
                            return a[0] - b[0];
                        }
                    );
                    // find the first "first" part and start collecting parts
                    // until "last" is found
                    var startIndex = null;
                    var buffer = null;
                    for( i=0 ; i<buffers[receiver].messages.length ; i++ ) {
                        if(buffers[receiver].messages[i][2]=="first") {
                            startIndex = i;
                            buffer = buffers[receiver].messages[i][1];
                        } else
                        if(startIndex!==null) {
                            buffer += buffers[receiver].messages[i][1];
                            if(buffers[receiver].messages[i][2]=="last") {
                                // if our buffer matches the message length
                                // we have a complete message
                                if(buffer.length==buffers[receiver].messages[startIndex][3]) {
                                    // message is complete
                                    enqueueMessage(buffers[receiver].messages[startIndex][0], receiver, sender, buffer);
                                    buffers[receiver].messages.splice(startIndex, i-startIndex);
                                    buffers[receiver].firsts -= 1;
                                    buffers[receiver].lasts -= 1;
                                    if(buffers[receiver].messages.length==0) delete buffers[receiver];
                                    startIndex = null;
                                    buffer = null;
                                } else {
                                    // message is not complete
                                }
                            }
                        }
                    }
                }
            }

            function enqueueMessage(index, receiver, sender, value) {

                if(!messages[receiver]) {
                    messages[receiver] = [];
                }

                var meta = {
                        "msg.preprocessor": "FirePHPCoreCompatibility",
                        "target": "console",
                        "lang.id": "registry.pinf.org/cadorn.org/github/renderers/packages/php/master"
                    },
                    data,
                    parts;

                try {
                    parts = JSON.decode(value);
                } catch(e) {
                    console.error("Error parsing JsonStream message", e, value);
                    throw e;
                }

                // console
                if(UTIL.isArrayLike(parts) && parts.length==2 &&
                    (typeof parts[0] == "object") && UTIL.has(parts[0], "Type")) {

                    data = parts[1];

                    for( var name in parts[0] ) {
                        if(name=="Type") {

                            if(groupStack.length>0) {
                                meta["group"] = groupStack[groupStack.length-1];
                            }

                            switch(parts[0][name]) {
                                case "LOG":
                                    meta["priority"] = "log";
                                    break;
                                case "INFO":
                                    meta["priority"] = "info";
                                    break;
                                case "WARN":
                                    meta["priority"] = "warn";
                                    break;
                                case "ERROR":
                                    meta["priority"] = "error";
                                    break;
                                case "EXCEPTION":
                                    var originalData = data;
                                    data = {
                                        "__className": originalData.Class,
                                        "__isException": true,
                                        "protected:message": originalData.Message,
                                        "protected:file": originalData.File,
                                        "protected:line": originalData.Line,
                                        "private:trace": originalData.Trace
                                    }
                                    if (data["private:trace"] && data["private:trace"].length > 0) {
                                        if (data["private:trace"][0].file != originalData.File || data["private:trace"][0].line != originalData.Line) {
                                            data["private:trace"].unshift({
                                               "class": originalData.Class || "",
                                                "type": originalData.Type || "",
                                                "function": originalData.Function || "",
                                                "file": originalData.File || "",
                                                "line": originalData.Line || "",
                                                "args": originalData.Args || ""
                                            });
                                        }
                                    }
                                    meta["priority"] = "error";
                                    break;
                                case "TRACE":
                                    meta["renderer"] = "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/trace";
                                    var trace = [
                                        {
                                            "class": data.Class || "",
                                            "type": data.Type || "",
                                            "function": data.Function || "",
                                            "file": data.File || "",
                                            "line": data.Line || "",
                                            "args": data.Args || ""
                                        }
                                    ];
                                    if(data.Trace) {
                                        trace = trace.concat(data.Trace);
                                    }
                                    data = {
                                        "title": data.Message,
                                        "trace": trace
                                    };
                                    break;
                                case "TABLE":
                                    meta["renderer"] = "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table";
                                    data = {"data": data};
                                    if(data.data.length==2 && typeof data.data[0] == "string") {
                                        data.header = data.data[1].splice(0,1)[0];
                                        data.title = data.data[0];
                                        data.data = data.data[1];
                                    } else {
                                        data.header = data.data.splice(0,1)[0];
                                    }
                                    break;
                                case "GROUP_START":
                                    groupIndex++;
                                    meta["group.start"] = true;
                                    meta["group"] = "group-" + groupIndex;
                                    groupStack.push("group-" + groupIndex);
                                    break;
                                case "GROUP_END":
                                    meta["group.end"] = true;
                                    if(groupStack.length>0) {
                                        groupStack.pop();
                                    }
                                    break;
                                default:
                                    throw new Error("Log type '" + parts[0][name] + "' not implemented");
                                    break;
                            }
                        } else
                        if(name=="Label") {
                            meta["label"] = parts[0][name];
                        } else
                        if(name=="File") {
                            meta["file"] = parts[0][name];
                        } else
                        if(name=="Line") {
                            meta["line"] = parts[0][name];
                        } else
                        if(name=="Collapsed") {
                            meta[".collapsed"] = (parts[0][name]=='true')?true:false;
//                        } else
//                        if(name=="Color") {
//                            meta["fc.group.color"] = parts[0][name];
                        }
                    }
                } else
                // dump
                {
                    data = parts;
                    meta["label"] = "Dump";
                }

                if(meta["renderer"] == "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table") {
                    if(meta["label"]) {
                        data.title = meta["label"];
                        delete meta["label"];
                    }
                } else
                if(meta["group.start"]) {
                    meta["group.title"] = meta["label"];
                    delete meta["label"];
                    if(typeof meta[".collapsed"] == "undefined" || !meta[".collapsed"]) {
                        meta["group.expand"] = meta["group"];
                    }
                    delete meta[".collapsed"];
                }

                var message = MESSAGE.Message();
                message.setReceiver(receiver);
                message.setSender(sender);

                try {
                    message.setMeta(JSON.encode(meta));
                } catch(e) {
                    console.error("Error encoding object (JsonStream compatibility)", e, meta);
                    throw e;
                }

                try {
                    message.setData(JSON.encode(data));
                } catch(e) {
                    console.error("Error encoding object (JsonStream compatibility)", e, data);
                    throw e;
                }

                messages[receiver].push([index, message]);
            }
        },

        encodeMessage: function(options, message) {
            throw new Error("Not implemented!");
        },

        encodeKey: function(util, receiverId, senderId) {
            throw new Error("Not implemented!");
        }
    };
};



protocols["http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/announce/0.1.0"] = function(uri) {

    return {
        parse: function(buffers, receivers, senders, messages, key, value) {

            var parts = key.split('-');
            // parts[0] - message id/index

            if(parts[0]=='index') {
                // ignore the index header
                return;
            }

            // 62|...|\
            var m = value.match(/^(\d*)?\|(.*)\|(\\)?$/);
            if(!m) {
                throw new Error("Error parsing message: " + value);
            }

            // length present and message matches length - complete message
            if(m[1] && m[1]==m[2].length && !m[3]) {
                enqueueMessage(key, m[2]);
            } else
            // message continuation present - message part
            if( m[3] ) {
                enqueueBuffer(key, m[2], (m[1])?'first':'part', m[1]);
            } else
            // no length and no message continuation - last message part
            if( !m[1] && !m[3] ) {
                enqueueBuffer(key, m[2], 'last');
            } else {
                throw new Error('Error parsing message: ' + value);
            }

            // this supports message parts arriving in any order as fast as possible
            function enqueueBuffer(index, value, position, length) {

                receiver = "*";
                if(!buffers[receiver]) {
                    buffers[receiver] = {"firsts": 0, "lasts": 0, "messages": []};
                }
                if(position=="first") buffers[receiver].firsts += 1;
                else if(position=="last") buffers[receiver].lasts += 1;
                buffers[receiver].messages.push([index, value, position, length]);

                // if we have a mathching number of first and last parts we assume we have
                // a complete message so we try and join it
                if(buffers[receiver].firsts>0 && buffers[receiver].firsts==buffers[receiver].lasts) {
                    // first we sort all messages
                    buffers[receiver].messages.sort(
                        function (a, b) {
                            return a[0] - b[0];
                        }
                    );
                    // find the first "first" part and start collecting parts
                    // until "last" is found
                    var startIndex = null;
                    var buffer = null;
                    for( i=0 ; i<buffers[receiver].messages.length ; i++ ) {
                        if(buffers[receiver].messages[i][2]=="first") {
                            startIndex = i;
                            buffer = buffers[receiver].messages[i][1];
                        } else
                        if(startIndex!==null) {
                            buffer += buffers[receiver].messages[i][1];
                            if(buffers[receiver].messages[i][2]=="last") {
                                // if our buffer matches the message length
                                // we have a complete message
                                if(buffer.length==buffers[receiver].messages[startIndex][3]) {
                                    // message is complete
                                    enqueueMessage(buffers[receiver].messages[startIndex][0], buffer);
                                    buffers[receiver].messages.splice(startIndex, i-startIndex);
                                    buffers[receiver].firsts -= 1;
                                    buffers[receiver].lasts -= 1;
                                    if(buffers[receiver].messages.length==0) delete buffers[receiver];
                                    startIndex = null;
                                    buffer = null;
                                } else {
                                    // message is not complete
                                }
                            }
                        }
                    }
                }
            }

            function enqueueMessage(index, value) {

                receiver = "*";

                if(!messages[receiver]) {
                    messages[receiver] = [];
                }

                var m = /^(.*?[^\\])?\|(.*)$/.exec(value);

                var message = MESSAGE.Message();
                message.setReceiver(receiver);
                message.setMeta(m[1] || null);
                message.setData(m[2]);

                messages[receiver].push([index, message]);
            }
        },

        encodeMessage: function(options, message) {

            var protocol_id = message.getProtocol();
            if(!protocol_id) {
                throw new Error("Protocol not set for message");
            }

            var headers = [];

            var meta = message.getMeta() || "";

            var data = meta.replace(/\|/g, "\\|") + '|' + message.getData().replace(/\|/g, "\\|");

            var parts = chunk_split(data, options.messagePartMaxLength);

            var part,
                msg;
            for( var i=0 ; i<parts.length ; i++) {
                if (part = parts[i]) {

                    msg = "";

                    // escape backslashes
                    // NOTE: This should probably be done during JSON encoding to ensure we do not double-escape
                    //       with different encoders, but not sure how different encoders behave yet.
                    part = part.replace(/\\/g, "\\\\");

                    if (parts.length>2) {
                        msg = ((i==0)?data.length:'') +
                              '|' + part + '|' +
                              ((i<parts.length-2)?"\\":"");
                    } else {
                        msg = part.length + '|' + part + '|';
                    }

                    headers.push([
                        protocol_id,
                        "",
                        "",
                        msg
                    ]);
                }
            }
            return headers;
        },

        encodeKey: function(util) {

            if(!util["protocols"]) util["protocols"] = {};
            if(!util["messageIndexes"]) util["messageIndexes"] = {};

            var protocol = getProtocolIndex(uri);
            var messageIndex = getMessageIndex(protocol);

            return util.HEADER_PREFIX + protocol + "-" + messageIndex;

            function getProtocolIndex(protocolId) {
                if(util["protocols"][protocolId]) return util["protocols"][protocolId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + "protocol-" + i);
                    if(!value) {
                        util["protocols"][protocolId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + "protocol-" + i, protocolId);
                        return i;
                    } else
                    if(value==protocolId) {
                        util["protocols"][protocolId] = i;
                        return i;
                    }
                }
            }

            function getMessageIndex(protocolIndex) {
                var value = util["messageIndexes"][protocolIndex] || util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-index");
                if(!value) {
                    value = 0;
                }
                value++;
                util["messageIndexes"][protocolIndex] = value;
                util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-index", value);
                return value;
            }
        }
    };
};




function chunk_split(value, length) {
    var parts = [];
    var part;
    while( (part = value.substr(0, length)) && part.length > 0 ) {
        parts.push(part);
        value = value.substr(length);
    }
    return parts;
}

},{"./message":7,"fp-modules-for-nodejs/lib/json":15,"fp-modules-for-nodejs/lib/util":21}],9:[function(require,module,exports){

var Receiver = exports.Receiver = function () {
    if (!(this instanceof exports.Receiver))
        return new exports.Receiver();

    this.listeners = [];
    this.ids = [];
}
    
Receiver.prototype.setId = function(id) {
    if(this.ids.length > 0) {
        throw new Error("ID already set for receiver!");
    }
    this.ids.push(id);
}

Receiver.prototype.addId = function(id) {
    this.ids.push(id);
}

/**
 * @deprecated
 */
Receiver.prototype.getId = function() {
    if(this.ids.length > 1) {
        throw new Error("DEPRECATED: Multiple IDs for receiver. Cannot use getId(). Use getIds() instead!");
    }
    return this.ids[0];
}

Receiver.prototype.getIds = function() {
    return this.ids;
}

Receiver.prototype.hasId = function(id) {
    for( var i=0 ; i<this.ids.length ; i++ ) {
        if(this.ids[i]==id) {
            return true;
        }
    }
    return false;
}

Receiver.prototype.onChannelOpen = function(context) {
    this._dispatch("onChannelOpen", [context]);
}

Receiver.prototype.onChannelClose = function(context) {
    this._dispatch("onChannelClose", [context]);
}

Receiver.prototype.onMessageGroupStart = function(context) {
    this._dispatch("onMessageGroupStart", [context]);
}

Receiver.prototype.onMessageGroupEnd = function(context) {
    this._dispatch("onMessageGroupEnd", [context]);
}

Receiver.prototype.onMessageReceived = function(message, context) {
    return this._dispatch("onMessageReceived", [message, context]);
}

Receiver.prototype.addListener = function(listener) {
    this.listeners.push(listener);
}

Receiver.prototype._dispatch = function(event, args) {
    if(this.listeners.length==0) {
        return;
    }
    var returnOptions,
        opt;
    for( var i=0 ; i<this.listeners.length ; i++ ) {
        if(this.listeners[i][event]) {
            opt = this.listeners[i][event].apply(this.listeners[i], args);
            if(opt) {
                if(!returnOptions) {
                    returnOptions = opt;
                } else {
                    for( var key in opt ) {
                        returnOptions[key] = opt[key];
                    }
                }
            }
        }
    }
    return returnOptions;
}

},{}],10:[function(require,module,exports){

var WILDFIRE = require("../wildfire"),
    JSON = require("fp-modules-for-nodejs/lib/json");

var CallbackStream = exports.CallbackStream = function CallbackStream()
{
    if (!(this instanceof exports.CallbackStream))
        return new exports.CallbackStream();
    this.messagesIndex = 1;
    this.messages = {};

    var self = this;

    this.dispatcher = WILDFIRE.Dispatcher();
    // TODO: Use own protocol here
    this.dispatcher.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');


    this.receiver = WILDFIRE.Receiver();
    this.receiveHandler = null;

    this.receiver.addListener({
        onMessageReceived: function(context, message)
        {
            var meta = JSON.decode(message.getMeta());

            if(meta[".action"] == "request")
            {
                self.receiveHandler({
                    meta: meta,
                    data: JSON.decode(message.getData())
                }, function(message)
                {
                    if (!message || typeof message !== "object")
                        throw new Error("Did not get message object for receiveHandler response");
                    if (typeof message.data === "undefined")
                        throw new Error("Message object from receiveHandler response does not include 'data' property.");
                    
                    var msg = WILDFIRE.Message();
                    if (typeof message.meta == "undefined")
                        message.meta = {};

                    message.meta[".callbackid"] = meta[".callbackid"];
                    message.meta[".action"] = "respond";

                    try {
                        msg.setMeta(JSON.encode(message.meta));
                    } catch(e) {
                        console.warn("Error JSON encoding meta", e);
                        throw new Error("Error JSON encoding meta: " + e);
                    }
                    try {
                        msg.setData(JSON.encode(message.data));
                    } catch(e) {
                        console.warn("Error JSON encoding data", e);
                        throw new Error("Error JSON encoding data: " + e);
                    }

                    try {
                        self.dispatcher.dispatch(msg, true);
                    } catch(e) {
                        console.warn("Error dispatching message in " + module.id, e);
                        throw new Error("Error '"+e+"' dispatching message in " + module.id);
                    }
                });
            }
            else
            if(meta[".action"] == "respond")
            {
                if(self.messages["i:" + meta[".callbackid"]])
                {
                    self.messages["i:" + meta[".callbackid"]][1](
                        {
                            meta: meta,
                            data: JSON.decode(message.getData())
                        }
                    );
                    delete self.messages["i:" + meta[".callbackid"]];
                }
            }
            else
                throw new Error("NYI");
        }
    });
}

CallbackStream.prototype.setChannel = function(channel)
{
    this.dispatcher.setChannel(channel);
    channel.addReceiver(this.receiver);
}

CallbackStream.prototype.setHere = function(id)
{
    // TODO: Remove suffix once we use our own protocol for callbacks
    this.receiver.setId(id + "-callback");
    // TODO: Remove suffix once we use our own protocol for callbacks
    this.dispatcher.setSender(id + "-callback");
}

CallbackStream.prototype.setThere = function(id)
{
    // TODO: Remove suffix once we use our own protocol for callbacks
    this.dispatcher.setReceiver(id + "-callback");
}

CallbackStream.prototype.send = function(message, callback)
{
    var msg = WILDFIRE.Message();
    if (typeof message.meta == "undefined")
        message.meta = {};

    message.meta[".callbackid"] = this.messagesIndex;
    message.meta[".action"] = "request";

    msg.setMeta(JSON.encode(message.meta));
    msg.setData(JSON.encode(message.data));

    this.messages["i:" + this.messagesIndex] = [msg, callback];
    this.messagesIndex++;

    this.dispatcher.dispatch(msg, true);
}

CallbackStream.prototype.receive = function(handler)
{
    this.receiveHandler = handler;
}

},{"../wildfire":12,"fp-modules-for-nodejs/lib/json":15}],11:[function(require,module,exports){


const RECEIVER_ID = "http://registry.pinf.org/cadorn.org/wildfire/@meta/receiver/transport/0";

var MD5 = require("fp-modules-for-nodejs/lib/md5");
var STRUCT = require("fp-modules-for-nodejs/lib/struct");
var JSON = require("fp-modules-for-nodejs/lib/json");
//var HTTP = require("http");
var MESSAGE = require("./message");
var RECEIVER = require("./receiver");


var Transport = exports.Transport = function(options) {
    if (!(this instanceof exports.Transport))
        return new exports.Transport(options);
    this.options = options;
}

Transport.prototype.newApplicator = function(applicator) {
    return Applicator(this, applicator);
}

Transport.prototype.serviceDataRequest = function(key) {
    return require("./wildfire").getBinding().formatResponse({
        "contentType": "text/plain"
    }, this.getData(key));
}

Transport.prototype.getUrl = function(key) {
    return this.options.getUrl(key);
}

Transport.prototype.setData = function(key, value) {
    return this.options.setData(key, value);
}

Transport.prototype.getData = function(key) {
    return this.options.getData(key);
}


var Applicator = function(transport, applicator) {
    if (!(this instanceof Applicator))
        return new Applicator(transport, applicator);
    this.transport = transport;
    this.applicator = applicator;
    this.buffer = {};
}

Applicator.prototype.setMessagePart = function(key, value) {
    this.buffer[key] = value;
}

Applicator.prototype.getMessagePart = function(key) {
    if(!this.buffer[key]) return null;
    return this.buffer[key];
}

Applicator.prototype.flush = function(channel) {

    var data = [];
    var seed = [];

    // combine all message parts into one text block
    for( var key in this.buffer ) {
        data.push(key + ": " + this.buffer[key]);
        if(data.length % 3 == 0 && seed.length < 5) seed.push(this.buffer[key]);
    }
    
    // generate a key for the text block
    var key = STRUCT.bin2hex(MD5.hash(Math.random() + ":" + module.path + ":" + seed.join("")));

    // store the text block for future access
    this.transport.setData(key, data.join("\n"));
    
    // create a pointer message to be sent instead of the original messages
    var message = MESSAGE.Message();
    message.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0');
    message.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js/lib/transport.js');
    message.setReceiver(RECEIVER_ID);
    message.setData(JSON.encode({"url": this.transport.getUrl(key)}));
    
    // send the pointer message through the channel bypassing all transports and local receivers
    channel.enqueueOutgoing(message, true);
    return channel.flush(this.applicator, true);
}

exports.newReceiver = function(channel) {
    var receiver = RECEIVER.Receiver();
    receiver.setId(RECEIVER_ID);
    receiver.addListener({
        onMessageReceived: function(context, message) {
            try {
                context.transporter = RECEIVER_ID;

throw new Error("OOPS!!!");
/*
                // make a sync secondary request
                var data = HTTP.read(JSON.decode(message.getData()).url);
                if(data) {
                    channel.parseReceived(data, context, {
                        "skipChannelOpen": true,
                        "skipChannelClose": true
                    });
                }
*/
            } catch(e) {
                console.warn(e);
            }
        }
    });
    return receiver;
}


},{"./message":7,"./receiver":9,"./wildfire":12,"fp-modules-for-nodejs/lib/json":15,"fp-modules-for-nodejs/lib/md5":16,"fp-modules-for-nodejs/lib/struct":19}],12:[function(require,module,exports){

exports.Receiver = function() {
    return require("./receiver").Receiver();
}

exports.Dispatcher = function() {
    return require("./dispatcher").Dispatcher();
}

exports.Message = function() {
    return require("./message").Message();
}

exports.HttpHeaderChannel = function(options) {
    return require("./channel-httpheader").HttpHeaderChannel(options);
}

exports.HttpClientChannel = function() {
    return require("./channel/http-client").HttpClientChannel();
}

exports.ShellCommandChannel = function() {
    return require("./channel-shellcommand").ShellCommandChannel();
}

exports.PostMessageChannel = function() {
    return require("./channel-postmessage").PostMessageChannel();
}

exports.CallbackStream = function() {
    return require("./stream/callback").CallbackStream();
}

},{"./channel-httpheader":1,"./channel-postmessage":2,"./channel-shellcommand":3,"./channel/http-client":5,"./dispatcher":6,"./message":7,"./receiver":9,"./stream/callback":10}],13:[function(require,module,exports){

/* Binary */
// -- tlrobinson Tom Robinson
// -- gozala Irakli Gozalishvili
// -- tschaub
// -- nrstott Nathan Stott

//var engine = require("./platform/{platform}/binary"),
var engine = require("./platform/node/binary"),
    B_ALLOC = engine.B_ALLOC,
    B_LENGTH = engine.B_LENGTH,
    B_GET = engine.B_GET,
    B_SET = engine.B_SET,
    B_FILL = engine.B_FILL,
    B_COPY = engine.B_COPY,
    B_DECODE = engine.B_DECODE,
    B_ENCODE = engine.B_ENCODE,
    B_DECODE_DEFAULT = engine.B_DECODE_DEFAULT,
    B_ENCODE_DEFAULT = engine.B_ENCODE_DEFAULT,
    B_TRANSCODE = engine.B_TRANSCODE;
    
var Binary = exports.Binary = function() {
    // this._bytes
    // this._offset
    // this._length
};
/*
Object.defineProperty(Binary.prototype, "length", {
    "get": function () {
        return this._length;
    },
    "enumerable": false,
    "configurable": false
});
*/
// toArray() - n array of the byte values
// toArray(charset) - an array of the code points, decoded
Binary.prototype.toArray = function(charset) {
    if (arguments.length === 0) {
        var array = new Array(this._length);
        
        for (var i = 0; i < this._length; i++)
            array[i] = this.get(i);
        
        return array;
    }
    else if (arguments.length === 1) {
        var string = B_DECODE(this._bytes, this._offset, this._length, charset),
            length = string.length,
            array = new Array(length);
        
        for (var i = 0; i < length; i++)
            array[i] = string.charCodeAt(i);
        
        return array;
    }
    else
        throw new Error("Illegal arguments to toArray()");
};

// toByteArray() - just a copy
// toByteArray(sourceCharset, targetCharset) - transcoded
Binary.prototype.toByteArray = function(sourceCodec, targetCodec) {
    if (arguments.length < 2)
        return new ByteArray(this);
    else if (arguments.length === 2 && typeof sourceCodec === "string" && typeof targetCodec === "string") {
        var bytes = B_TRANSCODE(this._bytes, this._offset, this._length, sourceCodec, targetCodec);
        return new ByteArray(bytes, 0, B_LENGTH(bytes));
    }
    
    throw new Error("Illegal arguments to ByteArray toByteArray");
};

// toByteString() - byte for byte copy
// toByteString(sourceCharset, targetCharset) - transcoded
Binary.prototype.toByteString = function(sourceCodec, targetCodec) {
    if (arguments.length < 2)
        return new ByteString(this);
    else if (arguments.length === 2 && typeof sourceCodec === "string" && typeof targetCodec === "string") {
        var bytes = B_TRANSCODE(this._bytes, this._offset, this._length, sourceCodec, targetCodec);
        return new ByteString(bytes, 0, B_LENGTH(bytes));
    }
    
    throw new Error("Illegal arguments to ByteArray toByteString");
};

// decodeToString()
// decodeToString(charset) - returns a String from its decoded bytes in a given charset. If no charset is provided, or if the charset is "undefined", assumes the default system encoding.
// decodeToString(number) - returns a String from its decoded bytes in a given base, like 64, 32, 16, 8, 2
Binary.prototype.decodeToString = function(charset) {
    if (charset) {
        if (typeof charset == "number")
            return require("./base" + charset).encode(this);
        else if (/^base/.test(charset))
            return require(charset).encode(this);
        else
            return B_DECODE(this._bytes, this._offset, this._length, charset);
    }
    return B_DECODE_DEFAULT(this._bytes, this._offset, this._length);
};

// get(offset) - Return the byte at offset as a Number.
Binary.prototype.get = function(offset) {
    if (offset < 0 || offset >= this._length)
        return NaN;
    
    //var b = this._bytes[this._offset + offset];
    //return (b >= 0) ? b : -1 * ((b ^ 0xFF) + 1);
    return B_GET(this._bytes, this._offset + offset)
};

Binary.prototype.indexOf = function(byteValue, start, stop) {
    // HACK: use ByteString's slice since we know we won't be modifying result
    var array = ByteString.prototype.slice.apply(this, [start, stop]).toArray(),
        result = array.indexOf(byteValue);
    return (result < 0) ? -1 : result + (start || 0);
};

Binary.prototype.lastIndexOf = function(byteValue, start, stop) {
    // HACK: use ByteString's slice since we know we won't be modifying result
    var array = ByteString.prototype.slice.apply(this, [start, stop]).toArray(),
        result = array.lastIndexOf(byteValue);
    return (result < 0) ? -1 : result + (start || 0);
};

// valueOf()
Binary.prototype.valueOf = function() {
    return this;
};

/* ByteString */

var ByteString = exports.ByteString = function() {
    if (!(this instanceof ByteString)) {
        if (arguments.length == 0)
            return new ByteString();
        if (arguments.length == 1)
            return new ByteString(arguments[0]);
        if (arguments.length == 2)
            return new ByteString(arguments[0], arguments[1]);
        if (arguments.length == 3)
            return new ByteString(arguments[0], arguments[1], arguments[2]);
    }

    // ByteString() - Construct an empty byte string.
    if (arguments.length === 0) {
        this._bytes     = B_ALLOC(0); // null;
        this._offset    = 0;
        this._length    = 0;
    }
    // ByteString(byteString) - Copies byteString.
    else if (arguments.length === 1 && arguments[0] instanceof ByteString) {
        return arguments[0];
    }
    // ByteString(byteArray) - Use the contents of byteArray.
    else if (arguments.length === 1 && arguments[0] instanceof ByteArray) {
        var copy = arguments[0].toByteArray();
        this._bytes     = copy._bytes;
        this._offset    = copy._offset;
        this._length    = copy._length;
    }
    // ByteString(arrayOfNumbers) - Use the numbers in arrayOfNumbers as the bytes.
    else if (arguments.length === 1 && Array.isArray(arguments[0])) {
        var array = arguments[0];
        this._bytes = B_ALLOC(array.length);
        for (var i = 0; i < array.length; i++) {
            var b = array[i];
            // If any element is outside the range 0...255, an exception (TODO) is thrown.
            if (b < -0x80 || b > 0xFF)
                throw new Error("ByteString constructor argument Array of integers must be -128 - 255 ("+b+")");
            // Java "bytes" are interpreted as 2's complement
            //this._bytes[i] = (b < 128) ? b : -1 * ((b ^ 0xFF) + 1);
            B_SET(this._bytes, i, b);
        }
        this._offset = 0;
        this._length = B_LENGTH(this._bytes);
    }
    // ByteString(string, charset) - Convert a string. The ByteString will contain string encoded with charset.
    else if ((arguments.length === 1 || (arguments.length === 2 && arguments[1] === undefined)) && typeof arguments[0] === "string") {
        this._bytes     = B_ENCODE_DEFAULT(arguments[0]);
        this._offset    = 0;
        this._length    = B_LENGTH(this._bytes);
    }
    else if (arguments.length === 2 && typeof arguments[0] === "string" && typeof arguments[1] === "string") {
        this._bytes     = B_ENCODE(arguments[0], arguments[1]);
        this._offset    = 0;
        this._length    = B_LENGTH(this._bytes);
    }
    // private: ByteString(bytes, offset, length)
    else if (arguments.length === 3 && typeof arguments[1] === "number" && typeof arguments[2] === "number") {
        this._bytes     = arguments[0];
        this._offset    = arguments[1];
        this._length    = arguments[2];
    }
    else {
        var util = require("./util");
        throw new Error("Illegal arguments to ByteString constructor: " + util.repr(arguments));
    }
    
    if (engine.ByteStringWrapper)
        return engine.ByteStringWrapper(this);
    else
        return this;
};

ByteString.prototype = new Binary();

ByteString.prototype.__defineGetter__("length", function() {
    return this._length;
});
ByteString.prototype.__defineSetter__("length", function(length) {
});

// toByteArray() - Returns a byte for byte copy in a ByteArray.
// toByteArray(sourceCharset, targetCharset) - Returns a transcoded copy in a ByteArray.
//  - implemented on Binary

// toByteString() - Returns itself, since there's no need to copy an immutable ByteString.
// toByteString(sourceCharset, targetCharset) - Returns a transcoded copy.
//  - implemented on Binary

// toArray() - Returns an array containing the bytes as numbers.
// toArray(charset) - Returns an array containing the decoded Unicode code points.
//  - implemented on Binary

// toString()
ByteString.prototype.toString = function(charset) {
    if (charset)
        return this.decodeToString(charset);
        
    return "[ByteString "+this._length+"]";
};

// decodeToString(charset) - Returns the decoded ByteArray as a string.
//  - implemented on Binary

ByteString.prototype.byteAt =
ByteString.prototype.charAt = function(offset) {
    var byteValue = this.get(offset);
    
    if (isNaN(byteValue))
        return new ByteString();
        
    return new ByteString([byteValue]);
};

// indexOf() - implemented on Binary
// lastIndexOf() - implemented on Binary

// charCodeAt(offset)
ByteString.prototype.charCodeAt = Binary.prototype.get;

// get(offset) - implemented on Binary

// byteAt(offset) ByteString - implemented on Binary
// charAt(offset) ByteString - implemented on Binary

// split(delimiter, [options])
ByteString.prototype.split = function(delimiters, options) {
    var options = options || {},
        count = options.count === undefined ? -1 : options.count,
        includeDelimiter = options.includeDelimiter || false;
    
    // standardize delimiters into an array of ByteStrings:
    if (!Array.isArray(delimiters))
        delimiters = [delimiters];
        
    delimiters = delimiters.map(function(delimiter) {
        if (typeof delimiter === "number")
            delimiter = [delimiter];
        return new ByteString(delimiter);
    });
    
    var components = [],
        startOffset = this._offset,
        currentOffset = this._offset;
    
    // loop until there's no more bytes to consume
    bytes_loop :
    while (currentOffset < this._offset + this._length) {
        
        // try each delimiter until we find a match
        delimiters_loop :
        for (var i = 0; i < delimiters.length; i++) {
            var d = delimiters[i];
            
            for (var j = 0; j < d._length; j++) {
                // reached the end of the bytes, OR bytes not equal
                if (currentOffset + j > this._offset + this._length ||
                    B_GET(this._bytes, currentOffset + j) !== B_GET(d._bytes, d._offset + j)) {
                    continue delimiters_loop;
                }
            }
            
            // push the part before the delimiter
            components.push(new ByteString(this._bytes, startOffset, currentOffset - startOffset));
            
            // optionally push the delimiter
            if (includeDelimiter)
                components.push(new ByteString(this._bytes, currentOffset, d._length))
            
            // reset the offsets
            startOffset = currentOffset = currentOffset + d._length;
            
            continue bytes_loop;
        }
        
        // if there was no match, increment currentOffset to try the next one
        currentOffset++;
    }
    
    // push the remaining part, if any
    if (currentOffset > startOffset)
        components.push(new ByteString(this._bytes, startOffset, currentOffset - startOffset));
    
    return components;
};

// slice()
// slice(begin)
// slice(begin, end)
ByteString.prototype.slice = function(begin, end) {
    if (begin === undefined)
        begin = 0;
    else if (begin < 0)
        begin = this._length + begin;
        
    if (end === undefined)
        end = this._length;
    else if (end < 0)
        end = this._length + end;
    
    begin = Math.min(this._length, Math.max(0, begin));
    end = Math.min(this._length, Math.max(0, end));
    
    return new ByteString(this._bytes, this._offset + begin, end - begin);
};

// substr(start)
// substr(start, length)
ByteString.prototype.substr = function(start, length) {
    if (start !== undefined) {
        if (length !== undefined)
            return this.slice(start);
        else
            return this.slice(start, start + length);
    }
    return this.slice();
};

// substring(first)
// substring(first, last)
ByteString.prototype.substring = function(from, to) {
    if (from !== undefined) {
        if (to !== undefined)
            return this.slice(Math.max(Math.min(from, this._length), 0));
        else
            return this.slice(Math.max(Math.min(from, this._length), 0),
                              Math.max(Math.min(to, this._length), 0));
    }
    return this.slice();
};

// [] ByteString - TODO

// toSource()
ByteString.prototype.toSource = function() {
    return "ByteString(["+this.toArray().join(",")+"])";
};

/* ByteArray */

// ByteArray() - New, empty ByteArray.
// ByteArray(length) - New ByteArray filled with length zero bytes.
// ByteArray(byteArray) - Copy byteArray.
// ByteArray(byteString) - Copy contents of byteString.
// ByteArray(arrayOfBytes) - Use numbers in arrayOfBytes as contents.
//     Throws an exception if any element is outside the range 0...255 (TODO).
// ByteArray(string, charset) - Create a ByteArray from a Javascript string, the result being encoded with charset.
var ByteArray = exports.ByteArray = function() {
    if (!this instanceof ByteArray) {
        if (arguments.length == 0)
            return new ByteArray();
        if (arguments.length == 1)
            return new ByteArray(arguments[0]);
        if (arguments.length == 2)
            return new ByteArray(arguments[0], arguments[1]);
        if (arguments.length == 3)
            return new ByteArray(arguments[0], arguments[1], arguments[2]);
    }

    // ByteArray() - New, empty ByteArray.
    if (arguments.length === 0) {
        this._bytes     = B_ALLOC(0); // null;
        this._offset    = 0;
        this._length    = 0;
    }
    // ByteArray(length) - New ByteArray filled with length zero bytes.
    else if (arguments.length === 1 && typeof arguments[0] === "number") {
        this._bytes     = B_ALLOC(arguments[0]); // null;
        this._offset    = 0;
        this._length    = B_LENGTH(this._bytes);
    }
    // ByteArray(byteArray) - Copy byteArray.
    // ByteArray(byteString) - Copy contents of byteString.
    else if (arguments.length === 1 && (arguments[0] instanceof ByteArray || arguments[0] instanceof ByteString)) {
        var byteArray = new ByteArray(arguments[0]._length);
        B_COPY(arguments[0]._bytes, arguments[0]._offset, byteArray._bytes, byteArray._offset, byteArray._length);
        return byteArray;
    }
    // ByteArray(arrayOfBytes) - Use numbers in arrayOfBytes as contents.
    // Throws an exception if any element is outside the range 0...255 (TODO).
    else if (arguments.length === 1 && Array.isArray(arguments[0])) {
        var array = arguments[0];
        this._bytes = B_ALLOC(array.length);
        for (var i = 0; i < array.length; i++) {
            var b = array[i];
            // If any element is outside the range 0...255, an exception (TODO) is thrown.
            if (b < 0 || b > 0xFF)
                throw new Error("ByteString constructor argument Array of integers must be 0 - 255 ("+b+")");
            // Java "bytes" are interpreted as 2's complement
            //this._bytes[i] = (b < 128) ? b : -1 * ((b ^ 0xFF) + 1);
            B_SET(this._bytes, i, b);
        }
        this._offset = 0;
        this._length = B_LENGTH(this._bytes);
    }
    // ByteArray(string, charset) - Create a ByteArray from a Javascript string, the result being encoded with charset.
    else if ((arguments.length === 1 || (arguments.length === 2 && arguments[1] === undefined)) && typeof arguments[0] === "string") {
        this._bytes     = B_ENCODE_DEFAULT(arguments[0]);
        this._offset    = 0;
        this._length    = B_LENGTH(this._bytes);
    }
    else if (arguments.length === 2 && typeof arguments[0] === "string" && typeof arguments[1] === "string") {
        this._bytes     = B_ENCODE(arguments[0], arguments[1]);
        this._offset    = 0;
        this._length    = B_LENGTH(this._bytes);
    }
    // private: ByteArray(bytes, offset, length)
    else if (arguments.length === 3 && typeof arguments[1] === "number" && typeof arguments[2] === "number") {
        this._bytes     = arguments[0];
        this._offset    = arguments[1];
        this._length    = arguments[2];
    }
    else
        throw new Error("Illegal arguments to ByteString constructor: [" +
            Array.prototype.join.apply(arguments, [","]) + "] ("+arguments.length+")");
    
    if (engine.ByteArrayWrapper)
        return engine.ByteArrayWrapper(this);
    else
        return this;
};

ByteArray.prototype = new Binary();

ByteArray.prototype.__defineGetter__("length", function() {
    return this._length;
});
ByteArray.prototype.__defineSetter__("length", function(length) {
    if (typeof length !== "number")
        return;
    
    // same length
    if (length === this._length) {
        return;
    }
    // new length is less, truncate
    else if (length < this._length) {
        this._length = length;
    }
    // new length is more, but fits without moving, just clear new bytes
    else if (this._offset + length <= B_LENGTH(this._bytes)) {
        B_FILL(this._bytes, this._length, this._offset + length - 1, 0);
        this._length = length;
    }
    // new length is more, but fits if we shift to bottom, so do that.
    else if (length <= B_LENGTH(this._bytes)) {
        B_COPY(this._bytes, this._offset, this._bytes, 0, this._length);
        this._offset = 0;
        B_FILL(this._bytes, this._length, this._offset + length - 1, 0);
        this._length = length;
    }
    // new length is more than the allocated bytes array, allocate a new one and copy the data
    else {
        var newBytes = B_ALLOC(length);
        B_COPY(this._bytes, this._offset, newBytes, 0, this._length);
        this._bytes = newBytes;
        this._offset = 0;
        this._length = length;
    }
});

// FIXME: array notation for set and get
ByteArray.prototype.set = function(index, b) {
    // If any element is outside the range 0...255, an exception (TODO) is thrown.
    if (b < 0 || b > 0xFF)
        throw new Error("ByteString constructor argument Array of integers must be 0 - 255 ("+b+")");
        
    if (index < 0 || index >= this._length)
        throw new Error("Out of range");
    
    // Java "bytes" are interpreted as 2's complement
    //this._bytes[this._offset + index] = (b < 128) ? b : -1 * ((b ^ 0xFF) + 1);
    B_SET(this._bytes, this._offset + index, b);
};

// toArray()
// toArray(charset)
//  - implemented on Binary

// toByteArray() - just a copy
// toByteArray(sourceCharset, targetCharset) - transcoded
//  - implemented on Binary

// toByteString() - byte for byte copy
// toByteString(sourceCharset, targetCharset) - transcoded
//  - implemented on Binary

// toString() - a string representation like "[ByteArray 10]"
// toString(charset) - an alias for decodeToString(charset)
ByteArray.prototype.toString = function(charset) {
    if (charset)
        return this.decodeToString(charset);
    
    return "[ByteArray "+this._length+"]"; 
};

// decodeToString(charset) - implemented on Binary

// byteAt(offset) ByteString - Return the byte at offset as a ByteString.
//  - implemented on Binary

// get(offset) Number - Return the byte at offset as a Number.
//  - implemented on Binary

// concat(other ByteArray|ByteString|Array)
// TODO: I'm assuming Array means an array of ByteStrings/ByteArrays, not an array of integers.
ByteArray.prototype.concat = function() {
    var components = [this],
        totalLength = this._length;
    
    for (var i = 0; i < arguments.length; i++) {
        var component = Array.isArray(arguments[i]) ? arguments[i] : [arguments[i]];
        
        for (var j = 0; j < component.length; j++) {
            var subcomponent = component[j];
            if (!(subcomponent instanceof ByteString) && !(subcomponent instanceof ByteArray))
                throw "Arguments to ByteArray.concat() must be ByteStrings, ByteArrays, or Arrays of those.";
            
            components.push(subcomponent);
            totalLength += subcomponent.length;
        }
    }
    
    var result = new ByteArray(totalLength),
        offset = 0;
    
    components.forEach(function(component) {
        B_COPY(component._bytes, component._offset, result._bytes, offset, component._length);
        offset += component._length;
    });
    
    return result;
};

// pop() -> byte Number
ByteArray.prototype.pop = function() {
    if (this._length === 0)
        return undefined;
    
    this._length--;
    
    return B_GET(this._bytes, this._offset + this._length);
};

// push(...variadic Numbers...)-> count Number
ByteArray.prototype.push = function() {
    var length, newLength = this.length += length = arguments.length;
    try {
        for (var i = 0; i < length; i++)
            this.set(newLength - length + i, arguments[i]);
    } catch (e) {
        this.length -= length;
        throw e;
    }
    return newLength;
};

// extendRight(...variadic Numbers / Arrays / ByteArrays / ByteStrings ...)
ByteArray.prototype.extendRight = function() {
    throw "NYI";
};

// shift() -> byte Number
ByteArray.prototype.shift = function() {
    if (this._length === 0)
        return undefined;
    
    this._length--;
    this._offset++;
    
    return B_GET(this._bytes, this._offset - 1);
};

// unshift(...variadic Numbers...) -> count Number
ByteArray.prototype.unshift = function() {
    var copy = this.slice();
    this.length = 0;
    try {
        this.push.apply(this, arguments);
        this.push.apply(this, copy.toArray());
        return this.length;
    } catch(e) {
        B_COPY(copy._bytes, copy._offset, this._bytes, this._offset, copy.length);
        this.length = copy.length;
        throw e;
    }
};

// extendLeft(...variadic Numbers / Arrays / ByteArrays / ByteStrings ...)
ByteArray.prototype.extendLeft = function() {
    throw "NYI";
};

// reverse() in place reversal
ByteArray.prototype.reverse = function() {
    // "limit" is halfway, rounded down. "top" is the last index.
    var limit = Math.floor(this._length/2) + this._offset,
        top = this._length - 1;
        
    // swap each pair of bytes, up to the halfway point
    for (var i = this._offset; i < limit; i++) {
        var tmp = B_GET(this._bytes, i);
        B_SET(this._bytes, i, B_GET(this._bytes, top - i));
        B_SET(this._bytes, top - i, tmp);
    }
    
    return this;
};

// slice()
ByteArray.prototype.slice = function() {
    return new ByteArray(ByteString.prototype.slice.apply(this, arguments));
};

var numericCompareFunction = function(o1, o2) { return o1 - o2; };

// sort([compareFunction])
ByteArray.prototype.sort = function(compareFunction) {
    // FIXME: inefficient?
    
    var array = this.toArray();
    
    if (arguments.length)
        array.sort(compareFunction);
    else
        array.sort(numericCompareFunction);
    
    for (var i = 0; i < array.length; i++)
        this.set(i, array[i]);
};

// splice()
ByteArray.prototype.splice = function(index, howMany /*, elem1, elem2 */) {
    if (index === undefined) return;
    if (index < 0) index += this.length;
    if (howMany === undefined) howMany = this._length - index;
    var end = index + howMany;
    var remove = this.slice(index, end);
    var keep = this.slice(end);
    var inject = Array.prototype.slice.call(arguments, 2);
    this._length = index;
    this.push.apply(this, inject);
    this.push.apply(this, keep.toArray());
    return remove;
};

// indexOf() - implemented on Binary
// lastIndexOf() - implemented on Binary

// split() Returns an array of ByteArrays instead of ByteStrings.
ByteArray.prototype.split = function() {
    var components = ByteString.prototype.split.apply(this.toByteString(), arguments);
    
    // convert ByteStrings to ByteArrays
    for (var i = 0; i < components.length; i++) {
        // we know we can use these byte buffers directly since we copied them above
        components[i] = new ByteArray(components[i]._bytes, components[i]._offset, components[i]._length);
    }
    
    return components;
};

// filter(callback[, thisObject])
ByteArray.prototype.filter = function(callback, thisObject) {
    var result = new ByteArray(this._length);
    for (var i = 0, length = this._length; i < length; i++) {
        var value = this.get(i);
        if (callback.apply(thisObject, [value, i, this]))
            result.push(value);
    }
    return result;
};

// forEach(callback[, thisObject]);
ByteArray.prototype.forEach = function(callback, thisObject) {
    for (var i = 0, length = this._length; i < length; i++)
        callback.apply(thisObject, [this.get(i), i, this]);
};

// every(callback[, thisObject])
ByteArray.prototype.every = function(callback, thisObject) {
    for (var i = 0, length = this._length; i < length; i++)
        if (!callback.apply(thisObject, [this.get(i), i, this]))
            return false;
    return true;
};

// some(callback[, thisObject])
ByteArray.prototype.some = function(callback, thisObject) {
    for (var i = 0, length = this._length; i < length; i++)
        if (callback.apply(thisObject, [this.get(i), i, this]))
            return true;
    return false;
};

// map(callback[, thisObject]);
ByteArray.prototype.map = function(callback, thisObject) {
    var result = new ByteArray(this._length);
    for (var i = 0, length = this._length; i < length; i++)
        result.set(i, callback.apply(thisObject, [this.get(i), i, this]));
    return result;
};

// reduce(callback[, initialValue])
ByteArray.prototype.reduce = function(callback, initialValue) {
    var value = initialValue;
    for (var i = 0, length = this._length; i < length; i++)
        value = callback(value, this.get(i), i, this);
    return value;
};

// reduceRight(callback[, initialValue])
ByteArray.prototype.reduceRight = function(callback, initialValue) {
    var value = initialValue;
    for (var i = this._length-1; i > 0; i--)
        value = callback(value, this.get(i), i, this);
    return value;
};

// displace(begin, end, values/ByteStrings/ByteArrays/Arrays...) -> length
//     begin/end are specified like for slice. Can be used like splice but does not return the removed elements.
ByteArray.prototype.displace = function(begin, end) {
    throw "NYI";
};

// toSource() returns a string like "ByteArray([])" for a null byte-array.
ByteArray.prototype.toSource = function() {
    return "ByteArray(["+this.toArray().join(",")+"])";
};


},{"./platform/node/binary":18,"./util":21}],14:[function(require,module,exports){

//var ENGINE = require("./platform/{platform}/http-client");
var ENGINE = require("./platform/browser/http-client");
var URI = require("./uri");

/**
 * @param options object
 *   host: 'www.google.com'
 *   port: 80
 *   path: '/upload'
 *   method: 'POST'
 *   headers: {}
 *   data: request (post) data
 *   responseEncoding: 'utf8'
 */
exports.request = function(options, successCallback, errorCallback)
{
    if (typeof options.url !== "undefined")
    {
        if (typeof options.host !== "undefined")
            throw new Error("Cannot set 'host' when 'url' is set!");
        if (typeof options.path !== "undefined")
            throw new Error("Cannot set 'path' when 'url' is set!");
        if (typeof options.port !== "undefined")
            throw new Error("Cannot set 'port' when 'url' is set!");

        var uri = URI.URI(options.url);

        options.host = uri.authority;
        options.port = uri.port || ((uri.scheme === "https")?443:80);
        options.path = uri.path || "/";
        
        if (uri.query) {
        	options.path += "?" + uri.query;
        }
    }
    options.method = options.method || "GET";
    options.port = options.port || 80;
    options.path = options.path || "/";
    options.url = options.url || ("http://" + options.host + ":" + options.port + options.path);
    options.headers = options.headers || { "Host": options.host };

    options.headers["Host"] = options.headers["Host"] || options.host;
    options.headers["User-Agent"] = options.headers["User-Agent"] || "pinf/modules-js/http-client";

    return ENGINE.request(options, successCallback, errorCallback);
}

},{"./platform/browser/http-client":17,"./uri":20}],15:[function(require,module,exports){

exports.encode = JSON.stringify;
exports.decode = JSON.parse;

},{}],16:[function(require,module,exports){

/*!
    A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
    Digest Algorithm, as defined in RFC 1321.
    Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
    Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
    Distributed under the BSD License
    See http://pajhome.org.uk/crypt/md5 for more info.
    Ported to Chiron and Narwhal by Kris Kowal, kriskowal
*/

// ported by:
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License

var util = require("./util");
var struct = require("./struct");

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */

/*** hash
    returns a hex string of the md5 hash for a given string.
*/
exports.hash_md5 = function(s) {
    return struct.bin2hex(exports.hash(s));
}
exports.hash = function (s, _characterSize) {
    if (util.no(_characterSize)) _characterSize = struct.characterSize;
    return struct.binl2bin(core_md5(struct.str2binl(s), s.length * _characterSize));
};

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
var core_md5 = function (x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << ((len) % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;

    var a =  1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d =  271733878;

    for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;

        a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
        d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
        c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
        b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
        a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
        d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
        c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
        b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
        a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
        d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
        c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
        b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
        a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
        d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
        c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
        b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

        a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
        d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
        c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
        b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
        a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
        d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
        c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
        b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
        a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
        d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
        c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
        b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
        a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
        d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
        c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
        b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

        a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
        d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
        c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
        b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
        a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
        d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
        c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
        b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
        a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
        d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
        c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
        b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
        a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
        d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
        c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
        b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

        a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
        d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
        c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
        b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
        a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
        d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
        c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
        b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
        a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
        d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
        c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
        b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
        a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
        d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
        c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
        b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

        a = struct.addU32(a, olda);
        b = struct.addU32(b, oldb);
        c = struct.addU32(c, oldc);
        d = struct.addU32(d, oldd);
    }
    return [a, b, c, d];

};

/*
 * These functions implement the four basic operations the algorithm uses.
 */

var md5_cmn = function (q, a, b, x, s, t) {
    return struct.addU32(struct.rolU32(struct.addU32(a, q, x, t), s), b);
};

var md5_ff = function (a, b, c, d, x, s, t) {
    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
};

var md5_gg = function (a, b, c, d, x, s, t) {
    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
};

var md5_hh = function (a, b, c, d, x, s, t) {
    return md5_cmn(b ^ c ^ d, a, b, x, s, t);
};

var md5_ii = function (a, b, c, d, x, s, t) {
    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
};

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
var core_hmac_md5 = function (key, data, _characterSize) {
    if (util.no(_characterSize)) _characterSize = struct.characterSize;
    var bkey = struct.str2binl(key);
    if(bkey.length > 16) bkey = core_md5(bkey, key.length * _characterSize);

    var ipad = [], opad = [];
    for (var i = 0; i < 16; i++) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = core_md5(ipad.concat(struct.str2binl(data)), 512 + data.length * _characterSize);
    return core_md5(opad.concat(hash), 512 + 128);
};


},{"./struct":19,"./util":21}],17:[function(require,module,exports){

exports.request = function(options, successCallback, errorCallback)
{
    try {

        // TODO: Add support for other browsers

        var request = new XMLHttpRequest();
        request.onreadystatechange = function (event) {
            if (request.readyState == 4) {
                
                var headers = {},
                    lines = request.getAllResponseHeaders().split("\n");
                for (var i=0,ic=lines.length ; i<ic ; i++ )
                {
                    if (lines[i])
                    {
                        var m = lines[i].match(/^([^:]*):\s*(.*)$/);
                        headers[m[1]] = m[2];
                    }
                }

                successCallback({
                    status: request.status,
                    headers: headers,
                    data: request.responseText
                });
            }
        };
        request.open(options.method, options.url, true);

        for (var name in options.headers)
        {
            if (name.toLowerCase() != "host")
            {
                request.setRequestHeader(name, options.headers[name]);
            }
        }

        request.send(options.data);

    } catch(e) {
        console.warn(e);
        errorCallback(e);
    }
}

},{}],18:[function(require,module,exports){
(function (Buffer){

//var Buffer = require("../../buffer").Buffer;

exports.B_LENGTH = function (bytes) {
    return bytes.length;
};

exports.B_ALLOC = function (length) {
//    throw new Error("NYI - exports.B_ALLOC in " + module.id);
    return new Buffer(length);
};

exports.B_FILL = function(bytes, length, offset, value) {
    bytes.fill(value, offset, offset + length);
};

exports.B_COPY = function(src, srcOffset, dst, dstOffset, length) {
    src.copy(dst, srcOffset, srcOffset + length, dstOffset);
};

exports.B_GET = function(bytes, index) {
    return bytes[index];
};

exports.B_SET = function(bytes, index, value) {
    bytes[index] = value;
};

exports.B_DECODE = function(bytes, offset, length, charset) {
    return bytes.toString(charset, offset, offset + length);
};

exports.B_DECODE_DEFAULT = function(bytes, offset, length) {
    return bytes.utf8Slice(offset, length);
};

exports.B_ENCODE = function(string, charset) {
    throw new Error("NYI - exports.B_ENCODE in " + module.id);
//    return Buffer.fromStringCharset(string, charset);
};

exports.B_ENCODE_DEFAULT = function(string) {
    return exports.B_ENCODE(string, 'utf-8');
};

exports.B_TRANSCODE = function(bytes, offset, length, sourceCharset, targetCharset) {
    var raw = exports.B_DECODE(bytes, offset, length, sourceCharset);
    return exports.B_ENCODE(bytes, 0, raw.length, targetCharset);
};

}).call(this,require("buffer").Buffer)
},{"buffer":31}],19:[function(require,module,exports){

// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License

var util = require("./util");
var binary = require("./binary");

/*** alphabet16Upper
*/
exports.alphabet16Upper = "0123456789ABCDEF";

/*** alphabet16Lower
*/
exports.alphabet16Lower = "0123456789abcdef";

/*** alphabet16
    ``alphabet16Lower`` is the default hexadecimal alphabet.
    This value can be overridden on the module
    and function level.
*/

exports.alphabet16 = exports.alphabet16Lower;

/*** alphabet36
*/
exports.alphabet36 = "0123456789abcdefghijklmnopqrstuvwxyz";

/*** alphabet64
*/
exports.alphabet64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/*** padBase64 
    base-64 pad character. "=" for strict RFC compliance, "" for brevity
    "=" by default.
    This value can be overridden on the module
    and function level.
*/
exports.padBase64 = "=";

/*** characterSize
    bits per input character. 8 - ASCII; 16 - Unicode
    This value can be overridden on the module
    and function level.
*/
exports.characterSize = 8; 

/*** ord
    Returns the character code ordinal (offset in the ASCII or Unicode tables)
    for a given single character. 

     - inverse: `chr`

*/
exports.ord = function (chr) {
    return chr.charCodeAt();
};

/*** chr
    Returns the character for a given character code ordinal (offset in the
    ASCII or Unicode tables).

     - inverse: `ord`

*/
exports.chr = function (ord) {
    return String.fromCharCode(ord);
};

/* undocumented addU32
    Add integers, wrapping at 2**32. This uses 16-bit operations internally
    to work around bugs in some JavaScript interpreters.

    - `variadic`
*/
exports.addU32 = function (/* ... */) {
    var acc = 0;
    for (var i = 0; i < arguments.length; i++) {
        var x = arguments[i];
        var lsw = (acc & 0xFFFF) + (x & 0xFFFF);
        var msw = (acc >> 16) + (x >> 16) + (lsw >> 16);
        acc = (msw << 16) | (lsw & 0xFFFF);
    }
    return acc;
};

/* undocumented rolU32
    Bitwise rotate a 32-bit number to the left.
*/
exports.rolU32 = function (num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
};

/* undocumented str2binl
    Convert a string to an array of little-endian words
    If characterSize is ASCII, characters >255 have their hi-byte silently ignored.
*/
exports.str2binl = function (str, _characterSize) {
    if (util.no(_characterSize))
        _characterSize = exports.characterSize;
    var bin = [];
    var mask = (1 << _characterSize) - 1;
    for (var i = 0; i < str.length * _characterSize; i += _characterSize)
        bin[i>>5] |= (str.charCodeAt(i / _characterSize) & mask) << (i % 32);
    return bin;
};

/* undocumented str2binb
    Convert an 8-bit or 16-bit string to an array of big-endian words
    In 8-bit function, characters >255 have their hi-byte silently ignored.
*/
exports.str2binb = function (str, _characterSize) {
    if (util.no(_characterSize))
        _characterSize = exports.characterSize;
    var bin = [];
    var mask = (1 << _characterSize) - 1;
    for (var i = 0; i < str.length * _characterSize; i += _characterSize)
        bin[i>>5] |= (
            (str.charCodeAt(i / _characterSize) & mask) <<
            (32 - _characterSize - i % 32)
        );
    return bin;
};

/* undocumented binl2str
    Convert an array of little-endian words to a string
*/
exports.binl2str = function (bin, _characterSize) {
    return exports.binl2bin(bin, _characterSize).decodeToString('ascii');
};

/* undocumented binl2bin
    Convert an array of little-endian words to a string
*/
exports.binl2bin = function (bin, _characterSize) {
    if (util.no(_characterSize)) 
        _characterSize = exports.characterSize;
    var str = [];
    var mask = (1 << _characterSize) - 1;
    for (var i = 0; i < bin.length * 32; i += _characterSize)
        str.push((bin[i>>5] >>> (i % 32)) & mask);
    return binary.ByteString(str);
};

/* undocumented binb2str
    Convert an array of big-endian words to a string
*/
exports.binb2str = function (bin, _characterSize) {
    return exports.binb2bin(bin, _characterSize).decodeToString('ascii');
};

/* undocumented binb2bin
    Convert an array of big-endian words to a string
*/
exports.binb2bin = function (bin, _characterSize) {
    if (util.no(_characterSize)) 
        _characterSize = exports.characterSize;
    var str = [];
    var mask = (1 << _characterSize) - 1;
    for (var i = 0; i < bin.length * 32; i += _characterSize)
        str.push((bin[i>>5] >>> (32 - _characterSize - i % 32)) & mask);
    return binary.ByteString(str);
};

/* undocumented binl2hex
    Convert an array of little-endian words to a hex string.
*/
exports.binl2hex = function (binarray, _alphabet16) {
    if (util.no(_alphabet16))
        _alphabet16 = exports.alphabet16;
    var str = "";
    for (var i = 0; i < binarray.length * 4; i++) {
        str += _alphabet16.charAt((binarray[i>>2] >> ((i % 4) * 8 + 4)) & 0xF) +
               _alphabet16.charAt((binarray[i>>2] >> ((i % 4) * 8)) & 0xF);
    }
    return str;
};

/* undocumented binb2hex
    Convert an array of big-endian words to a hex string.
*/
exports.binb2hex = function (binarray, _alphabet16) {
    if (util.no(_alphabet16))
        _alphabet16 = exports.alphabet16;
    var str = "";
    for (var i = 0; i < binarray.length * 4; i++) {
        str += _alphabet16.charAt((binarray[i>>2] >> ((3 - i % 4)*8+4)) & 0xF) +
               _alphabet16.charAt((binarray[i>>2] >> ((3 - i % 4) * 8)) & 0xF);
    }
    return str;
};

/* undocumented binl2base64
    Convert an array of little-endian words to a base-64 string
*/
exports.binl2base64 = function (binarray) {
    var str = "";
    for (var i = 0; i < binarray.length * 4; i += 3) {
        var triplet = (
            (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16) |
            (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8) |
            ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF)
        );
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > binarray.length * 32)
                str += exports.padBase64;
            else str += exports.alphabet64.charAt((triplet >> 6*(3-j)) & 0x3F);
        }
    }
    return str;
};

/* undocumented binb2base64
    Convert an array of big-endian words to a base-64 string
*/
exports.binb2base64 = function (binarray) {
    var str = "";
    for (var i = 0; i < binarray.length * 4; i += 3) {
        var triplet = (
            (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) |
            (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 ) |
            ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF)
        );
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > binarray.length * 32)
                str += exports.padBase64;
            else str += exports.alphabet64.charAt((triplet >> 6*(3-j)) & 0x3F);
        }
    }
    return str;
};

/* undocumented bin2hex
    Convert a string to a hex string.
 */
exports.bin2hex = function (bin) {
    
    function convert(num) {
        if (num > 65535) throw "error";
        var first = Math.round(num/4096 - .5),
            temp1 = (num - first * 4096),
            second = Math.round(temp1/256 -.5),
            temp2 = (temp1 - second * 256),
            third = Math.round(temp2/16 - .5),
            fourth = (temp2 - third * 16);
        return String(letter(third) + letter(fourth));
    }
    
    function letter(num) {
        if (num < 10) return ""+num;
        else {
            if (num == 10) return "A";
            if (num == 11) return "B";
            if (num == 12) return "C";
            if (num == 13) return "D";
            if (num == 14) return "E";
            if (num == 15) return "F";
        }
    }
    
    var str = "";
    for (var i = 0; i < bin.length; i++) {
        str += convert(bin.charCodeAt(i));
    }
    return str;
}

},{"./binary":13,"./util":21}],20:[function(require,module,exports){

// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// gmosx, George Moschovitis

// Based on: http://data.iana.org/TLD/tlds-alpha-by-domain.txt
var TLDS = exports.TLDS = [
    "AC","AD","AE","AERO","AF","AG","AI","AL","AM","AN","AO","AQ","AR","ARPA","AS","ASIA","AT","AU","AW","AX","AZ",
    "BA","BB","BD","BE","BF","BG","BH","BI","BIZ","BJ","BM","BN","BO","BR","BS","BT","BV","BW","BY","BZ",
    "CA","CAT","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","COM","COOP","CR","CU","CV","CX","CY","CZ",
    "DE","DJ","DK","DM","DO","DZ",
    "EC","EDU","EE","EG","ER","ES","ET","EU",
    "FI","FJ","FK","FM","FO","FR",
    "GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GOV","GP","GQ","GR","GS","GT","GU","GW","GY",
    "HK","HM","HN","HR","HT","HU",
    "ID","IE","IL","IM","IN","INFO","INT","IO","IQ","IR","IS","IT",
    "JE","JM","JO","JOBS","JP",
    "KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ",
    "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
    "MA","MC","MD","ME","MG","MH","MIL","MK","ML","MM","MN","MO","MOBI","MP","MQ","MR","MS","MT","MU","MUSEUM","MV","MW","MX","MY","MZ",
    "NA","NAME","NC","NE","NET","NF","NG","NI","NL","NO","NP","NR","NU","NZ",
    "OM","ORG",
    "PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PRO","PS","PT","PW","PY",
    "QA",
    "RE","RO","RS","RU","RW",
    "SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","ST","SU","SV","SY","SZ",
    "TC","TD","TEL","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TP","TR","TRAVEL","TT","TV","TW","TZ",
    "UA","UG","UK","US","UY","UZ",
    "VA","VC","VE","VG","VI","VN","VU",
    "WF","WS",
    "XN",
    "YE","YT","YU",
    "ZA","ZM","ZW"
];


/**
 * Uniform Resource Identifier (URI) - RFC3986
 * http://www.ietf.org/rfc/rfc3986.txt
 */
var URI = exports.URI = function (uri) {
    if (!(this instanceof URI))
        return new URI(uri);
    if (typeof uri === "object") {
        for (var name in uri) {
            if (Object.prototype.hasOwnProperty.call(uri, name)) {
                this[name] = uri[name];
            }
        }
    } else if (typeof uri === "string") {
        exports.parse.call(this, uri);
    } else {
        throw new TypeError("Invalid argument for URI constructor.");
    }

};

URI.prototype.resolve = function (other) {
    return exports.resolve(this, other);
};

URI.prototype.to = function (other) {
    return exports.relative(this, other);
};

URI.prototype.from = function (other) {
    return exports.relative(other, this);
};

/**
 * Convert the URI to a String.
 */
URI.prototype.toString = function () {
    return exports.format(this);
}

exports.unescape = URI.unescape = function(uri, plus) {
    return decodeURI(uri.replace(/\+/g, " "));
}

exports.unescapeComponent = URI.unescapeComponent = function(uri, plus) {
    return decodeURIComponent(uri.replace(/\+/g, " "));
}

// from Chiron's HTTP module:

/**** keys
    members of a parsed URI object.
*/
exports.keys = [
    "url",
    "scheme",
    "authorityRoot",
    "authority",
        "userInfo",
            "user",
            "password",
        "domain",
            "domains",
        "port",
    "path",
        "root",
        "directory",
            "directories",
        "file",
    "query",
    "anchor"
];

/**** expressionKeys
    members of a parsed URI object that you get
    from evaluting the strict regular expression.
*/
exports.expressionKeys = [
    "url",
    "scheme",
    "authorityRoot",
    "authority",
        "userInfo",
            "user",
            "password",
        "domain",
        "port",
    "path",
        "root",
        "directory",
        "file",
    "query",
    "anchor"
];

/**** strictExpression
*/
exports.strictExpression = new RegExp( /* url */
    "^" +
    "(?:" +
        "([^:/?#]+):" + /* scheme */
    ")?" +
    "(?:" +
        "(//)" + /* authorityRoot */
        "(" + /* authority */
            "(?:" +
                "(" + /* userInfo */
                    "([^:@/]*)" + /* user */
                    ":?" +
                    "([^:@/]*)" + /* password */
                ")?" +
                "@" +
            ")?" +
            "([^:/?#]*)" + /* domain */
            "(?::(\\d*))?" + /* port */
        ")" +
    ")?" +
    "(" + /* path */
        "(/?)" + /* root */
        "((?:[^?#/]*/)*)" +
        "([^?#]*)" + /* file */
    ")" +
    "(?:\\?([^#]*))?" + /* query */
    "(?:#(.*))?" /*anchor */
);

/**** Parser
    returns a URI parser function given
    a regular expression that renders 
    `expressionKeys` and returns an `Object`
    mapping all `keys` to values.
*/
exports.Parser = function (expression) {
    return function (url) {
        if (typeof url == "undefined")
            throw new Error("HttpError: URL is undefined");
        if (typeof url != "string")
            return new Object(url);

        var items = this instanceof URI ? this : Object.create(URI.prototype);
        var parts = expression.exec(url);

        for (var i = 0; i < parts.length; i++) {
            items[exports.expressionKeys[i]] = parts[i] ? parts[i] : "";
        }

        items.root = (items.root || items.authorityRoot) ? '/' : '';

        items.directories = items.directory.split("/");
        if (items.directories[items.directories.length - 1] == "") {
            items.directories.pop();
        }

        /* normalize */
        var directories = [];
        for (var i = 0; i < items.directories.length; i++) {
            var directory = items.directories[i];
            if (directory == '.') {
            } else if (directory == '..') {
                if (directories.length && directories[directories.length - 1] != '..')
                    directories.pop();
                else
                    directories.push('..');
            } else {
                directories.push(directory);
            }
        }
        items.directories = directories;

        items.domains = items.domain.split(".");

        return items;
    };
};

/**** parse
    a strict URI parser.
*/
exports.parse = exports.Parser(exports.strictExpression);

/**** format
    accepts a parsed URI object and returns
    the corresponding string.
*/
exports.format = function (object) {
    if (typeof(object) == 'undefined')
        throw new Error("UrlError: URL undefined for urls#format");
    if (object instanceof String || typeof(object) == 'string')
        return object;
    var domain =
        object.domains ?
        object.domains.join(".") :
        object.domain;
    var userInfo = (
            object.user ||
            object.password 
        ) ?
        (
            (object.user || "") + 
            (object.password ? ":" + object.password : "") 
        ) :
        object.userInfo;
    var authority = (
            userInfo ||
            domain ||
            object.port
        ) ? (
            (userInfo ? userInfo + "@" : "") +
            (domain || "") + 
            (object.port ? ":" + object.port : "")
        ) :
        object.authority;
    var directory =
        object.directories ?
        object.directories.join("/") :
        object.directory;
    var path =
        directory || object.file ?
        (
            (directory ? directory + "/" : "") +
            (object.file || "")
        ) :
        object.path;
    return (
        (object.scheme ? object.scheme + ":" : "") +
        (authority ? "//" + authority : "") +
        (object.root || (authority && path) ? "/" : "") +
        (path ? path.replace(/^\//, "") : "") +
        (object.query ? "?" + object.query : "") +
        (object.anchor ? "#" + object.anchor : "")
    ) || object.url || "";
};

/**** resolveObject
    returns an object representing a URL resolved from
    a relative location and a source location.
*/
exports.resolveObject = function (source, relative) {
    if (!source) 
        return relative;

    source = exports.parse(source);
    relative = exports.parse(relative);

    if (relative.url == "")
        return source;

    delete source.url;
    delete source.authority;
    delete source.domain;
    delete source.userInfo;
    delete source.path;
    delete source.directory;

    if (
        relative.scheme && relative.scheme != source.scheme ||
        relative.authority && relative.authority != source.authority
    ) {
        source = relative;
    } else {
        if (relative.root) {
            source.directories = relative.directories;
        } else {

            var directories = relative.directories;
            for (var i = 0; i < directories.length; i++) {
                var directory = directories[i];
                if (directory == ".") {
                } else if (directory == "..") {
                    if (source.directories.length) {
                        source.directories.pop();
                    } else {
                        source.directories.push('..');
                    }
                } else {
                    source.directories.push(directory);
                }
            }

            if (relative.file == ".") {
                relative.file = "";
            } else if (relative.file == "..") {
                source.directories.pop();
                relative.file = "";
            }
        }
    }

    if (relative.root)
        source.root = relative.root;
    if (relative.protcol)
        source.scheme = relative.scheme;
    if (!(!relative.path && relative.anchor))
        source.file = relative.file;
    source.query = relative.query;
    source.anchor = relative.anchor;

    return source;
};

/**** relativeObject
    returns an object representing a relative URL to
    a given target URL from a source URL.
*/
exports.relativeObject = function (source, target) {
    target = exports.parse(target);
    source = exports.parse(source);

    delete target.url;

    if (
        target.scheme == source.scheme &&
        target.authority == source.authority
    ) {
        delete target.scheme;
        delete target.authority;
        delete target.userInfo;
        delete target.user;
        delete target.password;
        delete target.domain;
        delete target.domains;
        delete target.port;
        if (
            !!target.root == !!source.root && !(
                target.root &&
                target.directories[0] != source.directories[0]
            )
        ) {
            delete target.path;
            delete target.root;
            delete target.directory;
            while (
                source.directories.length &&
                target.directories.length &&
                target.directories[0] == source.directories[0]
            ) {
                target.directories.shift();
                source.directories.shift();
            }
            while (source.directories.length) {
                source.directories.shift();
                target.directories.unshift('..');
            }

            if (!target.root && !target.directories.length && !target.file && source.file)
                target.directories.push('.');

            if (source.file == target.file)
                delete target.file;
            if (source.query == target.query)
                delete target.query;
            if (source.anchor == target.anchor)
                delete target.anchor;
        }
    }

    return target;
};

/**
 * @returns a URL resovled to a relative URL from a source URL.
 */
exports.resolve = function (source, relative) {
    return exports.format(exports.resolveObject(source, relative));
};

/**
 * @returns a relative URL to a target from a source.
 */
exports.relative = function (source, target) {
    return exports.format(exports.relativeObject(source, target));
};

/**
 * converts a file-system path to a URI.
 * @param path a String or String-like object, possibly a Path object,
 * representing a file system Path
 * @returns a URI as a String
 */
/*
TODO: Refactor
exports.pathToUri = function (path) {
    var FS = require("file");
    return "file:" + FS.split(path).map(encodeURIComponent).join('/');
};
*/

},{}],21:[function(require,module,exports){

// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- isaacs Isaac Schlueter
// -- nrstott Nathan Stott
// -- fitzgen Nick Fitzgerald
// -- nevilleburnell Neville Burnell
// -- cadorn Christoph Dorn

// a decorator for functions that curry "polymorphically",
// that is, that return a function that can be tested
// against various objects if they're only "partially
// completed", or fewer arguments than needed are used.
// 
// this enables the idioms:
//      [1, 2, 3].every(lt(4)) eq true
//      [1, 2, 3].map(add(1)) eq [2, 3, 4]
//      [{}, {}, {}].forEach(set('a', 10))
//
exports.operator = function (name, length, block) {
    var operator = function () {
        var args = exports.array(arguments);
        var completion = function (object) {
            if (
                typeof object == "object" &&
                object !== null && // seriously?  typeof null == "object"
                name in object && // would throw if object === null
                // not interested in literal objects:
                !Object.prototype.hasOwnProperty.call(object, name)
            )
                return object[name].apply(object, args);
            return block.apply(
                this,
                [object].concat(args)
            );
        };
        if (arguments.length < length) {
            // polymoprhic curry, delayed completion
            return completion;
        } else {
            // immediate completion
            return completion.call(this, args.shift());
        }
    };
    operator.name = name;
    operator.displayName = name;
    operator.length = length;
    operator.operator = block;
    return operator;
};

exports.no = function (value) {
    return value === null || value === undefined;
};

// object

exports.object = exports.operator('toObject', 1, function (object) {
    var items = object;
    if (!items.length)
        items = exports.items(object);
    var copy = {};
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var key = item[0];
        var value = item[1];
        copy[key] = value;
    }
    return copy;
});

exports.object.copy = function (object) {
    var copy = {};
    exports.object.keys(object).forEach(function (key) {
        copy[key] = object[key];
    });
    return copy;
};

exports.object.deepCopy = function (object) {
    var copy = {};
    exports.object.keys(object).forEach(function (key) {
        copy[key] = exports.deepCopy(object[key]);
    });
    return copy;
};

exports.object.eq = function (a, b, stack) {
    return (
        !exports.no(a) && !exports.no(b) &&
        exports.array.eq(
            exports.sort(exports.object.keys(a)),
            exports.sort(exports.object.keys(b))
        ) &&
        exports.object.keys(a).every(function (key) {
            return exports.eq(a[key], b[key], stack);
        })
    );
};

exports.object.len = function (object) {
    return exports.object.keys(object).length;
};

exports.object.has = function (object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
};

exports.object.keys = function (object) {
    var keys = [];
    for (var key in object) {
        if (exports.object.has(object, key))
            keys.push(key);
    }
    return keys;
};

exports.object.values = function (object) {
    var values = [];
    exports.object.keys(object).forEach(function (key) {
        values.push(object[key]);
    });
    return values;
};

exports.object.items = function (object) {
    var items = [];
    exports.object.keys(object).forEach(function (key) {
        items.push([key, object[key]]);
    });
    return items;
};

/**
 * Updates an object with the properties from another object.
 * This function is variadic requiring a minimum of two arguments.
 * The first argument is the object to update.  Remaining arguments
 * are considered the sources for the update.  If multiple sources
 * contain values for the same property, the last one with that
 * property in the arguments list wins.
 *
 * example usage:
 * util.update({}, { hello: "world" });  // -> { hello: "world" }
 * util.update({}, { hello: "world" }, { hello: "le monde" }); // -> { hello: "le monde" }
 *
 * @returns Updated object
 * @type Object
 *
 */
exports.object.update = function () {
    return variadicHelper(arguments, function(target, source) {
        var key;
        for (key in source) {
            if (exports.object.has(source, key)) {
                target[key] = source[key];
            }
        }
    });
};

exports.object.deepUpdate = function (target, source) {
    var key;
	for (key in source) {
        if(exports.object.has(source, key)) {
            if(typeof source[key] == "object" && exports.object.has(target, key)) {
                exports.object.deepUpdate(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
};

/**
 * Updates an object with the properties of another object(s) if those
 * properties are not already defined for the target object. First argument is
 * the object to complete, the remaining arguments are considered sources to
 * complete from. If multiple sources contain the same property, the value of
 * the first source with that property will be the one inserted in to the
 * target.
 *
 * example usage:
 * util.complete({}, { hello: "world" });  // -> { hello: "world" }
 * util.complete({ hello: "narwhal" }, { hello: "world" }); // -> { hello: "narwhal" }
 * util.complete({}, { hello: "world" }, { hello: "le monde" }); // -> { hello: "world" }
 *
 * @returns Completed object
 * @type Object
 *
 */
exports.object.complete = function () {
    return variadicHelper(arguments, function(target, source) {
        var key;
        for (key in source) {
            if (
                exports.object.has(source, key) &&
                !exports.object.has(target, key)
            ) {
                target[key] = source[key];
            }
        }
    });
};

exports.object.deepComplete = function () {
    return variadicHelper(arguments, function (target, source) {
        var key;
        for (key in source) {
            if (
                exports.object.has(source, key) &&
                !exports.object.has(target, key)
            ) {
                target[key] = exports.deepCopy(source[key]);
            }
        }
    });
};

exports.object.deepDiff = function () {
    var sources = Array.prototype.slice.call(arguments);
    var diff = exports.deepCopy(sources.shift());
    return variadicHelper([diff].concat(sources), function (diff, source) {
        var key;
        for (key in source) {
            if(exports.object.has(source, key)) {
                if(exports.object.has(diff, key)) {
                    if(exports.deepEqual(diff[key], source[key])) {
                        delete diff[key];
                    } else {
                        if(!exports.isArrayLike(diff[key])) {
                            diff[key] = exports.deepDiff(diff[key], source[key]);
                        }
                    }
                }
            }
        }
    });
};

exports.object.repr = function (object) {
    return "{" +
        exports.object.keys(object)
        .map(function (key) {
            return exports.enquote(key) + ": " +
                exports.repr(object[key]);
        }).join(", ") +
    "}";
};

/**
 * @param args Arguments list of the calling function
 * First argument should be a callback that takes target and source parameters.
 * Second argument should be target.
 * Remaining arguments are treated a sources.
 *
 * @returns Target
 * @type Object
 */
var variadicHelper = function (args, callback) {
    var sources = Array.prototype.slice.call(args);
    var target = sources.shift();

    sources.forEach(function(source) {
        callback(target, source);
    });

    return target;
};

// array

exports.array = function (array) {
    if (exports.no(array))
        return [];
    if (!exports.isArrayLike(array)) {
        if (
            array.toArray &&
            !Object.prototype.hasOwnProperty.call(array, 'toArray')
        ) {
            return array.toArray();
        } else if (
            array.forEach &&
            !Object.prototype.hasOwnProperty.call(array, 'forEach')
        ) {
            var results = [];
            array.forEach(function (value) {
                results.push(value);
            });
            return results;
        } else if (typeof array === "string") {
            return Array.prototype.slice.call(array);
        } else {
            return exports.items(array);
        }
    }
    return Array.prototype.slice.call(array);
};

exports.array.coerce = function (array) {
    if (!Array.isArray(array))
        return exports.array(array);
    return array;
};

exports.isArrayLike = function(object) {
    return Array.isArray(object) || exports.isArguments(object);
};

// from http://code.google.com/p/google-caja/wiki/NiceNeighbor
// by "kangax"
//
// Mark Miller posted a solution that will work in ES5 compliant
// implementations, that may provide future insight:
// (http://groups.google.com/group/narwhaljs/msg/116097568bae41c6)
exports.isArguments = function (object) {
    // ES5 reliable positive
    if (Object.prototype.toString.call(object) == "[object Arguments]")
        return true;
    // for ES5, we will still need a way to distinguish false negatives
    //  from the following code (in ES5, it is possible to create
    //  an object that satisfies all of these constraints but is
    //  not an Arguments object).
    // callee should exist
    if (
        !typeof object == "object" ||
        !Object.prototype.hasOwnProperty.call(object, 'callee') ||
        !object.callee || 
        // It should be a Function object ([[Class]] === 'Function')
        Object.prototype.toString.call(object.callee) !== '[object Function]' ||
        typeof object.length != 'number'
    )
        return false;
    for (var name in object) {
        // both "callee" and "length" should be { DontEnum }
        if (name === 'callee' || name === 'length') return false;
    }
    return true;
};

exports.array.copy = exports.array;

exports.array.deepCopy = function (array) {
    return array.map(exports.deepCopy);
};

exports.array.len = function (array) {
    return array.length;
};

exports.array.has = function (array, value) {
    return Array.prototype.indexOf.call(array, value) >= 0;
};

exports.array.put = function (array, key, value) {
    array.splice(key, 0, value);
    return array;
};

exports.array.del = function (array, begin, end) {
    array.splice(begin, end === undefined ? 1 : (end - begin));
    return array;
};

exports.array.eq = function (a, b, stack) {
    return exports.isArrayLike(b) &&
        a.length == b.length &&
        exports.zip(a, b).every(exports.apply(function (a, b) {
            return exports.eq(a, b, stack);
        }));
};

exports.array.lt = function (a, b) {
    var length = Math.max(a.length, b.length);
    for (var i = 0; i < length; i++)
        if (!exports.eq(a[i], b[i]))
            return exports.lt(a[i], b[i]);
    return false;
};

exports.array.repr = function (array) {
    return "[" + exports.map(array, exports.repr).join(', ') + "]";
};

exports.array.first = function (array) {
    return array[0];
};

exports.array.last = function (array) {
    return array[array.length - 1];
};

exports.apply = exports.operator('apply', 2, function (args, block) {
    return block.apply(this, args);
});

exports.copy = exports.operator('copy', 1, function (object) {
    if (exports.no(object))
        return object;
    if (exports.isArrayLike(object))
        return exports.array.copy(object);
    if (object instanceof Date)
        return object;
    if (typeof object == 'object')
        return exports.object.copy(object);
    return object;
});

exports.deepCopy = exports.operator('deepCopy', 1, function (object) {
    if (exports.no(object))
        return object;
    if (exports.isArrayLike(object))
        return exports.array.deepCopy(object);
    if (typeof object == 'object')
        return exports.object.deepCopy(object);
    return object;
});

exports.repr = exports.operator('repr', 1, function (object) {
    if (exports.no(object))
        return String(object);
    if (exports.isArrayLike(object))
        return exports.array.repr(object);
    if (typeof object == 'object' && !(object instanceof Date))
        return exports.object.repr(object);
    if (typeof object == 'string')
        return exports.enquote(object);
    return object.toString();
});

exports.keys = exports.operator('keys', 1, function (object) {
    if (exports.isArrayLike(object))
        return exports.range(object.length);
    else if (typeof object == 'object')
        return exports.object.keys(object);
    return [];
});

exports.values = exports.operator('values', 1, function (object) {
    if (exports.isArrayLike(object))
        return exports.array(object);
    else if (typeof object == 'object')
        return exports.object.values(object);
    return [];
});

exports.items = exports.operator('items', 1, function (object) {
    if (exports.isArrayLike(object) || typeof object == "string")
        return exports.enumerate(object);
    else if (typeof object == 'object')
        return exports.object.items(object);
    return [];
});

exports.len = exports.operator('len', 1, function (object) {
    if (exports.isArrayLike(object))
        return exports.array.len(object);
    else if (typeof object == 'object')
        return exports.object.len(object);
});

exports.has = exports.operator('has', 2, function (object, value) {
    if (exports.isArrayLike(object))
        return exports.array.has(object, value);
    else if (typeof object == 'object')
        return exports.object.has(object, value);
    return false;
});

exports.get = exports.operator('get', 2, function (object, key, value) {
    if (typeof object == "string") {
        if (!typeof key == "number")
            throw new Error("TypeError: String keys must be numbers");
        if (!exports.has(exports.range(object.length), key)) {
            if (arguments.length == 3)
                return value;
            throw new Error("KeyError: " + exports.repr(key));
        }
        return object.charAt(key);
    }
    if (typeof object == "object") {
        if (!exports.object.has(object, key)) {
            if (arguments.length == 3)
                return value;
            throw new Error("KeyError: " + exports.repr(key));
        }
        return object[key];
    } 
    throw new Error("Object does not have keys: " + exports.repr(object));
});

exports.set = exports.operator('set', 3, function (object, key, value) {
    object[key] = value;
    return object;
});

exports.getset = exports.operator('getset', 3, function (object, key, value) {
    if (!exports.has(object, key))
        exports.set(object, key, value);
    return exports.get(object, key);
});

exports.del = exports.operator('del', 2, function (object, begin, end) {
    if (exports.isArrayLike(object))
        return exports.array.del(object, begin, end);
    delete object[begin];
    return object;
});

exports.cut = exports.operator('cut', 2, function (object, key) {
    var result = exports.get(object, key);
    exports.del(object, key);
    return result;
});

exports.put = exports.operator('put', 2, function (object, key, value) {
    if (exports.isArrayLike(object))
        return exports.array.put(object, key, value);
    return exports.set(object, key, value);
});

exports.first = exports.operator('first', 1, function (object) {
    return object[0];
});

exports.last = exports.operator('last', 1, function (object) {
    return object[object.length - 1];
});

exports.update = exports.operator('update', 2, function () {
    var args = Array.prototype.slice.call(arguments);
    return exports.object.update.apply(this, args);
});

exports.deepUpdate = exports.operator('deepUpdate', 2, function (target, source) {
    exports.object.deepUpdate(target, source);
});

exports.complete = exports.operator('complete', 2, function (target, source) {
    var args = Array.prototype.slice.call(arguments);
    return exports.object.complete.apply(this, args);
});

exports.deepComplete = exports.operator('deepComplete', 2, function (target, source) {
    var args = Array.prototype.slice.call(arguments);
    return exports.object.deepComplete.apply(this, args);
});

exports.deepDiff = exports.operator('deepDiff', 2, function (target, source) {
    var args = Array.prototype.slice.call(arguments);
    return exports.object.deepDiff.apply(this, args);
});

exports.deepEqual = function(actual, expected) {
    
    // 7.1. All identical values are equivalent, as determined by ===.
    if (actual === expected) {
        return true;

    // 7.2. If the expected value is a Date object, the actual value is
    // equivalent if it is also a Date object that refers to the same time.
    } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();

    // 7.3. Other pairs that do not both pass typeof value == "object",
    // equivalence is determined by ==.
    } else if (typeof actual != 'object' && typeof expected != 'object') {
        return actual == expected;

    // XXX specification bug: this should be specified
    } else if (typeof expected == "string" || typeof actual == "string") {
        return expected == actual;

    // 7.4. For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical "prototype" property. Note: this
    // accounts for both named and indexed properties on Arrays.
    } else {
        return actual.prototype === expected.prototype && exports.object.eq(actual, expected);
    }
}

exports.remove = exports.operator('remove', 2, function (list, value) {
    var index;
    if ((index = list.indexOf(value))>-1)
        list.splice(index,1);
    return list;
});

// TODO insert
// TODO discard

exports.range = function () {
    var start = 0, stop = 0, step = 1;
    if (arguments.length == 1) {
        stop = arguments[0];
    } else {
        start = arguments[0];
        stop = arguments[1];
        step = arguments[2] || 1;
    }
    var range = [];
    for (var i = start; i < stop; i += step)
        range.push(i);
    return range;
};

exports.forEach = function (array, block) {
    Array.prototype.forEach.call(
        exports.array.coerce(array),
        block
    );
};

exports.forEachApply = function (array, block) {
    Array.prototype.forEach.call(
        exports.array.coerce(array),
        exports.apply(block)
    );
};

exports.map = function (array, block, context) {
    return Array.prototype.map.call(
        exports.array.coerce(array),
        block,
        context
    );
};

exports.mapApply = function (array, block) {
    return Array.prototype.map.call(
        exports.array.coerce(array),
        exports.apply(block)
    );
};

exports.every = exports.operator('every', 2, function (array, block, context) {
    return exports.all(exports.map(array, block, context));
});

exports.some = exports.operator('some', 2, function (array, block, context) {
    return exports.any(exports.map(array, block, context));
});

exports.all = exports.operator('all', 1, function (array) {
    array = exports.array.coerce(array);
    for (var i = 0; i < array.length; i++)
        if (!array[i])
            return false;
    return true;
});

exports.any = exports.operator('all', 1, function (array) {
    array = exports.array.coerce(array);
    for (var i = 0; i < array.length; i++)
        if (array[i])
            return true;
    return false;
});

exports.reduce = exports.operator('reduce', 2, function (array, block, basis) {
    array = exports.array.coerce(array);
    return array.reduce.apply(array, arguments);
});

exports.reduceRight = exports.operator('reduceRight', 2, function (array, block, basis) {
    array = exports.array.coerce(array);
    return array.reduceRight.apply(array, arguments);
});

exports.zip = function () {
    return exports.transpose(arguments);
};

exports.transpose = function (array) {
    array = exports.array.coerce(array);
    var transpose = [];
    var length = Math.min.apply(this, exports.map(array, function (row) {
        return row.length;
    }));
    for (var i = 0; i < array.length; i++) {
        var row = array[i];
        for (var j = 0; j < length; j++) {
            var cell = row[j];
            if (!transpose[j])
                transpose[j] = [];
            transpose[j][i] = cell;
        }
    }
    return transpose;
};

exports.enumerate = function (array, start) {
    array = exports.array.coerce(array);
    if (exports.no(start))
        start = 0;
    return exports.zip(
        exports.range(start, start + array.length),
        array
    );
};

// arithmetic, transitive, and logical operators

exports.is = function (a, b) {
    // <Mark Miller>
    if (a === b)
        // 0 === -0, but they are not identical
        return a !== 0 || 1/a === 1/b;
    // NaN !== NaN, but they are identical.
    // NaNs are the only non-reflexive value, i.e., if a !== a,
    // then a is a NaN.
    return a !== a && b !== b;
    // </Mark Miller>
};

exports.eq = exports.operator('eq', 2, function (a, b, stack) {
    if (!stack)
        stack = [];
    if (a === b)
        return true;
    if (typeof a !== typeof b)
        return false;
    if (exports.no(a))
        return exports.no(b);
    if (a instanceof Date)
        return a.valueOf() === b.valueOf();
    if (a instanceof RegExp)
        return a.source === b.source &&
            a.global === b.global &&
            a.ignoreCase === b.ignoreCase &&
            a.multiline === b.multiline;
    if (typeof a === "function") { 
        var caller = stack[stack.length - 1];
        // XXX what is this for?  can it be axed?
        // it comes from the "equiv" project code
        return caller !== Object &&
            typeof caller !== "undefined";
    }
    if (exports.isArrayLike(a))
        return exports.array.eq(
            a, b,
            stack.concat([a.constructor])
        );
    if (typeof a === 'object')
        return exports.object.eq(
            a, b,
            stack.concat([a.constructor])
        );
    return false;
});

exports.ne = exports.operator('ne', 2, function (a, b) {
    return !exports.eq(a, b);
});

exports.lt = exports.operator('lt', 2, function (a, b) {
    if (exports.no(a) != exports.no(b))
        return exports.no(a) > exports.no(b);
    if (exports.isArrayLike(a) && exports.isArrayLike(b))
        return exports.array.lt(a, b);
    return a < b;
});

exports.gt = exports.operator('gt', 2, function (a, b) {
    return !(exports.lt(a, b) || exports.eq(a, b));
});

exports.le = exports.operator(2, 'le', function (a, b) {
    return exports.lt(a, b) || exports.eq(a, b);
});

exports.ge = exports.operator(2, 'ge', function (a, b) {
    return !exports.lt(a, b);
});

exports.mul = exports.operator(2, 'mul', function (a, b) {
    if (typeof a == "string")
        return exports.string.mul(a, b);
    return a * b;
});

/*** by
    returns a `comparator` that compares
    values based on the values resultant from
    a given `relation`.
    accepts a `relation` and an optional comparator.

    To sort a list of objects based on their
    "a" key::

        objects.sort(by(get("a")))

    To get those in descending order::

        objects.sort(by(get("a")), desc)

    `by` returns a comparison function that also tracks
    the arguments you used to construct it.  This permits
    `sort` and `sorted` to perform a Schwartzian transform
    which can increase the performance of the sort
    by a factor of 2.
*/
exports.by = function (relation) {
    var compare = arguments[1];
    if (exports.no(compare))
        compare = exports.compare;
    var comparator = function (a, b) {
        a = relation(a);
        b = relation(b);
        return compare(a, b);
    };
    comparator.by = relation;
    comparator.compare = compare;
    return comparator;
};

exports.compare = exports.operator(2, 'compare', function (a, b) {
    if (exports.no(a) !== exports.no(b))
        return exports.no(b) - exports.no(a);
    if (typeof a === "number" && typeof b === "number")
        return a - b;
    return exports.eq(a, b) ? 0 : exports.lt(a, b) ? -1 : 1;
});

/*** sort
    an in-place array sorter that uses a deep comparison
    function by default (compare), and improves performance if
    you provide a comparator returned by "by", using a
    Schwartzian transform.
*/
exports.sort = function (array, compare) {
    if (exports.no(compare))
        compare = exports.compare;
    if (compare.by) {
        /* schwartzian transform */
        array.splice.apply(
            array,
            [0, array.length].concat(
                array.map(function (value) {
                    return [compare.by(value), value];
                }).sort(function (a, b) {
                    return compare.compare(a[0], b[0]);
                }).map(function (pair) {
                    return pair[1];
                })
            )
        );
    } else {
        array.sort(compare);
    }
    return array;
};

/*** sorted
    returns a sorted copy of an array using a deep
    comparison function by default (compare), and
    improves performance if you provide a comparator
    returned by "by", using a Schwartzian transform.
*/
exports.sorted = function (array, compare) {
    return exports.sort(exports.array.copy(array), compare);
};

exports.reverse = function (array) {
    return Array.prototype.reverse.call(array);
};

exports.reversed = function (array) {
    return exports.reverse(exports.array.copy(array));
};

exports.hash = exports.operator(1, 'hash', function (object) {
    return '' + object;
});

exports.unique = exports.operator(1, 'unique', function (array, eq, hash) {
    var visited = {};
    if (!eq) eq = exports.eq;
    if (!hash) hash = exports.hash;
    return array.filter(function (value) {
        var bucket = exports.getset(visited, hash(value), []);
        var finds = bucket.filter(function (other) {
            return eq(value, other);
        });
        if (!finds.length)
            bucket.push(value);
        return !finds.length;
    });
});

// string

exports.string = exports.operator(1, 'toString', function (object) {
    return '' + object;
});

exports.string.mul = function (string, n) {
    return exports.range(n).map(function () {
        return string;
    }).join('');
};

/*** escape
    escapes all characters of a string that are
    special to JavaScript and many other languages.
    Recognizes all of the relevant
    control characters and formats all other
    non-printable characters as Hex byte escape
    sequences or Unicode escape sequences depending
    on their size.

    Pass ``true`` as an optional second argument and
    ``escape`` produces valid contents for escaped
    JSON strings, wherein non-printable-characters are
    all escaped with the Unicode ``\u`` notation.
*/
/* more Steve Levithan flagrence */
var escapeExpression = /[^ !#-[\]-~]/g;
/* from Doug Crockford's JSON library */
var escapePatterns = {
    '\b': '\\b',    '\t': '\\t',
    '\n': '\\n',    '\f': '\\f',    '\r': '\\r',
    '"' : '\\"',    '\\': '\\\\'
};
exports.escape = function (value, strictJson) {
    if (typeof value != "string")
        throw new Error(
            module.path +
            "#escape: requires a string.  got " +
            exports.repr(value)
        );
    return value.replace(
        escapeExpression, 
        function (match) {
            if (escapePatterns[match])
                return escapePatterns[match];
            match = match.charCodeAt();
            if (!strictJson && match < 256)
                return "\\x" + exports.padBegin(match.toString(16), 2);
            return '\\u' + exports.padBegin(match.toString(16), 4);
        }
    );
};

/*** enquote
    transforms a string into a string literal, escaping
    all characters of a string that are special to
    JavaScript and and some other languages.

    ``enquote`` uses double quotes to be JSON compatible.

    Pass ``true`` as an optional second argument to
    be strictly JSON compliant, wherein all
    non-printable-characters are represented with
    Unicode escape sequences.
*/
exports.enquote = function (value, strictJson) {
    return '"' + exports.escape(value, strictJson) + '"';
};

/*** expand
    transforms tabs to an equivalent number of spaces.
*/
// TODO special case for \r if it ever matters
exports.expand = function (str, tabLength) {
    str = String(str);
    tabLength = tabLength || 4;
    var output = [],
        tabLf = /[\t\n]/g,
        lastLastIndex = 0,
        lastLfIndex = 0,
        charsAddedThisLine = 0,
        tabOffset, match;
    while (match = tabLf.exec(str)) {
        if (match[0] == "\t") {
            tabOffset = (
                tabLength - 1 -
                (
                    (match.index - lastLfIndex) +
                    charsAddedThisLine
                ) % tabLength
            );
            charsAddedThisLine += tabOffset;
            output.push(
                str.slice(lastLastIndex, match.index) +
                exports.mul(" ", tabOffset + 1)
            );
        } else if (match[0] === "\n") {
            output.push(str.slice(lastLastIndex, tabLf.lastIndex));
            lastLfIndex = tabLf.lastIndex;
            charsAddedThisLine = 0;
        }
        lastLastIndex = tabLf.lastIndex;
    }
    return output.join("") + str.slice(lastLastIndex);
};

var trimBeginExpression = /^\s\s*/g;
exports.trimBegin = function (value) {
    return String(value).replace(trimBeginExpression, "");  
};

var trimEndExpression = /\s\s*$/g;
exports.trimEnd = function (value) {
    return String(value).replace(trimEndExpression, "");    
};

exports.trim = function (value) {
    return String(value).replace(trimBeginExpression, "").replace(trimEndExpression, "");
};

/* generates padBegin and padEnd */
var augmentor = function (augment) {
    return function (value, length, pad) {
        if (exports.no(pad)) pad = '0';
        if (exports.no(length)) length = 2;
        value = String(value);
        while (value.length < length) {
            value = augment(value, pad);
        }
        return value;
    };
};

/*** padBegin

    accepts:
     - a `String` or `Number` value
     - a minimum length of the resultant `String`:
       by default, 2
     - a pad string: by default, ``'0'``.

    returns a `String` of the value padded up to at least
    the minimum length.  adds the padding to the begining
    side of the `String`.

*/
exports.padBegin = augmentor(function (value, pad) {
    return pad + value;
});

/*** padEnd

    accepts:
     - a `String` or `Number` value
     - a minimum length of the resultant `String`:
       by default, 2
     - a pad string: by default, ``'0'``.

    returns a `String` of the value padded up to at least
    the minimum length.  adds the padding to the end
    side of the `String`.

*/
exports.padEnd = augmentor(function (value, pad) {
    return value + pad;
});

/*** splitName
    splits a string into an array of words from an original
    string.
*/
// thanks go to Steve Levithan for this regular expression
// that, in addition to splitting any normal-form identifier
// in any case convention, splits XMLHttpRequest into
// "XML", "Http", and "Request"
var splitNameExpression = /[a-z]+|[A-Z](?:[a-z]+|[A-Z]*(?![a-z]))|[.\d]+/g;
exports.splitName = function (value) {
    var result = String(value).match(splitNameExpression);
    if (result)
        return result;
    return [value];
};

/*** joinName
    joins a list of words with a given delimiter
    between alphanumeric words.
*/
exports.joinName = function (delimiter, parts) {
    if (exports.no(delimiter)) delimiter = '_';
    parts.unshift([]);
    return parts.reduce(function (parts, part) {
        if (
            part.match(/\d/) &&
            exports.len(parts) && parts[parts.length-1].match(/\d/)
        ) {
            return parts.concat([delimiter + part]);
        } else {
            return parts.concat([part]);
        }
    }).join('');
};

/*** upper
    converts a name to ``UPPER CASE`` using
    a given delimiter between numeric words.

    see:
     - `lower`
     - `camel`
     - `title`

*/
exports.upper = function (value, delimiter) {
    if (exports.no(delimiter))
        return value.toUpperCase();
    return exports.splitName(value).map(function (part) {
        return part.toUpperCase();
    }).join(delimiter);
};

/*** lower
    converts a name to a ``lower case`` using
    a given delimiter between numeric words.

    see:
     - `upper`
     - `camel`
     - `title`

*/
exports.lower = function (value, delimiter) {
    if (exports.no(delimiter))
        return String(value).toLowerCase();
    return exports.splitName(value).map(function (part) {
        return part.toLowerCase();
    }).join(delimiter);
};

/*** camel
    converts a name to ``camel Case`` using
    a given delimiter between numeric words.

    see:
     - `lower`
     - `upper`
     - `title`

*/
exports.camel = function (value, delimiter) {
    return exports.joinName(
        delimiter,
        exports.mapApply(
            exports.enumerate(exports.splitName(value)),
            function (n, part) {
                if (n) {
                    return (
                        part.substring(0, 1).toUpperCase() +
                        part.substring(1).toLowerCase()
                    );
                } else {
                    return part.toLowerCase();
                }
            }
        )
    );
};

/*** title
    converts a name to ``Title Case`` using
    a given delimiter between numeric words.

    see:
     - `lower`
     - `upper`
     - `camel`

*/
exports.title = function (value, delimiter) {
    return exports.joinName(
        delimiter,
        exports.splitName(value).map(function (part) {
            return (
                part.substring(0, 1).toUpperCase() +
                part.substring(1).toLowerCase()
            );
        })
    );
};


},{}],22:[function(require,module,exports){
(function (process){
/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {
      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      this._maxListeners = conf.maxListeners !== undefined ? conf.maxListeners : defaultMaxListeners;

      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);
      conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    } else {
      this._maxListeners = defaultMaxListeners;
    }
  }

  function logPossibleMemoryLeak(count, eventName) {
    var errorMsg = '(node) warning: possible EventEmitter memory ' +
        'leak detected. ' + count + ' listeners added. ' +
        'Use emitter.setMaxListeners() to increase limit.';

    if(this.verboseMemoryLeak){
      errorMsg += ' Event name: ' + eventName + '.';
    }

    if(typeof process !== 'undefined' && process.emitWarning){
      var e = new Error(errorMsg);
      e.name = 'MaxListenersExceededWarning';
      e.emitter = this;
      e.count = count;
      process.emitWarning(e);
    } else {
      console.error(errorMsg);

      if (console.trace){
        console.trace();
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    this.verboseMemoryLeak = false;
    configure.call(this, conf);
  }
  EventEmitter.EventEmitter2 = EventEmitter; // backwards compatibility for exporting EventEmitter property

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name !== undefined) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else {
          if (typeof tree._listeners === 'function') {
            tree._listeners = [tree._listeners];
          }

          tree._listeners.push(listener);

          if (
            !tree._listeners.warned &&
            this._maxListeners > 0 &&
            tree._listeners.length > this._maxListeners
          ) {
            tree._listeners.warned = true;
            logPossibleMemoryLeak.call(this, tree._listeners.length, name);
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    if (n !== undefined) {
      this._maxListeners = n;
      if (!this._conf) this._conf = {};
      this._conf.maxListeners = n;
    }
  };

  EventEmitter.prototype.event = '';


  EventEmitter.prototype.once = function(event, fn) {
    return this._once(event, fn, false);
  };

  EventEmitter.prototype.prependOnceListener = function(event, fn) {
    return this._once(event, fn, true);
  };

  EventEmitter.prototype._once = function(event, fn, prepend) {
    this._many(event, 1, fn, prepend);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    return this._many(event, ttl, fn, false);
  }

  EventEmitter.prototype.prependMany = function(event, ttl, fn) {
    return this._many(event, ttl, fn, true);
  }

  EventEmitter.prototype._many = function(event, ttl, fn, prepend) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      return fn.apply(this, arguments);
    }

    listener._origin = fn;

    this._on(event, listener, prepend);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all && this._all.length) {
      handler = this._all.slice();
      if (al > 3) {
        args = new Array(al);
        for (j = 0; j < al; j++) args[j] = arguments[j];
      }

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this, type);
          break;
        case 2:
          handler[i].call(this, type, arguments[1]);
          break;
        case 3:
          handler[i].call(this, type, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
      if (typeof handler === 'function') {
        this.event = type;
        switch (al) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          args = new Array(al - 1);
          for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          handler.apply(this, args);
        }
        return true;
      } else if (handler) {
        // need to make copy of handlers because list can change in the middle
        // of emit call
        handler = handler.slice();
      }
    }

    if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this);
          break;
        case 2:
          handler[i].call(this, arguments[1]);
          break;
        case 3:
          handler[i].call(this, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
      return true;
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }

    return !!this._all;
  };

  EventEmitter.prototype.emitAsync = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
        if (!this._events.newListener) { return Promise.resolve([false]); }
    }

    var promises= [];

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all) {
      if (al > 3) {
        args = new Array(al);
        for (j = 1; j < al; j++) args[j] = arguments[j];
      }
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(this._all[i].call(this, type));
          break;
        case 2:
          promises.push(this._all[i].call(this, type, arguments[1]));
          break;
        case 3:
          promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
          break;
        default:
          promises.push(this._all[i].apply(this, args));
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      switch (al) {
      case 1:
        promises.push(handler.call(this));
        break;
      case 2:
        promises.push(handler.call(this, arguments[1]));
        break;
      case 3:
        promises.push(handler.call(this, arguments[1], arguments[2]));
        break;
      default:
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
        promises.push(handler.apply(this, args));
      }
    } else if (handler && handler.length) {
      handler = handler.slice();
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(handler[i].call(this));
          break;
        case 2:
          promises.push(handler[i].call(this, arguments[1]));
          break;
        case 3:
          promises.push(handler[i].call(this, arguments[1], arguments[2]));
          break;
        default:
          promises.push(handler[i].apply(this, args));
        }
      }
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        return Promise.reject(arguments[1]); // Unhandled 'error' event
      } else {
        return Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }

    return Promise.all(promises);
  };

  EventEmitter.prototype.on = function(type, listener) {
    return this._on(type, listener, false);
  };

  EventEmitter.prototype.prependListener = function(type, listener) {
    return this._on(type, listener, true);
  };

  EventEmitter.prototype.onAny = function(fn) {
    return this._onAny(fn, false);
  };

  EventEmitter.prototype.prependAny = function(fn) {
    return this._onAny(fn, true);
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype._onAny = function(fn, prepend){
    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    if(prepend){
      this._all.unshift(fn);
    }else{
      this._all.push(fn);
    }

    return this;
  }

  EventEmitter.prototype._on = function(type, listener, prepend) {
    if (typeof type === 'function') {
      this._onAny(type, listener);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if (this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else {
      if (typeof this._events[type] === 'function') {
        // Change to array.
        this._events[type] = [this._events[type]];
      }

      // If we've already got an array, just add
      if(prepend){
        this._events[type].unshift(listener);
      }else{
        this._events[type].push(listener);
      }

      // Check for listener leak
      if (
        !this._events[type].warned &&
        this._maxListeners > 0 &&
        this._events[type].length > this._maxListeners
      ) {
        this._events[type].warned = true;
        logPossibleMemoryLeak.call(this, this._events[type].length, type);
      }
    }

    return this;
  }

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }

        this.emit("removeListener", type, listener);

        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }

        this.emit("removeListener", type, listener);
      }
    }

    function recursivelyGarbageCollect(root) {
      if (root === undefined) {
        return;
      }
      var keys = Object.keys(root);
      for (var i in keys) {
        var key = keys[i];
        var obj = root[key];
        if ((obj instanceof Function) || (typeof obj !== "object") || (obj === null))
          continue;
        if (Object.keys(obj).length > 0) {
          recursivelyGarbageCollect(root[key]);
        }
        if (Object.keys(obj).length === 0) {
          delete root[key];
        }
      }
    }
    recursivelyGarbageCollect(this.listenerTree);

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          this.emit("removeListenerAny", fn);
          return this;
        }
      }
    } else {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++)
        this.emit("removeListenerAny", fns[i]);
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else if (this._events) {
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.eventNames = function(){
    return Object.keys(this._events);
  }

  EventEmitter.prototype.listenerCount = function(type) {
    return this.listeners(type).length;
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (typeof define === 'function' && define.amd) {
     // AMD. Register as an anonymous module.
    define(function() {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

}).call(this,require('_process'))
},{"_process":33}],23:[function(require,module,exports){
(function (setImmediate){
"use strict";

var BROWSER = browser;

var WILDFIRE = exports.WILDFIRE = require("./wildfire");

WILDFIRE.VERBOSE = false;
WILDFIRE.once("error", function (err) {
  console.error(err);
});

async function initCurrentContext() {
  if (currentContext) {
    return;
  }

  var tabDetails = (await BROWSER.tabs.query({
    currentWindow: true,
    active: true
  }))[0];

  if (tabDetails.url) {
    setCurrentContextFromDetails({
      tabId: tabDetails.id,
      url: tabDetails.url
    }, true);
  }
}

setImmediate(initCurrentContext);

function broadcastForContext(context, message) {
  message.context = context;
  message.to = "message-listener";
  return BROWSER.runtime.sendMessage(message).catch(function (err) {
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
var currentContext = null;
var lastDetailsForTabId = {};

function setCurrentContextFromDetails(details, clearIfNew) {
  if (!details) {
    if (currentContext) {
      currentContext = null;
      broadcastForContext(currentContext, {
        event: "currentContext"
      });
    }
  } else {
    var newCtx = {
      url: details.url,
      tabId: details.tabId
    };
    newCtx.pageUid = JSON.stringify(newCtx);
    newCtx.hostname = details.url.replace(/^[^:]+:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1");

    if (newCtx !== currentContext && (!newCtx || !currentContext || newCtx.pageUid !== currentContext.pageUid)) {
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
      broadcastForContext(currentContext, {
        event: "prepare"
      });
    }
  }
}

async function runtime_onMessage(message) {
  if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.runtime -| onMessage (message):", message);

  if (message.to === "broadcast") {
    if (message.event === "currentContext") {
      if (!currentContext) {
        await initCurrentContext();
      }

      broadcastForContext(currentContext, message);
    } else {
      if (!message.context && !currentContext) {
        await initCurrentContext();
      }

      broadcastForContext(message.context || currentContext || null, message);
    }
  } else if (message.to === "background") {
    if (message.event === "reload") {
      browser.tabs.reload(message.context.tabId, {
        bypassCache: true
      });
    }
  }
}

BROWSER.runtime.onMessage.addListener(runtime_onMessage);
WILDFIRE.on("destroy", function () {
  BROWSER.runtime.onMessage.removeListener(runtime_onMessage);
});

function webNavigation_onBeforeNavigate(details) {
  if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.webNavigation -| onBeforeNavigate (details):", details);

  if (details.parentFrameId !== -1) {
    return;
  }

  setCurrentContextFromDetails(details);
}

BROWSER.webNavigation.onBeforeNavigate.addListener(webNavigation_onBeforeNavigate, {
  url: [{}]
});
WILDFIRE.on("destroy", function () {
  BROWSER.webNavigation.onBeforeNavigate.removeListener(webNavigation_onBeforeNavigate);
});

function webRequest_onBeforeRequest(details) {
  if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.webRequest -| onBeforeRequest (details):", details);

  if (typeof details.documentUrl !== "undefined" || details.parentFrameId !== -1) {
    return;
  }

  setCurrentContextFromDetails(details, true);
}

BROWSER.webRequest.onBeforeRequest.addListener(webRequest_onBeforeRequest, {
  urls: ["<all_urls>"]
});
WILDFIRE.on("destroy", function () {
  BROWSER.webRequest.onBeforeRequest.removeListener(webRequest_onBeforeRequest);
});

function tabs_onRemoved(tabId) {
  if (WILDFIRE.VERBOSE) console.log("[background] BROWSER.tabs -| onRemoved (tabId):", tabId);

  if (currentContext && currentContext.tabId == tabId) {
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
}).call(this,require("timers").setImmediate)
},{"./wildfire":29,"timers":34}],24:[function(require,module,exports){
"use strict";

exports.for = function (API) {
  var processor = null;
  var requestIndex = 0;

  function onRequest(request) {
    var requestId = null;
    var headers = {};
    request.requestHeaders.forEach(function (header) {
      if (header.name.toLowerCase() === "x-request-id") {
        requestId = header.value;
      }

      headers[header.name] = header.value;
    });
    var result = processor({
      "id": requestId || "id:" + request.url + ":" + requestIndex,
      "url": request.url,
      "hostname": request.url.replace(/^https?:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1"),
      "port": request.url.replace(/^https?:\/\/[^:]+:?(\d+)?\/.*?$/, "$1") || 80,
      "method": request.method,
      "headers": headers,
      setRequestHeader: function (name, value) {
        request.requestHeaders.filter(function (header) {
          return header.name === name;
        })[0].value = value;
      }
    });

    if (!result) {
      return {};
    }

    return result.then(function (changes) {
      if (!changes) {
        return {};
      }

      var ret = {};

      if (changes.requestHeaders) {
        var headers = [];
        Object.keys(changes.requestHeaders).forEach(function (name) {
          headers.push({
            name: name,
            value: changes.requestHeaders[name]
          });
        });
        ret.requestHeaders = headers;
      }

      return ret;
    });
  }

  API.BROWSER.webRequest.onBeforeSendHeaders.addListener(onRequest, {
    urls: ["<all_urls>"]
  }, ["blocking", "requestHeaders"]);
  API.on("destroy", function () {
    API.BROWSER.webRequest.onBeforeSendHeaders.removeListener(onRequest);
  });
  return {
    register: function (_processor) {
      processor = _processor;
    }
  };
};
},{}],25:[function(require,module,exports){
"use strict";

exports.for = function (API) {
  var pageUrlByTabId = {};
  var pageTimestampByTabId = {};

  function onHeadersReceived(response) {
    var pageUrl = response.documentUrl || response.url;
    var pageTimeStamp = response.timeStamp;

    if (response.parentFrameId !== -1) {
      pageUrl = pageUrlByTabId[response.tabId] || null;
      pageTimeStamp = pageTimestampByTabId[response.tabId] || null;
    } else if (response.type === "main_frame") {
        pageUrlByTabId[response.tabId] = pageUrl;
        pageTimestampByTabId[response.tabId] = pageTimeStamp;
      }

    console.log("Make pageUrl", pageUrl, "from response", response);
    API.emit("http.response", {
      "request": {
        "id": response.requestId,
        "context": {
          frameId: response.frameId,
          tabId: response.tabId,
          url: response.url,
          hostname: response.url.replace(/^[^:]+:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1"),
          requestId: response.requestId,
          requestType: response.type,
          documentUrl: response.documentUrl,
          timeStamp: response.timeStamp,
          pageUrl: pageUrl,
          pageTimeStamp: pageTimeStamp,
          pageUid: JSON.stringify({
            url: pageUrl,
            tabId: response.tabId
          }),
          requestUid: JSON.stringify({
            url: response.url,
            timeStamp: response.timeStamp,
            frameId: response.frameId,
            tabId: response.tabId
          })
        }
      },
      "status": response.statusCode,
      "headers": response.responseHeaders
    });
  }

  API.BROWSER.webRequest.onHeadersReceived.addListener(onHeadersReceived, {
    urls: ["<all_urls>"]
  }, ["responseHeaders"]);
  API.on("destroy", function () {
    API.BROWSER.webRequest.onHeadersReceived.removeListener(onHeadersReceived);
  });
  return {};
};
},{}],26:[function(require,module,exports){
"use strict";

exports.for = function (API) {
  var transportReceiver1 = API.WILDFIRE.Receiver();
  transportReceiver1.setId("http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1");
  transportReceiver1.addListener({
    onMessageReceived: function (request, message) {
      message.context = request.context;

      if (API.on && API.on.firePHPMessage) {
        API.on.firePHPMessage(message);
      }
    }
  });
  API.httpHeaderChannel.addReceiver(transportReceiver1);
  var transportReceiver2 = API.WILDFIRE.Receiver();
  transportReceiver2.setId("http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1");
  transportReceiver2.addListener({
    onMessageReceived: function (request, message) {
      message.context = request.context;

      if (API.on && API.on.firePHPMessage) {
        API.on.firePHPMessage(message);
      }
    }
  });
  API.httpHeaderChannel.addReceiver(transportReceiver2);
  return {};
};
},{}],27:[function(require,module,exports){
"use strict";

exports.for = function (API) {
  var receivers = {
    "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/insight/controller/0": {},
    "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/insight/plugin/0": {},
    "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/insight/package/0": {},
    "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/insight/selective/0": {},
    "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/request/0": {},
    "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/page/0": {
      messageHandler: "insightMessage"
    },
    "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/process/0": {}
  };
  Object.keys(receivers).forEach(function (uri) {
    var receiver = API.WILDFIRE.Receiver();
    receiver.setId(uri);
    receiver.addListener({
      onMessageReceived: function (request, message) {
        message.context = request.context;

        if (receivers[uri].messageHandler && API.on && API.on[receivers[uri].messageHandler]) {
          API.on[receivers[uri].messageHandler](message);
        } else {
          console.log("IGNORING insight MESSAGE:", message);
        }
      }
    });
    API.httpHeaderChannel.addReceiver(receiver);
  });
  return {};
};
},{}],28:[function(require,module,exports){
"use strict";

var BROWSER = typeof browser !== "undefined" && browser || null;
var domainSettingsCache = {};

if (BROWSER) {
  BROWSER.storage.onChanged.addListener(function (changes, area) {
    for (var item of Object.keys(changes)) {
      if (!/^domain\[.+\]\..+$/.test(item)) continue;
      domainSettingsCache[item] = changes[item].newValue;
    }
  });
}

exports.getSetting = function (name) {
  function get() {
    if (!BROWSER) return Promise.resolve(null);
    return BROWSER.storage.local.get(name).then(function (value) {
      return domainSettingsCache[name] = value[name];
    });
  }

  if (typeof domainSettingsCache[name] === "undefined") {
    get();
    return Promise.resolve(false);
  }

  return get();
};

exports.setSetting = function (name, value) {
  if (!BROWSER) return Promise.resolve(null);
  return BROWSER.storage.local.set(name, value);
};

exports.getDomainSettingsForDomain = function (domain) {
  return exports.getSetting("domain[" + domain + "].enabled").then(function (enabled) {
    return exports.getSetting("domain[" + domain + "].enableUserAgentHeader").then(function (enableUserAgentHeader) {
      return exports.getSetting("domain[" + domain + "].enableFirePHPHeader").then(function (enableFirePHPHeader) {
        return exports.getSetting("domain[" + domain + "].enableChromeLoggerData").then(function (enableChromeLoggerData) {
          return Promise.resolve({
            "enabled": enabled,
            "enableUserAgentHeader": enableUserAgentHeader,
            "enableFirePHPHeader": enableFirePHPHeader,
            "enableChromeLoggerData": enableChromeLoggerData
          });
        });
      });
    });
  });
};

exports.isEnabledForDomain = function (domain) {
  return exports.getDomainSettingsForDomain(domain).then(function (settings) {
    return settings.enabled && (settings.enableUserAgentHeader || settings.enableFirePHPHeader || settings.enableChromeLoggerData);
  });
};

exports.getDomainSettingsForRequest = function (request) {
  return exports.getDomainSettingsForDomain(request.hostname).then(function (settings) {
    return settings;
  });
};
},{}],29:[function(require,module,exports){
"use strict";

var EVENTS = require("eventemitter2");

var API = module.exports = new EVENTS();
API.console = console;
API.BROWSER = browser;
API.WILDFIRE = require("wildfire-for-js");

var REQUEST_OBSERVER = require("./adapters/http-request-observer").for(API);

var RESPONSE_OBSERVER = require("./adapters/http-response-observer").for(API);

var SETTINGS = require("./settings");

var forceEnabled = false;

API.forcedEnable = function (oo) {
  forceEnabled = oo;
};

API.on.chromeLoggerMessage = function (message) {
  API.emit("message.chromelogger", message);
};

API.on.insightMessage = function (message) {
  API.emit("message.insight", message);
};

API.on.firePHPMessage = function (message) {
  API.emit("message.firephp", message);
};

API.on.transport = function (info) {
  API.emit("message.transport", info);
};

function isEnabled() {
  return true;
}

var httpHeaderChannel = API.httpHeaderChannel = API.WILDFIRE.HttpHeaderChannel({
  "enableTransport": false,
  onError: function (err) {
    console.error("HttpHeaderChannel error:", err);
    API.emit("error", err);
  }
});
httpHeaderChannel.setNoReceiverCallback(function (id) {
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

require("./receivers/firephp").for(API);

require("./receivers/insight").for(API);

var announceDispatcher = API.WILDFIRE.Dispatcher();
announceDispatcher.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/announce/0.1.0');
announceDispatcher.setChannel(httpHeaderChannel);

function getAnnounceMessageForRequest(request) {
  if (!getAnnounceMessageForRequest._forHostnames) {
    getAnnounceMessageForRequest._forHostnames = {};
  }

  var cache = getAnnounceMessageForRequest._forHostnames;

  if (cache[request.hostname]) {
    return cache[request.hostname];
  }

  cache[request.hostname] = new API.WILDFIRE.Message();
  cache[request.hostname].setData(JSON.stringify({
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
  if (!isEnabled()) {
    return null;
  }

  return SETTINGS.getDomainSettingsForRequest(request).then(function (settings) {
    hostnameSettings[request.hostname] = settings;

    if (!forceEnabled && !settings.enabled) {
      return {};
    }

    if (forceEnabled || settings.enableUserAgentHeader) {
      if (!request.headers["User-Agent"].match(/\sFirePHP\/([\.|\d]*)\s?/)) {
        request.headers["User-Agent"] = request.headers["User-Agent"] + " FirePHP/0.5";
      }
    }

    if (forceEnabled || settings.enableFirePHPHeader) {
      request.headers["X-FirePHP-Version"] = "0.4";
    }

    return {
      requestHeaders: request.headers
    };
  });
});
API.on("http.response", function (response) {
  if (!isEnabled()) {
    return;
  }

  var settings = hostnameSettings[response.request.context.hostname];

  if (!settings || !forceEnabled && !settings.enabled) {
    return;
  }

  if (API.VERBOSE) console.log("[wildfire] response domain settings for '" + response.request.context.hostname + "':", settings);
  var chromeLoggerMessage = response.headers.filter(function (header) {
    return header.name === "X-ChromeLogger-Data";
  });

  if (chromeLoggerMessage.length > 0) {
    chromeLoggerMessage.forEach(function (header) {
      try {
        var message = decodeURIComponent(escape(atob(header.value)));
        message = JSON.parse(message);
        API.on.chromeLoggerMessage(message);
      } catch (err) {
        console.error("header", header);
        console.error("Error processing message:", err);
      }
    });
  } else {
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
  }
});
},{"./adapters/http-request-observer":24,"./adapters/http-response-observer":25,"./receivers/firephp":26,"./receivers/insight":27,"./settings":28,"eventemitter2":22,"wildfire-for-js":12}],30:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],31:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":30,"ieee754":32}],32:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],33:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],34:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":33,"timers":34}]},{},[23])(23)
});

	});
});