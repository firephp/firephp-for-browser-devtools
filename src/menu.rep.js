
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
                    padding-left: 5px;
                    padding-right: 5px;

                    border-radius: 5px;
                    border-color: rgb(216, 216, 216) rgb(209, 209, 209) rgb(186, 186, 186);
                    border-style: solid;
                    border-width: 1px;
                    padding: 1px 5px 2px;
                    color: rgba(0, 0, 0, 0.847);
                    background-color: rgb(255, 255, 255);
                    box-sizing: border-box;
                }

            </style>

            <script>
                const COMPONENT = require("./component");

                let tag = this;

                const comp = COMPONENT.for({
                    browser: window.crossbrowser
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
                    window.crossbrowser.storage.local.set({
                        "persist-on-navigate": event.target.checked
                    });                       
                }

                tag.on("mount", function () {
                    window.crossbrowser.storage.local.get("persist-on-navigate").then(function (value) {
                        tag.root.querySelector('[name="settings.persist-on-navigate"]').checked = value["persist-on-navigate"] || false;
                    });
                });

            </script>

        <<<)
    }, options);
};
