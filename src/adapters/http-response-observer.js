
exports.for = function (API) {

    // TODO: Clear old records
    var topUrlByFrameId = {};

    function onHeadersReceived (response) {
        if (API.VERBOSE) console.log("[http-response-observer] onHeadersReceived (response):", response);

        var topUrl = response.documentUrl || response.url;
        if (response.parentFrameId !== -1) {
            topUrl = topUrlByFrameId["" + response.parentFrameId] || null;
        }

        if (
            response.type === "main_frame" ||
            response.type === "sub_frame"
        ) {
            topUrlByFrameId["" + response.frameId] = topUrl;
        }

//console.log("topUrlByFrameId :::", topUrlByFrameId);
        
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
                    requestId: response.requestId,
                    requestType: response.type,
                    documentUrl: response.documentUrl,
                    topUrl: topUrl
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
