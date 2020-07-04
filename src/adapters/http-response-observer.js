

exports.forAPI = function (API) {

    class ResponseObserver {

        constructor (onResponseHandler) {
            const self = this;

            API.on("destroy", function () {
                self.ensureUnhooked();
            });            

            let isHooked = false;

            let pageUrlByTabId = {};
            let pageTimestampByTabId = {};

            function onHeadersReceived (response) {

                if (API.VERBOSE) console.log("[http-response-observer] onHeadersReceived (response):", response);

                let pageUrl = response.documentUrl || response.url;
                let pageTimeStamp = response.timeStamp;
                if (response.parentFrameId !== -1) {
                    pageUrl = pageUrlByTabId[response.tabId] || null;
                    pageTimeStamp = pageTimestampByTabId[response.tabId] || null;
                } else
                if (
                    response.type === "main_frame"// ||
                    //response.type === "sub_frame"
                ) {
                    pageUrlByTabId[response.tabId] = pageUrl;
                    pageTimestampByTabId[response.tabId] = pageTimeStamp;
                }

                onResponseHandler({
                    "request": {
                        "id": response.requestId,
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
                    "headers": response.responseHeaders
                });
            }

            self.ensureHooked = function () {
                if (!isHooked) {    
                    API.BROWSER.remap();
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
                    isHooked = true;
                }
            }

            self.ensureUnhooked = function () {
                if (isHooked) {
                    API.BROWSER.webRequest.onHeadersReceived.removeListener(onHeadersReceived);
                    isHooked = false;
                }
                pageUrlByTabId = {};
                pageTimestampByTabId = {};
            }
        }

    }

    return ResponseObserver;
}
