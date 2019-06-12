
exports.main = function (JSONREP, node, options) {    

    var api = {
        currentContext: null
    };

    browser.runtime.onMessage.addListener(function (message) {

        if (message.to === "message-listener") {
            if (message.event === "currentContext") {
                api.currentContext = message.context;
            }
        }

        if (api.onMessage) {
            api.onMessage(message);
        }
    });


    return JSONREP.makeRep2({
        "config": {
            "node": node,
            "api": api
        },
        "code": (riotjs:makeRep () >>>

            <div>
                <button if={!enabled} onclick={triggerEnable} class="enable">Enable</button>
                <button if={enabled} onclick={triggerDisable} class="disable">Disable</button>
            </div>

            <style>

                :scope DIV BUTTON {
                    width: 100%;
                    height: 20px;
                    border: 2px;
                    font-weight: bold;
                    cursor: pointer;
                    background-color: white;
                    padding: 3px;
                    height: auto;
                }

                :scope DIV BUTTON.enable {
                    color: #007200;
                    border-top: 2px solid #ff5151;
                    border-bottom: 2px solid #ff5151;
                    border-left: 10px solid #ff5151;
                    border-right: 10px solid #ff5151;
                }

                :scope DIV BUTTON.disable {
                    color: #900;
                    border-top: 2px solid #05c600;
                    border-bottom: 2px solid #05c600;
                    border-left: 10px solid #05c600;
                    border-right: 10px solid #05c600;
                }
                
            </style>

            <script>

                var tag = this;

                tag.enabled = false;

                function getSettingForHostname (hostname, name) {
                    var key = "domain[" + hostname + "]." + name;
                    return browser.storage.local.get(key).then(function (value) {
                        return (value[key] || false);
                    });
                }
                function setSettingForHostname (hostname, name, value) {
                    var obj = {};
                    obj["domain[" + hostname + "]." + name] = value;                     
                    return browser.storage.local.set(obj).then(function () {
                        browser.runtime.sendMessage({
                            to: "broadcast",
                            event: "currentContext"
                        });
                        return null;
                    });
                }

                opts.config.api.onMessage = function (message) {

                    if (
                        message.context &&
                        message.context.tabId != browser.devtools.inspectedWindow.tabId
                    ) {
                        return;
                    }
                    
                    if (message.to === "message-listener") {
                        if (
                            message.event === "currentContext" &&
                            message.context
                        ) {

                            getSettingForHostname(
                                opts.config.api.currentContext.hostname,
                                "enabled"
                            ).then(function (enabled) {

                                tag.enabled = enabled;
                                tag.update();
                                return null;
                            }).catch(function (err) {
                                console.error(err);
                            });
                        }
                    }
                }

                tag.on("mount", tag.update);
                
                tag.triggerEnable = function (event) {

                    return setSettingForHostname(
                        opts.config.api.currentContext.hostname,
                        "enabled",
                        true
                    ).then(function () {
                        tag.update();

                        browser.runtime.sendMessage({
                            to: "background",
                            event: "reload",
                            context: {
                                tabId: browser.devtools.inspectedWindow.tabId
                            }
                        });

                        return null;
                    }).catch(function (err) {
                        console.error(err);
                    });
                }

                tag.triggerDisable = function (event) {

                    return setSettingForHostname(
                        opts.config.api.currentContext.hostname,
                        "enabled",
                        false
                    ).then(function () {
                        tag.update();
                        return null;
                    }).catch(function (err) {
                        console.error(err);
                    });
                }

            </script>

        <<<)
    }, options);
};
