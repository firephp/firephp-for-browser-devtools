
const BROWSER = browser;


BROWSER.runtime.onMessage.addListener(function (request) {


    console.log("Message in content panel from the background script:", request);

    return null;
});


console.log("CONTENT PANEL LOADED");
