
exports.main = function (JSONREP, node) {    
        
    return JSONREP.makeRep({
        "config": {
            "node": node
        },
        "code": (riotjs:makeRep () >>>

            <div>
                <h2>{ hostname }</h2>
                <ul class="settings">
                    <li><input type="checkbox" name="settings.enableUserAgentHeader" onchange={syncCheckbox}/> Enable UserAgent Header</li>
                    <li><input type="checkbox" name="settings.enableFirePHPHeader" onchange={syncCheckbox}/> Enable FirePHP Header</li>
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

                tag.hostname = "";

                if (typeof browser !== "undefined") {

                    function getHostname () {
                        return browser.devtools.inspectedWindow.eval("window.location.hostname").then(function (result) {
                            return result[0];                    
                        });
                    }
                    function getSettingForHostname (hostname, name) {
                        var key = "domain[" + hostname + "]." + name;
                        return browser.storage.local.get(key).then(function (value) {
                            return (value[key] || false);
                        });
                    }
                    function setSettingForHostname (hostname, name, value) {
                        var obj = {};
                        obj["domain[" + hostname + "]." + name] = value;
                        return browser.storage.local.set(obj);
                    }                 

                    function sync (preUpdate) {
                        return getHostname().then(function (hostname) {

                            tag.hostname = hostname;

                            if (preUpdate) {
                                return null;
                            }
                            
                            $('INPUT[type="checkbox"]', tag.root).each(function () {
                                var el = $(this);
                                var name = el.attr("name");
                                if (!/^settings\./.test(name)) return;                                
                                getSettingForHostname(hostname, name).then(function (enabled) {
                                    el.get(0).checked = enabled;
                                    return null;
                                }).catch(function (err) {
                                    console.error(err);
                                });
                            });

                            return null;
                        }).catch(function (err) {
                            console.error(err);
                        });
                    }

                    function triggerSync () {
                        sync(true).then(function () {
                            tag.update();
                            return null;
                        });                        
                    }

                    browser.runtime.onMessage.addListener(function (message) {
                        if (message.to === "message-listener") {
                            if (message.event === "onDOMContentLoaded") {
                                triggerSync();
                            } else
                            if (message.event === "tabs.onActivated") {
                                triggerSync();
                            }
                        }
                    });

                    tag.on("mount", function () {
                        triggerSync();
                    });
                    tag.on("updated", sync);
                    
                    tag.syncCheckbox = function (event) {

                        var name = event.target.getAttribute("name");

                        getHostname().then(function (hostname) {    
                            return setSettingForHostname(hostname, name, event.target.checked);
                        }).then(function () {
                            tag.update();
                            return null;
                        }).catch(function (err) {
                            throw err;
                        });
                    }
                }

            </script>

        <<<)
    });
};
