
exports.main = function (JSONREP, node, options) {    

    var api = {
        currentContext: null
    };
    
    if (typeof browser !== "undefined") {
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
    }


    return JSONREP.makeRep2({
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

                :scope DIV H2 {
                    padding-left: 10px;
                    padding-right: 10px;
                }

                :scope DIV UL.settings {
                    padding-left: 10px;
                    padding-right: 10px;
                    list-style-type: none;
                }

                :scope DIV UL.settings > LI {
                    white-space: nowrap;
                }

            </style>

            <script>

                var tag = this;

                tag.hostname = ( opts.config.api.currentContext && opts.config.api.currentContext.hostname) || "";

                function getSettingForHostname (hostname, name) {
                    if (typeof browser === "undefined") {
                        return Promise.resolve(null);
                    }
                    var key = "domain[" + hostname + "]." + name;
                    return browser.storage.local.get(key).then(function (value) {
                        return (value[key] || false);
                    });
                }

                const DEBOUNCE = require('lodash/debounce');

                var broadcastCurrentContext = DEBOUNCE(function () {
                    browser.runtime.sendMessage({
                        to: "broadcast",
                        event: "currentContext"
                    });
                    return null;
                }, 250);

                function setSettingForHostname (hostname, name, value) {
                    if (typeof browser === "undefined") {
                        return Promise.resolve(null);
                    }

                    return getSettingForHostname (hostname, name).then(function (existingValue) {
                        if (value === existingValue) {
                            // No change
                            return;
                        }
                        var obj = {};
                        obj["domain[" + hostname + "]." + name] = value;
                        return browser.storage.local.set(obj).then(broadcastCurrentContext);
                    });
                }

                opts.config.api.onMessage = function (message) {

                    if (
                        typeof browser !== "undefined" &&
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

                            if (
                                opts.config.node &&
                                opts.config.node._util &&
                                typeof opts.config.node._util.enabled !== 'undefined'
                            ) {
                                setSettingForHostname(tag.hostname, 'enabled', opts.config.node._util.enabled).then(function () {
                                    return null;
                                }).catch(function (err) {
                                    throw err;
                                });
                            }
            
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
    }, options);
};
