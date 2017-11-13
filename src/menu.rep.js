
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
                &nbsp;
                <input type="checkbox" name="settings.persist-on-navigate" onchange={notifyPersistChange}/>Persist
            </div>

            <style>

                :scope .menu {
                    padding: 5px;
                    padding-left: 10px;
                    padding-right: 10px;
                    white-space: nowrap;
                }

                :scope .menu > BUTTON {
                    cursor: pointer;
                    width: auto;
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
                    
                    tag.notifyPersistChange = function (event) {

                        browser.storage.local.set({
                            "persist-on-navigate": event.target.checked
                        });                       
                    }

                    tag.on("mount", function () {

                        browser.storage.local.get("persist-on-navigate").then(function (value) {
                            tag.root.querySelector('[name="settings.persist-on-navigate"]').checked = value["persist-on-navigate"] || false;
                        });
                    });                  
                }

            </script>

        <<<)
    });
};
