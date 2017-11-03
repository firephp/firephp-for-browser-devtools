
const WILDFIRE = require("./wildfire");


WILDFIRE.once("error", function (err) {
    console.error(err);
});

WILDFIRE.on("message.firephp", function (message) {

    console.log("RECEIVED FIREPHP MESSAGE!!!!", message);

});
