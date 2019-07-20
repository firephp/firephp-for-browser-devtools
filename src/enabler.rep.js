
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
                <button if={enabled === false} onclick={triggerEnable} class="enable">Enable</button>
                <button if={enabled === true} onclick={triggerDisable} class="disable">Disable</button>
            </div>

            <style>

                :scope DIV BUTTON {
                    width: 100%;
                    height: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    background-color: white;
                    padding: 3px;
                    height: auto;
                }

                :scope DIV BUTTON.enable {
                    color: #000000;
                    border-top: 2px solid #ff5151;
                    border-bottom: 2px solid #ff5151;
                    border-left: 10px solid #ff5151;
                    border-right: 10px solid #ff5151;
                }

                :scope DIV BUTTON.disable {
                    color: #000000;
                    border-top: 2px solid #05c600;
                    border-bottom: 2px solid #05c600;
                    border-left: 10px solid #05c600;
                    border-right: 10px solid #05c600;
                }
                
            </style>

            <script>

                const COMPONENT = require("./component");

                const tag = this;

                tag.enabled = null;

                const comp = COMPONENT.for({
                    browser: browser
                });

                comp.on("setting.enabled", function (enabled) {
                    tag.enabled = !!enabled;
                    if (!context) {
                        tag.enabled = null;
                    }
                    tag.update();
                });

                comp.on("changed.context", function (context) {
                    comp.contextChangeAcknowledged();
                    if (!context) {
                        tag.enabled = null;
                        tag.update();
                    } else {
                        comp.getSetting("enabled").then(function (enabled) {
                            tag.enabled = enabled;
                            tag.update();
                        });
                    }
                });

                tag.on("mount", tag.update);

                tag.triggerEnable = function (event) {
                    comp.setSetting(
                        "enabled",
                        true
                    ).then(function () {
                        tag.update();
                        comp.reloadBrowser();
                    });
                }

                tag.triggerDisable = function (event) {
                    comp.setSetting(
                        "enabled",
                        false
                    ).then(function () {
                        tag.update();
                    });
                }

            </script>

        <<<)
    }, options);
};
