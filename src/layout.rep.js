
const WINDOW = window;


/*
// TODO: This should not be needed once `inspector` issue is fixed.
// @see https://github.com/firephp/firephp-for-firefox-devtools/issues/26

// Ensure UI shows up within first 2 seconds. If not reload the page.
setTimeout(function () {

    var el = WINDOW.document.querySelector(".layout-views");
    if (!el) {
        console.log("WARNING: Reloading UI as '.layout-views' not found after 2 seconds.");
        window.location.reload();
    }
}, 2000);
*/


exports.main = function (JSONREP, node) {

    var panels = {};

    return Promise.all(Object.keys(node).map(function (name) {

        if (typeof node[name] === "string") {
            panels[name] = node[name];
            return null;
        }
        
        return Promise.all(Object.keys(node[name]).map(function (key) {
            var panelNode = {};
            panelNode[key] = node[name][key];
            return JSONREP.markupNode(panelNode).then(function (code) {
                panels[name] = code;
                return null;
            });
        }));
    })).then(function () {

        return JSONREP.makeRep({
            variables: {
                panels: panels
            },
            html: (html (variables) >>>
                <div class="layout-views">
                    <div class="ui" style="display: none;">
                        <table class="layout" height="100%" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td class="console-panel" width="100%" height="100%" rowspan="2">
                                    %%%variables.panels.console%%%
                                </td>
                            </tr>
                            <tr>
                                <td class="side-panel">
                                    <table class="layout" height="100%" border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td class="menu-panel">
                                                %%%variables.panels.menu%%%
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="settings-panel">
                                                %%%variables.panels.settings%%%
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="inspector-panel" height="100%">
                                                %%%variables.panels.inspector%%%
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class="manage">
                        <button class="close-button">Close</button>
                        %%%variables.panels.manage%%%
                    </div>
                    <div class="uninitialized">
                        <p>Reload to initialize FirePHP</p>
                    </div>
                </div>
            <<<),
            css: (css () >>>

                BODY {
                    background-color: #ffffff;
                    overflow: hidden;
                }

                :scope.layout-views {
                    height: 100%;
                }
                
                :scope.layout-views,
                :scope.layout-views TABLE {
                    font-family: Monaco;
                    font-size: 12px;
                }

                :scope .layout TD {
                    vertical-align: top;
                }

                :scope .layout TD.menu-panel {
                    border-bottom: 1px solid #dcdcdc;
                }
                
                :scope .layout TD.settings-panel {
                    border-bottom: 1px solid #dcdcdc;
                }
                
                :scope .layout TD.inspector-panel {
                    min-width: 200px;
                    overflow: auto;
                }

                :scope .manage {
                    height: 100%;
                    padding: 20px;
                }

                :scope .manage > .close-button {
                    display: none;
                }
                
                :scope .uninitialized {
                    text-align: center;
                    padding-top: 50px;
                    height: 100%;
                }
                :scope .uninitialized > P {
                    font-weight: bold;
                    font-size: 16px;
                    color: #dcdcdc;
                }

            <<<),
            on: {
                mount: function (el) {

                    var currentContext = null;
                    var forceManage = false;

                    function getSettingForHostname (hostname, name) {
                        var key = "domain[" + hostname + "]." + name;
                        return browser.storage.local.get(key).then(function (value) {
                            return (value[key] || false);
                        });
                    }

                    function isEnabledForHostname (hostname) {
                        return getSettingForHostname(hostname, "settings.enableUserAgentHeader").then(function (enableUserAgentHeader) {
                            return getSettingForHostname(hostname, "settings.enableFirePHPHeader").then(function (enableFirePHPHeader) {
                                return (
                                    enableUserAgentHeader ||
                                    enableFirePHPHeader                            
                                );
                            });                            
                        });
                    }

                    function sync () {   

                        if (currentContext) {

                            console.log("SYNC LAYOUT", "forceManage", forceManage);          

                            isEnabledForHostname(currentContext.hostname).then(function (enabled) {
                                
                                if (forceManage) {
                                    el.querySelector("DIV.manage").style.display = "block";

                                    if (enabled) {
                                        el.querySelector("DIV.manage > BUTTON.close-button").style.display = "inline-block";
                                    } else {
                                        el.querySelector("DIV.manage > BUTTON.close-button").style.display = "none";
                                    }
                                    el.querySelector("DIV.uninitialized").style.display = "none";
                                    el.querySelector("DIV.ui").style.display = "none";

                                } else {
                                    el.querySelector("DIV.manage > BUTTON.close-button").style.display = "none";

                                    if (enabled) {
                                        el.querySelector("DIV.manage").style.display = "none";
                                        el.querySelector("DIV.uninitialized").style.display = "none";
                                        el.querySelector("DIV.ui").style.display = "block";
                                    } else {
                                        el.querySelector("DIV.manage").style.display = "block";
                                        el.querySelector("DIV.uninitialized").style.display = "none";
                                        el.querySelector("DIV.ui").style.display = "none";
                                    }
                                    return null;
                                }                            
                            }).catch(function (err) {
                                console.error(err);
                            });
                        } else {
                            el.querySelector("DIV.ui").style.display = "none";
                            el.querySelector("DIV.manage").style.display = "none";
                            el.querySelector("DIV.uninitialized").style.display = "block";
                        }
                    }

                    el.querySelector("DIV.manage > BUTTON.close-button").addEventListener("click", function () {
                        forceManage = false;
                        sync();
                    }, false);

                    if (typeof browser !== "undefined") {

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
                                    sync();
                                } else
                                if (message.event === "manage") {
                                    forceManage = true;
                                    sync();
                                }
                            }
                        });

                        sync();

                    } else {
                        el.querySelector("DIV.uninitialized").style.display = "none";
                        el.querySelector("DIV.manage").style.display = "none";
                        el.querySelector("DIV.ui").style.display = "block";
                    }
                }
            }
        });
    });
};
        