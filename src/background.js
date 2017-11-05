
const BROWSER = browser;
const WILDFIRE = exports.WILDFIRE = require("./wildfire");


WILDFIRE.once("error", function (err) {
    console.error(err);
});

WILDFIRE.on("message.firephp", function (message) {

//    console.log("RECEIVED FIREPHP MESSAGE!!5555!", message);

    var sending = BROWSER.runtime.sendMessage({
        to: "message-listener",
        message: {
            sender: message.sender,
            receiver: message.receiver,
            meta: message.meta,
            data: message.data            
        }
    });
    sending.then(function (response) {
    }, function (err) {
        console.error(err);
    });

});
