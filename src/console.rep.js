
const BROWSER = browser;
const WINDOW = window;


exports.main = function (JSONREP, node) {

    return JSONREP.markupNode(node).then(function (code) {

        return JSONREP.makeRep('<div>' + code + '</div>', {
            on: {
                mount: function (el) {

                    var consoles = {};

                    function makeKeyForContext (context) {
                        return context.tabId + ":" + context.url;
                    }

                    function getConsoleForContext (context) {
                        var key = makeKeyForContext(context);
                        if (!consoles[key]) {
                            consoles[key] = WINDOW.FC.consoleForId(key);
                        }
                        return consoles[key];
                    }

                    BROWSER.runtime.onMessage.addListener(function (message) {

                        if (
                            message.context &&
                            message.context.tabId != BROWSER.devtools.inspectedWindow.tabId
                        ) {
                            return;
                        }

                        if (message.to === "message-listener") {

                            if (message.response) {
                                
                                var panelEl = getConsoleForContext(message.context).getPanelEl();
                                
                                var el = WINDOW.document.createElement('div');
                                el.setAttribute("class", "request");
                                el.setAttribute("style", [
                                    'padding: 3px',
                                    'padding-left: 10px',
                                    'padding-right: 10px',
                                    'color: #FFFFFF',
                                    'background-color: #0000FF',
                                    'border: 1px solid black'
                                ].join(";"));
                                el.innerHTML = message.context.url;
                                
                                panelEl.appendChild(el);

                            } else                                
                            if (message.message) {
                                message.message.context = message.context;

                                getConsoleForContext(message.context).getAPI().log(message.message);
                            } else
                            if (message.event === "clear") {

                                Object.keys(consoles).forEach(function (id) {

                                    if (consoles[id].isShowing()) {
                                        consoles[id].getAPI().clear();
                                    }
                                });                                
                            } else
                            if (
                                message.event === "currentContext" &&
                                message.context
                            ) {
                                var key = makeKeyForContext(message.context);
                                
                                Object.keys(consoles).forEach(function (id) {
                                    if (id === key) {
                                        consoles[id].show();
                                    } else {
                                        consoles[id].hide();
                                    }
                                });
                            } else
                            if (message.event === "destroyContext") {

                                Object.keys(consoles).forEach(function (id) {
                                    if (id.replace(/^([^:]+):.+$/, "$1") == message.context.tabId) {
                                        WINDOW.FC.destroyConsoleForId(id);
                                        delete consoles[id];
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });
};
