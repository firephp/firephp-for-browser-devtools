
const BROWSER = browser;
const WINDOW = window;


exports.main = function (JSONREP, node) {

    BROWSER.runtime.onMessage.addListener(function (message) {

        if (message.to === "message-listener") {

            WINDOW.FC.log(message.message);
        }
    });

    return "";
};
