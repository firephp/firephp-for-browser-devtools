
const WINDOW = window;

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
                <div class="views">
                    <div class="ui" style="display: none;">
                        <table class="layout" height="100%" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td class="console-panel" width="100%" height="100%" rowspan="2">
                                    <div>
                                        %%%variables.panels.console%%%
                                    </div>
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
                    <div class="uninitialized">
                        <p>Reload to initialize FirePHP</p>
                    </div>
                </div>
            <<<),
            css: (css () >>>

                :scope.views,
                :scope.views TABLE {
                    font-family: Monaco;
                    font-size: 12px;
                }

                :scope .layout TD {
                    vertical-align: top;
                }

                :scope .layout TD.console-panel > DIV {
                    overflow-x: hidden;
                    overflow-y: auto;
                    border-right: 1px solid #dcdcdc;
                    height: 100vh;
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

                :scope .uninitialized {
                    text-align: center;
                    padding-top: 50px;
                }
                :scope .uninitialized > P {
                    font-weight: bold;
                    font-size: 16px;
                    color: #dcdcdc;
                }

            <<<),
            on: {
                mount: function (el) {

                    WINDOW.document.body.style.overflow = "hidden";

                    if (typeof browser !== "undefined") {

                        browser.runtime.onMessage.addListener(function (message) {
                            if (message.to === "message-listener") {
                                if (
                                    message.event === "currentContext"
                                ) {
                                    if (message.context) {
                                        el.querySelector("DIV.uninitialized").setAttribute("style", "display: none;");
                                        el.querySelector("DIV.ui").removeAttribute("style");
                                    } else {
                                        el.querySelector("DIV.ui").setAttribute("style", "display: none;");
                                        el.querySelector("DIV.uninitialized").removeAttribute("style");
                                    }
                                }
                            }
                        });
                    } else {
                        el.querySelector("DIV.uninitialized").setAttribute("style", "display: none;");
                        el.querySelector("DIV.ui").removeAttribute("style");        
                    }
                }
            }
        });
    });
};
        