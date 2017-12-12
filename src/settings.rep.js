
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
                <ul class="settings">
                    <li><input type="checkbox" name="enableUserAgentHeader" onchange={syncCheckbox}/> Enable UserAgent Header</li>
                    <li><input type="checkbox" name="enableFirePHPHeader" onchange={syncCheckbox}/> Enable FirePHP Header</li>
                </ul>
            </div>

            <style>

                :scope DIV > H2 {
                    padding-left: 10px;
                    padding-right: 10px;
                }
                
                :scope DIV > UL.settings {
                    padding-left: 10px;
                    padding-right: 10px;
                    list-style-type: none;
                }

                :scope DIV > UL.settings > LI {
                    white-space: nowrap;
                }

            </style>

            <script>

                var tag = this;

                tag.hostname = ( opts.config.api.currentContext && opts.config.api.currentContext.hostname) || "";

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
                            tag.hostname = message.context.hostname;
                            tag.update();
                        }
                    }
                }

                tag.on("mount", tag.update);
                tag.on("updated", function () {

                    $('INPUT[type="checkbox"]', tag.root).each(function () {
                        var el = $(this);
                        var name = el.attr("name");
                        getSettingForHostname(tag.hostname, name).then(function (enabled) {
                            el.get(0).checked = enabled;
                            return null;
                        }).catch(function (err) {
                            console.error(err);
                        });
                    });
                });
                
                tag.syncCheckbox = function (event) {

                    var name = event.target.getAttribute("name");
                    return setSettingForHostname(tag.hostname, name, event.target.checked).then(function () {
                        tag.update();
                        return null;
                    }).catch(function (err) {
                        throw err;
                    });
                }

            </script>

        <<<)
    });
};
