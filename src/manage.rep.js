
exports.main = function (JSONREP, node) {    

    return JSONREP.markupNode(node.settings).then(function (settingsCode) {

        return JSONREP.makeRep({
            "config": {
                "settingsCode": settingsCode,
                "node": node
            },
            "code": (riotjs:makeRep () >>>

                <div class="manage-panel">
                    <h2>Settings for: { hostname }</h2>

                    <raw html="{settingsCode}"/>

                    <h2>FirePHP</h2>

                    <i>FirePHP is 100% <a target="_blank" href="https://github.com/firephp/firephp-for-firefox-devtools">Open Source with code on Github</a></i>

                    <ul>
                        <li><a target="_blank" href="https://github.com/firephp/firephp-for-firefox-devtools/issues">Report an Issue or Suggest a Feature</a></li>
                        <li>Server Libraries:
                            <ul>
                                <li><b>FirePHPCore</b> - <a target="_blank" href="https://github.com/firephp/firephp-core">github.com/firephp/firephp-core</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <style>

                    :scope DIV.manage-panel {
                        padding: 10px;
                    }

                </style>

                <script>

                    var tag = this;

                    tag.settingsCode = opts.config.settingsCode;
                    tag.hostname = "";

                    function getHostname () {
                        if (typeof browser !== "undefined") {
                            return browser.devtools.inspectedWindow.eval("window.location.hostname").then(function (result) {
                                return result[0];                    
                            });
                        } else {
                            return Promise.resolve(window.location.hostname);
                        }
                    }

                    function sync (preUpdate) {
                        return getHostname().then(function (hostname) {

                            tag.hostname = hostname;

                            if (preUpdate) {
                                return null;
                            }

                            // attach event handlers


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

                    tag.on("mount", function () {
                        triggerSync();
                    });

                    var firstUpdate = true;
                    tag.on("updated", function () {
                        if (firstUpdate) {
                            // NOTE: We need to wait for the 'raw' tag to mount itself.
                            setTimeout(function () {
// TODO: Use custom styleManager for riotjs so styles do not get over-written
// @see https://github.com/riot/riot/blob/master/lib/browser/tag/styleManager.js
                                JSONREP.mountElement(tag.root);
                                sync();
                            }, 0);
                            firstUpdate = false;
                        }
                    });
                    
                    tag.on("updated", sync);


                    if (typeof browser !== "undefined") {
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
                    } else {
                        triggerSync();
                    }
                    

                </script>

            <<<)
        });
    });
};
