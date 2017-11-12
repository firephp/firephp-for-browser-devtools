
exports.for = function (API) {
    
    function onHeadersReceived (response) {
        if (API.VERBOSE) console.log("[http-response-observer] onHeadersReceived (response):", response);

        API.emit("http.response", {
            "request": {
                "id": response.requestId,
                //"url": response.url,
                //"hostname": response.url,
                //"port": response.url,
                //"method": response.method,
                //"headers": [],
                "context": {
                    frameId: response.frameId,
                    tabId: response.tabId,
                    url: response.url,
                    hostname: response.url.replace(/^[^:]+:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1"),
                    requestId: response.requestId
                }
            },
            "status": response.statusCode,
            //"contentType": contentType,
            "headers": response.responseHeaders
        });
    }
    API.BROWSER.webRequest.onHeadersReceived.addListener(
        onHeadersReceived,
        {
            urls: [
                "<all_urls>"
            ]
        },
        [
            "responseHeaders"
        ]
    );
    API.on("destroy", function () {
        API.BROWSER.webRequest.onHeadersReceived.removeListener(onHeadersReceived);
    });

    return {};
}
