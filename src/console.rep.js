
const BROWSER = browser;
const WINDOW = window;


exports.main = function (JSONREP, node) {

    return JSONREP.markupNode(node).then(function (code) {

        return JSONREP.makeRep('<div>' + code + '</div>', {
            on: {
                mount: function (el) {

                    var consoles = {};

                    function makeKeyForContext (context) {
                        return context.tabId + ":" + context.hostname;
                    }

                    BROWSER.runtime.onMessage.addListener(function (message) {
                        
                        if (message.to === "message-listener") {

                            if (message.message) {
                                message.message.domain = message.context.hostname;

                                var key = makeKeyForContext(message.context);
                                if (!consoles[key]) {
                                    consoles[key] = WINDOW.FC.consoleForId(key);
                                }
                                consoles[key].getAPI().log(message.message);
                            } else
                            if (message.event === "onBeforeNavigate") {

                                var key = makeKeyForContext(message.context);
                                
                                // We only forward the call if the console exists
                                if (consoles[key]) {
                                    consoles[key].getAPI().clear();
                                }
                            } else
                            if (message.event === "tabs.onActivated") {

                                var key = makeKeyForContext(message.context);
                                
                                Object.keys(consoles).forEach(function (id) {
                                    if (id === key) {
                                        consoles[id].show();
                                    } else {
                                        consoles[id].hide();
                                    }
                                });
                            } else
                            if (message.event === "tabs.onRemoved") {

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
