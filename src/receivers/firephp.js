

exports.for = function (API) {


    var transportReceiver1 = API.WILDFIRE.Receiver();
    transportReceiver1.setId("http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1");
    transportReceiver1.addListener({
	    onMessageReceived: function(request, message) {

//	        try {
                message.requestUrl = request.url;

	        	API.console.log("FirebugConsole onMessageReceived 1", message);

                if (
                    API.on &&
                    API.on.firePHPMessage
                ) {
                    API.on.firePHPMessage(message);
                }

//	        } catch (err) {
//                API.console.error(err);
//	        }
	    }
	});
    API.httpHeaderChannel.addReceiver(transportReceiver1);


    var transportReceiver2 = API.WILDFIRE.Receiver();
    transportReceiver2.setId("http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1");
    transportReceiver2.addListener({
	    onMessageReceived: function(request, message) {

//	        try {

                message.requestUrl = request.url;
    
	        	API.console.log("FirePHP onMessageReceived", message);

                if (
                    API.on &&
                    API.on.firePHPMessage
                ) {
                    API.on.firePHPMessage(message);
                }

//	        } catch (err) {
//	        	API.console.error(err);
//	        }
	    }
	});
    API.httpHeaderChannel.addReceiver(transportReceiver2);


/*
// FirePHP 0.x compatibility
"http://registry.pinf.org/cadorn.org/github/fireconsole/@meta/receiver/console/0.1.0"

    var receiver = API.WILDFIRE.Receiver();
    receiver.setId("http://github.com/fireconsole/@meta/receivers/wildfire/fireconsole/0");
    receiver.addListener({

        onMessageReceived: function(request, message) {

            try {

                var data = JSON.decode(message.getData());

                if (data.method = "callApi") {

                    return context.callApi(data.args[0], data.args[1] || {});

                } else {
                    throw new Error("Method '" + data.method + "' not found!");
                }

            } catch (err) {
                console.error(err);
            }
        }

    });
*/

    // FirePHP 0.x compatibility
/*
    var transportReceiver = API.WILDFIRE.Receiver();
    transportReceiver.setId("http://registry.pinf.org/cadorn.org/github/fireconsole/@meta/receiver/console/0.1.0");
    transportReceiver.addListener({
	    onMessageReceived: function(request, message) {

	        try {

	        	API.console.log("FireConsole onMessageReceived FirePHP!: " + message);

            if (
                API.on &&
                API.on.message
            ) {
                API.on.message(message);
            }

	        } catch (err) {
	        	API.console.error(err);
	        }
	    }
  	});
    API.httpHeaderChannel.addReceiver(transportReceiver);
*/

	return {};
}
