
const BROWSER = (typeof browser !== "undefined" && browser) || null;
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

                    var consoles = {};
                    var lastRequestConsole = null;
                    var persistentConsole = null;
                    
                    var persistLogs = false;
                    if (BROWSER) {
                        BROWSER.storage.onChanged.addListener(function (changes, area) {
                            if (changes["persist-on-navigate"]) {
                                persistLogs = changes["persist-on-navigate"].newValue;
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
                            }
                        });
                        BROWSER.storage.local.get("persist-on-navigate").then(function (value) {
                            persistLogs = value["persist-on-navigate"];
                        });
                    }


                    function makeKeyForContext (context) {
                        //if (
                        //    typeof context.requestType === "undefined" ||
                        //    context.requestType === "main_frame"
                        //) {
                        //    return context.tabId + ":" + context.url;
                        //} else {
                            return context.tabId + ":combined";// + (context.topUrl || context.url);
                        //}
                    }

                    function getConsoleForContext (context) {
                        if (persistentConsole) {
                            return persistentConsole;
                        }
                        var key = makeKeyForContext(context);
                        if (!consoles[key]) {
                            consoles[key] = WINDOW.FC.consoleForId(key);
                        }
                        return consoles[key];
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

                    var lastConsoleId = null;

                    if (BROWSER) {
                        BROWSER.runtime.onMessage.addListener(function (message) {

                            if (
                                message.context &&
                                message.context.tabId != BROWSER.devtools.inspectedWindow.tabId
                            ) {
                                return;
                            }

                            if (message.to === "message-listener") {

                                if (message.response) {

                                    lastRequestConsole = getConsoleForContext(message.context);
                                    if (persistLogs) {
                                        if (!persistentConsole) {
                                            persistentConsole = lastRequestConsole;
                                        }
                                    } else {
                                        if (message.context.requestType === "main_frame") {
                                            lastRequestConsole.getAPI().clear();
                                        }
                                    }

                                    var panelEl = lastRequestConsole.getPanelEl();

                                    var el = WINDOW.document.createElement('div');
                                    el.setAttribute("class", "request");
                                    el.innerHTML = message.context.url;
                                    
                                    panelEl.appendChild(el);
                                    scrollIfBottom();
                                } else                                
                                if (message.message) {
                                    message.message.context = message.context;

                                    getConsoleForContext(message.context).getAPI().log(message.message);
                                    scrollIfBottom();
                                } else
                                if (message.event === "clear") {

                                    Object.keys(consoles).forEach(function (id) {

                                        if (consoles[id].isShowing()) {
                                            consoles[id].getAPI().clear();
                                        }
                                    });
                                    scrollIfBottom();
                                } else
                                if (
                                    message.event === "currentContext" &&
                                    message.context
                                ) {
                                    if (persistentConsole) {
                                        return;
                                    }                                
                                    var key = makeKeyForContext(message.context);
                                    Object.keys(consoles).forEach(function (id) {
                                        if (
                                            (
                                                persistLogs &&
                                                id.split(":")[0] == message.context.tabId
                                            ) ||
                                            id === key
                                        ) {
                                            lastConsoleId = id;
                                            consoles[id].show();
                                        } else {
                                            consoles[id].hide();
                                        }
                                    });
                                } else
                                if (message.event === "destroyContext") {

                                    Object.keys(consoles).forEach(function (id) {
                                        if (id.split(":")[0] == message.context.tabId) {
                                            WINDOW.FC.destroyConsoleForId(id);
                                            delete consoles[id];
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            }
        }, options);
    });
};
