
exports.for = function (API) {

    var receivers = {
        "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/insight/controller/0": {},
        "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/insight/plugin/0": {},
        "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/insight/package/0": {},
        "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/insight/selective/0": {},
        "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/request/0": {},
        "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/page/0": {
            messageHandler: "insightMessage"
        },
        "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/process/0": {}
    };

    Object.keys(receivers).forEach(function (uri) {

        var receiver = API.WILDFIRE.Receiver();
        receiver.setId(uri);
        receiver.addListener({
      	    onMessageReceived: function (request, message) {

//      	        try {

                  message.requestUrl = request.url;
    
                  API.console.log("INSIGHT MESSAGE [" + uri + "] onMessageReceived !1", message);
                  API.console.log("INSIGHT MESSAGE API.on", API.on);

                  if (
                      receivers[uri].messageHandler &&
                      API.on &&
                      API.on[receivers[uri].messageHandler]
                  ) {
                      API.on[receivers[uri].messageHandler](message);
                  } else {

console.log("IGNORING insight MESSAGE:", message);

                  }

//      	        } catch (err) {
//      	        	API.console.error(err);
//      	        }
      	    }
    	  });
        API.httpHeaderChannel.addReceiver(receiver);

    });


	  return {};
}
