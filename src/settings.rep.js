
exports.main = function (JSONREP, node, options) {    

    return JSONREP.makeRep2({
        "config": {
            "node": node
        },
        "code": (riotjs:makeRep () >>>
        
            <div>
                <table>
                    <tr>
                        <td width="75%">

                            <h2>Global Settings</h2>

                            <ul>
                                <li><input type="checkbox" name="reloadOnEnable" scope="global" onchange={syncCheckbox}/> Reload page on <b>Enable</b></li>
                            </ul>
            
                            <h2>Settings for: { hostname }</h2>

                            <div class="settings">
                                <ul>
                                    <li>
                                        <h2><a href="https://github.com/firephp/firephp-core" target="_blank">FirePHPCore</a></h2>
                                        <p>Only one type of request header needs to be sent.</p>
                                        <ul>
                                            <li><input type="checkbox" name="enableUserAgentHeader" onchange={syncCheckbox}/> Enable <b>UserAgent Request Header</b> - Modifies the <i>User-Agent</i> request header by appending <i>FirePHP/0.5</i>.</li>
                                            <li><input type="checkbox" name="enableFirePHPHeader" onchange={syncCheckbox}/> Enable <b>FirePHP Request Header</b> - Adds a <i>X-FirePHP-Version: 0.4</i> request header.</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <h2><a href="https://github.com/ccampbell/chromelogger" target="_blank">Chrome Logger</a></h2>
                                        <ul>
                                            <li><input type="checkbox" name="enableChromeLoggerData" onchange={syncCheckbox}/> Render <i>X-ChromeLogger-Data</i> response headers to the console.</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </td>
                        <td width="25%">
                            <div class="info">
                                <h2>How to get setup</h2>
                                <ol>
                                    <li>Choose an integration method.</li>
                                    <li>Integrate the server library into your project.</li>
                                    <li>Check the relevant box.</li>
                                    <li><b>Close</b> the <i>Settings</i> and <b>Enable</b> the tool.</li>
                                </ol>
                                <p><i>FirePHP is <a target="_blank" href="https://github.com/firephp/firephp-for-firefox-devtools">Open Source with code on Github</a></i></p>
                                <p><a target="_blank" href="https://github.com/firephp/firephp-for-firefox-devtools/issues">Report an Issue or Suggest a Feature</a></p>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <style>

                :scope DIV TABLE TD {
                    vertical-align: top;
                }

                :scope DIV UL {
                    list-style-type: none;
                    margin: 0px;
                    padding: 0px;
                }

                :scope DIV TABLE TD DIV.settings > UL > LI {
                    white-space: nowrap;
                    border: 1px solid black;
                    margin: 0px;
                    margin-bottom: 3px;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                }

                :scope DIV TABLE TD DIV.settings > UL > LI:hover {
                    background-color: #ebebeb;
                }

                :scope DIV TABLE TD DIV.settings > UL > LI > H2 {
                    maring-top: 0px;
                }

                :scope DIV TABLE TD DIV.settings > UL > LI > UL {
                    list-style-type: none;
                    margin-bottom: 10px;
                }

                :scope DIV TABLE TD DIV.info {
                    margin-left: 10px;
                    border: 1px solid #bcbcbc;
                    background-color: #efefef;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                }

                :scope DIV TABLE TD DIV.info {
                    float: right;
                }

                :scope DIV TABLE TD DIV.info H2 {
                    maring-top: 0px;
                }

                :scope DIV TABLE TD DIV.info > OL {
                    margin: 0px;
                    padding: 0px;
                    margin-left: 20px;
                }

            </style>

            <script>
                const COMPONENT = require("./component");

                const tag = this;
                const comp = COMPONENT.for({
                    browser: window.crossbrowser
                });

                tag.hostname = "";                    

                comp.on("changed.context", function (context) {
                    comp.contextChangeAcknowledged();

                    if (
                        opts.config.node &&
                        opts.config.node._util &&
                        typeof opts.config.node._util.enabled !== 'undefined'
                    ) {
                        comp.setSetting('enabled', opts.config.node._util.enabled);
                    }

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

//                tag.on("mount", sync);

                function sync () {
                    tag.root.querySelectorAll('INPUT[type="checkbox"]').forEach(function (el) {
                        if (el.getAttribute("scope") === "global") {
                            comp.getGlobalSetting(el.getAttribute("name")).then(function (enabled) {
                                el.checked = !!enabled;
                            });
                        } else {
                            comp.getSetting(el.getAttribute("name")).then(function (enabled) {
                                el.checked = !!enabled;
                            });
                        }
                    });
//                    tag.update();
                }

                tag.syncCheckbox = function (event) {
                    if (event.target.getAttribute("scope") === "global") {
                        comp.setGlobalSetting(event.target.getAttribute("name"), event.target.checked).then(function () {
                            //tag.update();
                            sync();
                        });
                    } else {
                        comp.setSetting(event.target.getAttribute("name"), event.target.checked).then(function () {
                            //tag.update();
                            sync();
                        });
                    }
                }

            </script>

        <<<)
    }, options);
};
