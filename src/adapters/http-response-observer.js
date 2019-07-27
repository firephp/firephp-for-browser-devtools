
exports.for = function (API) {

    // TODO: Clear old records
    let pageUrlByTabId = {};
    let pageTimestampByTabId = {};


    function onHeadersReceived (response) {
//        if (API.VERBOSE)
//console.log("[http-response-observer] onHeadersReceived (response):", response);

        var pageUrl = response.documentUrl || response.url;
        var pageTimeStamp = response.timeStamp;
        if (response.parentFrameId !== -1) {
            pageUrl = pageUrlByTabId[response.tabId] || null;
            pageTimeStamp = pageTimestampByTabId[response.tabId] || null;
        } else
        if (
            response.type === "main_frame"// ||
//            response.type === "sub_frame"
        ) {
            pageUrlByTabId[response.tabId] = pageUrl;
            pageTimestampByTabId[response.tabId] = pageTimeStamp;
        }

//console.log("pageUrlByFrameId :::", pageUrlByFrameId);
        
console.log("Make pageUrl", pageUrl, "from response", response);

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
                    timeStamp: response.timeStamp,
                    pageUrl: pageUrl,
                    pageTimeStamp: pageTimeStamp,
                    pageUid: JSON.stringify({
                        url: pageUrl,
                        tabId: response.tabId
                    }),
                    requestUid: JSON.stringify({
                        url: response.url,
                        timeStamp: response.timeStamp,
                        frameId: response.frameId,
                        tabId: response.tabId
                    })
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
