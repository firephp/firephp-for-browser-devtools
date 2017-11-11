
exports.main = function (JSONREP, node) {    

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


    return JSONREP.makeRep({
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

                :scope BUTTON {
                    width: 100%;
                    height: 20px;
                    border: 2px;
                    font-weight: bold;
                }

                :scope BUTTON.enable {
                    color: #005007;
                    background-color: red;
                }

                :scope BUTTON.disable {
                    color: red;
                    background-color: #005007;
                }
                
            </style>

            <script>

                var tag = this;

                tag.enabled = false;

                if (typeof browser !== "undefined") {

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

                        if (message.to === "message-listener") {
                            if (
                                message.event === "currentContext" &&
                                message.context
                            ) {

                                getSettingForHostname(
                                    opts.config.api.currentContext.hostname,
                                    "settings.enabled"
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
                            "settings.enabled",
                            true
                        ).then(function () {
                            tag.update();
                            return null;
                        }).catch(function (err) {
                            console.error(err);
                        });
                    }

                    tag.triggerDisable = function (event) {

                        return setSettingForHostname(
                            opts.config.api.currentContext.hostname,
                            "settings.enabled",
                            false
                        ).then(function () {
                            tag.update();
                            return null;
                        }).catch(function (err) {
                            console.error(err);
                        });
                    }
                }

            </script>

        <<<)
    });
};
