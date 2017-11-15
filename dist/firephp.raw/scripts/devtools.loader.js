
const WINDOW = window;

const url = "./devtools.js";

WINDOW.PINF.sandbox(url, function (sandbox) {

    sandbox.main();

}, console.error);
