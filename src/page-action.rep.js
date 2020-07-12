
exports.main = function (JSONREP, node, options) {    

    return JSONREP.makeRep2({
        "config": {
            "node": node
        },
        "code": (riotjs:makeRep () >>>
        
            <div class="wrapper">
                <h2>FirePHP permissions for: { hostname }</h2>

                <div class="settings">
                    <ul>
                        <li><input type="checkbox" name="permissionGranted" onchange={syncCheckbox}/> Grant permission to intercept requests.</li>
                    </ul>
                </div>

                <div class="settings info hidden">
                    <ul>
                        <li>Open the <b>Developer Tools</b>, click on the <b>FirePHP</b> tab and</br>
                            configure the client to connect to a server library.</li>
                    </ul>
                </div>

            </div>

            <style>

                :scope DIV DIV.wrapper {
                    margin: 20px;
                }

                :scope DIV UL {
                    list-style-type: none;
                    margin: 0px;
                    padding: 0px;
                }

                :scope DIV DIV.settings > UL > LI {
                    white-space: nowrap;
                    border: 1px solid black;
                    margin: 0px;
                    margin-bottom: 3px;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                }

                :scope DIV DIV.settings > UL > LI:hover {
                    background-color: #ebebeb;
                }

                :scope DIV DIV.settings > UL {
                    list-style-type: none;
                    margin-bottom: 10px;
                }

                :scope DIV .hidden {
                    display: none;
                }

            </style>

            <script>
                const COMPONENT = require("./component");

                const tag = this;

                const comp = COMPONENT.for({
                    name: "page-action",
                    browser: window.crossbrowser
                });

                tag.hostname = "";                    

                setImmediate(function () {
                    comp.getCurrentContext();
                });

                comp.on("changed.context", function (context) {

                    comp.contextChangeAcknowledged();

                    if (context) {
                        tag.hostname = context.hostname;
                    } else {
                        tag.hostname = "";
                    }

                    tag.update();

                    sync();
                });

                comp.on("changed.setting", function () {
                    sync();
                });

                function sync () {

                    tag.root.querySelectorAll('INPUT[type="checkbox"]').forEach(function (el) {
                        if (el.getAttribute("scope") === "global") {
                            comp.getGlobalSetting(el.getAttribute("name")).then(function (enabled) {
                                el.checked = !!enabled;
                            });
                        } else {
                            comp.getSetting(el.getAttribute("name")).then(function (enabled) {
                                el.checked = !!enabled;

                                if (el.getAttribute("name") === "permissionGranted") {
                                    if (el.checked) {
                                        tag.root.querySelector('DIV.info').classList.remove('hidden');
                                    } else {
                                        tag.root.querySelector('DIV.info').classList.add('hidden');
                                    }
                                }                                
                            });
                        }
                    });
                }


                tag.syncCheckbox = function (event) {

                    // TODO: Remove once optional permissions work properly on firefox.
                    if (window.crossbrowser.browserType === 'firefox') {

                        comp.setSetting(event.target.getAttribute("name"), event.target.checked).then(function () {
                            sync();
                        });

                    } else {

                        if (event.target.checked) {
                            // The background page will act on this modification and set the 'permissionGranted' setting
                            window.crossbrowser.permissions.request({
                                permissions: [
                                    'webRequest',
                                    'webRequestBlocking'
                                ],
                                origins: [
                                    comp.currentContext.urlSelector
                                ]
                            });
                        } else {
                            // The background page will act on this modification and set the 'permissionGranted' setting
                            window.crossbrowser.permissions.remove({
                                permissions: [
                                    'webRequest',
                                    'webRequestBlocking'
                                ],
                                origins: [
                                    comp.currentContext.urlSelector
                                ]
                            });
                        }
                    }
                }

            </script>

        <<<)
    }, options);
};
