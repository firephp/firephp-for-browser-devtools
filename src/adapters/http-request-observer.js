
exports.forAPI = function (API) {

    class RequestObserver {

        constructor (onRequestHandler) {
            const self = this;

            API.on("destroy", function () {
                self.ensureUnhooked();
            });

            let requestIndex = 0;
            let isHooked = false;

            // Firefox allows returning a promise since version 52
            // @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest
            // Chrome requires a sync return
            // @see https://developer.chrome.com/extensions/webRequest#event-onBeforeSendHeaders
            function onRequest (request) {

                if (API.VERBOSE) console.log("[http-request-observer] onRequest (request):", request);

                let requestId = null;
                let headers = {};
                request.requestHeaders.forEach(function (header) {
                    if (header.name.toLowerCase() === "x-request-id") {
                        requestId = header.value;
                    }
                    headers[header.name] = header.value;
                });

                requestIndex += 1;
        
                let result = onRequestHandler({
                    "id": requestId || "id:" + request.url + ":" + requestIndex,
                    "url": request.url,
                    "hostname": request.url.replace(/^https?:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1"),
                    "port": request.url.replace(/^https?:\/\/[^:]+:?(\d+)?\/.*?$/, "$1") || 80,
                    "method": request.method,
                    "headers": headers
                });
        
                if (
                    !result ||
                    !result.requestHeaders
                ) {
                    return {};
                }
        
                return {
                    requestHeaders: Object.keys(result.requestHeaders).map(function (name) {
                        return {
                            name: name,
                            value: result.requestHeaders[name]
                        };
                    })
                };
            }            


            self.ensureHooked = function () {
                if (!isHooked) {    
                    API.BROWSER.webRequest.onBeforeSendHeaders.addListener(
                        onRequest,
                        {
                            urls: [
                                "<all_urls>"
                            ]
                        },
                        [
                            "blocking",
                            "requestHeaders"
                        ]
                    );
                    isHooked = true;
                }        
            }
    
            self.ensureUnhooked = function () {
                API.BROWSER.webRequest.onBeforeSendHeaders.removeListener(onRequest);
                isHooked = false;
            }

        }
    }

    return RequestObserver;
}
