
const BROWSER = browser;
const WINDOW = window;


exports.main = function (JSONREP, node) {

    BROWSER.runtime.onMessage.addListener(function (message) {

        if (message.to === "message-listener") {

            if (message.message) {

                WINDOW.FC.log(message.message);

            } else
            if (message.event === "onBeforeNavigate") {

                WINDOW.FC.clear();
            }

        }
    });

    return "";
};
