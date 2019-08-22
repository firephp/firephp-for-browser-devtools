
exports.main = function (JSONREP, node, options) {    

    return JSONREP.markupNode(node.settings || "Settings").then(function (settingsCode) {

        return JSONREP.makeRep2({
            "config": {
                "settingsCode": settingsCode,
                "node": node
            },
            "code": (riotjs:makeRep () >>>

                <div class="manage-panel">
                
                    <raw html="{settingsCode}"/>

                </div>

                <style>

                    :scope DIV .manage-panel {
                        padding: 10px;
                        padding-left: 20px;
                        padding-right: 20px;
                        background-color: white;
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
                    const COMPONENT = require("./component");

                    const tag = this;

                    tag.settingsCode = opts.config.settingsCode;

                    const comp = COMPONENT.for({
                        browser: window.crossbrowser
                    });

                    comp.on("changed.context", function (context) {
                        comp.contextChangeAcknowledged();

                        if (context) {
                            tag.hostname = context.hostname;
                        } else {
                            tag.hostname = "";
                        }

                        tag.update();
                    });

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

                </script>

            <<<)
        }, options);
    });
};
