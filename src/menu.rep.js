
exports.main = function (JSONREP, node) {    
        
    return JSONREP.makeRep({
        "config": {
            "node": node
        },
        "code": (riotjs:makeRep () >>>

            <div class="menu">
                <button onclick={triggerClear}>Clear</button>
                &nbsp;
                <button onclick={triggerManage}>Manage</button>
            </div>

            <style>

                :scope DIV.menu {
                    padding: 3px;
                    padding-left: 10px;
                    padding-right: 10px;
                }
                
            </style>

            <script>

                var tag = this;

                if (typeof browser !== "undefined") {

                    tag.triggerClear = function (event) {

                        browser.runtime.sendMessage({
                            to: "broadcast",
                            event: "clear",
                            context: {
                                tabId: browser.devtools.inspectedWindow.tabId
                            }
                        });
                    }

                    tag.triggerManage = function (event) {

                        browser.runtime.sendMessage({
                            to: "broadcast",
                            event: "manage",
                            context: {
                                tabId: browser.devtools.inspectedWindow.tabId
                            }
                        });
                    }                        
                }

            </script>

        <<<)
    });
};
