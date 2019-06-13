
const WINDOW = window;

const url = "./index.js";

WINDOW.PINF.sandbox(url, function (sandbox) {

    sandbox.main();

}, console.error);
