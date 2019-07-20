
const WINDOW = window;

WINDOW.$ = require("./lib/jquery3.min");


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


exports.main = function (JSONREP, node, options) {

    if (typeof WINDOW.browser === "undefined") {
        WINDOW.browser = require("./adapters/page-browser-api");
    }

    var panels = {};

    return Promise.all(Object.keys(node).map(function (name) {

        if (typeof node[name] === "string") {
            panels[name] = panels[name] || [];
            panels[name].push(node[name]);
            return null;
        }
        
        return Promise.all(Object.keys(node[name]).map(function (key, i) {
            panels[name] = panels[name] || [];

            var panelNode = {};
            panelNode[key] = node[name][key];
            return JSONREP.markupNode(panelNode).then(function (code) {
                panels[name][i] = code;
                return null;
            });
        }));
    })).then(function () {

        Object.keys(panels).forEach(function (name) {
            panels[name] = panels[name].join("\n");
        });

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
                    <div class="manage" style="display: none;">
                        <button class="close-button">Close</button>
                        %%%variables.panels.manage%%%
                    </div>
                    <div class="uninitialized" style="display: none;">
                        <p><button action="reload">Reload</button> to initialize FirePHP</p>
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
                    font-family: Lucida Grande, Tahoma, sans-serif;
                    font-size: 11px;
                }

                :scope .layout TD {
                    vertical-align: top;
                }

                :scope .layout TD.menu-panel {
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
                    background-color: #efefef;
                }

                :scope .manage > .close-button {
                    display: none;
                    cursor: pointer;
                    margin-bottom: 10px;
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
                :scope .uninitialized BUTTON {
                    font-size: 16px;
                    color: #dcdcdc;
                    cursor: pointer;
                }
                    
            <<<),
            on: {
                mount: function (el) {

                    const COMPONENT = require("./component");

                    let forceManage = false;

                    const comp = COMPONENT.for({
                        browser: browser
                    });

                    comp.on("changed.context", function () {
                        comp.contextChangeAcknowledged();
                        sync();
                    });

                    comp.on("changed.setting", function (name, enabled) {
                        sync();
                    });

                    comp.on("message", function (message) {
                        if (message.event === "manage") {
                            forceManage = true;
                            sync();
                        }
                    });


                    var persistLogs = false;
                    browser.storage.onChanged.addListener(function (changes, area) {
                        if (changes["persist-on-navigate"]) {
                            persistLogs = changes["persist-on-navigate"].newValue;
                        }
                    });
                    browser.storage.local.get("persist-on-navigate").then(function (value) {
                        persistLogs = value["persist-on-navigate"];
                    });

                    let view = null;
                    let configured = false;
                    let enabled = false;

                    async function sync () {
                        try {
                            if (comp.currentContext) {
                                configured = await comp.isConfigured();
                                enabled = await comp.getSetting("enabled");

                                // User requested to manage settings
                                if (forceManage) {
                                    view = "manage";
                                } else
                                // Default state when first opening
                                if (
                                    !configured &&
                                    !enabled &&
                                    !persistLogs
                                ) {
                                    view = "manage";
                                } else
                                // Navigated to a new hostname and clicked enable without first configuring
                                if (
                                    persistLogs &&
                                    enabled &&
                                    !configured
                                ) {
                                    view = "manage";
                                } else {
                                    view = "console";
                                }
                            } else {
                                view = "uninitialized";                            
                            }

console.log("VIEW DETAIS", view, "configured", configured, "enabled", enabled);

                            var toggles = {
                                ui: false,
                                manage: false,
                                uninitialized: false
                            };

                            if (view === "uninitialized") {
                                toggles.uninitialized = true;
                            } else
                            if (view === "manage") {
                                toggles.manage = true;

                                if (
                                    forceManage ||
                                    configured ||
                                    persistLogs
                                ) {
                                    el.querySelector("DIV.manage > BUTTON.close-button").style.display = "inline-block";
                                } else {
                                    el.querySelector("DIV.manage > BUTTON.close-button").style.display = "none";
                                }
                            } else
                            if (view === "console") {
                                toggles.ui = true;
                            } else {
                                throw new Error(`'view' with value '${view}' not implemented!`);
                            }

                            el.querySelector("DIV.ui").style.display = toggles.ui ? "block" : "none";
                            el.querySelector("DIV.manage").style.display = toggles.manage ? "block" : "none";
                            el.querySelector("DIV.uninitialized").style.display = toggles.uninitialized ? "block" : "none";

                        } catch (err) {
                            console.error("Error during sync():", err);
                            throw err;
                        }
                    }

                    el.querySelector("DIV.manage > BUTTON.close-button").addEventListener("click", async function () {
                        try {
                            // Navigated to a new hostname and clicked enable without first configuring
                            // and now clicked close. So we disable again as nothing was configured.
                            if (
                                persistLogs &&
                                enabled &&
                                !configured
                            ) {
                                await comp.setSetting("enabled", false);
                            } else
                            // Managing settings for enabled hostname and clearing all settings
                            // and now clicking close. So we disable as nothing is configured.
                            if (
                                forceManage &&
                                enabled &&
                                !configured
                            ) {
                                await comp.setSetting("enabled", false);
                            }
                            forceManage = false;
                            sync();
                        } catch (err) {
                            console.error(err);
                        }
                    }, false);

                    el.querySelector('BUTTON[action="reload"]').addEventListener("click", function () {
                        comp.reloadBrowser();
                    }, false);
                }
            }
        }, undefined, options);
    });
};
