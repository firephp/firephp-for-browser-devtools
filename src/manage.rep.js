
exports.main = function (JSONREP, node, options) {    

    return JSONREP.markupNode(node.settings || "Settings").then(function (settingsCode) {

        return JSONREP.makeRep2({
            "config": {
                "settingsCode": settingsCode,
                "node": node
            },
            "code": (riotjs:makeRep () >>>

                <div class="manage-panel">
                
                    <h2>Settings for: { hostname }</h2>

                    <raw html="{settingsCode}"/>

                    <h2>FirePHP</h2>

                    <p><i>FirePHP is <a target="_blank" href="https://github.com/firephp/firephp-for-firefox-devtools">Open Source with code on Github</a></i></p>

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

                    :scope DIV .manage-panel {
                        padding: 10px;
                    }

                    :scope DIV .manage-panel > P {
                        padding-left: 10px;
                        padding-right: 10px;
                    }

                    :scope DIV LI {
                        margin-top: 5px;
                    }
                        
                </style>

                <script>

                    var tag = this;
                    var currentContext = null;

                    tag.hostname = "";                    
                    tag.settingsCode = opts.config.settingsCode;
                    
                    tag.on("mount", tag.update);

                    tag.on("updated", function () {
                        // TODO: Fix UI flashing
                        // NOTE: We need to wait for the 'raw' tag to mount itself.
                        setTimeout(function () {
// TODO: Use custom styleManager for riotjs so styles do not get over-written
// @see https://github.com/riot/riot/blob/master/lib/browser/tag/styleManager.js
                            JSONREP.mountElement(tag.root);
                        }, 0);
                    });
                    
                    if (typeof browser !== 'undefined') {
                        browser.runtime.onMessage.addListener(function (message) {

                            if (
                                message.context &&
                                message.context.tabId != browser.devtools.inspectedWindow.tabId
                            ) {
                                return;
                            }

                            if (message.to === "message-listener") {
                                if (message.event === "currentContext") {

                                    currentContext = message.context;
                                    if (currentContext) {
                                        tag.hostname = currentContext.hostname;
                                    } else {
                                        tag.hostname = "";
                                    }
                                    tag.update();
                                }
                            }
                        });
                    }

                </script>

            <<<)
        }, options);
    });
};
