
//const BROWSER = (typeof browser != "undefined") ? browser : chrome;
const WINDOW = window;


exports.main = function (JSONREP, node, options) {

    return JSONREP.markupNode(node).then(function (code) {

        return JSONREP.makeRep('<div class="console">' + code + '</div>', {
            css: (css () >>>

                :scope.console {
                    overflow-x: hidden;
                    overflow-y: auto;
                    border-right: 1px solid #dcdcdc;
                    height: 100vh;
                }

                :scope.console DIV.request {
                    padding: 3px;
                    padding-left: 10px;
                    padding-right: 10px;
                    color: #FFFFFF;
                    background-color: #0000FF;
                    border: 1px solid black;
                }

            <<<),
            on: {
                mount: function (el) {

//console.log("[devtools] BROWSER.tabId:", BROWSER.devtools.inspectedWindow.tabId);

//if (message.to === "background") {
//    if (message.event === "resolveTabId") {

                    const COMPONENT = require("./component");

                    const comp = COMPONENT.for({
                        browser: WINDOW.crossbrowser
                    });

                    comp.on("setting.enabled", function (enabled) {
                        if (!enabled) {
                            if (
                                comp.currentContext &&
                                consoles[comp.currentContext.pageUid]
                            ) {
//console.log("CLEAR CONSOLE DUE TO SETTINGS CHANGE");
                                consoles[comp.currentContext.pageUid].getAPI().clear();
                            }
                        }
                    });


                    function syncConsoleVisibility () {

                        if (!comp.currentContext) {
                            Object.keys(consoles).forEach(function (id) {
                                consoles[id].hide();
                            });
                            return;
                        }
                        if (persistentConsole) {
                            return;
                        }
                        Object.keys(consoles).forEach(function (id) {
                            if (
/*                                
                                (
                                    persistLogs &&
                                    id
                                ) ||
*/
                                id === comp.currentContext.pageUid
                            ) {
                                consoles[id].show();
                            } else {
                                consoles[id].hide();
                            }
                        });                        
                    }


                    comp.on("changed.context", function (context) {
                        comp.contextChangeAcknowledged();

//console.log("CONTEXT HAS CHANGED IN CONSOLE", context);

                        syncPersistentConsole();
                        syncConsoleVisibility();
                    });

                    function ensureRequestWrapper (fc, context) {
                        const panelEl = fc.getPanelEl();
//console.log("Use context", context);

                        const id = (context.requestUid).replace(/["\{\}]/g, '_');
                        fc._requestWrappers = fc._requestWrappers || {};
                        if (!fc._requestWrappers[id]) {

                            let requestType = context.requestType;
                            if (requestType === "sub_frame") {
                                requestType = "iframe";
                            } else
                            if (requestType === "main_frame") {
                                requestType = "page";
                            } else
                            if (requestType === "xmlhttprequest") {
                                requestType = "ajax";
                            }
                            requestType = requestType.toUpperCase();

//console.log("MAKE NEW REQUEST WRAPPER!");

                            let domNode = WINDOW.document.createElement("div");
                            panelEl.appendChild(domNode);

                            fc._requestWrappers[id] = WINDOW.FC.fireconsole.repRenderer.renderNodeInto({
                                "meta": {
                                    "wrapper": "wrappers/request"
                                },
                                "value": {
                                    "title": {
                                        "type": "string",
                                        "value": context.url
                                    },
                                    "typeLabel": {
                                        "type": "string",
                                        "value": requestType
                                    }
                                }                                        
                            }, domNode).then(function () {

                                const consoleEl = domNode.querySelector('.body');

                                const fireconsole = new WINDOW.FC.FireConsole();
                                fireconsole.setPanelElement(consoleEl);
                                
                                fireconsole.onAny(function (name, value) {
                                    WINDOW.FC.fireconsole.emit(name, value);
                                });
    
                                return fireconsole.getAPI();
                            }, function (err) {
                                throw err;
                            });
                        }

//console.log("RETURN EXISTING REQUEST WRAPPER!");

                        return fc._requestWrappers[id];
                    }

                    comp.on("message", function (message) {
                        try {
/*                            
                            if (message.event === "currentContext") {
                                lastRequestConsole = getConsoleForContext(message.context);
                                if (persistLogs) {
                                    if (!persistentConsole) {
                                        persistentConsole = lastRequestConsole;
                                    }
                                } else {
                                    if (message.context.requestType === "main_frame") {
                                        lastRequestConsole.getAPI().clear();
console.log("CLEAR lastRequestConsole CONSOLE!!");

                                    }
                                }
                            } else         
*/
                            if (message.message) {
                                message.message.context = message.context;

                                let fc = getConsoleForContext(message.context);
                                ensureRequestWrapper(fc, message.context).then(function (api) {

//console.log("APPEND MESSAGE TO REQUEST CONSOLE");

//console.log("LOG TO CONSOLE 1", message.message);
                                    message.message.meta = (
                                        message.message.meta &&
                                        JSON.parse(message.message.meta)
                                    ) || {};
                                    message.message.meta.console = message.message.meta.console || {};
                                    message.message.meta.console.enableFileInspect = true;

                                    api.send(message.message);
                                    scrollIfBottom();
                                });
                            } else
                            if (message.event === "prepare") {

//console.log("PREPARE CONSOLE!!!", message.context);

                                let fc = getConsoleForContext(message.context);
                                if (!persistLogs) {
//console.log("CLEAR lastRequestConsole CONSOLE!!");
                                    fc.getAPI().clear();
                                }

                                /*
                                lastRequestConsole = getConsoleForContext(message.context);
                                if (persistLogs) {
                                    if (!persistentConsole) {
                                        persistentConsole = lastRequestConsole;
                                    }
                                } else {
        console.log("CLEAR lastRequestConsole CONSOLE!!");
                                    lastRequestConsole.getAPI().clear();
                                }
                                */

                            } else
                            if (message.event === "clear") {
//console.log("CLEAR CONSOLE!!!", message.context);

                                Object.keys(consoles).forEach(function (id) {
//console.log("console id", id);                                    
                                    if (id == message.context.pageUid) {
//                                        if (consoles[id].isShowing()) {
                                        consoles[id].getAPI().clear();
                                    }
                                });
                                scrollIfBottom();
                            } else
                            if (message.event === "destroyContext") {
//console.log("DESTROY CONTEXT!!!", message.context);

                                Object.keys(consoles).forEach(function (id) {
                                    if (id == message.context.pageUid) {
                                        WINDOW.FC.fireconsole.destroyConsoleForId(id.replace(/["\{\}]/g, '_'));
                                        delete consoles[id];
                                    }
                                });
                            }
                        } catch (err) {
                            console.error("message", JSON.stringify(message, null, 4));
                            console.error("ERROR", err.message + "\n" + err.stack);
                            throw err;
                        }
                    });


                    var consoles = {};
//                    var lastRequestConsole = null;
                    var persistentConsole = null;
                   

                    function syncPersistentConsole () {

                        return WINDOW.crossbrowser.storage.local.get("persist-on-navigate").then(function (value) {
                            persistLogs = value["persist-on-navigate"];

                            if (persistLogs) {
                                if (
                                    !persistentConsole &&
                                    comp.currentContext
                                ) {
                                    persistentConsole = getConsoleForContext(comp.currentContext);
                                }
                            } else {
                                if (persistentConsole) {
                                    // Clear 'persistentConsole'
                                    if (comp.currentContext) {
                                        getConsoleForContext(comp.currentContext).getAPI().clear();
                                    }
                                    persistentConsole = null;
                                    // Clear currentContext console
                                    if (comp.currentContext) {
                                        getConsoleForContext(comp.currentContext).getAPI().clear();
                                    }
                                }
                            }

                            syncConsoleVisibility();
                        });
                    }
                    
                    var persistLogs = false;
                    if (WINDOW.crossbrowser) {
                        WINDOW.crossbrowser.storage.onChanged.addListener(function (changes, area) {
                            if (changes["persist-on-navigate"]) {

                                syncPersistentConsole();
//                                persistLogs = changes["persist-on-navigate"].newValue;


/*
                                if (
                                    persistLogs &&
                                    !persistentConsole
                                ) {
                                    persistentConsole = lastRequestConsole;
                                } else
                                if (
                                    !persistLogs &&
                                    persistentConsole
                                ) {
                                    persistentConsole = null;
                                }
*/
                            }
                        });
                    }

/*
                    function makeKeyForContext (context) {
                        //if (
                        //    typeof context.requestType === "undefined" ||
                        //    context.requestType === "main_frame"
                        //) {
                        //    return context.tabId + ":" + context.url;
                        //} else {
                            if (
                                !context ||
                                !context.pageUid
                            ) {
                                console.error("context", context);
                                throw new Error(`No 'context.pageUid' found!`);
                            }

                            return context.pageUid.replace(/["\{\}]/g, '_');//tabId + ":combined";// + (context.topUrl || context.url);
                        //}
                    }
*/

                    function getConsoleForContext (context) {
                        if (persistentConsole) {
                            return persistentConsole;
                        }
                        if (
                            !context ||
                            typeof context.pageUid === "undefined"
                        ) {
                            console.error("context", context);
                            throw new Error("'context' does not have required property 'pageUid'!");
                        }
//                        var key = makeKeyForContext(context);
                        if (!consoles[context.pageUid]) {
//console.log("MAKE CONSOLE FOR Page UID:", context.pageUid);                            
                            consoles[context.pageUid] = WINDOW.FC.fireconsole.consoleForId(context.pageUid.replace(/["\{\}]/g, '_'));
                        }
                        return consoles[context.pageUid];
                    }


                    var isScrolledToBottom = false;
                    function syncScrolledToBottom () {
                        if (el.scrollTop === (el.scrollHeight - el.offsetHeight)) {
                            isScrolledToBottom = true;
                        } else {
                            isScrolledToBottom = false;
                        }
                    }
                    el.onscroll = syncScrolledToBottom;
                    function scrollIfBottom () {
                        if (isScrolledToBottom) {
                            el.scrollTop = el.scrollHeight;
                        }
                        syncScrolledToBottom();
                    }
                }
            }
        }, options);
    });
};
