
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
            <<<),
            css: (css () >>>

                :scope.layout TD {
                    vertical-align: top;
                    font-family: Monaco;
                    font-size: 12px;
                }

                :scope.layout TD.console-panel {
                    overflow-x: hidden;
                    overflow-y: auto;
                    border-right: 1px solid #dcdcdc;
                }

                :scope.layout TD.settings-panel {
                    border-bottom: 1px solid #dcdcdc;
                }
                
                :scope.layout TD.inspector-panel {
                    min-width: 200px;
                    overflow: auto;
                }

            <<<),
            on: {
                mount: function (el) {

                }
            }
        });
    });
};
        