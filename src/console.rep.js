
const BROWSER = browser;
const WINDOW = window;


exports.main = function (JSONREP, node) {

    return JSONREP.markupNode(node).then(function (code) {

        return JSONREP.makeRep('<div>' + code + '</div>', {
            on: {
                mount: function (el) {

                    var consoles = {};

                    function getConsoleForHostname (hostname) {
                        if (!consoles[hostname]) {
                            consoles[hostname] = WINDOW.FC.consoleForId(hostname);
                        }
                        return consoles[hostname];
                    }

                    BROWSER.runtime.onMessage.addListener(function (message) {
                        
                        if (message.to === "message-listener") {

                            if (message.message) {
                                message.message.domain = message.hostname;
                                getConsoleForHostname(message.hostname).getAPI().log(message.message);
                            } else
                            if (message.event === "onBeforeNavigate") {

                                // We only forward the call if the console exists
                                if (consoles[message.hostname]) {
                                    consoles[message.hostname].getAPI().clear();
                                }
                            } else
                            if (message.event === "tabs.onActivated") {

                                Object.keys(consoles).forEach(function (id) {
                                    if (id === message.hostname) {
                                        consoles[id].show();
                                    } else {
                                        consoles[id].hide();
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
