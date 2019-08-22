
const WINDOW = window;


WINDOW.crossbrowser.runtime.onMessage.addListener(function (request, sender, _sendResponse) {

    function sendResponse (response) {

        response.to = request.from;
        response.from = request.to;
        response.id = request.id;

        WINDOW.crossbrowser.tabs.sendMessage(
            sender.tab.id,
            response
        ).catch(console.error);
    }

    if (request.to === "fetch.url") {

        var url = request.url;

        if (!/^https?:/.test(url)) {
            url = WINDOW.crossbrowser.runtime.getURL(url);
        }

        WINDOW.fetch(url).then(function (response) {            
            return response.text();
        }).then(function (text) {

            sendResponse({
                response: text
            });                
        }).catch(function(err) {

console.log("ERROR", err);            
            sendResponse({
                error: err
            });
        });
    } else
    if (request.to === "postJSON") {

        WINDOW.fetch(request.url, {
            method: 'post',
            headers: {
                "Accept": "application/json; charset=utf-8",                     
                "Content-Type": "application/json; charset=utf-8"                
            },
            body: request.data
        }).then(function (response) {
            return response.text();
        }).then(function (text) {

            return null;
        }).catch(function(err) {

console.log("ERROR", err);
            return null;
        });
    }
});

["background.js"].forEach(function (script) {

    const url = "scripts/" + script;

    WINDOW.PINF.sandbox(url, function (sandbox) {

        sandbox.main();

    }, console.error);
});
