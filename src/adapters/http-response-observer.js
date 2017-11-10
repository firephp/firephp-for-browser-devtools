
exports.for = function (API) {

    var requestIndex = 0;
    
    function onRequest (request) {
        
//        console.log("INTERCEPT RESPONSE:", request);

        var requestId = null;
        var contentType = "";
        
/*
            visitHeader: function(name, value) {
                requestHeaders.push({name: name, value: value});
                if(name.toLowerCase()=="x-request-id") {
                    requestId = value;
                }
            }
        var responseHeaders = [],
            contentType = false;
            visitHeader: function(name, value) {
                responseHeaders.push({name: name, value: value});
                if (name.toLowerCase() == "content-type")
                    contentType = value;
            }
*/

        requestIndex += 1;

        var response = {
            "request": {
                "id": requestId || "id:" + request.url + ":" + requestIndex,
                "url": request.url,
                "hostname": request.url,
                "port": request.url,
                "method": request.method,
                "headers": [],
                "context": {
                    tabId: request.tabId,
                    url: request.url,
                    hostname: request.url.replace(/^[^:]+:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1")
                }
            },
            "status": request.statusCode,
            "contentType": contentType,
            "headers": request.responseHeaders
        };

//console.log("intercepted response", response);

        API.emit("http.response", response);
    }

    API.BROWSER.webRequest.onHeadersReceived.addListener(
        onRequest,
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

        API.BROWSER.webRequest.onHeadersReceived.removeListener(onRequest);
    });

    return {};
}
