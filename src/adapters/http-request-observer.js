
exports.for = function (API) {

    var processors = [];
    var requestIndex = 0;


    function onRequest (request) {

//console.log("MAKE REQUEST ... add headers", request);

        var requestId = null;

        request.requestHeaders.forEach(function (header) {
            if (header.name.toLowerCase() === "x-request-id") {
                requestId = header.value;
            }
        });

        processors.forEach(function (processor) {

//console.log("register processor", processor);

            processor({
                "id": requestId || "id:" + request.url + ":" + requestIndex,
                "url": request.url,
                "hostname": request.url.replace(/^https?:\/\/([^:]+)(:\d+)?\/.*$/, "$1")[1],
                "port": request.url.replace(/^https?:\/\/[^:]+:?(\d+)?\/.*$/, "$1")[1] || 80,
                "method": request.method,
                "headers": request.requestHeaders,
                setRequestHeader: function (name, value) {

                    request.requestHeaders.filter(function (header) {
                        return (header.name === name);
                    })[0].value = value;
                }
            });
        });

        return {
            requestHeaders: request.requestHeaders
        };
    }


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

    API.on("destroy", function () {

        API.BROWSER.webRequest.onBeforeSendHeaders.removeListener(onRequest);
    });

    return {
        register: function (processor) {
            processors.push(processor);
        }
    };
}
