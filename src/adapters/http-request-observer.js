
exports.for = function (API) {

    var processor = null;
    var requestIndex = 0;


    function onRequest (request) {

//console.log("MAKE REQUEST ... add headers", request);

        var requestId = null;

        var headers = {};
        request.requestHeaders.forEach(function (header) {
            if (header.name.toLowerCase() === "x-request-id") {
                requestId = header.value;
            }
            headers[header.name] = header.value;
        });

//console.log("register processor", processor);

        var result = processor({
            "id": requestId || "id:" + request.url + ":" + requestIndex,
            "url": request.url,
            "hostname": request.url.replace(/^https?:\/\/([^:\/]+)(:\d+)?\/.*?$/, "$1"),
            "port": request.url.replace(/^https?:\/\/[^:]+:?(\d+)?\/.*?$/, "$1") || 80,
            "method": request.method,
            "headers": headers,
            setRequestHeader: function (name, value) {

                request.requestHeaders.filter(function (header) {
                    return (header.name === name);
                })[0].value = value;
            }
        });

        if (!result) {
            return {};
        }

        return result.then(function (changes) {

            if (!changes) {
                return {};
            }

            var headers = [];
            Object.keys(changes.requestHeaders).forEach(function (name) {
                headers.push({
                    name: name,
                    value: changes.requestHeaders[name]
                });
            });

            return {
                requestHeaders: headers
            };    
        });
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
        register: function (_processor) {
            processor = _processor;
        }
    };
}
