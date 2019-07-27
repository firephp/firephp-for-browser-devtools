
exports.main = function (JSONREP, node, options) {    
        
    return JSONREP.makeRep2({
        "config": {
            "node": node
        },
        "code": (riotjs:makeRep () >>>

            <div class="menu">
                <button onclick={triggerRelooad}>Reload</button>
                <button onclick={triggerClear}>Clear</button>
                <input type="checkbox" name="settings.persist-on-navigate" onchange={notifyPersistChange}/>Persist
                <button onclick={triggerManage}>Settings</button>
            </div>

            <style>

                :scope DIV .menu {
                    padding: 5px;
                    padding-left: 10px;
                    padding-right: 10px;
                    white-space: nowrap;
                }

                :scope DIV .menu > BUTTON {
                    cursor: pointer;
                    width: auto;
                    padding-left: 1px;
                    padding-right: 1px;
                }
                
            </style>

            <script>
                const COMPONENT = require("./component");

                let tag = this;

                const comp = COMPONENT.for({
                    browser: browser
                });

                tag.triggerRelooad = function (event) {
                    comp.reloadBrowser();
                }

                tag.triggerClear = function (event) {
                    comp.clearConsole();
                }

                tag.triggerManage = function (event) {
                    comp.showView("manage");
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

            </script>

        <<<)
    }, options);
};
